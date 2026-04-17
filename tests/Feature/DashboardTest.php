<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_approved_partners_can_visit_the_partner_dashboard()
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        $response = $this->actingAs($partner)->get(route('partner.dashboard'));

        $response->assertOk();
    }

    public function test_pending_partners_can_visit_the_pending_page()
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'PENDING',
        ]);

        $response = $this->actingAs($partner)->get(route('partner.pending'));

        $response->assertOk();
    }
}
