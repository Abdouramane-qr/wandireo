<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'), ['Cookie' => 'locale=fr']);
        $response->assertRedirect(route('login', ['locale' => 'fr'], false));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_fully_onboarded_partners_can_visit_the_partner_dashboard()
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'SIGNED',
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

    public function test_partner_pending_page_receives_contract_text_for_signature()
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'PENDING_SIGNATURE',
            'mandate_contract_text' => 'Contract terms visible to partner.',
            'mandate_signed_at' => null,
            'onboarding_completed_at' => null,
        ]);

        $response = $this->actingAs($partner)->get(route('partner.pending'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.mandateContractText', 'Contract terms visible to partner.')
                ->where('auth.user.mandateContractStatus', 'PENDING_SIGNATURE')
            );
    }
}
