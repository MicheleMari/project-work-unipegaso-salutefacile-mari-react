<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
            $table->id();
            $table->foreignId('investigation_id')
                ->nullable()
                ->constrained('investigations_performed')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('specialist_visit_id')
                ->nullable()
                ->constrained('specialist_visits')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->string('storage_path', 255);
            $table->string('original_name', 255);
            $table->string('mime_type', 100);
            $table->unsignedInteger('size_bytes')->nullable();
            $table->timestamps();
        });

        DB::statement('ALTER TABLE attachments ADD CONSTRAINT chk_attachment_size CHECK (size_bytes IS NULL OR size_bytes >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // MySQL uses DROP CHECK (no IF EXISTS support in 8.0)
        try {
            DB::statement('ALTER TABLE attachments DROP CHECK chk_attachment_size');
        } catch (\Throwable $e) {
            // If the constraint is already gone, ignore the error to allow rollback to continue
        }
        Schema::dropIfExists('attachments');
    }
};
