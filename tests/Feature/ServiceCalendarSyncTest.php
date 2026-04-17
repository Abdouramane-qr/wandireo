<?php

namespace Tests\Feature;

use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ServiceCalendarSync;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceCalendarSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_can_configure_and_sync_ical_for_accommodation(): void
    {
        $partner = User::factory()->create(['role' => 'PARTNER']);
        $service = Service::factory()
            ->state(['partner_id' => $partner->id])
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create();

        Sanctum::actingAs($partner);

        $this->putJson("/api/services/{$service->id}/calendar-sync", [
            'importUrl' => 'https://example.test/accommodation.ics',
        ])->assertOk();

        Http::fake([
            'https://example.test/accommodation.ics' => Http::response(
                "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20260420\r\nDTEND;VALUE=DATE:20260423\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n",
                200,
                ['Content-Type' => 'text/calendar'],
            ),
        ]);

        $response = $this->postJson(
            "/api/services/{$service->id}/calendar-sync/sync",
        );

        $response->assertOk();
        $response->assertJsonPath('stats.importedEvents', 1);
        $response->assertJsonPath('stats.blockedDates', 3);

        $this->assertDatabaseHas('service_calendar_syncs', [
            'service_id' => $service->id,
            'last_status' => 'SUCCESS',
            'imported_events_count' => 1,
        ]);

        $this->assertDatabaseHas('availability_slots', [
            'service_id' => $service->id,
            'date' => '2026-04-20 00:00:00',
            'source_type' => 'ICAL',
            'is_blocked' => true,
        ]);
        $this->assertDatabaseHas('availability_slots', [
            'service_id' => $service->id,
            'date' => '2026-04-22 00:00:00',
            'source_type' => 'ICAL',
            'is_blocked' => true,
        ]);
    }

    public function test_export_calendar_contains_booking_and_manual_block(): void
    {
        $service = Service::factory()
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create();

        Booking::create([
            'client_id' => User::factory()->create(['role' => 'CLIENT'])->id,
            'partner_id' => $service->partner_id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'participants' => 2,
            'unit_price' => 120,
            'total_price' => 240,
            'currency' => 'EUR',
            'payment_mode' => 'OFFLINE',
            'amount_paid_online' => 0,
            'extra_data' => [],
        ]);

        AvailabilitySlot::create([
            'service_id' => $service->id,
            'date' => now()->addDays(10)->toDateString(),
            'source_type' => 'MANUAL',
            'is_blocked' => true,
            'slots' => [],
        ]);

        $response = $this->get("/api/services/{$service->id}/calendar.ics");

        $response->assertOk();
        $response->assertHeader(
            'Content-Type',
            'text/calendar; charset=utf-8',
        );
        $response->assertSee('BEGIN:VCALENDAR', false);
        $response->assertSee('SUMMARY:' . $service->title . ' - Reservation', false);
        $response->assertSee('SUMMARY:' . $service->title . ' - Indisponible', false);
    }

    public function test_car_service_is_rejected_for_ical_sync(): void
    {
        $partner = User::factory()->create(['role' => 'PARTNER']);
        $service = Service::factory()
            ->state(['partner_id' => $partner->id])
            ->category('VOITURE', 'PAR_JOUR')
            ->create();

        Sanctum::actingAs($partner);

        $this->getJson("/api/services/{$service->id}/calendar-sync")
            ->assertStatus(422)
            ->assertJsonValidationErrors('service');
    }

    public function test_ical_sync_configuration_keeps_a_distinct_row_from_fareharbor_sync_state(): void
    {
        $partner = User::factory()->create(['role' => 'PARTNER']);
        $service = Service::factory()
            ->state(['partner_id' => $partner->id])
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create();

        ServiceCalendarSync::query()->create([
            'service_id' => $service->id,
            'provider' => 'FAREHARBOR',
            'last_status' => 'SUCCESS',
            'last_synced_at' => now(),
            'imported_events_count' => 0,
        ]);

        Sanctum::actingAs($partner);

        $this->putJson("/api/services/{$service->id}/calendar-sync", [
            'importUrl' => 'https://example.test/accommodation.ics',
        ])->assertOk();

        $this->assertDatabaseHas('service_calendar_syncs', [
            'service_id' => $service->id,
            'provider' => 'FAREHARBOR',
            'last_status' => 'SUCCESS',
        ]);
        $this->assertDatabaseHas('service_calendar_syncs', [
            'service_id' => $service->id,
            'provider' => 'ICAL',
            'import_url' => 'https://example.test/accommodation.ics',
            'last_status' => 'IDLE',
        ]);
        $this->assertSame(
            2,
            ServiceCalendarSync::query()->where('service_id', $service->id)->count(),
        );
    }
}
