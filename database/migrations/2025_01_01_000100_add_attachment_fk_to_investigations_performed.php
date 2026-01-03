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
        Schema::table('investigations_performed', function (Blueprint $table) {
            $table->foreign('attachment_id', 'fk_ip_attachment')
                ->references('id')
                ->on('attachments')
                ->nullOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investigations_performed', function (Blueprint $table) {
            $table->dropForeign('fk_ip_attachment');
        });
    }
};
