<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->string('priorite')->default('normale')->after('message');
            $table->timestamp('reponse_at')->nullable()->after('reponse_admin');
            $table->foreignId('reponse_by_id')->nullable()->after('reponse_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reponse_by_id');
            $table->dropColumn(['priorite', 'reponse_at']);
        });
    }
};
