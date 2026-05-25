<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sorties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stagiaire_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date_sortie');
            $table->date('date_retour');
            $table->string('contact')->nullable();
            $table->text('motif')->nullable();
            $table->string('statut')->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('sorties');
    }
};
