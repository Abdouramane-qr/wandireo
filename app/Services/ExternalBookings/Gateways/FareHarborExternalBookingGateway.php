<?php

namespace App\Services\ExternalBookings\Gateways;

use App\Models\Booking;
use App\Models\Service;
use App\Services\ExternalBookings\ExternalBookingException;
use App\Services\ExternalBookings\ExternalBookingGateway;
use App\Services\ExternalBookings\ExternalBookingResult;
use App\Services\FareHarbor\FareHarborClient;
use Illuminate\Support\Arr;

class FareHarborExternalBookingGateway implements ExternalBookingGateway
{
    public function __construct(
        private readonly FareHarborClient $client,
    ) {
    }

    public function provider(): string
    {
        return 'FAREHARBOR';
    }

    public function createBooking(Booking $booking, Service $service): ExternalBookingResult
    {
        $companySlug = (string) data_get($service->extra_data, 'fareharbor.company');
        $itemId = (string) data_get($service->extra_data, 'fareharbor.itemId', $service->source_external_id);

        if ($companySlug === '' || $itemId === '') {
            throw new ExternalBookingException(
                'FareHarbor booking configuration is incomplete.',
                [
                    'company' => $companySlug,
                    'item_id' => $itemId,
                ],
            );
        }

        $payload = [
            'booking' => [
                'uuid' => (string) $booking->id,
                'start_date' => optional($booking->start_date)->toDateString(),
                'end_date' => optional($booking->end_date)->toDateString(),
                'participants' => (int) $booking->participants,
                'currency' => (string) $booking->currency,
                'total_price' => (float) $booking->total_price,
                'amount_paid_online' => (float) $booking->amount_paid_online,
                'notes' => $booking->notes,
            ],
            'traveler' => data_get($booking->extra_data, 'traveler'),
            'selected_extras' => data_get($booking->extra_data, 'selected_extras', []),
            'source' => 'wandireo',
        ];

        $response = $this->client->createBooking($companySlug, $itemId, $payload);

        $reference = (string) (
            Arr::get($response, 'uuid')
            ?? Arr::get($response, 'booking.uuid')
            ?? Arr::get($response, 'pk')
            ?? Arr::get($response, 'id')
            ?? ''
        );

        if ($reference === '') {
            throw new ExternalBookingException(
                'FareHarbor did not return a booking reference.',
                [
                    'response' => $response,
                ],
            );
        }

        $status = (string) (
            Arr::get($response, 'status')
            ?? Arr::get($response, 'booking.status')
            ?? 'CONFIRMED'
        );

        return new ExternalBookingResult(
            $reference,
            strtoupper($status),
            $response,
        );
    }
}
