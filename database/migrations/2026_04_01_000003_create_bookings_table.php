<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained('users');
            $table->uuid('service_id');
            $table->foreign('service_id')->references('id')->on('services');

            // Statuts
            $table->string('status')->default('PENDING');         // PENDING | CONFIRMED | CANCELLED
            $table->string('payment_status')->default('PENDING'); // PENDING | PAID | REFUNDED

            // Dates et participants
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->unsignedInteger('participants')->default(1);

            // Tarification
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('payment_mode');
            $table->decimal('amount_paid_online', 10, 2)->default(0);

            // Stripe
            $table->string('stripe_payment_intent_id')->nullable();

            // Notes
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('client_id');
            $table->index('partner_id');
            $table->index('status');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
