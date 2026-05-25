<?php

namespace Database\Seeders;

use App\Models\{Chambre, Paiement, Presence, Reclamation, Stagiaire, StagiaireCentre, User};
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

        $user = User::firstOrCreate(
            ['email' => 'stagiaire@cmc.test'],
            ['name' => 'Ahlam Hiba', 'password' => Hash::make('password'), 'role' => 'stagiaire', 'category' => 'filles']
        );

        StagiaireCentre::upsert([
            ['nom' => 'Ahlam', 'prenom' => 'Hiba', 'cin' => 'AB123', 'numero_inscription' => 'CMC001', 'filiere' => 'Developpement Digital', 'genre' => 'Fille', 'created_at' => now(), 'updated_at' => now()],
            ['nom' => 'Yassine', 'prenom' => 'Omar', 'cin' => 'CD456', 'numero_inscription' => 'CMC002', 'filiere' => 'Infrastructure Digitale', 'genre' => 'Garcon', 'created_at' => now(), 'updated_at' => now()],
        ], ['cin'], ['nom', 'prenom', 'numero_inscription', 'filiere', 'genre', 'updated_at']);

        $chambre = Chambre::firstOrCreate(
            ['numero' => 'F-101'],
            ['etage' => '1ere etage', 'category' => 'filles', 'capacite' => 4, 'statut' => 'disponible']
        );

        Chambre::firstOrCreate(
            ['numero' => 'G-201'],
            ['etage' => '2eme etage', 'category' => 'garcons', 'capacite' => 4, 'statut' => 'disponible']
        );

        $stagiaire = Stagiaire::firstOrCreate(
            ['cin' => 'AB123'],
            ['user_id' => $user->id, 'nom' => 'Ahlam', 'prenom' => 'Hiba', 'telephone' => '0600000000', 'genre' => 'Fille', 'filiere' => 'Developpement Digital', 'chambre_id' => $chambre->id, 'category' => 'filles']
        );

        Paiement::firstOrCreate(
            ['stagiaire_id' => $stagiaire->id, 'mois' => 'Mai'],
            ['montant' => 300, 'statut' => 'paye', 'date_paiement' => now()]
        );

        Presence::firstOrCreate(
            ['stagiaire_id' => $stagiaire->id, 'date' => today()],
            ['statut' => 'present', 'ip_address' => '192.168.1.10']
        );

        Reclamation::firstOrCreate(
            ['stagiaire_id' => $stagiaire->id, 'sujet' => 'Fenetre'],
            ['type' => 'Chambre', 'message' => 'Probleme de fenetre dans la chambre.', 'statut' => 'en_attente']
        );
    }
}
