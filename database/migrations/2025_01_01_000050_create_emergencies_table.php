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
        Schema::create('emergencies', function (Blueprint $table) {
            $table->id();
            $table->text('description')->nullable();
            $table->enum('alert_code', ['bianco', 'giallo', 'arancio', 'rosso'])->nullable();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('patient_id')->constrained('patients')->restrictOnDelete()->cascadeOnUpdate();
            $table->json('vital_signs')->nullable();
            $table->string('status', 50)->default('triage');
            $table->timestamps();

            $table->index('user_id', 'idx_emergencies_user');
            $table->index('patient_id', 'idx_emergencies_patient');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergencies');
    }
};
