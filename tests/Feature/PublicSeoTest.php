<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.name' => 'Wandireo',
            'app.url' => 'https://tripanova.code-ai-insight.com',
        ]);
    }

    public function test_homepage_renders_server_side_seo_tags(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee(
            '<link rel="canonical" href="https://tripanova.code-ai-insight.com">',
            false,
        );
        $response->assertSee(
            '<meta name="description" content="Wandireo rassemble hebergements, activites, bateaux et voitures premium dans une experience de reservation fluide et rapide.">',
            false,
        );
    }

    public function test_search_page_is_marked_noindex_with_canonical_base_url(): void
    {
        $response = $this->get('/recherche?q=lagos&category=ACTIVITE');

        $response->assertOk();
        $response->assertSee(
            '<meta name="robots" content="noindex,follow">',
            false,
        );
        $response->assertSee(
            '<link rel="canonical" href="https://tripanova.code-ai-insight.com/recherche">',
            false,
        );
    }

    public function test_service_page_uses_service_specific_seo_tags(): void
    {
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'title' => 'Croisiere privee lagon',
                'description' => 'Une sortie privee en mer pour decouvrir les plus beaux lagons.',
                'location_city' => 'Lanzarote',
                'location_country' => 'Espagne',
                'images' => ['uploads/services/lagon.jpg'],
            ]);

        $response = $this->get("/services/{$service->id}");

        $response->assertOk();
        $response->assertSee('Croisiere privee lagon, Lanzarote, Espagne', false);
        $response->assertSee(
            '<meta property="og:image" content="https://tripanova.code-ai-insight.com/uploads/services/lagon.jpg">',
            false,
        );
    }

    public function test_sitemap_lists_public_static_dynamic_pages(): void
    {
        $author = User::factory()->create();
        $service = Service::factory()->create([
            'is_available' => true,
        ]);
        BlogPost::query()->create([
            'author_id' => $author->id,
            'slug' => 'escapade-premium',
            'title' => 'Escapade premium',
            'excerpt' => 'Une escapade premium au soleil.',
            'content' => 'Contenu',
            'status' => 'PUBLISHED',
            'published_at' => now(),
        ]);
        BlogPost::query()->create([
            'author_id' => $author->id,
            'slug' => 'brouillon',
            'title' => 'Brouillon',
            'excerpt' => 'Brouillon',
            'content' => 'Contenu',
            'status' => 'DRAFT',
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/xml; charset=UTF-8');
        $response->assertSee('https://tripanova.code-ai-insight.com/blog', false);
        $response->assertSee("https://tripanova.code-ai-insight.com/services/{$service->id}", false);
        $response->assertSee('https://tripanova.code-ai-insight.com/blog/escapade-premium', false);
        $response->assertDontSee('https://tripanova.code-ai-insight.com/blog/brouillon', false);
    }
}
