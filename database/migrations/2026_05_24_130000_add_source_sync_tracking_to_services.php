<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->string('source_sync_status')->nullable()->after('last_synced_at');
            $table->timestamp('source_last_seen_at')->nullable()->after('source_sync_status');
            $table->timestamp('source_missing_at')->nullable()->after('source_last_seen_at');
            $table->text('source_sync_error_message')->nullable()->after('source_missing_at');

            $table->index('source_sync_status');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->dropIndex(['source_sync_status']);
            $table->dropColumn([
                'source_sync_status',
                'source_last_seen_at',
                'source_missing_at',
                'source_sync_error_message',
            ]);
        });
    }
};
