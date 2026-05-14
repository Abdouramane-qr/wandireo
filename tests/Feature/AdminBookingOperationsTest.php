<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBookingOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_booking_list_supports_payment_provider_and_search_filters(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create([
            'role' => 'CLIENT',
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
        ]);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'company_name' => 'Ocean Trails',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create([
                'title' => ['fr' => 'Croisiere Ocean'],
                'description' => ['fr' => 'Description'],
            ]);

        $failedBooking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'CANCELLED',
            'payment_status' => 'REFUNDED',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_reference' => 'fh-failed-123',
            'external_booking_status' => 'FAILED',
            'external_error_message' => 'Partner stock sync failed.',
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PAID',
            'start_date' => now()->addDays(2)->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_reference' => 'fh-confirmed-456',
            'external_booking_status' => 'CONFIRMED',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/bookings?paymentStatus=REFUNDED')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $failedBooking->id);

        $this->getJson('/api/bookings?externalBookingStatus=FAILED')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.external_booking_reference', 'fh-failed-123');

        $this->getJson('/api/bookings?q=stock%20sync')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $failedBooking->id);

        $this->getJson('/api/bookings?q=Ocean%20Trails')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
