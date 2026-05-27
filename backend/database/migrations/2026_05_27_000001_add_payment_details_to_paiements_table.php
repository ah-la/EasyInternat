<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->string('mode_paiement')->default('Especes')->after('statut');
            $table->string('numero_recu')->nullable()->after('mode_paiement');
            $table->unique(['stagiaire_id', 'mois']);
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropUnique(['stagiaire_id', 'mois']);
            $table->dropColumn(['mode_paiement', 'numero_recu']);
        });
    }
};
