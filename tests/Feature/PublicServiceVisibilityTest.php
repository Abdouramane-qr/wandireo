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

    public function test_public_partner_filtered_listing_keeps_unavailable_services_hidden(): void
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

        Service::factory()->for($partner, 'partner')->create([
            'title' => ['fr' => 'Masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $response = $this->getJson("/api/services?partnerId={$partner->id}");

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $available->id);
    }

    public function test_public_admin_all_parameter_does_not_expose_hidden_services(): void
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

        $response = $this->getJson('/api/services?adminAll=true');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $available->id);
    }

    public function test_admin_all_parameter_can_include_hidden_services_for_admin(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
        ]);

        Service::factory()->create([
            'title' => ['fr' => 'Service visible'],
            'description' => ['fr' => 'Description'],
            'is_available' => true,
        ]);

        Service::factory()->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/services?adminAll=true');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_partner_owner_listing_can_include_unavailable_services_when_filtered_by_partner(): void
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

    public function test_public_service_detail_api_returns_404_for_unavailable_services(): void
    {
        $service = Service::factory()->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound();
    }

    public function test_public_service_page_returns_404_for_unavailable_services(): void
    {
        $service = Service::factory()->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $this->get("/services/{$service->id}")
            ->assertNotFound();
    }

    public function test_partner_owner_can_access_hidden_service_in_api(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($partner, 'partner')->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $this->actingAs($partner)
            ->getJson("/api/services/{$service->id}")
            ->assertOk()
            ->assertJsonPath('id', (string) $service->id);
    }

    public function test_admin_can_access_hidden_service_in_public_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
        ]);
        $service = Service::factory()->create([
            'title' => ['fr' => 'Service masque'],
            'description' => ['fr' => 'Description'],
            'is_available' => false,
        ]);

        $this->actingAs($admin)
            ->get("/services/{$service->id}")
            ->assertOk();
    }
}
