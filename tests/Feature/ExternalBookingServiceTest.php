<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Services\ExternalBookings\ExternalBookingException;
use App\Services\ExternalBookings\ExternalBookingGateway;
use App\Services\ExternalBookings\ExternalBookingGatewayRegistry;
use App\Services\ExternalBookings\ExternalBookingResult;
use App\Services\ExternalBookings\ExternalBookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use stdClass;
use Tests\TestCase;

class ExternalBookingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_external_booking_details_for_supported_external_providers(): void
    {
        $booking = $this->makeExternalBooking('FAREHARBOR');
        $service = new ExternalBookingService(
            new ExternalBookingGatewayRegistry([
                new class implements ExternalBookingGateway
                {
                    public function provider(): string
                    {
                        return 'FAREHARBOR';
                    }

                    public function createBooking(Booking $booking, Service $service): ExternalBookingResult
                    {
                        return new ExternalBookingResult(
                            'ext-booking-123',
                            'CONFIRMED',
                            [
                                'booking_id' => $booking->id,
                                'service_id' => $service->id,
                            ],
                        );
                    }
                },
            ]),
        );

        $result = $service->syncOrFail($booking);

        $this->assertSame('ext-booking-123', $result->reference);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'external_booking_reference' => 'ext-booking-123',
            'external_booking_status' => 'CONFIRMED',
            'external_error_message' => null,
        ]);
        $this->assertSame(
            'ext-booking-123',
            $booking->fresh()->external_booking_reference,
        );
        $this->assertSame(
            ['booking_id' => $booking->id, 'service_id' => $booking->service_id],
            $booking->fresh()->external_booking_payload,
        );
    }

    public function test_it_is_idempotent_when_external_booking_is_already_confirmed(): void
    {
        $booking = $this->makeExternalBooking('FAREHARBOR', [
            'external_booking_reference' => 'ext-existing-123',
            'external_booking_status' => 'CONFIRMED',
            'external_booking_payload' => ['existing' => true],
        ]);

        $counter = new stdClass();
        $counter->count = 0;

        $service = new ExternalBookingService(
            new ExternalBookingGatewayRegistry([
                new class($counter) implements ExternalBookingGateway
                {
                    public function __construct(
                        private stdClass $counter,
                    ) {
                    }

                    public function provider(): string
                    {
                        return 'FAREHARBOR';
                    }

                    public function createBooking(Booking $booking, Service $service): ExternalBookingResult
                    {
                        $this->counter->count++;

                        return new ExternalBookingResult('should-not-run', 'CONFIRMED');
                    }
                },
            ]),
        );

        $result = $service->syncOrFail($booking);

        $this->assertSame(0, $counter->count);
        $this->assertSame('ext-existing-123', $result->reference);
        $this->assertSame(
            ['existing' => true],
            $booking->fresh()->external_booking_payload,
        );
    }

    public function test_it_fails_cleanly_when_an_external_provider_has_no_gateway(): void
    {
        $booking = $this->makeExternalBooking('CUSTOM_PROVIDER');
        $service = new ExternalBookingService(
            new ExternalBookingGatewayRegistry([]),
        );

        $this->expectException(ExternalBookingException::class);
        $this->expectExceptionMessage(
            'No external booking gateway is configured for provider [CUSTOM_PROVIDER].',
        );

        try {
            $service->syncOrFail($booking);
        } catch (ExternalBookingException $exception) {
            $this->assertSame(
                ['provider' => 'CUSTOM_PROVIDER'],
                $exception->context,
            );

            throw $exception;
        }
    }

    public function test_it_preserves_a_non_final_provider_status_without_marking_it_confirmed(): void
    {
        $booking = $this->makeExternalBooking('FAREHARBOR');
        $service = new ExternalBookingService(
            new ExternalBookingGatewayRegistry([
                new class implements ExternalBookingGateway
                {
                    public function provider(): string
                    {
                        return 'FAREHARBOR';
                    }

                    public function createBooking(Booking $booking, Service $service): ExternalBookingResult
                    {
                        return new ExternalBookingResult(
                            'ext-booking-pending',
                            'PENDING',
                            ['queued' => true],
                        );
                    }
                },
            ]),
        );

        $result = $service->syncOrFail($booking);

        $this->assertSame('PENDING', $result->status);
        $this->assertSame('PENDING', $booking->fresh()->external_booking_status);
        $this->assertFalse($service->hasConfirmedExternalBooking($booking->fresh()));
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function makeExternalBooking(string $provider, array $overrides = []): Booking
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => $provider,
                'source_external_id' => 'ext-item-123',
            ]);

        return Booking::query()->create(array_merge([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => null,
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'extra_data' => [
                'traveler' => [
                    'firstName' => 'Ada',
                    'lastName' => 'Lovelace',
                ],
            ],
        ], $overrides));
    }
}
