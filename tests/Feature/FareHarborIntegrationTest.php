<?php

namespace Tests\Feature;

use App\Models\FareHarborCompany;
use App\Models\Service;
use App\Models\User;
use App\Services\FareHarbor\FareHarborAvailabilityService;
use App\Services\FareHarbor\FareHarborClient;
use App\Services\FareHarbor\FareHarborSyncService;
use App\Support\FareHarborDefaultCompanies;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class FareHarborIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_external_fareharbor_service_can_use_the_local_booking_flow_when_price_is_known(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => null,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-item-1',
                'extra_data' => [
                    'fareharbor' => [
                        'company' => 'seafaris',
                        'itemId' => 'fh-item-1',
                        'bookingUrl' => 'https://fareharbor.com/example/book/fh-item-1/',
                    ],
                ],
            ]);
        $availabilityService = Mockery::mock(FareHarborAvailabilityService::class);
        $availabilityService
            ->shouldReceive('forService')
            ->times(3)
            ->withArgs(fn (Service $candidate): bool => $candidate->is($service))
            ->andReturn([
                [
                    'id' => 'slot-fh-item-1',
                    'service_id' => $service->id,
                    'date' => now()->addDays(3)->toDateString(),
                    'slots' => [
                        [
                            'startTime' => '09:00',
                            'maxCapacity' => 8,
                        ],
                    ],
                ],
            ]);

        $this->app->instance(FareHarborAvailabilityService::class, $availabilityService);

        Sanctum::actingAs($client);

        $this->postJson('/api/bookings/init', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(3)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'FULL_ONLINE',
        ])->assertOk()
            ->assertJsonPath('amountOnline', (float) $service->client_price * 2);

        $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(3)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'FULL_ONLINE',
        ])->assertCreated()
            ->assertJsonPath(
                'service.id',
                $service->id,
            );
    }

    public function test_external_fareharbor_service_rejects_local_booking_when_final_price_is_unknown(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => null,
                'partner_price' => 0,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-item-price-pending',
                'extra_data' => [
                    'fareharbor' => [
                        'company' => 'seafaris',
                        'itemId' => 'fh-item-price-pending',
                        'isDepositRequired' => true,
                        'depositAmount' => 50,
                        'depositAmountEur' => 50,
                        'processorCurrency' => 'EUR',
                        'priceStatus' => 'DEPOSIT_ONLY',
                    ],
                ],
            ]);

        Sanctum::actingAs($client);

        $this->postJson('/api/bookings/init', [
            'serviceId' => $service->id,
            'startDate' => now()->addDays(3)->toDateString(),
            'participants' => 2,
            'paymentMode' => 'FULL_ONLINE',
        ])->assertStatus(422)
            ->assertJsonPath(
                'message',
                'Le tarif final de cette activite n est pas encore disponible pour une reservation en ligne.',
            );
    }

    public function test_external_fareharbor_availability_is_returned_in_normalized_shape(): void
    {
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => null,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-item-2',
                'extra_data' => [
                    'fareharbor' => [
                        'company' => 'buggy-adventure',
                        'itemId' => 'fh-item-2',
                        'bookingUrl' => 'https://fareharbor.com/example/book/fh-item-2/',
                    ],
                ],
            ]);

        $availabilityService = Mockery::mock(FareHarborAvailabilityService::class);
        $availabilityService
            ->shouldReceive('forService')
            ->once()
            ->andReturn([
                [
                    'id' => 'slot-1',
                    'service_id' => $service->id,
                    'date' => '2026-04-20',
                    'slots' => [
                        [
                            'startTime' => '09:00',
                            'maxCapacity' => 8,
                        ],
                    ],
                ],
            ]);

        $this->app->instance(FareHarborAvailabilityService::class, $availabilityService);

        $this->getJson("/api/availability?serviceId={$service->id}")
            ->assertOk()
            ->assertJsonPath('0.id', 'slot-1')
            ->assertJsonPath('0.service_id', $service->id)
            ->assertJsonPath('0.date', '2026-04-20')
            ->assertJsonPath('0.slots.0.startTime', '09:00')
            ->assertJsonPath('0.slots.0.maxCapacity', 8);
    }

    public function test_external_fareharbor_availability_fails_softly_when_provider_errors(): void
    {
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => null,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-item-3',
                'extra_data' => [
                    'fareharbor' => [
                        'company' => 'seafaris',
                        'itemId' => 'fh-item-3',
                        'bookingUrl' => 'https://fareharbor.com/example/book/fh-item-3/',
                    ],
                ],
            ]);

        $availabilityService = Mockery::mock(FareHarborAvailabilityService::class);
        $availabilityService
            ->shouldReceive('forService')
            ->once()
            ->andThrow(new \RuntimeException('provider down'));

        $this->app->instance(FareHarborAvailabilityService::class, $availabilityService);

        $this->getJson("/api/availability?serviceId={$service->id}")
            ->assertOk()
            ->assertExactJson([]);
    }

    public function test_sync_does_not_disable_existing_company_services_when_item_sync_is_disabled(): void
    {
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => false,
            'sync_details_enabled' => true,
        ]);

        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => null,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-existing',
                'is_available' => true,
                'extra_data' => [
                    'fareharbor' => [
                        'company' => 'seafaris',
                        'itemId' => 'fh-existing',
                        'bookingUrl' => 'https://fareharbor.com/example/book/fh-existing/',
                    ],
                ],
            ]);

        $client = Mockery::mock(FareHarborClient::class);
        $this->app->instance(FareHarborClient::class, $client);

        $stats = $this->app->make(FareHarborSyncService::class)->syncCompany($company);

        $this->assertSame('seafaris', $stats['company']);
        $this->assertSame(0, $stats['importedCount']);
        $this->assertTrue($service->fresh()->is_available);
        $this->assertDatabaseHas('fareharbor_companies', [
            'id' => $company->id,
            'last_status' => 'SUCCESS',
            'last_imported_items_count' => 0,
        ]);
        $this->assertDatabaseHas('service_calendar_syncs', [
            'service_id' => $service->id,
            'provider' => 'FAREHARBOR',
            'last_status' => 'SUCCESS',
            'import_url' => null,
        ]);
    }

    public function test_sync_keeps_same_item_id_distinct_across_multiple_fareharbor_companies(): void
    {
        $seafaris = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => false,
        ]);
        $buggyAdventure = FareHarborCompany::query()->create([
            'display_name' => 'Buggy Adventure',
            'company_slug' => 'buggy-adventure',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => false,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->once()
            ->with('seafaris')
            ->andReturn([
                ['pk' => 'shared-item', 'title' => 'Sea Safari'],
            ]);
        $client->shouldReceive('listItems')
            ->once()
            ->with('buggy-adventure')
            ->andReturn([
                ['pk' => 'shared-item', 'title' => 'Buggy Tour'],
            ]);

        $this->app->instance(FareHarborClient::class, $client);
        $syncService = $this->app->make(FareHarborSyncService::class);

        $syncService->syncCompany($seafaris);
        $syncService->syncCompany($buggyAdventure);

        $this->assertDatabaseHas('services', [
            'source_provider' => 'FAREHARBOR',
            'source_external_id' => 'seafaris:shared-item',
            'title' => 'Sea Safari',
            'payment_mode' => 'COMMISSION_ONLINE_REST_ON_SITE',
            'booking_mode' => 'REQUEST',
        ]);
        $this->assertDatabaseHas('services', [
            'source_provider' => 'FAREHARBOR',
            'source_external_id' => 'buggy-adventure:shared-item',
            'title' => 'Buggy Tour',
            'payment_mode' => 'COMMISSION_ONLINE_REST_ON_SITE',
            'booking_mode' => 'REQUEST',
        ]);
        $this->assertSame(
            2,
            Service::query()->where('source_provider', 'FAREHARBOR')->count(),
        );
    }

    public function test_sync_maps_deposit_only_pricing_when_total_price_is_missing(): void
    {
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->once()
            ->with('seafaris')
            ->andReturn([
                ['pk' => 'fh-deposit-only', 'title' => 'Sunset Cruise'],
            ]);
        $client->shouldReceive('getItem')
            ->once()
            ->with('seafaris', 'fh-deposit-only')
            ->andReturn([
                'item' => [
                    'pk' => 'fh-deposit-only',
                    'title' => 'Sunset Cruise',
                    'short_description' => 'Evening cruise.',
                    'is_deposit_required' => true,
                    'deposit_offset' => 5000,
                    'processor_currency' => 'eur',
                    'booking_url' => 'https://fareharbor.com/example/book/fh-deposit-only/',
                ],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $this->app->make(FareHarborSyncService::class)->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'seafaris:fh-deposit-only')
            ->firstOrFail();

        $this->assertSame('COMMISSION_ONLINE_REST_ON_SITE', $service->payment_mode);
        $this->assertSame('REQUEST', $service->booking_mode);
        $this->assertSame(
            'DEPOSIT_ONLY',
            data_get($service->extra_data, 'fareharbor.priceStatus'),
        );
        $this->assertTrue(
            (bool) data_get($service->extra_data, 'fareharbor.isDepositRequired'),
        );
        $this->assertSame(
            50.0,
            (float) data_get($service->extra_data, 'fareharbor.depositAmount'),
        );
        $this->assertSame(
            50.0,
            (float) data_get($service->extra_data, 'fareharbor.depositAmountEur'),
        );
        $this->assertSame(
            'EUR',
            data_get($service->extra_data, 'fareharbor.processorCurrency'),
        );
    }

    public function test_sync_maps_deposit_only_pricing_from_nested_settings_payload(): void
    {
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Real Shape Co',
            'company_slug' => 'real-shape',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->once()
            ->with('real-shape')
            ->andReturn([
                ['pk' => 'fh-nested-deposit', 'title' => 'Nested Deposit Cruise'],
            ]);
        $client->shouldReceive('getItem')
            ->once()
            ->with('real-shape', 'fh-nested-deposit')
            ->andReturn([
                'item' => [
                    'pk' => 'fh-nested-deposit',
                    'title' => 'Nested Deposit Cruise',
                    'short_description' => 'Real FareHarbor-like payload.',
                    'company' => [
                        'processor_currency' => 'eur',
                    ],
                    'settings' => [
                        'is_deposit_required' => true,
                        'deposit_offset' => 5000,
                    ],
                    'booking_url' => 'https://fareharbor.com/example/book/fh-nested-deposit/',
                ],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $this->app->make(FareHarborSyncService::class)->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'real-shape:fh-nested-deposit')
            ->firstOrFail();

        $this->assertSame(
            'DEPOSIT_ONLY',
            data_get($service->extra_data, 'fareharbor.priceStatus'),
        );
        $this->assertTrue(
            (bool) data_get($service->extra_data, 'fareharbor.isDepositRequired'),
        );
        $this->assertSame(
            50.0,
            (float) data_get($service->extra_data, 'fareharbor.depositAmount'),
        );
        $this->assertSame(
            50.0,
            (float) data_get($service->extra_data, 'fareharbor.depositAmountEur'),
        );
        $this->assertSame(
            'EUR',
            data_get($service->extra_data, 'fareharbor.processorCurrency'),
        );
    }

    public function test_sync_assigns_imported_services_to_the_company_partner(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'company_name' => 'Seafaris',
            'partner_status' => 'APPROVED',
        ]);
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'partner_id' => $partner->id,
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => false,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->once()
            ->with('seafaris')
            ->andReturn([
                ['pk' => 'fh-assign', 'title' => 'Sea Safari'],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $this->app->make(FareHarborSyncService::class)->syncCompany($company);

        $this->assertDatabaseHas('services', [
            'source_provider' => 'FAREHARBOR',
            'source_external_id' => 'seafaris:fh-assign',
            'partner_id' => $partner->id,
            'is_available' => true,
        ]);
    }

    public function test_external_service_overrides_survive_a_future_sync(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => false,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->twice()
            ->with('seafaris')
            ->andReturn([
                ['pk' => 'fh-override', 'title' => 'Provider Title'],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $syncService = $this->app->make(FareHarborSyncService::class);
        $syncService->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'seafaris:fh-override')
            ->firstOrFail();

        Sanctum::actingAs($admin);

        $this->patchJson("/api/services/{$service->id}", [
            'title' => 'Titre Wandireo',
            'description' => 'Description locale',
            'partner_price' => 88.50,
            'images' => ['https://cdn.example.com/cover.jpg'],
            'extra_data' => [
                'attributes' => [
                    'family_friendly' => true,
                ],
            ],
        ])->assertOk();

        $syncService->syncCompany($company);

        $service->refresh();

        $this->assertSame('Titre Wandireo', $service->title);
        $this->assertSame('Description locale', $service->description);
        $this->assertSame(88.5, (float) $service->partner_price);
        $this->assertSame(
            ['https://cdn.example.com/cover.jpg'],
            $service->images,
        );
        $this->assertSame(
            true,
            data_get($service->extra_data, 'attributes.family_friendly'),
        );
        $this->assertSame(
            'Titre Wandireo',
            data_get($service->extra_data, 'fareharbor.overrides.title'),
        );
    }

    public function test_admin_can_create_and_link_a_partner_account_for_a_fareharbor_company(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/fareharbor/companies/{$company->id}/partner-account")
            ->assertCreated()
            ->assertJsonPath('company.company_slug', 'seafaris')
            ->assertJsonPath('company.partner.company_name', 'Seafaris');

        $company->refresh();

        $this->assertNotNull($company->partner_id);
        $this->assertDatabaseHas('users', [
            'id' => $company->partner_id,
            'role' => 'PARTNER',
            'company_name' => 'Seafaris',
        ]);
    }

    public function test_bootstrap_companies_command_upserts_the_default_v1_partner_list(): void
    {
        $this->artisan('fareharbor:bootstrap-companies')
            ->expectsOutput('FareHarbor V1 companies bootstrapped.')
            ->assertSuccessful();

        foreach (FareHarborDefaultCompanies::all() as $company) {
            $this->assertDatabaseHas('fareharbor_companies', [
                'company_slug' => $company['company_slug'],
                'display_name' => $company['display_name'],
                'is_enabled' => true,
                'sync_items_enabled' => true,
                'sync_details_enabled' => true,
            ]);
        }

        $this->artisan('fareharbor:bootstrap-companies')->assertSuccessful();

        $this->assertSame(10, FareHarborCompany::query()->count());
    }
}
