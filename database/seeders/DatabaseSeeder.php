<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(FareHarborCompanySeeder::class);

        User::query()->updateOrCreate(
            ['email' => 'client@wandireo.test'],
            [
                'name' => 'Client Demo',
                'password' => Hash::make('password'),
                'role' => 'CLIENT',
                'partner_status' => 'APPROVED',
                'partner_validated_at' => null,
                'mandate_contract_status' => 'NOT_SENT',
                'mandate_signed_at' => null,
                'company_name' => null,
                'commission_rate' => 0,
                'total_sales' => 0,
                'language' => 'fr',
                'preferred_currency' => 'EUR',
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'partner@wandireo.test'],
            [
                'name' => 'Partner Demo',
                'password' => Hash::make('password'),
                'role' => 'PARTNER',
                'partner_status' => 'APPROVED',
                'partner_validated_at' => now(),
                'mandate_contract_status' => 'SIGNED',
                'mandate_signed_at' => now(),
                'company_name' => 'Partner Demo Experiences',
                'commission_rate' => 0.20,
                'total_sales' => 0,
                'language' => 'fr',
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'CLIENT',
                'partner_status' => 'APPROVED',
                'partner_validated_at' => null,
                'mandate_contract_status' => 'NOT_SENT',
                'mandate_signed_at' => null,
                'company_name' => null,
                'commission_rate' => 0,
                'total_sales' => 0,
                'email_verified_at' => now(),
            ],
        );
    }
}
