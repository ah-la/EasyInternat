<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('sorties')->where('statut', 'en_attente')->update(['statut' => 'sorti']);
        DB::table('sorties')->where('statut', 'validee')->update(['statut' => 'retourne']);
        DB::table('sorties')->where('statut', 'refusee')->update(['statut' => 'sorti']);
    }

    public function down(): void
    {
        DB::table('sorties')->where('statut', 'sorti')->update(['statut' => 'en_attente']);
        DB::table('sorties')->where('statut', 'retourne')->update(['statut' => 'validee']);
    }
};
