<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Demande, Paiement, Presence, Reclamation, Sortie, Stagiaire};
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

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
        $sorties = Sortie::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));

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
            'sorties_en_attente' => (clone $sorties)->where('statut', 'en_attente')->count(),
            'notifications' => $this->notifications(
                demandes: clone $demandes,
                reclamations: clone $reclamations,
                paiements: clone $paiements,
                presences: clone $presences,
                sorties: clone $sorties
            ),
        ]);
    }

    private function notifications($demandes, $reclamations, $paiements, $presences, $sorties): Collection
    {
        $today = today();

        $newDemandes = (clone $demandes)->where('statut', 'en_attente')->whereDate('created_at', $today)->count();
        $openReclamations = (clone $reclamations)->whereIn('statut', ['en_attente', 'en_cours'])->count();
        $latePayments = (clone $paiements)->whereIn('statut', ['en_retard', 'non_paye'])->count();
        $absencesToday = (clone $presences)->whereDate('date', $today)->where('statut', 'absent')->count();
        $pendingSorties = (clone $sorties)->where('statut', 'en_attente')->count();

        return collect([
            [
                'type' => 'demande',
                'title' => 'Nouvelles demandes',
                'message' => $newDemandes > 0 ? "$newDemandes demande(s) ajoutee(s) aujourd hui" : 'Aucune nouvelle demande aujourd hui',
                'count' => $newDemandes,
                'tone' => $newDemandes > 0 ? 'warning' : 'success',
                'target' => 'demandes',
            ],
            [
                'type' => 'reclamation',
                'title' => 'Reclamations ouvertes',
                'message' => $openReclamations > 0 ? "$openReclamations reclamation(s) a traiter" : 'Aucune reclamation ouverte',
                'count' => $openReclamations,
                'tone' => $openReclamations > 0 ? 'warning' : 'success',
                'target' => 'reclamations',
            ],
            [
                'type' => 'paiement',
                'title' => 'Paiements en retard',
                'message' => $latePayments > 0 ? "$latePayments dossier(s) de paiement a suivre" : 'Paiements a jour',
                'count' => $latePayments,
                'tone' => $latePayments > 0 ? 'danger' : 'success',
                'target' => 'paiements',
            ],
            [
                'type' => 'absence',
                'title' => 'Absences du jour',
                'message' => $absencesToday > 0 ? "$absencesToday absence(s) signalee(s) aujourd hui" : 'Aucune absence signalee aujourd hui',
                'count' => $absencesToday,
                'tone' => $absencesToday > 0 ? 'danger' : 'success',
                'target' => 'presences',
            ],
            [
                'type' => 'sortie',
                'title' => 'Sorties en attente',
                'message' => $pendingSorties > 0 ? "$pendingSorties sortie(s) attendent une decision" : 'Aucune sortie en attente',
                'count' => $pendingSorties,
                'tone' => $pendingSorties > 0 ? 'warning' : 'success',
                'target' => 'presences',
            ],
        ]);
    }
}
