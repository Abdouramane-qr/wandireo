<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeCatalogPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_catalog_preview_returns_lightweight_public_services(): void
    {
        $activity = Service::factory()->create([
            'title' => ['fr' => 'Croisiere Benagil'],
            'description' => ['fr' => 'Une activite disponible pour la home.'],
            'category' => 'ACTIVITE',
            'location_city' => 'Benagil',
            'location_country' => 'PT',
            'images' => ['https://example.test/benagil.jpg'],
            'pricing_unit' => 'PAR_PERSONNE',
            'partner_price' => 50,
            'currency' => 'EUR',
            'rating' => 4.8,
            'review_count' => 12,
            'is_available' => true,
            'moderation_status' => Service::MODERATION_PUBLISHED,
            'extra_data' => [
                'duration' => 90,
                'durationUnit' => 'MINUTES',
                'fareharbor' => [
                    'raw' => ['large' => str_repeat('x', 1000)],
                ],
            ],
        ]);

        Service::factory()->create([
            'title' => ['fr' => 'Activite masquee'],
            'category' => 'ACTIVITE',
            'is_available' => false,
            'moderation_status' => Service::MODERATION_PUBLISHED,
        ]);

        $response = $this->getJson('/api/home/catalog-preview');

        $response
            ->assertOk()
            ->assertJsonPath('featuredServices.0.id', (string) $activity->id)
            ->assertJsonPath('featuredServices.0.category', 'ACTIVITE')
            ->assertJsonPath('featuredServices.0.location.country', 'Portugal')
            ->assertJsonPath('featuredServices.0.durationMinutes', 90)
            ->assertJsonPath('categoryCounts.ACTIVITE', 1)
            ->assertJsonPath('destinations.0.country', 'Portugal')
            ->assertJsonPath('destinations.0.region', 'Algarve')
            ->assertJsonMissingPath('featuredServices.0.extra_data')
            ->assertJsonMissingPath('featuredServices.0.extraData');
    }
}
