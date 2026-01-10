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
            $table->timestamp('closed_at')->nullable()->after('arrived_ps_at');
            $table->index('closed_at', 'idx_emergencies_closed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->dropIndex('idx_emergencies_closed_at');
            $table->dropColumn('closed_at');
        });
    }
};
