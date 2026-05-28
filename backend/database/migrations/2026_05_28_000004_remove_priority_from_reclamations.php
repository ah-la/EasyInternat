<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            if (Schema::hasColumn('reclamations', 'priorite')) {
                $table->dropColumn('priorite');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            if (!Schema::hasColumn('reclamations', 'priorite')) {
                $table->string('priorite')->default('normale')->after('message');
            }
        });
    }
};
