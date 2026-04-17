<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthApiTokenTest extends TestCase
{
    use RefreshDatabase;

    public function test_refresh_rotates_the_refresh_token(): void
    {
        $user = User::factory()->create();

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $loginResponse->assertOk();

        $originalRefreshToken = $loginResponse->json('refreshToken');
        $originalRefreshTokenModel = PersonalAccessToken::findToken($originalRefreshToken);

        $this->assertNotNull($originalRefreshTokenModel);

        $refreshResponse = $this->postJson('/api/auth/refresh', [
            'refreshToken' => $originalRefreshToken,
        ]);

        $refreshResponse->assertOk();
        $refreshResponse->assertJsonStructure(['accessToken', 'refreshToken']);
        $this->assertNull(PersonalAccessToken::find($originalRefreshTokenModel->id));
        $this->assertNotSame(
            $originalRefreshToken,
            $refreshResponse->json('refreshToken'),
        );
    }

    public function test_logout_can_revoke_the_supplied_refresh_token(): void
    {
        $user = User::factory()->create();
        $accessToken = $user->createToken('wdr-access', ['*'], now()->addHour());
        $refreshToken = $user->createToken('wdr-refresh', ['refresh'], now()->addDays(30));

        $this->withHeader('Authorization', 'Bearer ' . $accessToken->plainTextToken)
            ->deleteJson('/api/auth/logout', [
                'refreshToken' => $refreshToken->plainTextToken,
            ])
            ->assertOk();

        $this->assertNull(
            PersonalAccessToken::findToken($refreshToken->plainTextToken),
        );
    }
}
