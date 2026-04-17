<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TranslationDetailCacheTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_service_detail_returns_the_requested_locale_even_across_cached_requests(): void
    {
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'title' => [
                    'fr' => 'Croisiere privee',
                    'en' => 'Private cruise',
                ],
                'description' => [
                    'fr' => 'Description francaise',
                    'en' => 'English description',
                ],
            ]);

        $this->getJson("/api/services/{$service->id}", [
            'Accept-Language' => 'fr',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Croisiere privee')
            ->assertJsonPath('description', 'Description francaise');

        $this->getJson("/api/services/{$service->id}", [
            'Accept-Language' => 'en',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Private cruise')
            ->assertJsonPath('description', 'English description');
    }

    public function test_blog_detail_returns_the_requested_locale_even_across_cached_requests(): void
    {
        $author = User::factory()->create();

        BlogPost::query()->create([
            'author_id' => $author->id,
            'slug' => 'escapade-bilingue',
            'title' => [
                'fr' => 'Escapade premium',
                'en' => 'Premium getaway',
            ],
            'excerpt' => [
                'fr' => 'Resume francais',
                'en' => 'English summary',
            ],
            'content' => [
                'fr' => '<p>Contenu francais</p>',
                'en' => '<p>English content</p>',
            ],
            'status' => 'PUBLISHED',
            'published_at' => now(),
        ]);

        $this->getJson('/api/blog/posts/escapade-bilingue', [
            'Accept-Language' => 'fr',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Escapade premium')
            ->assertJsonPath('excerpt', 'Resume francais')
            ->assertJsonPath('content', '<p>Contenu francais</p>');

        $this->getJson('/api/blog/posts/escapade-bilingue', [
            'Accept-Language' => 'en',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Premium getaway')
            ->assertJsonPath('excerpt', 'English summary')
            ->assertJsonPath('content', '<p>English content</p>');
    }
}
