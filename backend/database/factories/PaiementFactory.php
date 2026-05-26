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
        return [
            'mois' => fake()->randomElement(['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai']),
            'montant' => 300,
            'statut' => 'paye',
            'date_paiement' => fake()->dateTimeBetween('-4 months', 'now'),
        ];
    }
}
