<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Presence>
 */
class PresenceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date' => fake()->dateTimeBetween('-10 days', 'now'),
            'statut' => fake()->randomElement(['present', 'absent']),
            'ip_address' => '192.168.1.'.fake()->numberBetween(10, 240),
        ];
    }
}
