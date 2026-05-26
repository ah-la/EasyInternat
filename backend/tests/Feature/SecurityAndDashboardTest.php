<?php

namespace Tests\Feature;

use App\Models\{Chambre, Paiement, Reclamation, Sortie, Stagiaire, StagiaireCentre, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAndDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_responsable_filles_cannot_list_garcons_even_with_query_filter(): void
    {
        $responsable = User::factory()->create([
            'role' => 'responsable',
            'category' => 'filles',
            'password' => Hash::make('password'),
        ]);

        $girlsRoom = Chambre::factory()->create(['numero' => 'F-901', 'category' => 'filles']);
        $boysRoom = Chambre::factory()->create(['numero' => 'G-901', 'category' => 'garcons']);

        Stagiaire::factory()->create([
            'nom' => 'Aya',
            'genre' => 'Fille',
            'category' => 'filles',
            'chambre_id' => $girlsRoom->id,
        ]);
        Stagiaire::factory()->create([
            'nom' => 'Yassine',
            'genre' => 'Garcon',
            'category' => 'garcons',
            'chambre_id' => $boysRoom->id,
        ]);

        Sanctum::actingAs($responsable);

        $response = $this->getJson('/api/stagiaires?category=garcons');

        $response->assertOk();
        $this->assertSame(['filles'], collect($response->json('data'))->pluck('category')->unique()->values()->all());
    }

    public function test_stagiaire_cannot_create_sortie_for_another_stagiaire(): void
    {
        $firstUser = User::factory()->stagiaire('filles')->create();
        $secondUser = User::factory()->stagiaire('filles')->create();

        $room = Chambre::factory()->create(['category' => 'filles']);
        $first = Stagiaire::factory()->filles()->create(['user_id' => $firstUser->id, 'chambre_id' => $room->id]);
        $second = Stagiaire::factory()->filles()->create(['user_id' => $secondUser->id, 'chambre_id' => $room->id]);

        Sanctum::actingAs($firstUser);

        $response = $this->postJson('/api/sorties', [
            'stagiaire_id' => $second->id,
            'date_sortie' => now()->toDateString(),
            'date_retour' => now()->addDay()->toDateString(),
            'contact' => '0600000000',
            'motif' => 'Test securite',
        ]);

        $response->assertSuccessful();
        $this->assertDatabaseHas('sorties', [
            'id' => $response->json('id'),
            'stagiaire_id' => $first->id,
        ]);
    }

    public function test_dashboard_returns_role_scoped_notifications(): void
    {
        $responsable = User::factory()->create([
            'role' => 'responsable',
            'category' => 'filles',
        ]);
        $room = Chambre::factory()->create(['category' => 'filles']);
        $stagiaire = Stagiaire::factory()->filles()->create(['chambre_id' => $room->id]);

        Paiement::factory()->create(['stagiaire_id' => $stagiaire->id, 'statut' => 'en_retard']);
        Reclamation::factory()->create(['stagiaire_id' => $stagiaire->id, 'statut' => 'en_attente']);
        Sortie::create([
            'stagiaire_id' => $stagiaire->id,
            'date_sortie' => today(),
            'date_retour' => today()->addDay(),
            'statut' => 'en_attente',
        ]);

        Sanctum::actingAs($responsable);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('paiements_retard', 1)
            ->assertJsonPath('reclamations_ouvertes', 1)
            ->assertJsonPath('sorties_en_attente', 1)
            ->assertJsonStructure([
                'notifications' => [
                    '*' => ['type', 'title', 'message', 'count', 'tone', 'target'],
                ],
            ]);
    }

    public function test_public_demande_requires_center_candidate_and_uses_center_data(): void
    {
        Storage::fake('public');

        StagiaireCentre::create([
            'nom' => 'Kenza',
            'prenom' => 'Mansouri',
            'cin' => 'DMF1001',
            'numero_inscription' => 'CMC-D-001',
            'filiere' => 'Developpement Digital',
            'genre' => 'Fille',
        ]);

        $response = $this->postJson('/api/demandes', [
            'nom' => 'Nom saisi',
            'cin' => 'DMF1001',
            'email' => 'kenza.demo@cmc.test',
            'telephone' => '0633333301',
            'genre' => 'Garcon',
            'filiere' => 'Autre filiere',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('nom', 'Kenza')
            ->assertJsonPath('prenom', 'Mansouri')
            ->assertJsonPath('genre', 'Fille')
            ->assertJsonPath('filiere', 'Developpement Digital');

        $this->postJson('/api/demandes', [
            'nom' => 'Inconnu',
            'cin' => 'UNKNOWN',
            'email' => 'unknown@cmc.test',
            'telephone' => '0600000000',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_demande_certificate_is_required_and_protected_by_role_scope(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $responsableGarcons = User::factory()->create(['role' => 'responsable', 'category' => 'garcons']);
        StagiaireCentre::create([
            'nom' => 'Lina',
            'prenom' => 'Tazi',
            'cin' => 'DMF1002',
            'numero_inscription' => 'CMC-D-002',
            'filiere' => 'Infrastructure Digitale',
            'genre' => 'Fille',
        ]);

        $this->postJson('/api/demandes', [
            'nom' => 'Lina',
            'cin' => 'DMF1002',
            'email' => 'lina.demo@cmc.test',
            'telephone' => '0633333302',
            'genre' => 'Fille',
            'filiere' => 'Infrastructure Digitale',
        ])->assertUnprocessable();

        $demandeId = $this->postJson('/api/demandes', [
            'nom' => 'Lina',
            'cin' => 'DMF1002',
            'email' => 'lina.demo@cmc.test',
            'telephone' => '0633333302',
            'genre' => 'Fille',
            'filiere' => 'Infrastructure Digitale',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertCreated()->json('id');

        Sanctum::actingAs($responsableGarcons);
        $this->getJson("/api/demandes/{$demandeId}/certificat")->assertForbidden();

        Sanctum::actingAs($admin);
        $this->get("/api/demandes/{$demandeId}/certificat")->assertOk();
    }

    public function test_accepting_demande_assigns_available_room(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $room = Chambre::factory()->create(['category' => 'filles', 'capacite' => 4]);
        StagiaireCentre::create([
            'nom' => 'Sara',
            'prenom' => 'Amal',
            'cin' => 'DMF1003',
            'numero_inscription' => 'CMC-D-003',
            'filiere' => 'Developpement Digital',
            'genre' => 'Fille',
        ]);

        $demandeId = $this->postJson('/api/demandes', [
            'nom' => 'Sara',
            'cin' => 'DMF1003',
            'email' => 'sara.demo@cmc.test',
            'telephone' => '0633333303',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertCreated()->json('id');

        Sanctum::actingAs($admin);

        $this->postJson("/api/demandes/{$demandeId}/accept")
            ->assertOk()
            ->assertJsonPath('stagiaire.chambre_id', $room->id);
    }


    public function test_paiement_creation_accepts_only_real_paid_records(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $room = Chambre::factory()->create(['category' => 'filles']);
        $stagiaire = Stagiaire::factory()->filles()->create(['chambre_id' => $room->id]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/paiements', [
            'stagiaire_id' => $stagiaire->id,
            'mois' => 'Mai',
            'montant' => 300,
            'statut' => 'en_retard',
        ])->assertUnprocessable();

        $this->postJson('/api/paiements', [
            'stagiaire_id' => $stagiaire->id,
            'mois' => 'Mai',
            'montant' => 300,
        ])->assertSuccessful()
            ->assertJsonPath('statut', 'paye');
    }

    public function test_stagiaire_creation_creates_account_and_blocks_full_room(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $room = Chambre::factory()->create(['category' => 'filles', 'capacite' => 1]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/stagiaires', [
            'nom' => 'Aya',
            'prenom' => 'Test',
            'cin' => 'AA1000',
            'telephone' => '0600000000',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'chambre_id' => $room->id,
            'email' => 'aya.test@cmc.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSuccessful()
            ->assertJsonPath('user.role', 'stagiaire')
            ->assertJsonPath('chambre.id', $room->id);

        $this->assertDatabaseHas('users', [
            'email' => 'aya.test@cmc.test',
            'role' => 'stagiaire',
            'category' => 'filles',
        ]);

        $this->postJson('/api/stagiaires', [
            'nom' => 'Nour',
            'prenom' => 'Test',
            'cin' => 'AA1001',
            'telephone' => '0600000001',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'chambre_id' => $room->id,
            'email' => 'nour.test@cmc.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable();
    }
}
