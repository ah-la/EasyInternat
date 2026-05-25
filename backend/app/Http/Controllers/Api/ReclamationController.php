<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Illuminate\Http\Request;

class ReclamationController extends Controller
{
    private function scoped(Request $request)
    {
        $query = Reclamation::with('stagiaire.chambre', 'stagiaire.user');
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->whereHas('stagiaire', fn ($q) => $q->where('category', $user->category));
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('statut')) $query->where('statut', $request->statut);
        if ($request->filled('type')) $query->where('type', $request->type);

        return $query->latest()->paginate(100);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string|max:100',
            'sujet' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $stagiaire = $request->user()->stagiaire;

        if (!$stagiaire) {
            return response()->json(['message' => 'Compte stagiaire introuvable'], 404);
        }

        return Reclamation::create($data + [
            'stagiaire_id' => $stagiaire->id,
            'statut' => 'en_attente',
        ])->load('stagiaire.chambre', 'stagiaire.user');
    }

    public function show(Reclamation $reclamation)
    {
        return $reclamation->load('stagiaire.chambre', 'stagiaire.user');
    }

    public function update(Request $request, Reclamation $reclamation)
    {
        $data = $request->validate([
            'type' => 'sometimes|string|max:100',
            'sujet' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'reponse_admin' => 'nullable|string',
            'statut' => 'sometimes|string|max:100',
        ]);

        $reclamation->update($data);

        return $reclamation->load('stagiaire.chambre', 'stagiaire.user');
    }

    public function destroy(Reclamation $reclamation)
    {
        $reclamation->delete();
        return response()->noContent();
    }
}
