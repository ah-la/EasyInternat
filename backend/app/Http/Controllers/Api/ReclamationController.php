<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionHistory;
use App\Models\Reclamation;
use Illuminate\Http\Request;

class ReclamationController extends Controller
{
    private function scoped(Request $request)
    {
        $query = Reclamation::with('stagiaire.chambre', 'stagiaire.user', 'reponseBy');
        $user = $request->user();

        if ($user?->role === 'responsable' && $user->category) {
            $query->whereHas('stagiaire', fn ($q) => $q->where('category', $user->category));
        }

        return $query;
    }

    private function ensureVisible(Request $request, Reclamation $reclamation): void
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        if ($category && $reclamation->stagiaire?->category !== $category) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('statut')) $query->where('statut', $request->statut);
        if ($request->filled('priorite')) $query->where('priorite', $request->priorite);
        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('date')) $query->whereDate('created_at', $request->date);
        if ($request->filled('category') && $request->user()?->role === 'admin') {
            $query->whereHas('stagiaire', fn ($q) => $q->where('category', $request->category));
        }
        if ($request->filled('chambre')) {
            $chambre = $request->chambre;
            $query->whereHas('stagiaire.chambre', fn ($q) => $q->where('numero', 'like', '%'.$chambre.'%'));
        }
        if ($request->filled('chambre_id')) {
            $query->whereHas('stagiaire', fn ($q) => $q->where('chambre_id', $request->chambre_id));
        }

        return $query->latest()->paginate(100);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string|max:100',
            'sujet' => 'required|string|max:255',
            'message' => 'required|string',
            'priorite' => 'nullable|in:urgente,normale,faible',
        ]);

        $stagiaire = $request->user()->stagiaire;

        if (!$stagiaire) {
            return response()->json(['message' => 'Compte stagiaire introuvable'], 404);
        }

        return Reclamation::create($data + [
            'stagiaire_id' => $stagiaire->id,
            'statut' => 'en_attente',
        ])->load('stagiaire.chambre', 'stagiaire.user', 'reponseBy');
    }

    public function show(Request $request, Reclamation $reclamation)
    {
        $reclamation->load('stagiaire');
        $this->ensureVisible($request, $reclamation);

        return $reclamation->load('stagiaire.chambre', 'stagiaire.user', 'reponseBy');
    }

    public function update(Request $request, Reclamation $reclamation)
    {
        $reclamation->load('stagiaire');
        $this->ensureVisible($request, $reclamation);

        $data = $request->validate([
            'type' => 'sometimes|string|max:100',
            'sujet' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'priorite' => 'sometimes|in:urgente,normale,faible',
            'reponse_admin' => 'nullable|string',
            'statut' => 'sometimes|in:en_attente,en_cours,traitee',
        ]);

        if (array_key_exists('reponse_admin', $data) && filled($data['reponse_admin'])) {
            $data['reponse_at'] = now();
            $data['reponse_by_id'] = $request->user()?->id;
        }

        $before = $reclamation->only(['type', 'sujet', 'message', 'priorite', 'reponse_admin', 'reponse_at', 'reponse_by_id', 'statut']);
        $reclamation->update($data);

        if (array_key_exists('reponse_admin', $data) || array_key_exists('statut', $data)) {
            ActionHistory::record($request->user(), 'reclamation_answered', $reclamation, 'Reclamation traitee', [
                'before' => $before,
                'after' => $reclamation->only(['type', 'sujet', 'message', 'priorite', 'reponse_admin', 'reponse_at', 'reponse_by_id', 'statut']),
            ]);
        }

        return $reclamation->load('stagiaire.chambre', 'stagiaire.user', 'reponseBy');
    }

    public function destroy(Request $request, Reclamation $reclamation)
    {
        $reclamation->load('stagiaire');
        $this->ensureVisible($request, $reclamation);
        $reclamation->delete();
        return response()->noContent();
    }
}
