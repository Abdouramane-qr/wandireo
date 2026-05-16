<?php

namespace App\Services\ExternalBookings;

class ExternalBookingResult
{
    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        public readonly string $reference,
        public readonly string $status,
        public readonly array $payload = [],
    ) {
    }
}
