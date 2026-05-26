<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Stagiaire, User};
use App\Services\PaymentStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StagiaireController extends Controller
{
    public function __construct(private PaymentStatusService $paymentStatus)
    {
    }

    private function scoped(Request $request)
    {
        $query = Stagiaire::with('chambre', 'user', 'paiements');
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->where('category', $user->category);
        }

        return $query;
    }

    private function ensureVisible(Request $request, Stagiaire $stagiaire): void
    {
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category && $stagiaire->category !== $user->category) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    private function categoryFromGenre(string $genre): string
    {
        return str_contains(strtolower($genre), 'fille') ? 'filles' : 'garcons';
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('category') && $request->user()?->role === 'admin') {
            $query->where('category', $request->category);
        }

        if ($request->filled('genre')) {
            $query->where('genre', $this->categoryFromGenre($request->genre) === 'filles' ? 'Fille' : 'Garcon');
        }

        if ($request->filled('chambre_id')) {
            $query->where('chambre_id', $request->chambre_id);
        }

        if ($request->filled('chambre')) {
            $chambre = $request->chambre;
            $query->whereHas('chambre', fn ($q) => $q->where('numero', 'like', '%'.$chambre.'%'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('nom', 'like', '%'.$search.'%')
                ->orWhere('prenom', 'like', '%'.$search.'%')
                ->orWhere('cin', 'like', '%'.$search.'%'));
        }

        $stagiaires = $query->latest()->paginate(100);
        $stagiaires->getCollection()->transform(fn (Stagiaire $stagiaire) => $this->paymentStatus->decorate($stagiaire));

        return $stagiaires;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'cin' => 'required|string|max:50|unique:stagiaires,cin',
            'telephone' => 'nullable|string|max:30',
            'genre' => 'required|string',
            'filiere' => 'nullable|string|max:255',
            'chambre_id' => 'nullable|exists:chambres,id',
            'chambre_numero' => 'nullable|string|exists:chambres,numero',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'nullable|string|min:6',
        ]);

        $category = $this->categoryFromGenre($data['genre']);

        if ($request->user()?->role === 'responsable' && $request->user()->category !== $category) {
            abort(403, 'Acces refuse pour cette categorie');
        }

        $chambreId = $data['chambre_id'] ?? null;

        if (!$chambreId && !empty($data['chambre_numero'])) {
            $chambreId = Chambre::where('numero', $data['chambre_numero'])->value('id');
        }

        if ($chambreId) {
            $chambre = Chambre::find($chambreId);
            if ($chambre && $chambre->category !== $category) {
                return response()->json(['message' => 'La chambre ne correspond pas a la categorie du stagiaire'], 422);
            }
        }

        $userId = null;
        if (!empty($data['email'])) {
            $user = User::create([
                'name' => trim($data['nom'].' '.($data['prenom'] ?? '')),
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'stagiaire',
                'category' => $category,
            ]);
            $userId = $user->id;
        }

        $stagiaire = Stagiaire::create([
            'user_id' => $userId,
            'nom' => $data['nom'],
            'prenom' => $data['prenom'] ?? '',
            'cin' => $data['cin'],
            'telephone' => $data['telephone'] ?? null,
            'genre' => $category === 'filles' ? 'Fille' : 'Garcon',
            'filiere' => $data['filiere'] ?? '',
            'chambre_id' => $chambreId,
            'category' => $category,
        ])->load('chambre', 'user', 'paiements');

        return $this->paymentStatus->decorate($stagiaire);
    }

    public function show(Request $request, Stagiaire $stagiaire)
    {
        $this->ensureVisible($request, $stagiaire);
        return $this->paymentStatus->decorate($stagiaire->load('chambre', 'user', 'paiements'));
    }

    public function profile(Request $request, Stagiaire $stagiaire)
    {
        $this->ensureVisible($request, $stagiaire);

        $stagiaire->load([
            'user',
            'chambre',
            'paiements' => fn ($q) => $q->latest(),
            'presences' => fn ($q) => $q->latest(),
            'reclamations' => fn ($q) => $q->latest(),
            'sorties' => fn ($q) => $q->latest(),
        ]);

        return $this->paymentStatus->decorate($stagiaire);
    }

    public function update(Request $request, Stagiaire $stagiaire)
    {
        $this->ensureVisible($request, $stagiaire);

        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|nullable|string|max:255',
            'cin' => 'sometimes|string|max:50|unique:stagiaires,cin,'.$stagiaire->id,
            'telephone' => 'nullable|string|max:30',
            'genre' => 'sometimes|string',
            'filiere' => 'sometimes|nullable|string|max:255',
            'chambre_id' => 'nullable|exists:chambres,id',
            'chambre_numero' => 'nullable|string|exists:chambres,numero',
            'email' => 'nullable|email|unique:users,email,'.($stagiaire->user_id ?: 'NULL'),
            'password' => 'nullable|string|min:6',
        ]);

        if (isset($data['genre'])) {
            $data['category'] = $this->categoryFromGenre($data['genre']);
            $data['genre'] = $data['category'] === 'filles' ? 'Fille' : 'Garcon';

            if ($request->user()?->role === 'responsable' && $request->user()->category !== $data['category']) {
                abort(403, 'Acces refuse pour cette categorie');
            }
        }

        if (!empty($data['chambre_numero'])) {
            $data['chambre_id'] = Chambre::where('numero', $data['chambre_numero'])->value('id');
        }

        if (!empty($data['chambre_id'])) {
            $targetCategory = $data['category'] ?? $stagiaire->category;
            $chambre = Chambre::find($data['chambre_id']);
            if ($chambre && $chambre->category !== $targetCategory) {
                return response()->json(['message' => 'La chambre ne correspond pas a la categorie du stagiaire'], 422);
            }
        }

        unset($data['email'], $data['password'], $data['chambre_numero']);
        $stagiaire->update($data);

        if ($stagiaire->user && ($request->filled('email') || $request->filled('password'))) {
            $userData = [];
            if ($request->filled('email')) $userData['email'] = $request->email;
            if ($request->filled('password')) $userData['password'] = Hash::make($request->password);
            if (isset($data['category'])) $userData['category'] = $data['category'];
            $stagiaire->user->update($userData);
        }

        return $this->paymentStatus->decorate($stagiaire->load('chambre', 'user', 'paiements'));
    }

    public function destroy(Request $request, Stagiaire $stagiaire)
    {
        $this->ensureVisible($request, $stagiaire);
        $stagiaire->delete();
        return response()->noContent();
    }
}
