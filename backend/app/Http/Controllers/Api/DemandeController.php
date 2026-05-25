<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Demande, StagiaireCentre, Stagiaire, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

    public function index(Request $request)
    {
        $query = Demande::latest();
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->where('genre', $this->genreFromCategory($user->category));
        }

        return $query->paginate(20);
    }

    public function verifyCandidat(Request $request)
    {
        $request->validate(['cin' => 'required|string']);

        $found = StagiaireCentre::where('cin', $request->cin)
            ->orWhere('numero_inscription', $request->cin)
            ->first();

        return response()->json(['exists' => (bool) $found, 'candidat' => $found]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'cin' => 'required|string|max:50',
            'numero_inscription' => 'nullable|string|max:100',
            'email' => 'required|email|max:255',
            'telephone' => 'required|string|max:30',
            'genre' => 'required|string',
            'filiere' => 'required|string|max:255',
            'certificat_residence' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:4096',
        ]);

        $exists = StagiaireCentre::where('cin', $data['cin'])
            ->orWhere('numero_inscription', $data['numero_inscription'] ?? '---')
            ->exists();

        if (!$exists) {
            return response()->json(['message' => 'Candidat non inscrit au centre'], 403);
        }

        if (Demande::where('cin', $data['cin'])->whereIn('statut', ['en_attente', 'liste_attente'])->exists()) {
            return response()->json(['message' => 'Une demande existe deja pour ce CIN'], 422);
        }

        if ($request->hasFile('certificat_residence')) {
            $data['certificat_residence'] = $request->file('certificat_residence')->store('certificats', 'public');
        }

        $data['prenom'] = $data['prenom'] ?? '';
        $data['genre'] = $this->genreFromCategory($this->categoryFromGenre($data['genre']));
        $data['statut'] = 'en_attente';

        return Demande::create($data);
    }

    public function show(Demande $demande)
    {
        return $demande;
    }

    public function update(Request $request, Demande $demande)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|nullable|string|max:255',
            'cin' => 'sometimes|string|max:50',
            'numero_inscription' => 'sometimes|nullable|string|max:100',
            'email' => 'sometimes|email|max:255',
            'telephone' => 'sometimes|string|max:30',
            'genre' => 'sometimes|string',
            'filiere' => 'sometimes|string|max:255',
            'statut' => 'sometimes|string',
            'motif_refus' => 'sometimes|nullable|string',
        ]);

        if (isset($data['genre'])) {
            $data['genre'] = $this->genreFromCategory($this->categoryFromGenre($data['genre']));
        }

        $demande->update($data);

        return $demande;
    }

    public function destroy(Demande $demande)
    {
        $demande->delete();
        return response()->noContent();
    }

    public function accept(Demande $demande)
    {
        $password = Str::password(8);
        $category = $this->categoryFromGenre($demande->genre);

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
                'category' => $category,
            ]
        );

        $demande->update(['statut' => 'acceptee']);

        return response()->json([
            'message' => 'Demande acceptee',
            'stagiaire' => $stagiaire,
            'email' => $user->email,
            'password_temporaire' => $user->wasRecentlyCreated ? $password : null,
        ]);
    }

    public function refuse(Request $request, Demande $demande)
    {
        $demande->update([
            'statut' => 'refusee',
            'motif_refus' => $request->input('motif_refus'),
        ]);

        return $demande;
    }
}
