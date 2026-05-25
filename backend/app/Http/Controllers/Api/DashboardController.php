<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Demande, Paiement, Presence, Reclamation, Sortie, Stagiaire};
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        $stagiaires = Stagiaire::query()->when($category, fn ($q) => $q->where('category', $category));
        $chambres = Chambre::query()->when($category, fn ($q) => $q->where('category', $category));
        $demandes = Demande::query()->when($category, fn ($q) => $q->where('genre', $category === 'filles' ? 'Fille' : 'Garcon'));
        $paiements = Paiement::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
        $presences = Presence::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
        $reclamations = Reclamation::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));

        return response()->json([
            'stagiaires' => (clone $stagiaires)->count(),
            'filles' => (clone $stagiaires)->where('category', 'filles')->count(),
            'garcons' => (clone $stagiaires)->where('category', 'garcons')->count(),
            'chambres_total' => (clone $chambres)->count(),
            'chambres_occupees' => (clone $chambres)->whereHas('stagiaires')->count(),
            'chambres_disponibles' => (clone $chambres)->where('statut', 'disponible')->count(),
            'demandes_en_attente' => (clone $demandes)->where('statut', 'en_attente')->count(),
            'paiements_retard' => (clone $paiements)->whereIn('statut', ['en_retard', 'non_paye'])->count(),
            'presences_jour' => (clone $presences)->whereDate('date', today())->count(),
            'reclamations_ouvertes' => (clone $reclamations)->whereIn('statut', ['en_attente', 'en_cours'])->count(),
            'sorties_en_attente' => Sortie::query()
                ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)))
                ->where('statut', 'en_attente')
                ->count(),
        ]);
    }
}
