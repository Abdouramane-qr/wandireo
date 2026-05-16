<?php

namespace Tests\Feature;

use App\Models\FareHarborCompany;
use App\Models\Service;
use App\Models\User;
use App\Services\FareHarbor\FareHarborAvailabilityService;
use App\Services\FareHarbor\FareHarborClient;
use App\Services\FareHarbor\FareHarborSyncService;
use App\Services\PartnerContentTranslationService;
use App\Support\FareHarborDefaultCompanies;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
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
            ->times(2)
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
        ])->assertStatus(422)
            ->assertJsonPath(
                'message',
                'External online bookings must be completed through Stripe Checkout before confirmation.',
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

    public function test_sync_translates_visible_partner_content_and_serves_the_requested_locale(): void
    {
        $counts = $this->fakeFastTranslateApi('pt');
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
                ['pk' => 'fh-pt', 'title' => 'Passeio de Barco'],
            ]);
        $client->shouldReceive('getItem')
            ->once()
            ->with('seafaris', 'fh-pt')
            ->andReturn([
                'item' => [
                    'pk' => 'fh-pt',
                    'name' => 'Passeio de Barco',
                    'description' => 'Explore as grutas.',
                    'meeting_point' => 'Marina de Lagos',
                    'included' => ['Colete salva-vidas'],
                    'not_included' => ['Transfer'],
                    'headline' => 'Passeio dourado',
                    'short_description' => 'Uma tarde no mar.',
                ],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $this->app->make(FareHarborSyncService::class)->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'seafaris:fh-pt')
            ->firstOrFail();

        $this->assertSame('pt', data_get($service->extra_data, 'translations.source_locale'));
        $this->assertSame('[de] Marina de Lagos', data_get($service->extra_data, 'translations.fields.meetingPoint.de'));
        $this->assertSame('[es] Colete salva-vidas', data_get($service->extra_data, 'translations.fields.included.es.0'));
        $this->assertGreaterThan(0, $counts['translate']);
        $this->assertSame(1, $counts['detect']);

        $this->getJson("/api/services/{$service->id}", [
            'Accept-Language' => 'de',
        ])
            ->assertOk()
            ->assertJsonPath('title', '[de] Passeio de Barco')
            ->assertJsonPath('description', '[de] Explore as grutas.')
            ->assertJsonPath('extra_data.meetingPoint', '[de] Marina de Lagos')
            ->assertJsonPath('extra_data.included.0', '[de] Colete salva-vidas')
            ->assertJsonPath('extra_data.notIncluded.0', '[de] Transfer')
            ->assertJsonPath('extra_data.fareharbor.headline', '[de] Passeio dourado')
            ->assertJsonPath('extra_data.fareharbor.shortDescription', '[de] Uma tarde no mar.');
    }

    public function test_sync_skips_detection_and_translation_when_imported_source_has_not_changed(): void
    {
        $counts = $this->fakeFastTranslateApi('en');
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->twice()
            ->with('seafaris')
            ->andReturn([
                ['pk' => 'fh-stable', 'title' => 'Sea Safari'],
            ]);
        $client->shouldReceive('getItem')
            ->twice()
            ->with('seafaris', 'fh-stable')
            ->andReturn([
                'item' => [
                    'pk' => 'fh-stable',
                    'name' => 'Sea Safari',
                    'description' => 'Explore the coast.',
                    'meeting_point' => 'Lagos Marina',
                    'included' => ['Life jacket'],
                    'not_included' => ['Hotel pickup'],
                    'headline' => 'Golden cruise',
                    'short_description' => 'Afternoon at sea.',
                ],
            ]);

        $this->app->instance(FareHarborClient::class, $client);

        $syncService = $this->app->make(FareHarborSyncService::class);
        $syncService->syncCompany($company);

        $afterFirstSync = [
            'detect' => $counts['detect'],
            'translate' => $counts['translate'],
        ];

        $syncService->syncCompany($company);

        $this->assertSame($afterFirstSync['detect'], $counts['detect']);
        $this->assertSame($afterFirstSync['translate'], $counts['translate']);
    }

    public function test_sync_retranslates_when_the_partner_source_content_changes(): void
    {
        $counts = $this->fakeFastTranslateApi('en');
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->twice()
            ->with('seafaris')
            ->andReturn(
                [['pk' => 'fh-delta', 'title' => 'Sea Safari']],
                [['pk' => 'fh-delta', 'title' => 'Sunset Safari']],
            );
        $client->shouldReceive('getItem')
            ->twice()
            ->with('seafaris', 'fh-delta')
            ->andReturn(
                [
                    'item' => [
                        'pk' => 'fh-delta',
                        'name' => 'Sea Safari',
                        'description' => 'Explore the coast.',
                        'meeting_point' => 'Lagos Marina',
                        'included' => ['Life jacket'],
                        'not_included' => ['Hotel pickup'],
                        'headline' => 'Golden cruise',
                        'short_description' => 'Afternoon at sea.',
                    ],
                ],
                [
                    'item' => [
                        'pk' => 'fh-delta',
                        'name' => 'Sunset Safari',
                        'description' => 'Watch the cliffs at sunset.',
                        'meeting_point' => 'Lagos Marina',
                        'included' => ['Life jacket'],
                        'not_included' => ['Hotel pickup'],
                        'headline' => 'Sunset escape',
                        'short_description' => 'Golden hour cruise.',
                    ],
                ],
            );

        $this->app->instance(FareHarborClient::class, $client);

        $syncService = $this->app->make(FareHarborSyncService::class);
        $syncService->syncCompany($company);
        $afterFirstSync = $counts['translate'];

        $syncService->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'seafaris:fh-delta')
            ->firstOrFail();

        $this->assertGreaterThan($afterFirstSync, $counts['translate']);
        $this->assertSame('[de] Sunset Safari', $service->getTranslations('title')['de']);
        $this->assertSame('[it] Watch the cliffs at sunset.', $service->getTranslations('description')['it']);
    }

    public function test_sync_reuses_existing_non_french_translations_when_a_resync_call_fails(): void
    {
        config()->set('services.fast_translate.enabled', true);
        config()->set('services.fast_translate.base_url', 'https://translate.test/api/v1');
        config()->set('services.fast_translate.api_key', 'test-key');
        config()->set('services.fast_translate.timeout', 5);

        $company = FareHarborCompany::query()->create([
            'display_name' => 'Seafaris',
            'company_slug' => 'seafaris',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        $translateAttempts = new \ArrayObject([
            'sea_safari_es' => 0,
        ]);

        Http::fake(function (Request $request) use ($translateAttempts) {
            if (str_ends_with($request->url(), '/detect/')) {
                return Http::response([
                    'language' => 'en',
                    'confidence' => 0.99,
                ]);
            }

            if (str_ends_with($request->url(), '/translate/')) {
                $payload = $request->data();

                if ($payload['text'] === 'Sea Safari' && $payload['target_language'] === 'es') {
                    $translateAttempts['sea_safari_es']++;

                    if ($translateAttempts['sea_safari_es'] > 1) {
                        return Http::response([
                            'detail' => 'Translation not found.',
                        ], 422);
                    }
                }

                return Http::response([
                    'translated_text' => sprintf(
                        '[%s] %s',
                        $payload['target_language'],
                        $payload['text'],
                    ),
                    'source_language' => $payload['source_language'],
                    'target_language' => $payload['target_language'],
                ]);
            }

            return Http::response([], 404);
        });

        $client = Mockery::mock(FareHarborClient::class);
        $client->shouldReceive('listItems')
            ->twice()
            ->with('seafaris')
            ->andReturn(
                [['pk' => 'fh-resilient', 'title' => 'Sea Safari']],
                [['pk' => 'fh-resilient', 'title' => 'Sea Safari']],
            );
        $client->shouldReceive('getItem')
            ->twice()
            ->with('seafaris', 'fh-resilient')
            ->andReturn(
                [
                    'item' => [
                        'pk' => 'fh-resilient',
                        'name' => 'Sea Safari',
                        'description' => 'Explore the coast.',
                        'meeting_point' => 'Lagos Marina',
                        'included' => ['Life jacket'],
                        'not_included' => ['Hotel pickup'],
                        'headline' => 'Golden cruise',
                        'short_description' => 'Afternoon at sea.',
                    ],
                ],
                [
                    'item' => [
                        'pk' => 'fh-resilient',
                        'name' => 'Sea Safari',
                        'description' => 'Watch the cliffs at sunset.',
                        'meeting_point' => 'Lagos Marina',
                        'included' => ['Life jacket'],
                        'not_included' => ['Hotel pickup'],
                        'headline' => 'Sunset escape',
                        'short_description' => 'Golden hour cruise.',
                    ],
                ],
            );

        $this->app->instance(FareHarborClient::class, $client);

        $syncService = $this->app->make(FareHarborSyncService::class);
        $syncService->syncCompany($company);
        $syncService->syncCompany($company);

        $service = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'seafaris:fh-resilient')
            ->firstOrFail();

        $audit = $this->app->make(PartnerContentTranslationService::class)
            ->auditServiceTranslations($service);

        $this->assertSame('[es] Sea Safari', $service->getTranslations('title')['es']);
        $this->assertSame('[de] Watch the cliffs at sunset.', $service->getTranslations('description')['de']);
        $this->assertSame('READY', data_get($service->extra_data, 'translations.status'));
        $this->assertSame([], $audit['blocking_issues']);
    }

    public function test_translation_audit_treats_source_match_as_warning_and_allows_benign_titles(): void
    {
        $translator = $this->app->make(PartnerContentTranslationService::class);

        $allowed = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-kayak',
                'title' => [
                    'fr' => 'Kayak',
                    'en' => 'Kayak',
                ],
                'description' => [
                    'fr' => 'Description francaise',
                    'en' => 'English description',
                ],
                'extra_data' => [
                    'translations' => [
                        'provider' => 'FAREHARBOR',
                        'status' => 'READY',
                        'source_locale' => 'en',
                        'source_hash' => 'kayak-hash',
                        'fields' => [
                            'title' => ['fr' => 'Kayak', 'en' => 'Kayak'],
                            'description' => ['fr' => 'Description francaise', 'en' => 'English description'],
                        ],
                    ],
                ],
            ]);

        $warning = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'fh-gift-card',
                'title' => [
                    'fr' => 'Gift Card',
                    'en' => 'Gift Card',
                ],
                'description' => [
                    'fr' => 'Treat your loved ones to unforgettable experiences!',
                    'en' => 'Treat your loved ones to unforgettable experiences!',
                ],
                'extra_data' => [
                    'translations' => [
                        'provider' => 'FAREHARBOR',
                        'status' => 'READY',
                        'source_locale' => 'en',
                        'source_hash' => 'gift-card-hash',
                        'fields' => [
                            'title' => ['fr' => 'Gift Card', 'en' => 'Gift Card'],
                            'description' => [
                                'fr' => 'Treat your loved ones to unforgettable experiences!',
                                'en' => 'Treat your loved ones to unforgettable experiences!',
                            ],
                        ],
                    ],
                ],
            ]);

        $allowedAudit = $translator->auditServiceTranslations($allowed);
        $warningAudit = $translator->auditServiceTranslations($warning);

        $this->assertSame([], $allowedAudit['blocking_issues']);
        $this->assertSame([], $allowedAudit['warning_issues']);
        $this->assertSame([], $warningAudit['blocking_issues']);
        $this->assertSame(
            ['fr_matches_source_title', 'fr_matches_source_description'],
            $warningAudit['warning_issues'],
        );
        $this->assertFalse($translator->serviceHasIncompleteTranslations($warning));
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
                'meetingPoint' => 'Port de Lagos',
                'included' => ['Guide francophone'],
                'notIncluded' => ['Transfert hotel'],
                'attributes' => [
                    'family_friendly' => true,
                ],
            ],
        ])->assertOk();

        $syncService->syncCompany($company);

        $service->refresh();

        $this->assertSame(88.5, (float) $service->partner_price);
        $this->assertSame(
            ['https://cdn.example.com/cover.jpg'],
            $service->images,
        );
        $this->assertSame(
            true,
            data_get($service->extra_data, 'wandireo.attributes.family_friendly'),
        );
        $this->assertSame(
            'Titre Wandireo',
            data_get($service->extra_data, 'fareharbor.overrides.title.fr'),
        );
        $this->assertContains(
            'Port de Lagos',
            data_get($service->extra_data, 'fareharbor.overrides.meetingPoint', []),
        );
        $this->assertContains(
            ['Guide francophone'],
            data_get($service->extra_data, 'fareharbor.overrides.included', []),
        );
        $this->assertContains(
            ['Transfert hotel'],
            data_get($service->extra_data, 'fareharbor.overrides.notIncluded', []),
        );

        $this->getJson("/api/services/{$service->id}", [
            'Accept-Language' => 'fr',
        ])
            ->assertOk()
            ->assertJsonPath('title', 'Titre Wandireo')
            ->assertJsonPath('description', 'Description locale')
            ->assertJsonPath('extra_data.meetingPoint', 'Port de Lagos')
            ->assertJsonPath('extra_data.included.0', 'Guide francophone')
            ->assertJsonPath('extra_data.notIncluded.0', 'Transfert hotel');
    }

    public function test_backfill_command_translates_existing_imported_partner_services(): void
    {
        $this->fakeFastTranslateApi('en');

        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => 'seafaris:fh-backfill',
                'title' => ['en' => 'Sea Safari'],
                'description' => ['en' => 'Explore the coast.'],
                'extra_data' => [
                    'meetingPoint' => 'Lagos Marina',
                    'included' => ['Life jacket'],
                    'notIncluded' => ['Hotel pickup'],
                    'fareharbor' => [
                        'headline' => 'Golden cruise',
                        'shortDescription' => 'Afternoon at sea.',
                    ],
                ],
            ]);

        $this->artisan('partner-content:translate-backfill', [
            '--provider' => 'FAREHARBOR',
        ])->assertSuccessful();

        $service->refresh();

        $this->assertSame('[fr] Sea Safari', $service->getTranslations('title')['fr']);
        $this->assertSame('[de] Explore the coast.', $service->getTranslations('description')['de']);
        $this->assertSame('[it] Lagos Marina', data_get($service->extra_data, 'translations.fields.meetingPoint.it'));
    }

    public function test_admin_can_create_and_link_a_partner_account_for_a_fareharbor_company(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $company = FareHarborCompany::query()->create([
            'display_name' => 'Moments Watersports',
            'company_slug' => 'momentswatersports',
            'is_enabled' => true,
            'sync_items_enabled' => true,
            'sync_details_enabled' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/fareharbor/companies/{$company->id}/partner-account")
            ->assertCreated()
            ->assertJsonPath('company.company_slug', 'momentswatersports')
            ->assertJsonPath('company.partner.company_name', 'Moments Watersports')
            ->assertJsonPath('partner_credentials.email', 'info@momentswatersports.com');

        $company->refresh();

        $this->assertNotNull($company->partner_id);
        $this->assertDatabaseHas('users', [
            'id' => $company->partner_id,
            'role' => 'PARTNER',
            'company_name' => 'Moments Watersports',
            'email' => 'info@momentswatersports.com',
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

        $this->assertSame(17, FareHarborCompany::query()->count());
    }

    /**
     * @return \ArrayObject<string, int>
     */
    private function fakeFastTranslateApi(string $detectedLanguage): \ArrayObject
    {
        config()->set('services.fast_translate.enabled', true);
        config()->set('services.fast_translate.base_url', 'https://translate.test/api/v1');
        config()->set('services.fast_translate.api_key', 'test-key');
        config()->set('services.fast_translate.timeout', 5);

        $counts = new \ArrayObject([
            'detect' => 0,
            'translate' => 0,
        ]);

        Http::fake(function (Request $request) use ($counts, $detectedLanguage) {
            if (str_ends_with($request->url(), '/detect/')) {
                $counts['detect']++;

                return Http::response([
                    'language' => $detectedLanguage,
                    'confidence' => 0.99,
                ]);
            }

            if (str_ends_with($request->url(), '/translate/')) {
                $counts['translate']++;
                $payload = $request->data();

                return Http::response([
                    'translated_text' => sprintf(
                        '[%s] %s',
                        $payload['target_language'],
                        $payload['text'],
                    ),
                    'source_language' => $payload['source_language'],
                    'target_language' => $payload['target_language'],
                ]);
            }

            return Http::response([], 404);
        });

        return $counts;
    }
}
