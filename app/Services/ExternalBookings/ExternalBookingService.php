<?php

namespace App\Services\ExternalBookings;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExternalBookingService
{
    public const STATUS_CONFIRMED = 'CONFIRMED';

    public function __construct(
        private readonly ExternalBookingGatewayRegistry $registry,
    ) {
    }

    public function requiresExternalBooking(Booking $booking): bool
    {
        return $booking->service?->source_type === 'EXTERNAL';
    }

    public function syncOrFail(Booking $booking): ExternalBookingResult
    {
        $booking->loadMissing(['service', 'client']);

        $service = $booking->service;

        if (! $service || $service->source_type !== 'EXTERNAL') {
            throw new ExternalBookingException(
                'This booking is not linked to an external inventory provider.',
            );
        }

        if (
            $this->hasConfirmedExternalBooking($booking)
            && filled($booking->external_booking_reference)
        ) {
            return new ExternalBookingResult(
                (string) $booking->external_booking_reference,
                self::STATUS_CONFIRMED,
                is_array($booking->external_booking_payload)
                    ? $booking->external_booking_payload
                    : [],
            );
        }

        $result = $this->dryRunEnabled()
            ? $this->makeDryRunResult($booking)
            : $this->createProviderBooking($booking, $service);

        DB::transaction(function () use ($booking, $result): void {
            $booking->forceFill([
                'external_booking_reference' => $result->reference,
                'external_booking_status' => strtoupper($result->status),
                'external_booking_payload' => $result->payload,
                'external_error_message' => null,
            ])->save();
        });

        Log::info('external_booking.created', [
            'booking_id' => $booking->id,
            'service_id' => $booking->service_id,
            'provider' => (string) $service->source_provider,
            'reference' => $result->reference,
            'status' => $result->status,
        ]);

        return $result;
    }

    public function hasConfirmedExternalBooking(Booking $booking): bool
    {
        return strtoupper((string) $booking->external_booking_status) === self::STATUS_CONFIRMED;
    }

    private function createProviderBooking(Booking $booking, Service $service): ExternalBookingResult
    {
        $gateway = $this->registry->forService($service);

        if (! $gateway) {
            throw new ExternalBookingException(
                sprintf(
                    'No external booking gateway is configured for provider [%s].',
                    (string) $service->source_provider,
                ),
                [
                    'provider' => (string) $service->source_provider,
                ],
            );
        }

        try {
            return $gateway->createBooking($booking, $service);
        } catch (ExternalBookingException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            throw new ExternalBookingException(
                $exception->getMessage(),
                [],
                0,
                $exception,
            );
        }
    }

    private function dryRunEnabled(): bool
    {
        return (bool) config('services.external_bookings.dry_run', false);
    }

    private function makeDryRunResult(Booking $booking): ExternalBookingResult
    {
        return new ExternalBookingResult(
            sprintf('DRYRUN-%s-%s', (string) $booking->service?->source_provider, (string) $booking->id),
            self::STATUS_CONFIRMED,
            [
                'dry_run' => true,
                'booking_id' => (string) $booking->id,
                'service_id' => $booking->service_id,
                'provider' => (string) $booking->service?->source_provider,
                'message' => 'External booking dry-run enabled; provider API was not called.',
            ],
        );
    }
}
