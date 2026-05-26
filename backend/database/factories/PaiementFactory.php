<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Paiement>
 */
class PaiementFactory extends Factory
{
    public function definition(): array
    {
        $statut = fake()->randomElement(['paye', 'en_retard', 'non_paye']);

        return [
            'mois' => fake()->randomElement(['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai']),
            'montant' => 300,
            'statut' => $statut,
            'date_paiement' => $statut === 'paye' ? fake()->dateTimeBetween('-4 months', 'now') : null,
        ];
    }
}
