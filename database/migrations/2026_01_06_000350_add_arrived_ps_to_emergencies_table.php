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
            $table->boolean('arrived_ps')->default(false)->after('notify_ps');
            $table->timestamp('arrived_ps_at')->nullable()->after('arrived_ps');
            $table->index('arrived_ps', 'idx_emergencies_arrived_ps');
            $table->index('arrived_ps_at', 'idx_emergencies_arrived_ps_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->dropIndex('idx_emergencies_arrived_ps');
            $table->dropIndex('idx_emergencies_arrived_ps_at');
            $table->dropColumn(['arrived_ps', 'arrived_ps_at']);
        });
    }
};
