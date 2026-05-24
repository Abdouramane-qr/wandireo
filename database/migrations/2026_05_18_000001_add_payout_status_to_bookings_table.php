<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->string('payout_status')->default('PENDING')->after('payment_status');
            $table->timestamp('payout_marked_at')->nullable()->after('payout_status');
            $table->foreignId('payout_marked_by')->nullable()->after('payout_marked_at')->constrained('users')->nullOnDelete();
            $table->text('payout_notes')->nullable()->after('payout_marked_by');

            $table->index('payout_status');
            $table->index('payout_marked_by');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropForeign(['payout_marked_by']);
            $table->dropIndex(['payout_status']);
            $table->dropIndex(['payout_marked_by']);
            $table->dropColumn([
                'payout_status',
                'payout_marked_at',
                'payout_marked_by',
                'payout_notes',
            ]);
        });
    }
};
