<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionHistory;
use App\Models\Paiement;
use App\Models\Stagiaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'mois' => 'required',
            'mois.*' => 'string|max:255',
            'montant' => 'required|numeric|min:0',
            'statut' => 'nullable|in:paye',
            'date_paiement' => 'required|date',
        ]);

        $this->ensureStagiaireVisible($request, (int) $data['stagiaire_id']);
        $months = collect(is_array($data['mois']) ? $data['mois'] : [$data['mois']])
            ->map(fn ($month) => trim((string) $month))
            ->filter()
            ->unique()
            ->values();

        if ($months->isEmpty()) {
            return response()->json(['message' => 'Selectionnez au moins un mois paye'], 422);
        }

        if (Paiement::where('stagiaire_id', $data['stagiaire_id'])->whereIn('mois', $months)->exists()) {
            return response()->json(['message' => 'Ce mois est deja paye pour ce stagiaire'], 422);
        }

        $created = DB::transaction(function () use ($request, $data, $months) {
            return $months->map(function ($month) use ($request, $data) {
                $paiement = Paiement::create([
                    'stagiaire_id' => $data['stagiaire_id'],
                    'mois' => $month,
                    'montant' => $data['montant'],
                    'statut' => 'paye',
                    'date_paiement' => $data['date_paiement'],
                ])->load('stagiaire.chambre');

                ActionHistory::record($request->user(), 'paiement_created', $paiement, 'Paiement cree', $paiement->toArray());

                return $paiement;
            });
        });

        return is_array($data['mois']) ? $created : $created->first();
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
            'date_paiement' => 'sometimes|required|date',
        ]);

        if (isset($data['stagiaire_id'])) {
            $this->ensureStagiaireVisible($request, (int) $data['stagiaire_id']);
        }

        $targetStagiaire = $data['stagiaire_id'] ?? $paiement->stagiaire_id;
        $targetMois = $data['mois'] ?? $paiement->mois;
        if (Paiement::where('stagiaire_id', $targetStagiaire)->where('mois', $targetMois)->whereKeyNot($paiement->id)->exists()) {
            return response()->json(['message' => 'Ce mois est deja paye pour ce stagiaire'], 422);
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
