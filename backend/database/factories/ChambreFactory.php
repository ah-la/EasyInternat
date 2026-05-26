<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Chambre>
 */
class ChambreFactory extends Factory
{
    public function definition(): array
    {
        $category = fake()->randomElement(['filles', 'garcons']);

        return [
            'numero' => ($category === 'filles' ? 'F' : 'G').'-'.fake()->unique()->numberBetween(100, 399),
            'etage' => fake()->randomElement(['1ere etage', '2eme etage', '3eme etage']),
            'category' => $category,
            'capacite' => 4,
            'statut' => 'disponible',
        ];
    }

    public function filles(): static
    {
        return $this->state(fn () => ['category' => 'filles']);
    }

    public function garcons(): static
    {
        return $this->state(fn () => ['category' => 'garcons']);
    }
}
