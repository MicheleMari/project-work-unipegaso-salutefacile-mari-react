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
        Schema::create('specialist_investigations', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150)->unique('uq_specialist_investigations_title');
            $table->text('description')->nullable();
            $table->string('discipline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialist_investigations');
    }
};
