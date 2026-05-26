<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Chambre, Paiement, Stagiaire};
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PdfController extends Controller
{
    public function export(Request $request, string $type)
    {
        $category = $request->user()?->role === 'responsable' ? $request->user()->category : null;

        [$title, $columns, $rows] = match ($type) {
            'stagiaires' => [
                'Liste des stagiaires',
                ['Nom', 'CIN', 'Genre', 'Filiere', 'Chambre'],
                Stagiaire::with('chambre')
                    ->when($category, fn ($q) => $q->where('category', $category))
                    ->get()
                    ->map(fn ($row) => [
                        trim($row->nom.' '.$row->prenom),
                        $row->cin,
                        $row->genre,
                        $row->filiere,
                        $row->chambre?->numero ?? '-',
                    ]),
            ],
            'chambres' => [
                'Liste des chambres',
                ['Numero', 'Etage', 'Categorie', 'Capacite', 'Occupants', 'Statut'],
                Chambre::withCount('stagiaires')
                    ->when($category, fn ($q) => $q->where('category', $category))
                    ->get()
                    ->map(fn ($row) => [
                        $row->numero,
                        $row->etage ?? '-',
                        $row->category,
                        $row->capacite,
                        $row->stagiaires_count,
                        $row->statut,
                    ]),
            ],
            'paiements' => [
                'Liste des paiements',
                ['Stagiaire', 'Mois', 'Montant', 'Statut', 'Date paiement'],
                Paiement::with('stagiaire')
                    ->whereHas('stagiaire', fn ($q) => $q->when($category, fn ($x) => $x->where('category', $category)))
                    ->get()
                    ->map(fn ($row) => [
                        trim($row->stagiaire->nom.' '.$row->stagiaire->prenom),
                        $row->mois,
                        $row->montant.' DH',
                        $row->statut,
                        $row->date_paiement ?? '-',
                    ]),
            ],
            default => abort(404, 'Type PDF inconnu'),
        };

        $pdf = Pdf::loadView('pdf.export', [
            'title' => $title,
            'columns' => $columns,
            'rows' => $rows,
            'generatedAt' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download($type.'-'.now()->format('Y-m-d').'.pdf');
    }
}
