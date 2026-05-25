<?php
use Illuminate\Database\Migrations\Migration; use Illuminate\Database\Schema\Blueprint; use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('chambres', function(Blueprint $table){ $table->id(); $table->string('numero')->unique(); $table->string('category'); $table->integer('capacite')->default(4); $table->string('statut')->default('disponible'); $table->timestamps(); }); } public function down(): void { Schema::dropIfExists('chambres'); } };
