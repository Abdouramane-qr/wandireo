<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('partner_status')->default('APPROVED')->after('role');
            $table->timestamp('partner_validated_at')->nullable()->after('partner_status');
            $table->foreignId('partner_validated_by')->nullable()->after('partner_validated_at')->constrained('users')->nullOnDelete();
            $table->text('partner_rejection_reason')->nullable()->after('partner_validated_by');
            $table->string('mandate_contract_status')->default('NOT_SENT')->after('partner_rejection_reason');
            $table->string('mandate_contract_file_path')->nullable()->after('mandate_contract_status');
            $table->timestamp('mandate_signed_at')->nullable()->after('mandate_contract_file_path');
            $table->timestamp('onboarding_completed_at')->nullable()->after('mandate_signed_at');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('source_type')->default('LOCAL')->after('payment_mode');
            $table->string('source_provider')->nullable()->after('source_type');
            $table->string('source_external_id')->nullable()->after('source_provider');
            $table->timestamp('last_synced_at')->nullable()->after('source_external_id');

            $table->index(['source_type', 'category'], 'idx_services_source_category');
            $table->unique(['source_provider', 'source_external_id'], 'uq_services_external_source');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropUnique('uq_services_external_source');
            $table->dropIndex('idx_services_source_category');
            $table->dropColumn([
                'source_type',
                'source_provider',
                'source_external_id',
                'last_synced_at',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('partner_validated_by');
            $table->dropColumn([
                'partner_status',
                'partner_validated_at',
                'partner_rejection_reason',
                'mandate_contract_status',
                'mandate_contract_file_path',
                'mandate_signed_at',
                'onboarding_completed_at',
            ]);
        });
    }
};
