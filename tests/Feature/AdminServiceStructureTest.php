<?php

namespace Tests\Feature;

use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminServiceStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_service_category(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/service-structure/categories', [
            'service_type' => 'ACTIVITE',
            'name' => 'Excursions',
            'name_translations' => [
                'fr' => 'Excursions',
                'en' => 'Tours',
            ],
            'slug' => '',
            'description' => 'Activites locales',
            'is_active' => true,
            'sort_order' => 5,
        ])
            ->assertCreated()
            ->assertJsonPath('name', 'Excursions')
            ->assertJsonPath('slug', 'excursions')
            ->assertJsonPath('name_translations.fr', 'Excursions');

        $this->assertDatabaseHas('service_categories', [
            'service_type' => 'ACTIVITE',
            'name' => 'Excursions',
            'slug' => 'excursions',
            'is_active' => true,
            'sort_order' => 5,
        ]);
    }

    public function test_admin_can_create_a_service_category_from_translated_name(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/service-structure/categories', [
            'service_type' => 'BATEAU',
            'name' => '',
            'name_translations' => [
                'fr' => 'Location avec skipper',
                'en' => 'Skippered rental',
            ],
            'description_translations' => [
                'fr' => 'Sorties en mer accompagnees.',
            ],
            'is_active' => true,
            'sort_order' => 0,
        ])
            ->assertCreated()
            ->assertJsonPath('name', 'Location avec skipper')
            ->assertJsonPath('slug', 'location-avec-skipper')
            ->assertJsonPath('description', 'Sorties en mer accompagnees.');

        $this->assertTrue(
            ServiceCategory::query()
                ->where('name', 'Location avec skipper')
                ->where('slug', 'location-avec-skipper')
                ->exists(),
        );
    }
}
