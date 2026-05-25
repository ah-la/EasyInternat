<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('paiements', function(Blueprint $table){ $table->id(); $table->foreignId('stagiaire_id')->constrained()->cascadeOnDelete(); $table->string('mois'); $table->decimal('montant',10,2); $table->string('statut'); $table->date('date_paiement')->nullable(); $table->timestamps(); }); } public function down(): void { Schema::dropIfExists('paiements'); } };
