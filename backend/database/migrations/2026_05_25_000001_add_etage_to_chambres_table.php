<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            $table->string('etage')->nullable()->after('numero');
        });
    }

    public function down(): void
    {
        Schema::table('chambres', function (Blueprint $table) {
            $table->dropColumn('etage');
        });
    }
};
