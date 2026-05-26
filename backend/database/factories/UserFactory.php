<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'stagiaire',
            'category' => fake()->randomElement(['filles', 'garcons']),
        ];
    }

    public function stagiaire(string $category): static
    {
        return $this->state(fn () => [
            'role' => 'stagiaire',
            'category' => $category,
        ]);
    }
}
