<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('service_id');
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1–5
            $table->text('comment');
            $table->timestamps();

            // Un client ne peut laisser qu'un avis par service
            $table->unique(['client_id', 'service_id']);
            $table->index('service_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
