<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_search_and_service_view_are_tracked(): void
    {
        $service = Service::factory()
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create(['title' => 'Villa Ocean']);

        $headers = ['X-Wandireo-Session' => 'session-abc123'];

        $this->getJson('/api/services?q=ocean&category=HEBERGEMENT', $headers)
            ->assertOk();
        $this->getJson("/api/services/{$service->id}", $headers)
            ->assertOk();

        $this->assertDatabaseHas('product_events', [
            'event_name' => 'search_performed',
            'session_id' => 'session-abc123',
        ]);
        $this->assertDatabaseHas('product_events', [
            'event_name' => 'service_viewed',
            'service_id' => $service->id,
            'session_id' => 'session-abc123',
        ]);
    }

    public function test_booking_events_and_admin_funnel_are_available(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create([
                'payment_mode' => 'FULL_CASH_ON_SITE',
            ]);

        Sanctum::actingAs($client);

        $headers = ['X-Wandireo-Session' => 'session-booking'];

        $this->postJson('/api/bookings/init', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(8)->toDateString(),
            'endDate' => now()->addDays(9)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'OFFLINE',
        ], $headers)->assertOk();

        $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(8)->toDateString(),
            'endDate' => now()->addDays(9)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'OFFLINE',
        ], $headers)->assertCreated();

        $this->assertDatabaseHas('product_events', [
            'event_name' => 'booking_started',
            'service_id' => $service->id,
        ]);
        $this->assertDatabaseHas('product_events', [
            'event_name' => 'booking_confirmed',
            'service_id' => $service->id,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/analytics/funnel')
            ->assertOk()
            ->assertJsonPath('bookingStartedCount', 1)
            ->assertJsonPath('bookingConfirmedCount', 1);
    }
}
