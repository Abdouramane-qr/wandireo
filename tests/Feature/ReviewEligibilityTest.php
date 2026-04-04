<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewEligibilityTest extends TestCase
{
    use RefreshDatabase;

    private function expectedClientPrice(Service $service): float
    {
        return (float) $service->partner_price * (1 + (float) $service->commission_rate);
    }

    public function test_client_cannot_review_without_completed_confirmed_booking(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()->create();

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/reviews', [
            'serviceId' => $service->id,
            'rating' => 5,
            'comment' => 'Tres bonne experience.',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('serviceId');
    }

    public function test_pending_review_does_not_change_service_rating_until_approved(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()->create([
            'rating' => null,
            'review_count' => 0,
        ]);
        $clientPrice = $this->expectedClientPrice($service);

        Booking::create([
            'client_id' => $client->id,
            'partner_id' => $service->partner_id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'start_date' => now()->subDays(3)->toDateString(),
            'end_date' => now()->subDay()->toDateString(),
            'participants' => 1,
            'unit_price' => $clientPrice,
            'total_price' => $clientPrice,
            'currency' => 'EUR',
            'payment_mode' => 'OFFLINE',
            'amount_paid_online' => 0,
            'extra_data' => [],
        ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/reviews', [
            'serviceId' => $service->id,
            'rating' => 4,
            'comment' => 'Sejour tres correct.',
        ]);

        $response->assertCreated();

        $service->refresh();
        $this->assertSame(0, $service->review_count);
        $this->assertNull($service->rating);

        $review = Review::firstOrFail();
        $review->update(['status' => 'APPROVED']);

        $service->refresh();
        $this->assertSame(1, $service->review_count);
        $this->assertSame(4.0, (float) $service->rating);
    }
}
