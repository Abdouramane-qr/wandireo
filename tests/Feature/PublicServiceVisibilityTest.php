<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicServiceVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_service_listing_only_returns_available_services(): void
    {
        $available = Service::factory()->create([
            'title' => ['fr' => 'Service visible'],
            'description' => ['fr' => 'Description'],
            'is_available' => true,
        ]);

        Service::factory()->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $response = $this->getJson('/api/services');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $available->id);
    }

    public function test_partner_listing_can_include_unavailable_services_when_filtered_by_partner(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        $available = Service::factory()->for($partner, 'partner')->create([
            'title' => ['fr' => 'Visible'],
            'description' => ['fr' => 'Description'],
            'is_available' => true,
        ]);

        $unavailable = Service::factory()->for($partner, 'partner')->create([
            'title' => ['fr' => 'Masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $response = $this->actingAs($partner)->getJson("/api/services?partnerId={$partner->id}");

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', (string) $unavailable->id)
            ->assertJsonPath('data.1.id', (string) $available->id);
    }
}
