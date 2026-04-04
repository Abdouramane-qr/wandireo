<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('status')->default('APPROVED')->after('comment');
            $table->timestamp('moderated_at')->nullable()->after('status');
            $table->foreignId('moderated_by')
                ->nullable()
                ->after('moderated_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropColumn(['status', 'moderated_at']);
        });
    }
};
