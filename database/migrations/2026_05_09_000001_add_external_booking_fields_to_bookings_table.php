<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->string('external_booking_reference')->nullable()->after('stripe_payment_intent_id');
            $table->string('external_booking_status')->nullable()->after('external_booking_reference');
            $table->json('external_booking_payload')->nullable()->after('external_booking_status');
            $table->text('external_error_message')->nullable()->after('external_booking_payload');

            $table->index('external_booking_reference');
            $table->index('external_booking_status');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropIndex(['external_booking_reference']);
            $table->dropIndex(['external_booking_status']);
            $table->dropColumn([
                'external_booking_reference',
                'external_booking_status',
                'external_booking_payload',
                'external_error_message',
            ]);
        });
    }
};
