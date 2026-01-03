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
        Schema::create('investigations_performed', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emergency_id')->constrained('emergencies')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('investigation_id')->constrained('investigations')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('performed_by')->constrained('users')->restrictOnDelete()->cascadeOnUpdate();
            $table->timestamp('performed_at')->useCurrent();
            $table->text('outcome')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('attachment_id')->nullable();

            $table->index('emergency_id', 'idx_ip_emergency');
            $table->index('investigation_id', 'idx_ip_investigation');
            $table->index('performed_by', 'idx_ip_performed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investigations_performed');
    }
};
