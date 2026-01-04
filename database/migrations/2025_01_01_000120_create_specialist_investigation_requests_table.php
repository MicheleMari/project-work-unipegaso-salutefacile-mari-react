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
        Schema::dropIfExists('specialist_investigation_requests');

        Schema::create('specialist_investigation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emergency_id')
                ->constrained('emergencies', indexName: 'fk_sir_emergency')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('specialist_investigation_id')
                ->constrained('specialist_investigations', indexName: 'fk_sir_specialist_investigation')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('requested_by')
                ->constrained('users', indexName: 'fk_sir_requested_by')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('specialist_visit_id')
                ->nullable()
                ->constrained('specialist_visits', indexName: 'fk_sir_specialist_visit')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->string('status', 40)->default('requested');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('report_expected_at')->nullable();
            $table->timestamp('report_received_at')->nullable();
            $table->text('outcome')->nullable();
            $table->text('notes')->nullable();
            $table->string('follow_up_action', 120)->nullable();
            $table->string('disposition', 60)->nullable();
            $table->timestamps();

            $table->index('emergency_id', 'idx_sir_emergency');
            $table->index('specialist_investigation_id', 'idx_sir_specialist_investigation');
            $table->index('requested_by', 'idx_sir_requested_by');
            $table->index('specialist_visit_id', 'idx_sir_specialist_visit');
            $table->index('status', 'idx_sir_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialist_investigation_requests');
    }
};
