<?php

namespace Database\Seeders;

use App\Models\{Chambre, Paiement, Presence, Reclamation, Stagiaire, StagiaireCentre, User};
use Illuminate\Database\Seeder;

class DemoStagiairesSeeder extends Seeder
{
    public function run(): void
    {
        $chambres = [
            'F-101' => $this->chambre('F-101', 'filles', '1ere etage'),
            'F-102' => $this->chambre('F-102', 'filles', '1ere etage'),
            'G-201' => $this->chambre('G-201', 'garcons', '2eme etage'),
            'G-202' => $this->chambre('G-202', 'garcons', '2eme etage'),
        ];

        $stagiaires = [
            ['Ahlam', 'Hiba', 'AB123', '0600000000', 'Developpement Digital', 'filles', 'F-101'],
            ['Salma', 'Bennani', 'EF1001', '0611111101', 'Infrastructure Digitale', 'filles', 'F-101'],
            ['Aya', 'El Idrissi', 'EF1002', '0611111102', 'Gestion des Entreprises', 'filles', 'F-102'],
            ['Imane', 'Rami', 'EF1003', '0611111103', 'Developpement Digital', 'filles', 'F-102'],
            ['Nour', 'Amrani', 'EF1004', '0611111104', 'Reseaux Informatiques', 'filles', 'F-102'],
            ['Yassine', 'Omar', 'CD456', '0622222201', 'Infrastructure Digitale', 'garcons', 'G-201'],
            ['Mehdi', 'Alaoui', 'EG2001', '0622222202', 'Developpement Digital', 'garcons', 'G-201'],
            ['Hamza', 'Fassi', 'EG2002', '0622222203', 'Reseaux Informatiques', 'garcons', 'G-202'],
            ['Anas', 'Berrada', 'EG2003', '0622222204', 'Gestion des Entreprises', 'garcons', 'G-202'],
            ['Othmane', 'Naciri', 'EG2004', '0622222205', 'Infrastructure Digitale', 'garcons', 'G-202'],
        ];

        foreach ($stagiaires as $index => [$nom, $prenom, $cin, $telephone, $filiere, $category, $chambreNumero]) {
            $genre = $category === 'filles' ? 'Fille' : 'Garcon';
            $email = $index === 0 ? 'stagiaire@cmc.test' : strtolower($prenom.'.'.$nom.'@cmc.test');

            $numeroInscription = match ($cin) {
                'AB123' => 'CMC001',
                'CD456' => 'CMC002',
                default => 'DEMO-'.($category === 'filles' ? 'F' : 'G').'-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
            };

            StagiaireCentre::updateOrCreate(
                ['cin' => $cin],
                [
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'numero_inscription' => $numeroInscription,
                    'filiere' => $filiere,
                    'genre' => $genre,
                ]
            );

            $userAttributes = User::factory()
                ->stagiaire($category)
                ->make([
                    'name' => $nom.' '.$prenom,
                    'email' => $email,
                ])
                ->getAttributes();

            unset($userAttributes['remember_token'], $userAttributes['email_verified_at']);
            $user = User::updateOrCreate(['email' => $email], $userAttributes);

            $stagiaireAttributes = Stagiaire::factory()
                ->state($category === 'filles' ? ['genre' => 'Fille', 'category' => 'filles'] : ['genre' => 'Garcon', 'category' => 'garcons'])
                ->make([
                    'user_id' => $user->id,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'cin' => $cin,
                    'telephone' => $telephone,
                    'filiere' => $filiere,
                    'chambre_id' => $chambres[$chambreNumero]->id,
                ])
                ->getAttributes();

            $stagiaire = Stagiaire::updateOrCreate(['cin' => $cin], $stagiaireAttributes);

            $this->seedProfileData($stagiaire, $index);
        }
    }

    private function chambre(string $numero, string $category, string $etage): Chambre
    {
        $attributes = Chambre::factory()
            ->state(['numero' => $numero, 'category' => $category, 'etage' => $etage])
            ->make()
            ->getAttributes();

        return Chambre::updateOrCreate(['numero' => $numero], $attributes);
    }

    private function seedProfileData(Stagiaire $stagiaire, int $index): void
    {
        $months = ['Mars', 'Avril', 'Mai'];

        foreach ($months as $monthIndex => $mois) {
            $statut = ($index + $monthIndex) % 3 === 0 ? 'en_retard' : 'paye';
            $attributes = Paiement::factory()
                ->make([
                    'stagiaire_id' => $stagiaire->id,
                    'mois' => $mois,
                    'statut' => $statut,
                    'date_paiement' => $statut === 'paye' ? now()->subDays($monthIndex + 1) : null,
                ])
                ->getAttributes();

            Paiement::updateOrCreate(
                ['stagiaire_id' => $stagiaire->id, 'mois' => $mois],
                $attributes
            );
        }

        for ($day = 0; $day < 3; $day++) {
            $date = today()->subDays($day);
            $attributes = Presence::factory()
                ->make([
                    'stagiaire_id' => $stagiaire->id,
                    'date' => $date,
                    'statut' => ($index + $day) % 4 === 0 ? 'absent' : 'present',
                ])
                ->getAttributes();

            Presence::updateOrCreate(
                ['stagiaire_id' => $stagiaire->id, 'date' => $date],
                $attributes
            );
        }

        $attributes = Reclamation::factory()
            ->make([
                'stagiaire_id' => $stagiaire->id,
                'type' => $index % 2 === 0 ? 'Chambre' : 'Maintenance',
                'sujet' => $index % 2 === 0 ? 'Probleme chambre' : 'Demande maintenance',
                'message' => $index % 2 === 0 ? 'Probleme a verifier dans la chambre.' : 'Besoin d une intervention technique.',
                'statut' => $index % 3 === 0 ? 'traitee' : 'en_attente',
                'reponse_admin' => $index % 3 === 0 ? 'Votre reclamation a ete traitee.' : null,
            ])
            ->getAttributes();

        Reclamation::updateOrCreate(
            ['stagiaire_id' => $stagiaire->id, 'sujet' => $attributes['sujet']],
            $attributes
        );
    }
}
