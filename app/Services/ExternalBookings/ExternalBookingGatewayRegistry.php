<?php

namespace App\Services\ExternalBookings;

use App\Models\Service;

class ExternalBookingGatewayRegistry
{
    /**
     * @param iterable<int, ExternalBookingGateway> $gateways
     */
    public function __construct(
        private readonly iterable $gateways,
    ) {
    }

    public function forService(Service $service): ?ExternalBookingGateway
    {
        if ($service->source_type !== 'EXTERNAL') {
            return null;
        }

        $provider = strtoupper((string) $service->source_provider);

        if ($provider === '') {
            return null;
        }

        foreach ($this->gateways as $gateway) {
            if (strtoupper($gateway->provider()) === $provider) {
                return $gateway;
            }
        }

        return null;
    }
}
