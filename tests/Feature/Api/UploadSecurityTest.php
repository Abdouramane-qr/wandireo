<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
