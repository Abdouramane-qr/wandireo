<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_calendar_syncs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_id')->unique();
            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->cascadeOnDelete();
            $table->string('provider')->default('ICAL');
            $table->text('import_url')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->string('last_status')->default('IDLE');
            $table->unsignedInteger('imported_events_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index(['provider', 'last_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_calendar_syncs');
    }
};
