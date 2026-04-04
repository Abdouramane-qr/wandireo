<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_pricing_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_id');
            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('rule_type');
            $table->string('adjustment_type');
            $table->decimal('adjustment_value', 10, 2);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('min_units')->nullable();
            $table->unsignedInteger('priority')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['service_id', 'is_active'], 'idx_pricing_rules_service_active');
            $table->index(['service_id', 'rule_type'], 'idx_pricing_rules_service_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_pricing_rules');
    }
};
