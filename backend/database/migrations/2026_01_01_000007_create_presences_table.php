<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('presences', function(Blueprint $table){ $table->id(); $table->foreignId('stagiaire_id')->constrained()->cascadeOnDelete(); $table->date('date'); $table->string('statut'); $table->string('ip_address')->nullable(); $table->timestamps(); $table->unique(['stagiaire_id','date']); }); } public function down(): void { Schema::dropIfExists('presences'); } };
