<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Reclamation>
 */
class ReclamationFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['Chambre', 'Paiement', 'Presence', 'Maintenance']);

        return [
            'type' => $type,
            'sujet' => $type === 'Chambre' ? 'Probleme chambre' : 'Demande de suivi',
            'message' => fake()->sentence(12),
            'reponse_admin' => null,
            'statut' => fake()->randomElement(['en_attente', 'en_cours', 'traitee']),
        ];
    }
}
