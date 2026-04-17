<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_calendar_syncs', function (Blueprint $table) {
            $table->dropUnique('service_calendar_syncs_service_id_unique');
            $table->unique(['service_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::table('service_calendar_syncs', function (Blueprint $table) {
            $table->dropUnique('service_calendar_syncs_service_id_provider_unique');
            $table->unique('service_id');
        });
    }
};
