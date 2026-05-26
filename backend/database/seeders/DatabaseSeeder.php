<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@cmc.test'],
            ['name' => 'Admin General', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'filles@cmc.test'],
            ['name' => 'Responsable Filles', 'password' => Hash::make('password'), 'role' => 'responsable', 'category' => 'filles']
        );

        User::firstOrCreate(
            ['email' => 'garcons@cmc.test'],
            ['name' => 'Responsable Garcons', 'password' => Hash::make('password'), 'role' => 'responsable', 'category' => 'garcons']
        );

        $this->call(DemoStagiairesSeeder::class);
    }
}
