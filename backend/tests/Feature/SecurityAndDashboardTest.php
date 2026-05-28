<?php

namespace Tests\Feature;

use App\Models\{Chambre, Demande, Paiement, Reclamation, Sortie, Stagiaire, StagiaireCentre, User};
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
            'statut' => 'sorti',
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

    public function test_sorties_are_role_scoped_and_only_admin_can_delete(): void
    {
        $responsable = User::factory()->create(['role' => 'responsable', 'category' => 'filles']);
        $admin = User::factory()->create(['role' => 'admin']);
        $girlsRoom = Chambre::factory()->create(['category' => 'filles']);
        $boysRoom = Chambre::factory()->create(['category' => 'garcons']);
        $girl = Stagiaire::factory()->filles()->create(['chambre_id' => $girlsRoom->id]);
        $boy = Stagiaire::factory()->garcons()->create(['chambre_id' => $boysRoom->id]);

        $girlSortie = Sortie::create([
            'stagiaire_id' => $girl->id,
            'date_sortie' => today(),
            'date_retour' => today()->addDay(),
            'statut' => 'sorti',
        ]);
        $boySortie = Sortie::create([
            'stagiaire_id' => $boy->id,
            'date_sortie' => today(),
            'date_retour' => today()->subDay(),
            'statut' => 'sorti',
        ]);

        Sanctum::actingAs($responsable);

        $this->getJson('/api/sorties?category=garcons')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.stagiaire.category', 'filles');

        $this->putJson("/api/sorties/{$girlSortie->id}", ['statut' => 'retourne'])
            ->assertOk()
            ->assertJsonPath('statut', 'retourne');

        $this->deleteJson("/api/sorties/{$girlSortie->id}")->assertForbidden();

        Sanctum::actingAs($admin);

        $this->getJson('/api/sorties?statut=retard')
            ->assertOk()
            ->assertJsonPath('data.0.id', $boySortie->id);

        $this->deleteJson("/api/sorties/{$boySortie->id}")->assertNoContent();
    }

    public function test_reclamations_are_role_scoped_and_store_response_history(): void
    {
        $responsable = User::factory()->create(['role' => 'responsable', 'category' => 'filles']);
        $girlsRoom = Chambre::factory()->create(['category' => 'filles']);
        $boysRoom = Chambre::factory()->create(['category' => 'garcons']);
        $girl = Stagiaire::factory()->filles()->create(['chambre_id' => $girlsRoom->id]);
        $boy = Stagiaire::factory()->garcons()->create(['chambre_id' => $boysRoom->id]);

        $girlReclamation = Reclamation::factory()->create([
            'stagiaire_id' => $girl->id,
            'statut' => 'en_attente',
        ]);
        Reclamation::factory()->create([
            'stagiaire_id' => $boy->id,
            'statut' => 'en_attente',
        ]);

        Sanctum::actingAs($responsable);

        $this->getJson('/api/reclamations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.stagiaire.category', 'filles');

        $this->putJson("/api/reclamations/{$girlReclamation->id}", [
            'reponse_admin' => 'Intervention programmee.',
            'statut' => 'en_cours',
        ])
            ->assertOk()
            ->assertJsonPath('statut', 'en_cours')
            ->assertJsonPath('reponse_by.name', $responsable->name);

        $this->assertDatabaseHas('reclamations', [
            'id' => $girlReclamation->id,
            'reponse_by_id' => $responsable->id,
        ]);
        $this->assertNotNull($girlReclamation->fresh()->reponse_at);
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
            'numero_inscription' => 'CMC-D-001',
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
            'numero_inscription' => 'CMC-D-404',
            'email' => 'unknown@cmc.test',
            'telephone' => '0600000000',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_demande_certificate_is_required_and_protected_by_role_scope(): void
    {
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
            'numero_inscription' => 'CMC-D-002',
            'email' => 'lina.demo@cmc.test',
            'telephone' => '0633333302',
            'genre' => 'Fille',
            'filiere' => 'Infrastructure Digitale',
        ])->assertUnprocessable();

        $demandeId = $this->postJson('/api/demandes', [
            'nom' => 'Lina',
            'cin' => 'DMF1002',
            'numero_inscription' => 'CMC-D-002',
            'email' => 'lina.demo@cmc.test',
            'telephone' => '0633333302',
            'genre' => 'Fille',
            'filiere' => 'Infrastructure Digitale',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertCreated()->json('id');

        Demande::find($demandeId)->update(['certificat_residence' => 'certificats/demo-DMF1002.png']);

        Sanctum::actingAs($responsableGarcons);
        $this->getJson("/api/demandes/{$demandeId}/certificat")->assertForbidden();

        Sanctum::actingAs($admin);
        $this->getJson("/api/demandes/{$demandeId}/certificat")->assertOk();
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
            'numero_inscription' => 'CMC-D-003',
            'email' => 'sara.demo@cmc.test',
            'telephone' => '0633333303',
            'genre' => 'Fille',
            'filiere' => 'Developpement Digital',
            'certificat_residence' => UploadedFile::fake()->create('certificat.pdf', 32, 'application/pdf'),
        ])->assertCreated()->json('id');

        Sanctum::actingAs($admin);

        $this->postJson("/api/demandes/{$demandeId}/accept", [
            'chambre_id' => $room->id,
            'password' => 'cmc-demo-123',
            'password_confirmation' => 'cmc-demo-123',
        ])
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
            'date_paiement' => now()->toDateString(),
        ])->assertUnprocessable();

        $this->postJson('/api/paiements', [
            'stagiaire_id' => $stagiaire->id,
            'mois' => 'Mai',
            'montant' => 300,
            'date_paiement' => now()->toDateString(),
        ])->assertSuccessful()
            ->assertJsonPath('statut', 'paye');

        $this->postJson('/api/paiements', [
            'stagiaire_id' => $stagiaire->id,
            'mois' => 'Mai',
            'montant' => 300,
            'date_paiement' => now()->toDateString(),
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Ce mois est deja paye pour ce stagiaire');
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

    public function test_chambre_validation_blocks_duplicates_over_capacity_and_occupied_delete(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $room = Chambre::factory()->create([
            'numero' => 'F-777',
            'category' => 'filles',
            'capacite' => 4,
        ]);

        $this->postJson('/api/chambres', [
            'numero' => 'F-777',
            'etage' => '1ere etage',
            'category' => 'filles',
            'capacite' => 4,
        ])->assertUnprocessable();

        $this->postJson('/api/chambres', [
            'numero' => 'F-778',
            'etage' => '1ere etage',
            'category' => 'filles',
            'capacite' => 5,
        ])->assertUnprocessable();

        Stagiaire::factory()->filles()->create(['chambre_id' => $room->id]);

        $this->putJson("/api/chambres/{$room->id}", [
            'category' => 'garcons',
        ])->assertUnprocessable();

        $this->deleteJson("/api/chambres/{$room->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Impossible de supprimer une chambre occupée.');
    }

    public function test_stagiaire_transfer_respects_category_and_room_capacity(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $fillesRoom = Chambre::factory()->create(['category' => 'filles', 'capacite' => 4]);
        $garconsRoom = Chambre::factory()->create(['category' => 'garcons', 'capacite' => 4]);
        $fullRoom = Chambre::factory()->create(['category' => 'filles', 'capacite' => 1]);
        $stagiaire = Stagiaire::factory()->filles()->create(['chambre_id' => $fillesRoom->id]);
        Stagiaire::factory()->filles()->create(['chambre_id' => $fullRoom->id]);

        Sanctum::actingAs($admin);

        $this->putJson("/api/stagiaires/{$stagiaire->id}", [
            'chambre_id' => $garconsRoom->id,
        ])->assertUnprocessable();

        $this->putJson("/api/stagiaires/{$stagiaire->id}", [
            'chambre_id' => $fullRoom->id,
        ])->assertUnprocessable();

        $this->putJson("/api/stagiaires/{$stagiaire->id}", [
            'chambre_id' => null,
        ])->assertOk()
            ->assertJsonPath('chambre_id', null);
    }

    public function test_admin_creates_responsable_account_and_inactive_responsable_cannot_login(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Chambre::factory()->create(['category' => 'filles']);
        Stagiaire::factory()->filles()->count(2)->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/responsables', [
            'name' => 'Responsable Test',
            'email' => 'responsable.test@cmc.test',
            'telephone' => '0611111111',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'category' => 'filles',
            'is_active' => true,
        ]);

        $response->assertSuccessful()
            ->assertJsonPath('role', 'responsable')
            ->assertJsonPath('category', 'filles')
            ->assertJsonPath('managed_stagiaires_count', 2);

        $responsable = User::where('email', 'responsable.test@cmc.test')->firstOrFail();
        $this->assertTrue(Hash::check('secret123', $responsable->password));

        $this->putJson("/api/responsables/{$responsable->id}", [
            'is_active' => false,
        ])->assertSuccessful()
            ->assertJsonPath('is_active', false);

        $this->postJson('/api/login', [
            'email' => 'responsable.test@cmc.test',
            'password' => 'secret123',
        ])->assertForbidden();
    }
}
