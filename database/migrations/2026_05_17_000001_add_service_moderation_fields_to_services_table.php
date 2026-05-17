<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('moderation_status')->default('PUBLISHED')->after('is_available');
            $table->text('moderation_reason')->nullable()->after('moderation_status');
            $table->timestamp('submitted_for_review_at')->nullable()->after('moderation_reason');
            $table->timestamp('moderated_at')->nullable()->after('submitted_for_review_at');
            $table->foreignId('moderated_by')->nullable()->after('moderated_at')->constrained('users')->nullOnDelete();

            $table->index('moderation_status');
            $table->index('moderated_by');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['moderation_status']);
            $table->dropIndex(['moderated_by']);
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropColumn([
                'moderation_status',
                'moderation_reason',
                'submitted_for_review_at',
                'moderated_at',
            ]);
        });
    }
};
