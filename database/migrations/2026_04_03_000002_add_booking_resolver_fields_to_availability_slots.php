<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('availability_slots', function (Blueprint $table) {
            $table->string('source_type')->default('MANUAL')->after('date');
            $table->boolean('is_blocked')->default(false)->after('source_type');

            $table->index(
                ['service_id', 'is_blocked'],
                'idx_availability_service_blocked',
            );
        });
    }

    public function down(): void
    {
        Schema::table('availability_slots', function (Blueprint $table) {
            $table->dropIndex('idx_availability_service_blocked');
            $table->dropColumn(['source_type', 'is_blocked']);
        });
    }
};
