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
            $table->foreignId('specialist_id')
                ->nullable()
                ->after('patient_id')
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->timestamp('specialist_called_at')->nullable()->after('status');
            $table->index('specialist_id', 'idx_emergencies_specialist');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencies', function (Blueprint $table) {
            $table->dropForeign(['specialist_id']);
            $table->dropIndex('idx_emergencies_specialist');
            $table->dropColumn(['specialist_id', 'specialist_called_at']);
        });
    }
};
