<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Demande, Paiement, Reclamation, Sortie, Stagiaire};
use App\Services\PaymentStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function __construct(private PaymentStatusService $paymentStatus)
    {
    }

    public function index(Request $request)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        $stagiaires = Stagiaire::query()->when($category, fn ($q) => $q->where('category', $category));
        $chambres = Chambre::query()->when($category, fn ($q) => $q->where('category', $category));
        $demandes = Demande::query()->when($category, fn ($q) => $q->where('genre', $category === 'filles' ? 'Fille' : 'Garcon'));
        $paiements = Paiement::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
        $reclamations = Reclamation::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
        $sorties = Sortie::query()->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)));
        $paymentStagiaires = (clone $stagiaires)->with('paiements')->get();
        $latePayments = $this->paymentStatus->lateCount($paymentStagiaires);

        return response()->json([
            'stagiaires' => (clone $stagiaires)->count(),
            'filles' => (clone $stagiaires)->where('category', 'filles')->count(),
            'garcons' => (clone $stagiaires)->where('category', 'garcons')->count(),
            'chambres_total' => (clone $chambres)->count(),
            'chambres_occupees' => (clone $chambres)->whereHas('stagiaires')->count(),
            'chambres_disponibles' => (clone $chambres)->where('statut', 'disponible')->count(),
            'demandes_en_attente' => (clone $demandes)->where('statut', 'en_attente')->count(),
            'paiements_retard' => $latePayments,
            'reclamations_ouvertes' => (clone $reclamations)->whereIn('statut', ['en_attente', 'en_cours'])->count(),
            'sorties_en_attente' => (clone $sorties)->where('statut', 'sorti')->count(),
            'monthly_activity' => $this->monthlyActivity($category),
            'notifications' => $this->notifications(
                demandes: clone $demandes,
                reclamations: clone $reclamations,
                paiements: clone $paiements,
                sorties: clone $sorties,
                latePayments: $latePayments
            ),
        ]);
    }

    private function monthlyActivity(?string $category): Collection
    {
        return collect(range(4, 0))
            ->map(fn (int $offset) => now()->startOfMonth()->subMonths($offset))
            ->map(function ($month) use ($category) {
                $sorties = Sortie::query()
                    ->whereBetween('date_sortie', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                    ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)))
                    ->count();

                $paiementsTotal = Paiement::query()
                    ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)))
                    ->where(function ($query) use ($month) {
                        $query
                            ->whereBetween('date_paiement', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                            ->orWhere('mois', $this->monthLabel($month));
                    })
                    ->sum('montant');

                return [
                    'month' => $this->monthLabel($month),
                    'sorties' => $sorties,
                    'paiements' => (float) $paiementsTotal,
                ];
            });
    }

    private function monthLabel($month): string
    {
        return [
            1 => 'Janvier',
            2 => 'Fevrier',
            3 => 'Mars',
            4 => 'Avril',
            5 => 'Mai',
            6 => 'Juin',
            7 => 'Juillet',
            8 => 'Aout',
            9 => 'Septembre',
            10 => 'Octobre',
            11 => 'Novembre',
            12 => 'Decembre',
        ][(int) $month->month];
    }

    private function notifications($demandes, $reclamations, $paiements, $sorties, int $latePayments): Collection
    {
        $today = today();

        $newDemandes = (clone $demandes)->where('statut', 'en_attente')->whereDate('created_at', $today)->count();
        $openReclamations = (clone $reclamations)->whereIn('statut', ['en_attente', 'en_cours'])->count();
        $pendingSorties = (clone $sorties)->where('statut', 'sorti')->count();

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
                'target' => 'stagiaires',
            ],
            [
                'type' => 'sortie',
                'title' => 'Stagiaires dehors',
                'message' => $pendingSorties > 0 ? "$pendingSorties stagiaire(s) sont actuellement dehors" : 'Aucun stagiaire dehors',
                'count' => $pendingSorties,
                'tone' => $pendingSorties > 0 ? 'warning' : 'success',
                'target' => 'sorties',
            ],
        ]);
    }
}
