<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{ActionHistory, Chambre, Demande, StagiaireCentre, Stagiaire, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemandeController extends Controller
{
    private function categoryFromGenre(?string $genre): string
    {
        return str_contains(strtolower((string) $genre), 'fille') ? 'filles' : 'garcons';
    }

    private function genreFromCategory(?string $category): string
    {
        return $category === 'filles' ? 'Fille' : 'Garcon';
    }

    private function ensureVisible(Request $request, Demande $demande): void
    {
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category && $demande->genre !== $this->genreFromCategory($user->category)) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    public function index(Request $request)
    {
        $query = Demande::latest();
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->where('genre', $this->genreFromCategory($user->category));
        }

        if ($request->filled('category') && $user?->role === 'admin') {
            $query->where('genre', $this->genreFromCategory($request->category));
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        return $query->paginate(20);
    }

    public function verifyCandidat(Request $request)
    {
        $data = $request->validate([
            'cin' => 'required|string',
            'numero_inscription' => 'nullable|string',
        ]);

        $query = StagiaireCentre::where('cin', $data['cin']);

        if (!empty($data['numero_inscription'])) {
            $query->where('numero_inscription', $data['numero_inscription']);
        }

        $found = $query->first();

        return response()->json(['exists' => (bool) $found, 'candidat' => $found]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'cin' => 'required|string|max:50',
            'numero_inscription' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'telephone' => 'required|string|max:30',
            'genre' => 'required|string',
            'filiere' => 'required|string|max:255',
            'certificat_residence' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $candidat = StagiaireCentre::where('cin', $data['cin'])
            ->where('numero_inscription', $data['numero_inscription'])
            ->first();

        if (!$candidat) {
            return response()->json(['message' => 'Candidat non trouvé au centre'], 403);
        }

        if (Demande::where('cin', $data['cin'])->exists()) {
            return response()->json(['message' => 'Vous avez déjà envoyé une demande.'], 422);
        }

        if ($request->hasFile('certificat_residence')) {
            Storage::disk('public')->makeDirectory('certificats');
            $file = $request->file('certificat_residence');
            $extension = $file->getClientOriginalExtension() ?: 'bin';
            $path = 'certificats/'.Str::uuid().'.'.$extension;
            $content = $file->getContent();
            Storage::disk('public')->put($path, $content);

            $data['certificat_residence'] = $path;
        }

        $data['nom'] = $candidat->nom ?: $data['nom'];
        $data['prenom'] = $candidat->prenom ?: ($data['prenom'] ?? '');
        $data['numero_inscription'] = $candidat->numero_inscription ?: ($data['numero_inscription'] ?? null);
        $data['filiere'] = $candidat->filiere ?: $data['filiere'];
        $data['genre'] = $this->genreFromCategory($this->categoryFromGenre($candidat->genre ?: $data['genre']));
        $data['statut'] = 'en_attente';

        return Demande::create($data);
    }

    public function show(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);
        return $demande;
    }

    public function certificat(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);

        if (!$demande->certificat_residence) {
            abort(404, 'Certificat introuvable');
        }

        if (Storage::disk('public')->exists($demande->certificat_residence)) {
            $mime = Storage::disk('public')->mimeType($demande->certificat_residence) ?: 'application/octet-stream';

            return Storage::disk('public')->response($demande->certificat_residence, 'certificat-residence-'.$demande->cin, [
                'Content-Type' => $mime,
                'Content-Disposition' => 'inline; filename="certificat-residence-'.$demande->cin.'"',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        abort(404, 'Certificat introuvable');
    }

    public function update(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);

        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|nullable|string|max:255',
            'cin' => 'sometimes|string|max:50',
            'numero_inscription' => 'sometimes|nullable|string|max:100',
            'email' => 'sometimes|email|max:255',
            'telephone' => 'sometimes|string|max:30',
            'genre' => 'sometimes|string',
            'filiere' => 'sometimes|string|max:255',
            'statut' => 'sometimes|in:en_attente,liste_attente,acceptee,refusee',
            'motif_refus' => 'sometimes|nullable|string',
        ]);

        if (isset($data['genre'])) {
            $data['genre'] = $this->genreFromCategory($this->categoryFromGenre($data['genre']));

            if ($request->user()?->role === 'responsable' && $data['genre'] !== $this->genreFromCategory($request->user()->category)) {
                abort(403, 'Acces refuse pour cette categorie');
            }
        }

        $demande->update($data);

        return $demande;
    }

    public function destroy(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);
        $demande->delete();
        return response()->noContent();
    }

    public function accept(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);

        $data = $request->validate([
            'chambre_id' => 'nullable|exists:chambres,id',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $password = $data['password'] ?? Str::password(8);
        $category = $this->categoryFromGenre($demande->genre);
        $chambre = null;

        if (!empty($data['chambre_id'])) {
            $chambre = Chambre::query()
                ->where('category', $category)
                ->withCount('stagiaires')
                ->find($data['chambre_id']);

            if (!$chambre) {
                return response()->json(['message' => 'Chambre invalide pour cette categorie'], 422);
            }

            if ($chambre->stagiaires_count >= $chambre->capacite) {
                return response()->json(['message' => 'Cette chambre est complete'], 422);
            }
        }

        if (!$chambre) {
            $chambre = Chambre::query()
                ->where('category', $category)
                ->withCount('stagiaires')
                ->get()
                ->first(fn (Chambre $room) => $room->stagiaires_count < $room->capacite);
        }

        if (!$chambre) {
            return response()->json(['message' => 'Aucune chambre disponible pour cette categorie'], 422);
        }

        [$user, $stagiaire] = DB::transaction(function () use ($request, $demande, $password, $category, $chambre) {
            $user = User::firstOrCreate(
                ['email' => $demande->email],
                [
                    'name' => trim($demande->nom.' '.$demande->prenom),
                    'password' => Hash::make($password),
                    'role' => 'stagiaire',
                    'category' => $category,
                ]
            );

            $stagiaire = Stagiaire::firstOrCreate(
                ['cin' => $demande->cin],
                [
                    'user_id' => $user->id,
                    'nom' => $demande->nom,
                    'prenom' => $demande->prenom,
                    'telephone' => $demande->telephone,
                    'genre' => $this->genreFromCategory($category),
                    'filiere' => $demande->filiere,
                    'chambre_id' => $chambre->id,
                    'category' => $category,
                ]
            );

            if (!$stagiaire->chambre_id) {
                $stagiaire->update(['chambre_id' => $chambre->id]);
            }

            $demande->update(['statut' => 'acceptee']);
            ActionHistory::record($request->user(), 'demande_accepted', $demande, 'Demande acceptee', [
                'stagiaire_id' => $stagiaire->id,
            ]);

            return [$user, $stagiaire->load('chambre', 'user')];
        });

        return response()->json([
            'message' => 'Demande acceptee',
            'stagiaire' => $stagiaire,
            'email' => $user->email,
            'password_temporaire' => $user->wasRecentlyCreated ? $password : null,
        ]);
    }

    public function refuse(Request $request, Demande $demande)
    {
        $this->ensureVisible($request, $demande);

        $data = $request->validate([
            'motif_refus' => 'nullable|string|max:1000',
        ]);

        $demande->update([
            'statut' => 'refusee',
            'motif_refus' => $data['motif_refus'] ?? null,
        ]);
        ActionHistory::record($request->user(), 'demande_refused', $demande, 'Demande refusee', [
            'motif_refus' => $data['motif_refus'] ?? null,
        ]);

        return $demande;
    }
}
