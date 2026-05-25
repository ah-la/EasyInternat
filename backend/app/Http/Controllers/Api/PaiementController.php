<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    private function scoped(Request $request)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        return Paiement::with('stagiaire.chambre')
            ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
    }

    public function index(Request $request)
    {
        $query = $this->scoped($request);

        if ($request->filled('mois')) $query->where('mois', $request->mois);
        if ($request->filled('statut')) $query->where('statut', $request->statut);

        return $query->latest()->paginate(100);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'mois' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'statut' => 'required|in:paye,en_retard,non_paye',
            'date_paiement' => 'nullable|date',
        ]);

        return Paiement::create($data)->load('stagiaire.chambre');
    }

    public function show(Paiement $paiement)
    {
        return $paiement->load('stagiaire.chambre');
    }

    public function update(Request $request, Paiement $paiement)
    {
        $data = $request->validate([
            'stagiaire_id' => 'sometimes|exists:stagiaires,id',
            'mois' => 'sometimes|string|max:255',
            'montant' => 'sometimes|numeric|min:0',
            'statut' => 'sometimes|in:paye,en_retard,non_paye',
            'date_paiement' => 'nullable|date',
        ]);

        $paiement->update($data);

        return $paiement->load('stagiaire.chambre');
    }

    public function destroy(Paiement $paiement)
    {
        $paiement->delete();
        return response()->noContent();
    }
}
