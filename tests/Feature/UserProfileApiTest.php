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
