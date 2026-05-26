<?php

namespace App\Services;

use App\Models\Stagiaire;
use Illuminate\Support\Str;

class PaymentStatusService
{
    private const MONTHS = [
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
    ];

    public function decorate(Stagiaire $stagiaire): Stagiaire
    {
        $status = $this->statusFor($stagiaire);

        $stagiaire->setAttribute('payment_status', $status['status']);
        $stagiaire->setAttribute('payment_label', $status['label']);
        $stagiaire->setAttribute('payment_due_month', $status['due_month']);
        $stagiaire->setAttribute('payment_latest_month', $status['latest_month']);

        return $stagiaire;
    }

    public function statusFor(Stagiaire $stagiaire): array
    {
        $paidMonths = $this->paidMonthNumbers($stagiaire);
        $currentMonth = (int) now()->month;
        $latestPaidMonth = empty($paidMonths) ? null : max($paidMonths);

        if (in_array($currentMonth, $paidMonths, true) || ($latestPaidMonth && $latestPaidMonth > $currentMonth)) {
            return $this->state('paye', 'Paye', $currentMonth, $latestPaidMonth);
        }

        if (now()->day > 10) {
            return $this->state('en_retard', 'En retard', $currentMonth, $latestPaidMonth);
        }

        return $this->state('a_payer', 'A payer', $currentMonth, $latestPaidMonth);
    }

    public function lateCount($stagiaires): int
    {
        return $stagiaires->filter(fn (Stagiaire $stagiaire) => $this->statusFor($stagiaire)['status'] === 'en_retard')->count();
    }

    private function state(string $status, string $label, int $dueMonth, ?int $latestMonth): array
    {
        return [
            'status' => $status,
            'label' => $label,
            'due_month' => self::MONTHS[$dueMonth],
            'latest_month' => $latestMonth ? self::MONTHS[$latestMonth] : null,
        ];
    }

    private function paidMonthNumbers(Stagiaire $stagiaire): array
    {
        $paiements = $stagiaire->relationLoaded('paiements')
            ? $stagiaire->paiements
            : $stagiaire->paiements()->where('statut', 'paye')->get(['mois', 'statut']);

        return $paiements
            ->where('statut', 'paye')
            ->flatMap(fn ($paiement) => explode(',', (string) $paiement->mois))
            ->map(fn ($month) => $this->monthNumber($month))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function monthNumber(string $month): ?int
    {
        $normalized = Str::of($month)->ascii()->lower()->trim()->toString();

        foreach (self::MONTHS as $number => $name) {
            if ($normalized === Str::of($name)->ascii()->lower()->toString()) {
                return $number;
            }
        }

        return null;
    }
}
