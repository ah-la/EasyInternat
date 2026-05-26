<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stagiaires', function (Blueprint $table) {
            $table->index(['category', 'chambre_id'], 'stagiaires_category_chambre_idx');
            $table->index(['genre', 'category'], 'stagiaires_genre_category_idx');
        });

        Schema::table('chambres', function (Blueprint $table) {
            $table->index(['category', 'statut'], 'chambres_category_statut_idx');
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->index(['genre', 'statut', 'created_at'], 'demandes_genre_statut_created_idx');
            $table->index(['cin', 'statut'], 'demandes_cin_statut_idx');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->index(['stagiaire_id', 'mois'], 'paiements_stagiaire_mois_idx');
            $table->index(['statut', 'date_paiement'], 'paiements_statut_date_idx');
        });

        Schema::table('reclamations', function (Blueprint $table) {
            $table->index(['statut', 'type', 'created_at'], 'reclamations_statut_type_created_idx');
        });

        Schema::table('sorties', function (Blueprint $table) {
            $table->index(['statut', 'date_sortie'], 'sorties_statut_date_idx');
        });
    }

    public function down(): void
    {
        Schema::table('sorties', function (Blueprint $table) {
            $table->dropIndex('sorties_statut_date_idx');
        });

        Schema::table('reclamations', function (Blueprint $table) {
            $table->dropIndex('reclamations_statut_type_created_idx');
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex('paiements_stagiaire_mois_idx');
            $table->dropIndex('paiements_statut_date_idx');
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->dropIndex('demandes_genre_statut_created_idx');
            $table->dropIndex('demandes_cin_statut_idx');
        });

        Schema::table('chambres', function (Blueprint $table) {
            $table->dropIndex('chambres_category_statut_idx');
        });

        Schema::table('stagiaires', function (Blueprint $table) {
            $table->dropIndex('stagiaires_category_chambre_idx');
            $table->dropIndex('stagiaires_genre_category_idx');
        });
    }
};
