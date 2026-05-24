<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_update_allowed_profile_fields_via_api(): void
    {
        $user = User::factory()->create([
            'role' => 'CLIENT',
            'name' => 'Ada Old',
            'phone_number' => null,
            'language' => 'fr',
            'preferred_currency' => 'EUR',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'phone_number' => '+33123456789',
            'language' => 'en',
            'preferred_currency' => 'USD',
        ])->assertOk()
            ->assertJsonPath('firstName', 'Ada')
            ->assertJsonPath('lastName', 'Lovelace')
            ->assertJsonPath('phoneNumber', '+33123456789')
            ->assertJsonPath('language', 'en')
            ->assertJsonPath('preferredCurrency', 'USD');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Ada Lovelace',
            'phone_number' => '+33123456789',
            'language' => 'en',
            'preferred_currency' => 'USD',
        ]);
    }

    public function test_partner_profile_update_does_not_persist_preferred_currency(): void
    {
        $user = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'name' => 'Partner Old',
            'preferred_currency' => null,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'first_name' => 'Partner',
            'last_name' => 'Updated',
            'preferred_currency' => 'USD',
        ])->assertOk()
            ->assertJsonPath('preferredCurrency', null);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Partner Updated',
            'preferred_currency' => null,
        ]);
    }

    public function test_partner_can_update_email_and_company_fields_in_own_space(): void
    {
        $user = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'name' => 'Partner Owner',
            'email' => 'old-partner@example.com',
            'email_verified_at' => now(),
            'company_name' => 'Old Company',
            'business_address' => 'Old Address',
            'phone_number' => null,
            'preferred_currency' => null,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'email' => 'new-partner@example.com',
            'phone_number' => '+351900000001',
            'company_name' => 'New Company',
            'business_address' => 'New Address 12',
            'preferred_currency' => 'USD',
        ])->assertOk()
            ->assertJsonPath('email', 'new-partner@example.com')
            ->assertJsonPath('phoneNumber', '+351900000001')
            ->assertJsonPath('companyName', 'New Company')
            ->assertJsonPath('businessAddress', 'New Address 12')
            ->assertJsonPath('preferredCurrency', null);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'new-partner@example.com',
            'phone_number' => '+351900000001',
            'company_name' => 'New Company',
            'business_address' => 'New Address 12',
            'preferred_currency' => null,
        ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_partner_can_update_tax_profile_fields_in_own_space(): void
    {
        $user = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'company_name' => 'Partner Company',
            'preferred_currency' => null,
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'legal_company_name' => 'Partner Company Legal SARL',
            'tax_country' => 'pt',
            'vat_number' => 'PT123456789',
            'business_registration_number' => 'REG-987654',
            'billing_email' => 'billing.partner@example.com',
        ])->assertOk()
            ->assertJsonPath('legalCompanyName', 'Partner Company Legal SARL')
            ->assertJsonPath('taxCountry', 'PT')
            ->assertJsonPath('vatNumber', 'PT123456789')
            ->assertJsonPath('businessRegistrationNumber', 'REG-987654')
            ->assertJsonPath('billingEmail', 'billing.partner@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'legal_company_name' => 'Partner Company Legal SARL',
            'tax_country' => 'PT',
            'vat_number' => 'PT123456789',
            'business_registration_number' => 'REG-987654',
            'billing_email' => 'billing.partner@example.com',
        ]);
    }

    public function test_client_cannot_persist_partner_tax_profile_fields(): void
    {
        $user = User::factory()->create([
            'role' => 'CLIENT',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'legal_company_name' => 'Client Legal',
            'tax_country' => 'FR',
            'vat_number' => 'FR123456789',
            'business_registration_number' => 'CLIENT-REG',
            'billing_email' => 'client-billing@example.com',
        ])->assertOk();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'legal_company_name' => null,
            'tax_country' => null,
            'vat_number' => null,
            'business_registration_number' => null,
            'billing_email' => null,
        ]);
    }

    public function test_profile_api_returns_validation_errors_for_invalid_fields(): void
    {
        $user = User::factory()->create([
            'role' => 'CLIENT',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/users/me', [
            'first_name' => null,
            'language' => 'english',
            'preferred_currency' => 'USDX',
        ])->assertStatus(422)
            ->assertJsonValidationErrors([
                'first_name',
                'language',
                'preferred_currency',
            ]);
    }
}
