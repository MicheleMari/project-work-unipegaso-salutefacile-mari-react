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
        Schema::table('specialist_visits', function (Blueprint $table) {
            $table->string('status', 40)->default('scheduled')->after('emergency_id');
            $table->timestamp('scheduled_at')->nullable()->after('status');
            $table->timestamp('report_expected_at')->nullable()->after('scheduled_at');
            $table->timestamp('report_received_at')->nullable()->after('report_expected_at');
            $table->boolean('needs_follow_up')->default(false)->after('report_received_at');
            $table->string('disposition', 60)->nullable()->after('needs_follow_up');
            $table->text('notes')->nullable()->after('disposition');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('specialist_visits', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'scheduled_at',
                'report_expected_at',
                'report_received_at',
                'needs_follow_up',
                'disposition',
                'notes',
            ]);
        });
    }
};
