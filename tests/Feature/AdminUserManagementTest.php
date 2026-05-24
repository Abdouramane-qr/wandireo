<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    public function test_admin_can_approve_partner_without_resubmitting_commission_rate(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'company_name' => 'Approved Partner SARL',
            'partner_status' => 'PENDING',
            'mandate_contract_status' => 'NOT_SENT',
            'mandate_contract_text' => null,
            'commission_rate' => 0.15,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/users/{$partner->id}", [
            'partner_status' => 'APPROVED',
        ])
            ->assertOk()
            ->assertJsonPath('partnerStatus', 'APPROVED')
            ->assertJsonPath('mandateContractStatus', 'PENDING_SIGNATURE');

        $partner->refresh();

        $this->assertDatabaseHas('users', [
            'id' => $partner->id,
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'commission_rate' => 0.15,
        ]);
        $this->assertStringContainsString('CONTRAT DE MANDAT', $partner->mandate_contract_text);
    }

    public function test_admin_can_update_partner_contract_text_and_require_new_signature(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'SIGNED',
            'mandate_contract_text' => 'Old contract',
            'mandate_signed_at' => now(),
            'onboarding_completed_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/users/{$partner->id}", [
            'mandate_contract_text' => 'Updated contract terms',
        ])
            ->assertOk()
            ->assertJsonPath('mandateContractStatus', 'PENDING_SIGNATURE')
            ->assertJsonPath('mandateContractText', 'Updated contract terms');

        $partner->refresh();

        $this->assertSame('PENDING_SIGNATURE', $partner->mandate_contract_status);
        $this->assertSame('Updated contract terms', $partner->mandate_contract_text);
        $this->assertNull($partner->mandate_signed_at);
        $this->assertNull($partner->onboarding_completed_at);
    }

    public function test_admin_can_reset_a_user_password(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'password' => Hash::make('old-password'),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/users/{$partner->id}/password", [
            'password' => 'new-password-123',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $partner->id);

        $this->assertSame('new-password-123', $response->json('temporary_password'));
        $this->assertTrue(Hash::check('new-password-123', $partner->fresh()->password));
    }

    public function test_admin_can_update_global_contract_template_for_all_partners(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $signedPartner = User::factory()->create([
            'role' => 'PARTNER',
            'mandate_contract_status' => 'SIGNED',
            'mandate_contract_text' => 'Old contract',
            'mandate_signed_at' => now(),
            'onboarding_completed_at' => now(),
        ]);
        $pendingPartner = User::factory()->create([
            'role' => 'PARTNER',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'mandate_contract_text' => 'Old contract',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson('/api/users/contract-template', [
            'contract_text' => "# New global contract\n\nUpdated terms.",
            'apply_to_partners' => true,
        ])
            ->assertOk()
            ->assertJsonPath('updated_partners', 2);

        foreach ([$signedPartner, $pendingPartner] as $partner) {
            $partner->refresh();
            $this->assertSame("# New global contract\n\nUpdated terms.", $partner->mandate_contract_text);
            $this->assertSame('PENDING_SIGNATURE', $partner->mandate_contract_status);
            $this->assertNull($partner->mandate_signed_at);
            $this->assertNull($partner->onboarding_completed_at);
        }
    }
}
