<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('service_id');
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            $table->timestamp('added_at')->useCurrent();

            // Un client ne peut mettre en favori qu'une seule fois un service
            $table->unique(['client_id', 'service_id']);
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
