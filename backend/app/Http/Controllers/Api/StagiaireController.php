<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Stagiaire, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StagiaireController extends Controller
{
    private function scoped(Request $request)
    {
        $query = Stagiaire::with('chambre', 'user');
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->where('category', $user->category);
        }

        return $query;
    }

    private function categoryFromGenre(string $genre): string
    {
        return str_contains(strtolower($genre), 'fille') ? 'filles' : 'garcons';
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q
                ->where('nom', 'like', '%'.$search.'%')
                ->orWhere('prenom', 'like', '%'.$search.'%')
                ->orWhere('cin', 'like', '%'.$search.'%'));
        }

        return $query->latest()->paginate(100);
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
        $chambreId = $data['chambre_id'] ?? null;

        if (!$chambreId && !empty($data['chambre_numero'])) {
            $chambreId = Chambre::where('numero', $data['chambre_numero'])->value('id');
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

        return Stagiaire::create([
            'user_id' => $userId,
            'nom' => $data['nom'],
            'prenom' => $data['prenom'] ?? '',
            'cin' => $data['cin'],
            'telephone' => $data['telephone'] ?? null,
            'genre' => $category === 'filles' ? 'Fille' : 'Garcon',
            'filiere' => $data['filiere'] ?? '',
            'chambre_id' => $chambreId,
            'category' => $category,
        ])->load('chambre', 'user');
    }

    public function show(Stagiaire $stagiaire)
    {
        return $stagiaire->load('chambre', 'user');
    }

    public function update(Request $request, Stagiaire $stagiaire)
    {
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
        }

        if (!empty($data['chambre_numero'])) {
            $data['chambre_id'] = Chambre::where('numero', $data['chambre_numero'])->value('id');
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

        return $stagiaire->load('chambre', 'user');
    }

    public function destroy(Stagiaire $stagiaire)
    {
        $stagiaire->delete();
        return response()->noContent();
    }
}
