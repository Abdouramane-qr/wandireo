<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_presign_returns_a_signed_upload_url_bound_to_the_current_user(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/uploads/presign', [
            'fileName' => 'cover.png',
            'contentType' => 'image/png',
            'folder' => 'blog',
        ]);

        $response->assertOk();
        $response->assertJsonPath('key', fn (?string $key) => is_string($key) && str_starts_with($key, 'blog/'));
        $this->assertStringStartsWith('/api/uploads/direct?', (string) $response->json('uploadUrl'));
        $this->assertStringContainsString('signature=', (string) $response->json('uploadUrl'));
        $this->assertStringContainsString(
            'issuedFor=' . $user->getAuthIdentifier(),
            (string) $response->json('uploadUrl'),
        );
    }

    public function test_direct_upload_rejects_unsigned_requests(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/uploads/direct?key=blog/test.png&issuedFor=' . $user->getAuthIdentifier(), [])
            ->assertForbidden();
    }

    public function test_direct_upload_accepts_relative_signed_upload_url(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $presignResponse = $this->postJson('/api/uploads/presign', [
            'fileName' => 'cover.png',
            'contentType' => 'image/png',
            'folder' => 'services',
        ])->assertOk();

        $uploadUrl = (string) $presignResponse->json('uploadUrl');
        $key = (string) $presignResponse->json('key');

        $this->post($uploadUrl, [
            'file' => UploadedFile::fake()->image('cover.png', 16, 16),
        ])
            ->assertCreated()
            ->assertJsonPath('key', $key);

        $this->assertTrue(Storage::disk('public')->exists($key));

        Storage::disk('public')->delete($key);
    }
}
