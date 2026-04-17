<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fareharbor_companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('display_name');
            $table->string('company_slug')->unique();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('sync_items_enabled')->default(true);
            $table->boolean('sync_details_enabled')->default(true);
            $table->timestamp('last_synced_at')->nullable();
            $table->string('last_status')->default('IDLE');
            $table->unsignedInteger('last_imported_items_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index(['is_enabled', 'last_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fareharbor_companies');
    }
};
