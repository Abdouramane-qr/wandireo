<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BlogTranslationTest extends TestCase
{
    use RefreshDatabase;

    public function test_blog_post_store_auto_translates_missing_locales(): void
    {
        $this->fakeFastTranslateApi('fr');
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/blog/posts', [
            'title' => 'Escapade premium',
            'excerpt' => 'Resume premium',
            'content' => '<p>Contenu premium</p>',
            'status' => 'PUBLISHED',
        ])->assertCreated();

        $post = BlogPost::query()->firstOrFail();

        $this->assertSame('Escapade premium', $post->getTranslations('title')['fr']);
        $this->assertSame('[en] Escapade premium', $post->getTranslations('title')['en']);
        $this->assertSame('[de] Resume premium', $post->getTranslations('excerpt')['de']);
        $this->assertSame('[it] <p>Contenu premium</p>', $post->getTranslations('content')['it']);
        $this->assertSame('fr', data_get($post->translation_state, 'source_locale'));
        $this->assertSame('READY', data_get($post->translation_state, 'status'));
    }

    public function test_blog_post_update_preserves_manual_translations_while_refreshing_auto_generated_locales(): void
    {
        $this->fakeFastTranslateApi('fr');
        $admin = User::factory()->create(['role' => 'ADMIN']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/blog/posts', [
            'title' => 'Escapade premium',
            'excerpt' => 'Resume premium',
            'content' => '<p>Contenu premium</p>',
            'status' => 'PUBLISHED',
        ])->assertCreated();

        $post = BlogPost::query()->firstOrFail();
        $firstGermanTitle = $post->getTranslations('title')['de'];

        $this->patchJson("/api/blog/posts/{$post->id}", [
            'title' => [
                'fr' => 'Escapade premium',
                'en' => 'Custom English title',
            ],
        ])->assertOk();

        $post->refresh();

        $this->assertSame('Custom English title', $post->getTranslations('title')['en']);

        $this->patchJson("/api/blog/posts/{$post->id}", [
            'title' => [
                'fr' => 'Nouvelle escapade premium',
                'en' => 'Custom English title',
            ],
        ])->assertOk();

        $post->refresh();

        $this->assertSame('Nouvelle escapade premium', $post->getTranslations('title')['fr']);
        $this->assertSame('Custom English title', $post->getTranslations('title')['en']);
        $this->assertSame('[de] Nouvelle escapade premium', $post->getTranslations('title')['de']);
        $this->assertNotSame($firstGermanTitle, $post->getTranslations('title')['de']);
    }

    public function test_blog_backfill_command_translates_existing_published_articles(): void
    {
        $this->fakeFastTranslateApi('fr');
        $author = User::factory()->create();

        $post = BlogPost::query()->create([
            'author_id' => $author->id,
            'slug' => 'escapade-premium',
            'title' => ['fr' => 'Escapade premium'],
            'excerpt' => ['fr' => 'Resume premium'],
            'content' => ['fr' => '<p>Contenu premium</p>'],
            'status' => 'PUBLISHED',
            'published_at' => now(),
        ]);

        $this->artisan('blog-content:translate-backfill')
            ->expectsOutput('Scanning blog posts with status PUBLISHED for translation backfill...')
            ->expectsOutput('Blog backfill complete. translated=1 unchanged=0 partial=0')
            ->assertSuccessful();

        $post->refresh();

        $this->assertSame('[en] Escapade premium', $post->getTranslations('title')['en']);
        $this->assertSame('[es] Resume premium', $post->getTranslations('excerpt')['es']);
        $this->assertSame('READY', data_get($post->translation_state, 'status'));
        $this->assertNotNull(data_get($post->translation_state, 'source_hash'));
    }

    private function fakeFastTranslateApi(string $detectedLanguage): void
    {
        config()->set('services.fast_translate.enabled', true);
        config()->set('services.fast_translate.base_url', 'https://translate.test/api/v1');
        config()->set('services.fast_translate.api_key', 'test-key');
        config()->set('services.fast_translate.timeout', 5);

        Http::fake(function (Request $request) use ($detectedLanguage) {
            if (str_ends_with($request->url(), '/detect/')) {
                return Http::response([
                    'language' => $detectedLanguage,
                    'confidence' => 0.99,
                ]);
            }

            if (str_ends_with($request->url(), '/translate/')) {
                $payload = $request->data();

                return Http::response([
                    'translated_text' => sprintf(
                        '[%s] %s',
                        $payload['target_language'],
                        $payload['text'],
                    ),
                ]);
            }

            return Http::response(status: 404);
        });
    }
}
