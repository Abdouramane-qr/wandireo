<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServicePricingRuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_can_manage_pricing_rules_for_own_service(): void
    {
        $partner = User::factory()->create(['role' => 'PARTNER']);
        $service = Service::factory()
            ->state(['partner_id' => $partner->id])
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create();

        Sanctum::actingAs($partner);

        $createResponse = $this->postJson(
            "/api/services/{$service->id}/pricing-rules",
            [
                'name' => 'Majoration week-end',
                'rule_type' => 'WEEKEND',
                'adjustment_type' => 'PERCENTAGE',
                'adjustment_value' => 15,
                'priority' => 20,
            ],
        );

        $createResponse->assertCreated();
        $ruleId = $createResponse->json('id');

        $this->getJson("/api/services/{$service->id}/pricing-rules")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Majoration week-end');

        $this->patchJson(
            "/api/services/{$service->id}/pricing-rules/{$ruleId}",
            ['adjustment_value' => 12],
        )->assertOk()->assertJsonPath('adjustment_value', '12.00');

        $this->deleteJson("/api/services/{$service->id}/pricing-rules/{$ruleId}")
            ->assertOk();

        $this->assertDatabaseCount('service_pricing_rules', 0);
    }

    public function test_booking_init_uses_duration_pricing_rule(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->state([
                'partner_id' => $partner->id,
                'partner_price' => 100,
                'commission_rate' => 0.20,
            ])
            ->category('HEBERGEMENT', 'PAR_NUIT')
            ->create();

        Config::set('services.stripe.secret', null);

        Sanctum::actingAs($partner);
        $this->postJson("/api/services/{$service->id}/pricing-rules", [
            'name' => 'Remise long séjour',
            'rule_type' => 'DURATION',
            'adjustment_type' => 'PERCENTAGE',
            'adjustment_value' => -10,
            'min_units' => 7,
            'priority' => 50,
        ])->assertCreated();

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/init', [
            'serviceId' => $service->id,
            'startDate' => '2026-04-10',
            'endDate' => '2026-04-17',
            'participants' => 1,
            'paymentMode' => 'FULL_ONLINE',
        ]);

        $response->assertOk();
        $response->assertJsonPath('pricing.partner_subtotal', 630);
        $response->assertJsonPath('pricing.commission_total', 126);
        $response->assertJsonPath('pricing.client_total', 756);
        $response->assertJsonPath('amountOnline', 756);
    }
}
