<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availability_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_id');
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            $table->date('date');
            // Créneaux horaires JSON : [{ startTime: "HH:MM", maxCapacity: N }]
            $table->json('slots')->default('[]');
            $table->timestamps();

            $table->unique(['service_id', 'date']);
            $table->index(['service_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availability_slots');
    }
};
