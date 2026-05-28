<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sorties', function (Blueprint $table) {
            $table->time('heure_sortie')->nullable()->after('date_sortie');
            $table->time('heure_retour_prevue')->nullable()->after('date_retour');
        });
    }

    public function down(): void
    {
        Schema::table('sorties', function (Blueprint $table) {
            $table->dropColumn(['heure_sortie', 'heure_retour_prevue']);
        });
    }
};
