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
            $table->boolean('notify_ps')->default(false)->after('status');
            $table->index('notify_ps', 'idx_emergencies_notify_ps');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->dropIndex('idx_emergencies_notify_ps');
            $table->dropColumn('notify_ps');
        });
    }
};
