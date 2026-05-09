<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ], ['Cookie' => 'locale=fr']);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', ['locale' => 'fr'], false));
    }

    public function test_new_users_can_resume_booking_after_registration(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'resume@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'booking_resume_redirect' => '/fr/panier',
        ], ['Cookie' => 'locale=fr']);

        $this->assertAuthenticated();
        $response->assertRedirect('/fr/panier');
    }
}
