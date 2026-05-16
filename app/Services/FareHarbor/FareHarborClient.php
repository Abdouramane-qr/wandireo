<?php

namespace App\Services\FareHarbor;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;

class FareHarborClient
{
    public function __construct(
        private readonly HttpFactory $http,
    ) {
    }

    public function listItems(string $companySlug): array
    {
        return $this->request("companies/{$companySlug}/items/");
    }

    public function getItem(string $companySlug, string $itemId): array
    {
        return $this->request("companies/{$companySlug}/items/{$itemId}/");
    }

    public function getCalendar(
        string $companySlug,
        string $itemId,
        int $year,
        int $month,
    ): array {
        return $this->request(
            "companies/{$companySlug}/items/{$itemId}/calendar/{$year}/{$month}/",
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function createBooking(string $companySlug, string $itemId, array $payload): array
    {
        return $this->request(
            "companies/{$companySlug}/items/{$itemId}/bookings/",
            'post',
            $payload,
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function request(string $path, string $method = 'get', array $payload = []): array
    {
        $request = $this->http
            ->baseUrl(rtrim(config('services.fareharbor.base_url'), '/'))
            ->acceptJson()
            ->timeout((int) config('services.fareharbor.timeout', 15));

        $response = match (strtolower($method)) {
            'post' => $request->post($path, $payload),
            default => $request->get($path),
        };

        if ($response->failed()) {
            throw new RequestException($response);
        }

        $data = $response->json();

        return is_array($data) ? $data : [];
    }
}
