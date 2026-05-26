<?php

namespace Tests\Feature;

use App\Models\{Chambre, Paiement, Presence, Reclamation, Sortie, Stagiaire, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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
        Presence::factory()->create(['stagiaire_id' => $stagiaire->id, 'date' => today(), 'statut' => 'absent']);
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
}
