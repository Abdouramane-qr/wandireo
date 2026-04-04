<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceSearchRankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_relevance_sort_prioritizes_destination_and_quality(): void
    {
        Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'title' => 'Sortie grottes Lagos premium',
                'location_city' => 'Lagos',
                'location_country' => 'Portugal',
                'location_region' => 'Algarve',
                'featured' => true,
                'rating' => 4.8,
                'review_count' => 18,
            ]);

        Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'title' => 'Excursion ocean',
                'location_city' => 'Faro',
                'location_country' => 'Portugal',
                'location_region' => 'Algarve',
                'featured' => false,
                'rating' => 4.9,
                'review_count' => 2,
            ]);

        $response = $this->getJson(
            '/api/services?category=ACTIVITE&destination=Lagos&sort=relevance',
        );

        $response->assertOk();
        $first = collect($response->json('data'))->first();

        $this->assertIsArray($first);
        $this->assertSame('Lagos', $first['location_city'] ?? null);
        $this->assertSame(
            'Sortie grottes Lagos premium',
            $first['title'] ?? null,
        );
    }
}
