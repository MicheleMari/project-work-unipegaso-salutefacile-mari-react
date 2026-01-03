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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('surname', 100);
            $table->foreignId('permission_id')->constrained('permissions')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete()->cascadeOnUpdate();
            $table->string('user_identity_code', 50)->unique();
            $table->string('email', 150)->unique();
            $table->string('password_hash', 255);
            $table->timestamps();

            $table->index('permission_id', 'idx_users_permission');
            $table->index('department_id', 'idx_users_department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
