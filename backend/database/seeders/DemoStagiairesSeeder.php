<?php

namespace Database\Seeders;

use App\Models\{Chambre, Paiement, Reclamation, Sortie, Stagiaire, StagiaireCentre, User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoStagiairesSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->clearOldDemoData();

            $chambres = $this->seedChambres();

            $stagiaires = [
                ['Salma', 'Bennani', 'EF1001', '0611111101', 'Developpement Digital', 'filles', 'F-101', 'stagiaire@cmc.test'],
                ['Aya', 'El Idrissi', 'EF1002', '0611111102', 'Infrastructure Digitale', 'filles', 'F-101', 'aya.elidrissi@cmc.test'],
                ['Imane', 'Rami', 'EF1003', '0611111103', 'Gestion des Entreprises', 'filles', 'F-102', 'imane.rami@cmc.test'],
                ['Yassine', 'Omar', 'EG2001', '0622222201', 'Developpement Digital', 'garcons', 'G-201', 'yassine.omar@cmc.test'],
                ['Mehdi', 'Alaoui', 'EG2002', '0622222202', 'Infrastructure Digitale', 'garcons', 'G-201', 'mehdi.alaoui@cmc.test'],
                ['Hamza', 'Fassi', 'EG2003', '0622222203', 'Reseaux Informatiques', 'garcons', 'G-202', 'hamza.fassi@cmc.test'],
            ];

            foreach ($stagiaires as $index => [$nom, $prenom, $cin, $telephone, $filiere, $category, $chambreNumero, $email]) {
                $stagiaire = $this->seedStagiaire(
                    $nom,
                    $prenom,
                    $cin,
                    $telephone,
                    $filiere,
                    $category,
                    $chambres[$chambreNumero],
                    $email,
                    $index
                );

                $this->seedPaiements($stagiaire, $index);
                $this->seedReclamations($stagiaire, $index);
                $this->seedSortie($stagiaire, $index);
            }
        });
    }

    private function clearOldDemoData(): void
    {
        $stagiaireUserIds = User::where('role', 'stagiaire')->pluck('id');

        DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->whereIn('tokenable_id', $stagiaireUserIds)
            ->delete();

        Sortie::query()->delete();
        Paiement::query()->delete();
        Reclamation::query()->delete();
        Stagiaire::query()->delete();
        User::where('role', 'stagiaire')->delete();
        Chambre::query()->delete();
        StagiaireCentre::query()->delete();

        if (DB::getSchemaBuilder()->hasTable('action_histories')) {
            DB::table('action_histories')
                ->whereIn('target_type', [
                    Chambre::class,
                    Paiement::class,
                    Reclamation::class,
                    Sortie::class,
                    Stagiaire::class,
                    User::class,
                ])
                ->delete();
        }
    }

    /**
     * @return array<string, Chambre>
     */
    private function seedChambres(): array
    {
        $rooms = [
            ['F-101', 'filles', '1ere etage'],
            ['F-102', 'filles', '1ere etage'],
            ['G-201', 'garcons', '2eme etage'],
            ['G-202', 'garcons', '2eme etage'],
        ];

        $chambres = [];

        foreach ($rooms as [$numero, $category, $etage]) {
            $chambres[$numero] = Chambre::create([
                'numero' => $numero,
                'category' => $category,
                'etage' => $etage,
                'capacite' => 4,
                'statut' => 'disponible',
            ]);
        }

        return $chambres;
    }

    private function seedStagiaire(
        string $nom,
        string $prenom,
        string $cin,
        string $telephone,
        string $filiere,
        string $category,
        Chambre $chambre,
        string $email,
        int $index
    ): Stagiaire {
        $genre = $category === 'filles' ? 'Fille' : 'Garcon';

        StagiaireCentre::create([
            'nom' => $nom,
            'prenom' => $prenom,
            'cin' => $cin,
            'numero_inscription' => 'CMC-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
            'filiere' => $filiere,
            'genre' => $genre,
        ]);

        $user = User::factory()
            ->stagiaire($category)
            ->create([
                'name' => $nom.' '.$prenom,
                'email' => $email,
            ]);

        return Stagiaire::create([
            'user_id' => $user->id,
            'nom' => $nom,
            'prenom' => $prenom,
            'cin' => $cin,
            'telephone' => $telephone,
            'genre' => $genre,
            'filiere' => $filiere,
            'chambre_id' => $chambre->id,
            'category' => $category,
        ]);
    }

    private function seedPaiements(Stagiaire $stagiaire, int $index): void
    {
        $months = $index % 2 === 0 ? ['Avril', 'Mai', 'Juin'] : ['Mai', 'Juin'];

        foreach ($months as $monthIndex => $mois) {
            Paiement::create([
                'stagiaire_id' => $stagiaire->id,
                'mois' => $mois,
                'montant' => 300,
                'statut' => 'paye',
                'mode_paiement' => $monthIndex % 2 === 0 ? 'Especes' : 'Virement',
                'numero_recu' => 'REC-'.$stagiaire->id.'-'.str_pad((string) ($monthIndex + 1), 2, '0', STR_PAD_LEFT),
                'date_paiement' => now()->subDays(($monthIndex + 1) * 5)->toDateString(),
            ]);
        }
    }

    private function seedReclamations(Stagiaire $stagiaire, int $index): void
    {
        $isHandled = $index % 3 === 0;

        Reclamation::create([
            'stagiaire_id' => $stagiaire->id,
            'type' => $index % 2 === 0 ? 'Chambre' : 'Maintenance',
            'sujet' => $index % 2 === 0 ? 'Probleme chambre' : 'Demande maintenance',
            'message' => $index % 2 === 0
                ? 'Probleme a verifier dans la chambre.'
                : 'Besoin d une intervention technique.',
            'statut' => $isHandled ? 'traitee' : 'en_attente',
            'reponse_admin' => $isHandled ? 'Votre reclamation a ete traitee.' : null,
            'reponse_at' => $isHandled ? now()->subDays(1) : null,
        ]);
    }

    private function seedSortie(Stagiaire $stagiaire, int $index): void
    {
        Sortie::create([
            'stagiaire_id' => $stagiaire->id,
            'date_sortie' => now()->subDays($index + 1)->toDateString(),
            'heure_sortie' => '09:00',
            'date_retour' => now()->addDays($index % 2 === 0 ? 1 : 2)->toDateString(),
            'heure_retour_prevue' => '18:00',
            'contact' => $stagiaire->telephone,
            'motif' => $index % 2 === 0 ? 'Visite familiale' : 'Rendez-vous administratif',
            'statut' => $index % 3 === 0 ? 'retourne' : 'sorti',
        ]);
    }
}
