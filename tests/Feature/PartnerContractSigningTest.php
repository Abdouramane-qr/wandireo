<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerContractSigningTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_mark_partner_contract_as_signed_via_dedicated_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'mandate_contract_file_path' => null,
            'mandate_signed_at' => null,
            'onboarding_completed_at' => null,
        ]);

        $response = $this->actingAs($admin)->postJson("/api/users/{$partner->id}/contract/mark-signed");

        $response
            ->assertOk()
            ->assertJsonPath('mandateContractStatus', 'SIGNED');

        $partner->refresh();

        $this->assertSame('SIGNED', $partner->mandate_contract_status);
        $this->assertNotNull($partner->mandate_signed_at);
        $this->assertNotNull($partner->onboarding_completed_at);
    }

    public function test_partner_can_sign_own_contract_when_a_pdf_is_available(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'mandate_contract_file_path' => 'https://example.test/contracts/partner.pdf',
            'mandate_signed_at' => null,
            'onboarding_completed_at' => null,
        ]);

        $response = $this->actingAs($partner)->postJson('/api/partner/contract/sign', [
            'accepted' => true,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('mandateContractStatus', 'SIGNED');

        $partner->refresh();

        $this->assertSame('SIGNED', $partner->mandate_contract_status);
        $this->assertNotNull($partner->mandate_signed_at);
        $this->assertNotNull($partner->onboarding_completed_at);
    }

    public function test_partner_can_sign_own_contract_when_contract_text_is_available(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'mandate_contract_file_path' => null,
            'mandate_contract_text' => 'Partner mandate terms.',
            'mandate_signed_at' => null,
            'onboarding_completed_at' => null,
        ]);

        $response = $this->actingAs($partner)->postJson('/api/partner/contract/sign', [
            'accepted' => true,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('mandateContractStatus', 'SIGNED');

        $partner->refresh();

        $this->assertSame('SIGNED', $partner->mandate_contract_status);
        $this->assertNotNull($partner->mandate_signed_at);
        $this->assertNotNull($partner->onboarding_completed_at);
    }

    public function test_partner_cannot_sign_without_contract_text_or_pdf(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'NOT_SENT',
            'mandate_contract_file_path' => null,
            'mandate_contract_text' => null,
        ]);

        $response = $this->actingAs($partner)->postJson('/api/partner/contract/sign', [
            'accepted' => true,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors('mandate_contract_text');
    }

    public function test_approved_partner_without_signed_contract_is_redirected_to_pending_page(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
        ]);

        $response = $this->actingAs($partner)->get(route('partner.dashboard'));

        $response->assertRedirect(route('partner.pending', [], false));
    }
}
