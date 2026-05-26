<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Stagiaire>
 */
class StagiaireFactory extends Factory
{
    public function definition(): array
    {
        $category = fake()->randomElement(['filles', 'garcons']);

        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName($category === 'filles' ? 'female' : 'male'),
            'cin' => strtoupper(fake()->bothify('??######')),
            'telephone' => '06'.fake()->numerify('########'),
            'genre' => $category === 'filles' ? 'Fille' : 'Garcon',
            'filiere' => fake()->randomElement([
                'Developpement Digital',
                'Infrastructure Digitale',
                'Gestion des Entreprises',
                'Reseaux Informatiques',
            ]),
            'category' => $category,
        ];
    }

    public function filles(): static
    {
        return $this->state(fn () => [
            'genre' => 'Fille',
            'category' => 'filles',
        ]);
    }

    public function garcons(): static
    {
        return $this->state(fn () => [
            'genre' => 'Garcon',
            'category' => 'garcons',
        ]);
    }
}
