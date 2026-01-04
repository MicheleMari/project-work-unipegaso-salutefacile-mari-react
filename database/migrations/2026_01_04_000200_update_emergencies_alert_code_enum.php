<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('emergencies', function () {
            DB::statement("
                ALTER TABLE emergencies
                MODIFY alert_code ENUM('bianco', 'verde', 'giallo', 'arancio', 'rosso') NULL
            ");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function () {
            DB::statement("
                ALTER TABLE emergencies
                MODIFY alert_code ENUM('bianco', 'giallo', 'arancio', 'rosso') NULL
            ");
        });
    }
};
