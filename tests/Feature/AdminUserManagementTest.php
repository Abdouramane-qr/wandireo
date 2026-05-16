<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_client_account(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/users', [
            'first_name' => 'Client',
            'last_name' => 'Demo',
            'email' => 'client.demo@example.test',
            'password' => 'password123',
            'role' => 'CLIENT',
            'language' => 'en',
            'preferred_currency' => 'EUR',
        ])
            ->assertCreated()
            ->assertJsonPath('email', 'client.demo@example.test')
            ->assertJsonPath('role', 'CLIENT');

        $this->assertDatabaseHas('users', [
            'email' => 'client.demo@example.test',
            'role' => 'CLIENT',
            'language' => 'en',
            'preferred_currency' => 'EUR',
            'commission_rate' => 0.15,
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'NOT_SENT',
        ]);
    }

    public function test_admin_can_create_an_admin_account(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/users', [
            'first_name' => 'Ops',
            'last_name' => 'Admin',
            'email' => 'ops.admin@example.test',
            'password' => 'password123',
            'role' => 'ADMIN',
            'language' => 'fr',
        ])
            ->assertCreated()
            ->assertJsonPath('email', 'ops.admin@example.test')
            ->assertJsonPath('role', 'ADMIN');

        $this->assertDatabaseHas('users', [
            'email' => 'ops.admin@example.test',
            'role' => 'ADMIN',
            'language' => 'fr',
            'commission_rate' => 0.15,
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'NOT_SENT',
        ]);
    }

    public function test_admin_can_create_a_partner_account(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/users', [
            'first_name' => 'Partner',
            'last_name' => 'Demo',
            'email' => 'partner.demo@example.test',
            'password' => 'password123',
            'role' => 'PARTNER',
            'company_name' => 'Partner Demo SARL',
            'commission_rate' => 0.22,
            'partner_status' => 'PENDING',
            'mandate_contract_status' => 'NOT_SENT',
        ])
            ->assertCreated()
            ->assertJsonPath('email', 'partner.demo@example.test')
            ->assertJsonPath('role', 'PARTNER')
            ->assertJsonPath('companyName', 'Partner Demo SARL');

        $this->assertDatabaseHas('users', [
            'email' => 'partner.demo@example.test',
            'role' => 'PARTNER',
            'company_name' => 'Partner Demo SARL',
            'commission_rate' => 0.22,
            'partner_status' => 'PENDING',
            'mandate_contract_status' => 'NOT_SENT',
        ]);
    }
}
