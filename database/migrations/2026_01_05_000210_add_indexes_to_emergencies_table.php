<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->index('created_at', 'idx_emergencies_created_at');
            $table->index('alert_code', 'idx_emergencies_alert_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->dropIndex('idx_emergencies_created_at');
            $table->dropIndex('idx_emergencies_alert_code');
        });
    }
};
