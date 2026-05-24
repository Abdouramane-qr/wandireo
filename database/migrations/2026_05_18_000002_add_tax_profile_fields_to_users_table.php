<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('legal_company_name')->nullable()->after('business_address');
            $table->string('tax_country', 2)->nullable()->after('legal_company_name');
            $table->string('vat_number', 64)->nullable()->after('tax_country');
            $table->string('business_registration_number', 128)->nullable()->after('vat_number');
            $table->string('billing_email')->nullable()->after('business_registration_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'legal_company_name',
                'tax_country',
                'vat_number',
                'business_registration_number',
                'billing_email',
            ]);
        });
    }
};
