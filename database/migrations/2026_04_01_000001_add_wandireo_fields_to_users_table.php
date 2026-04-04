<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('CLIENT')->after('email'); // CLIENT | PARTNER | ADMIN
            $table->string('phone_number')->nullable()->after('role');
            $table->string('language', 10)->default('fr')->after('phone_number');
            $table->string('profile_picture')->nullable()->after('language');
            // Champs CLIENT
            $table->string('preferred_currency', 3)->nullable();
            // Champs PARTNER
            $table->string('company_name')->nullable();
            $table->string('stripe_connected_account_id')->nullable();
            $table->string('business_address')->nullable();
            $table->decimal('commission_rate', 5, 4)->default(0.15);
            $table->decimal('total_sales', 12, 2)->default(0);
            // Champs ADMIN
            $table->json('permissions')->nullable();
            $table->json('managed_languages')->nullable();
            $table->json('managed_locations')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role', 'phone_number', 'language', 'profile_picture',
                'preferred_currency', 'company_name', 'stripe_connected_account_id',
                'business_address', 'commission_rate', 'total_sales',
                'permissions', 'managed_languages', 'managed_locations',
            ]);
        });
    }
};
