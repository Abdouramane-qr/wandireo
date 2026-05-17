<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_created_service_starts_as_draft_and_hidden(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        Sanctum::actingAs($partner);

        $response = $this->postJson('/api/services', $this->servicePayload());

        $response
            ->assertCreated()
            ->assertJsonPath('moderation_status', Service::MODERATION_DRAFT)
            ->assertJsonPath('is_available', false);

        $this->assertDatabaseHas('services', [
            'id' => $response->json('id'),
            'partner_id' => $partner->id,
            'moderation_status' => Service::MODERATION_DRAFT,
            'is_available' => false,
        ]);

        $this->assertDatabaseHas('service_moderation_events', [
            'service_id' => $response->json('id'),
            'actor_id' => $partner->id,
            'action' => 'CREATED',
            'to_status' => Service::MODERATION_DRAFT,
        ]);
    }

    public function test_partner_can_submit_own_draft_service_for_review(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($partner, 'partner')->create([
            'moderation_status' => Service::MODERATION_DRAFT,
            'is_available' => false,
        ]);

        Sanctum::actingAs($partner);

        $this->postJson("/api/services/{$service->id}/submit-review", [
            'reason' => 'Ready for review.',
        ])
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_PENDING_REVIEW)
            ->assertJsonPath('is_available', false);

        $service->refresh();

        $this->assertSame(Service::MODERATION_PENDING_REVIEW, $service->moderation_status);
        $this->assertFalse($service->is_available);
        $this->assertNotNull($service->submitted_for_review_at);
    }

    public function test_partner_cannot_submit_another_partner_service(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $otherPartner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($otherPartner, 'partner')->create([
            'moderation_status' => Service::MODERATION_DRAFT,
            'is_available' => false,
        ]);

        Sanctum::actingAs($partner);

        $this->postJson("/api/services/{$service->id}/submit-review")
            ->assertForbidden();
    }

    public function test_admin_can_approve_pending_service_and_store_event(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/approve", [
            'reason' => 'Content is compliant.',
        ])
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_APPROVED)
            ->assertJsonPath('is_available', false);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'moderation_status' => Service::MODERATION_APPROVED,
            'is_available' => false,
            'moderated_by' => $admin->id,
        ]);

        $this->assertDatabaseHas('service_moderation_events', [
            'service_id' => $service->id,
            'actor_id' => $admin->id,
            'from_status' => Service::MODERATION_PENDING_REVIEW,
            'to_status' => Service::MODERATION_APPROVED,
            'action' => 'APPROVED',
            'reason' => 'Content is compliant.',
        ]);
    }

    public function test_admin_can_publish_approved_service_and_make_it_public(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_APPROVED,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/publish")
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_PUBLISHED)
            ->assertJsonPath('is_available', true);

        $this->getJson("/api/services/{$service->id}")
            ->assertOk()
            ->assertJsonPath('id', (string) $service->id);
    }

    public function test_admin_can_reject_with_reason_and_service_remains_hidden(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/reject", [
            'reason' => 'Missing insurance document.',
        ])
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_REJECTED)
            ->assertJsonPath('moderation_reason', 'Missing insurance document.')
            ->assertJsonPath('is_available', false);

        $this->assertDatabaseHas('service_moderation_events', [
            'service_id' => $service->id,
            'action' => 'REJECTED',
            'reason' => 'Missing insurance document.',
        ]);

        $this->app['auth']->forgetGuards();

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound();
    }

    public function test_admin_can_suspend_published_service_and_hide_it_publicly(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PUBLISHED,
            'is_available' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/suspend", [
            'reason' => 'Compliance issue.',
        ])
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_SUSPENDED)
            ->assertJsonPath('is_available', false);

        $this->app['auth']->forgetGuards();

        $this->getJson("/api/services/{$service->id}")
            ->assertNotFound();
    }

    public function test_partner_cannot_moderate_services(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($partner, 'partner')->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($partner);

        $this->postJson("/api/services/{$service->id}/approve")
            ->assertForbidden();
        $this->postJson("/api/services/{$service->id}/publish")
            ->assertForbidden();
        $this->postJson("/api/services/{$service->id}/reject", ['reason' => 'No'])
            ->assertForbidden();
        $this->postJson("/api/services/{$service->id}/suspend", ['reason' => 'No'])
            ->assertForbidden();
    }

    public function test_existing_update_endpoint_cannot_make_unpublished_service_public(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($partner, 'partner')->create([
            'moderation_status' => Service::MODERATION_DRAFT,
            'is_available' => false,
        ]);

        Sanctum::actingAs($partner);

        $this->patchJson("/api/services/{$service->id}", [
            'is_available' => true,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('is_available');

        $this->assertFalse($service->fresh()->is_available);
    }

    public function test_existing_toggle_endpoint_cannot_make_unpublished_service_public(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_APPROVED,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/services/{$service->id}/toggle-availability", [
            'isAvailable' => true,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('is_available');

        $this->assertFalse($service->fresh()->is_available);
    }

    public function test_published_service_can_still_be_temporarily_disabled(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()->for($partner, 'partner')->create([
            'moderation_status' => Service::MODERATION_PUBLISHED,
            'is_available' => true,
        ]);

        Sanctum::actingAs($partner);

        $this->patchJson("/api/services/{$service->id}/toggle-availability", [
            'isAvailable' => false,
        ])
            ->assertOk()
            ->assertJsonPath('isAvailable', false);

        $this->assertFalse($service->fresh()->is_available);
    }

    public function test_admin_can_read_moderation_queue(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $pending = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);
        Service::factory()->create([
            'moderation_status' => Service::MODERATION_PUBLISHED,
            'is_available' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/services/moderation')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $pending->id)
            ->assertJsonPath('data.0.moderation_status', Service::MODERATION_PENDING_REVIEW);
    }

    public function test_partner_cannot_read_admin_moderation_queue(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        Sanctum::actingAs($partner);

        $this->getJson('/api/admin/services/moderation')
            ->assertForbidden();
    }

    public function test_external_service_moderation_preserves_external_source_fields(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
            'source_type' => 'EXTERNAL',
            'source_provider' => 'fareharbor',
            'source_external_id' => 'fh-item-123',
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/publish")
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_PUBLISHED)
            ->assertJsonPath('source_type', 'EXTERNAL')
            ->assertJsonPath('source_provider', 'fareharbor')
            ->assertJsonPath('source_external_id', 'fh-item-123');

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'source_type' => 'EXTERNAL',
            'source_provider' => 'fareharbor',
            'source_external_id' => 'fh-item-123',
            'moderation_status' => Service::MODERATION_PUBLISHED,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function servicePayload(): array
    {
        return [
            'title' => ['fr' => 'Balade moderation'],
            'description' => ['fr' => 'Une activite a verifier.'],
            'category' => 'ACTIVITE',
            'partner_price' => 100,
            'pricing_unit' => 'PAR_PERSONNE',
            'payment_mode' => 'FULL_ONLINE',
            'booking_mode' => 'INSTANT',
            'location_city' => 'Lagos',
            'location_country' => 'Portugal',
            'location_region' => 'Algarve',
            'images' => [],
            'tags' => [],
            'extra_data' => [],
        ];
    }
}
