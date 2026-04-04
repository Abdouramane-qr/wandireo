<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_name');
            $table->uuid('service_id')->nullable();
            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('session_id', 64)->nullable();
            $table->string('country_code', 8)->nullable();
            $table->string('locale', 8)->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['event_name', 'created_at']);
            $table->index(['session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_events');
    }
};
