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
        Schema::table('specialist_investigations', function (Blueprint $table) {
            $table->foreignId('department_id')
                ->nullable()
                ->after('discipline')
                ->constrained('departments')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->index('department_id', 'idx_specialist_investigations_department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('specialist_investigations', function (Blueprint $table) {
            $table->dropIndex('idx_specialist_investigations_department');
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });
    }
};
