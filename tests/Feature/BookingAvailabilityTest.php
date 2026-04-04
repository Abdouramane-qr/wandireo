<?php

namespace Tests\Feature;

use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private function expectedClientPrice(Service $service): float
    {
        return (float) $service->partner_price * (1 + (float) $service->commission_rate);
    }

    public function test_accommodation_booking_is_created_when_period_is_free(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()->create([
            'category' => 'HEBERGEMENT',
            'pricing_unit' => 'PAR_NUIT',
            'payment_mode' => 'FULL_ONLINE',
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(5)->toDateString(),
            'endDate' => now()->addDays(7)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'OFFLINE',
        ]);

        $response->assertCreated();
        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_overlapping_accommodation_booking_is_rejected(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $otherClient = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()->create([
            'category' => 'HEBERGEMENT',
            'pricing_unit' => 'PAR_NUIT',
        ]);
        $clientPrice = $this->expectedClientPrice($service);

        Booking::create([
            'client_id' => $otherClient->id,
            'partner_id' => $service->partner_id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'participants' => 2,
            'unit_price' => $clientPrice,
            'total_price' => $clientPrice * 2,
            'currency' => 'EUR',
            'payment_mode' => 'OFFLINE',
            'amount_paid_online' => 0,
            'extra_data' => [],
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(11)->toDateString(),
            'endDate' => now()->addDays(13)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'OFFLINE',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('availability');
        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_activity_capacity_is_enforced_when_availability_slot_exists(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $otherClient = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create();
        $clientPrice = $this->expectedClientPrice($service);
        $date = now()->addDays(4)->toDateString();

        AvailabilitySlot::create([
            'service_id' => $service->id,
            'date' => $date,
            'source_type' => 'MANUAL',
            'is_blocked' => false,
            'slots' => [
                ['startTime' => '09:00', 'maxCapacity' => 4],
            ],
        ]);

        Booking::create([
            'client_id' => $otherClient->id,
            'partner_id' => $service->partner_id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'start_date' => $date,
            'end_date' => null,
            'participants' => 2,
            'unit_price' => $clientPrice,
            'total_price' => $clientPrice * 2,
            'currency' => 'EUR',
            'payment_mode' => 'OFFLINE',
            'amount_paid_online' => 0,
            'extra_data' => [],
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => $date,
            'participants' => 3,
            'paymentMode' => 'OFFLINE',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('participants');
    }
}
