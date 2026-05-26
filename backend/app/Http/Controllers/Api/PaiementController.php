<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionHistory;
use App\Models\Paiement;
use App\Models\Stagiaire;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    private function scoped(Request $request)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        return Paiement::with('stagiaire.chambre')
            ->where('statut', 'paye')
            ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
    }

    private function ensureVisible(Request $request, Paiement $paiement): void
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        if ($category && $paiement->stagiaire?->category !== $category) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    private function ensureStagiaireVisible(Request $request, int $stagiaireId): void
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        if ($category && !Stagiaire::where('id', $stagiaireId)->where('category', $category)->exists()) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('mois')) $query->where('mois', $request->mois);
        if ($request->filled('statut')) $query->where('statut', $request->statut);
        if ($request->filled('date')) $query->whereDate('date_paiement', $request->date);
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
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'mois' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'statut' => 'nullable|in:paye',
            'date_paiement' => 'nullable|date',
        ]);

        $this->ensureStagiaireVisible($request, (int) $data['stagiaire_id']);
        $data['statut'] = 'paye';
        $data['date_paiement'] = $data['date_paiement'] ?? today();

        $paiement = Paiement::create($data)->load('stagiaire.chambre');
        ActionHistory::record($request->user(), 'paiement_created', $paiement, 'Paiement cree', $data);

        return $paiement;
    }

    public function show(Request $request, Paiement $paiement)
    {
        $paiement->load('stagiaire');
        $this->ensureVisible($request, $paiement);

        return $paiement->load('stagiaire.chambre');
    }

    public function update(Request $request, Paiement $paiement)
    {
        $paiement->load('stagiaire');
        $this->ensureVisible($request, $paiement);

        $data = $request->validate([
            'stagiaire_id' => 'sometimes|exists:stagiaires,id',
            'mois' => 'sometimes|string|max:255',
            'montant' => 'sometimes|numeric|min:0',
            'statut' => 'sometimes|in:paye',
            'date_paiement' => 'nullable|date',
        ]);

        if (isset($data['stagiaire_id'])) {
            $this->ensureStagiaireVisible($request, (int) $data['stagiaire_id']);
        }

        $before = $paiement->only(['stagiaire_id', 'mois', 'montant', 'statut', 'date_paiement']);
        $paiement->update($data);
        ActionHistory::record($request->user(), 'paiement_updated', $paiement, 'Paiement modifie', [
            'before' => $before,
            'after' => $paiement->only(['stagiaire_id', 'mois', 'montant', 'statut', 'date_paiement']),
        ]);

        return $paiement->load('stagiaire.chambre');
    }

    public function destroy(Request $request, Paiement $paiement)
    {
        $paiement->load('stagiaire');
        $this->ensureVisible($request, $paiement);
        ActionHistory::record($request->user(), 'paiement_deleted', $paiement, 'Paiement supprime', $paiement->toArray());
        $paiement->delete();
        return response()->noContent();
    }
}
