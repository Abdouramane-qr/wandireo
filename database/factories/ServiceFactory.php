<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'partner_id' => User::factory()->state([
                'role' => 'PARTNER',
                'partner_status' => 'APPROVED',
            ]),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'category' => 'HEBERGEMENT',
            'location_city' => fake()->city(),
            'location_country' => fake()->country(),
            'location_region' => fake()->state(),
            'images' => [],
            'pricing_unit' => 'PAR_NUIT',
            'partner_price' => 100,
            'commission_rate' => 0.20,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'rating' => null,
            'review_count' => 0,
            'is_available' => true,
            'tags' => [],
            'extra_data' => [],
        ];
    }

    public function category(string $category, string $pricingUnit): static
    {
        return $this->state(fn () => [
            'category' => $category,
            'pricing_unit' => $pricingUnit,
        ]);
    }
}
