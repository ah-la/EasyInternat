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
            ['name' => 'Admin General', 'password' => Hash::make('password'), 'role' => 'admin', 'is_active' => true]
        );

        User::firstOrCreate(
            ['email' => 'filles@cmc.test'],
            ['name' => 'Responsable Filles', 'telephone' => '0600000001', 'password' => Hash::make('password'), 'role' => 'responsable', 'category' => 'filles', 'is_active' => true]
        );

        User::firstOrCreate(
            ['email' => 'garcons@cmc.test'],
            ['name' => 'Responsable Garcons', 'telephone' => '0600000002', 'password' => Hash::make('password'), 'role' => 'responsable', 'category' => 'garcons', 'is_active' => true]
        );

        $this->call(DemoStagiairesSeeder::class);
    }
}
