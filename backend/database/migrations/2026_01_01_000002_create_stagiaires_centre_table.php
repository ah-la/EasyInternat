<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stagiaires_centre', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->unique();
            $table->string('numero_inscription')->nullable()->unique();
            $table->string('filiere');
            $table->string('genre');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('stagiaires_centre');
    }
};
