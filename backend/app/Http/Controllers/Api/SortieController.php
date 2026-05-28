<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionHistory;
use App\Models\Sortie;
use Illuminate\Http\Request;

class SortieController extends Controller
{
    private function ensureVisible(Request $request, Sortie $sortie): void
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        if ($category && $sortie->stagiaire?->category !== $category) {
            abort(403, 'Acces refuse pour cette categorie');
        }
    }

    public function index(Request $request)
    {
        $query = Sortie::with('stagiaire.chambre');
        $user = $request->user();

        if ($user && $user->role === 'responsable' && $user->category) {
            $query->whereHas('stagiaire', fn ($q) => $q->where('category', $user->category));
        }

        if ($user && $user->role === 'stagiaire') {
            $query->whereHas('stagiaire', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($request->filled('category') && $user?->role === 'admin') {
            $query->whereHas('stagiaire', fn ($q) => $q->where('category', $request->category));
        }

        if ($request->filled('statut')) {
            if ($request->statut === 'retard') {
                $query->where('statut', 'sorti')
                    ->where(function ($q) {
                        $q->whereDate('date_retour', '<', today())
                            ->orWhere(fn ($x) => $x
                                ->whereDate('date_retour', today())
                                ->whereNotNull('heure_retour_prevue')
                                ->where('heure_retour_prevue', '<', now()->format('H:i:s')));
                    });
            } elseif ($request->statut === 'sorti') {
                $query->where('statut', 'sorti')->whereDate('date_retour', '>=', today());
            } else {
                $query->where('statut', $request->statut);
            }
        }

        if ($request->filled('date')) {
            $query->whereDate('date_sortie', $request->date);
        }

        if ($request->filled('chambre')) {
            $chambre = $request->chambre;
            $query->whereHas('stagiaire.chambre', fn ($q) => $q->where('numero', 'like', '%'.$chambre.'%'));
        }

        return $query->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_sortie' => 'required|date',
            'heure_sortie' => 'required|date_format:H:i',
            'date_retour' => 'required|date|after_or_equal:date_sortie',
            'heure_retour_prevue' => 'required|date_format:H:i',
            'contact' => 'nullable|string|max:30',
            'motif' => 'required|string|min:3|max:255',
        ]);

        $data['stagiaire_id'] = $request->user()->stagiaire?->id;

        if (!$data['stagiaire_id']) {
            return response()->json(['message' => 'Compte stagiaire introuvable'], 404);
        }

        return Sortie::create($data + ['statut' => 'sorti'])->load('stagiaire.chambre');
    }

    public function update(Request $request, Sortie $sortie)
    {
        $sortie->load('stagiaire');
        $this->ensureVisible($request, $sortie);

        $data = $request->validate([
            'date_sortie' => 'sometimes|date',
            'heure_sortie' => 'sometimes|date_format:H:i',
            'date_retour' => 'sometimes|date|after_or_equal:date_sortie',
            'heure_retour_prevue' => 'sometimes|date_format:H:i',
            'contact' => 'nullable|string|max:30',
            'motif' => 'nullable|string',
            'statut' => 'sometimes|in:sorti,retourne',
        ]);

        $before = $sortie->only(['date_sortie', 'heure_sortie', 'date_retour', 'heure_retour_prevue', 'contact', 'motif', 'statut']);
        $sortie->update($data);

        if (array_key_exists('statut', $data)) {
            ActionHistory::record($request->user(), 'sortie_status_updated', $sortie, 'Statut sortie modifie', [
                'before' => $before,
                'after' => $sortie->only(['date_sortie', 'heure_sortie', 'date_retour', 'heure_retour_prevue', 'contact', 'motif', 'statut']),
            ]);
        }

        return $sortie->load('stagiaire.chambre');
    }

    public function destroy(Request $request, Sortie $sortie)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Seul admin peut supprimer une sortie');
        }

        $sortie->load('stagiaire');
        $this->ensureVisible($request, $sortie);
        $sortie->delete();
        return response()->noContent();
    }
}
