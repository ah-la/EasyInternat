<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Demande>
 */
class DemandeFactory extends Factory
{
    public function definition(): array
    {
        $genre = fake()->randomElement(['Fille', 'Garcon']);

        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName($genre === 'Fille' ? 'female' : 'male'),
            'cin' => strtoupper(fake()->bothify('??####')),
            'numero_inscription' => strtoupper(fake()->bothify('CMC-###')),
            'email' => fake()->unique()->safeEmail(),
            'telephone' => fake()->numerify('06########'),
            'genre' => $genre,
            'filiere' => fake()->randomElement(['Developpement Digital', 'Infrastructure Digitale', 'Gestion des Entreprises']),
            'certificat_residence' => null,
            'statut' => 'en_attente',
            'motif_refus' => null,
        ];
    }
}
