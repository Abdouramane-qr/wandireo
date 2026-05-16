<?php

namespace App\Services\ExternalBookings;

use RuntimeException;

class ExternalBookingException extends RuntimeException
{
    /**
     * @param array<string, mixed> $context
     */
    public function __construct(
        string $message,
        public readonly array $context = [],
        int $code = 0,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
