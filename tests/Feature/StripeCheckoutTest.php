<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use App\Services\ExternalBookings\ExternalBookingException;
use App\Services\ExternalBookings\ExternalBookingResult;
use App\Services\ExternalBookings\ExternalBookingService;
use App\Services\FareHarbor\FareHarborAvailabilityService;
use App\Services\Payments\StripeCheckoutGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Stripe\Refund;
use Stripe\Checkout\Session;
use Tests\TestCase;

class StripeCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_checkout_creates_a_pending_payment_and_booking(): void
    {
        config()->set('app.url', 'http://localhost');
        config()->set('services.stripe.secret', 'sk_test_123');

        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'payment_mode' => 'FULL_ONLINE',
                'currency' => 'EUR',
            ]);

        $gateway = Mockery::mock(StripeCheckoutGateway::class);
        $gateway
            ->shouldReceive('createSession')
            ->once()
            ->andReturn(Session::constructFrom([
                'id' => 'cs_test_123',
                'url' => 'https://checkout.stripe.test/session/cs_test_123',
            ]));
        $this->app->instance(StripeCheckoutGateway::class, $gateway);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/checkout', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'FULL_ONLINE',
            'traveler' => [
                'firstName' => 'Ada',
                'lastName' => 'Lovelace',
                'email' => 'ada@example.com',
                'phone' => '+33123456789',
                'nationality' => 'FR',
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('sessionId', 'cs_test_123')
            ->assertJsonPath('url', 'https://checkout.stripe.test/session/cs_test_123');

        $bookingId = (string) $response->json('bookingId');

        $this->assertDatabaseHas('payments', [
            'user_id' => $client->id,
            'stripe_session_id' => 'cs_test_123',
            'status' => 'pending',
            'currency' => 'EUR',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'client_id' => $client->id,
            'service_id' => $service->id,
            'status' => 'AWAITING_PAYMENT',
            'payment_status' => 'PENDING',
        ]);
    }

    public function test_checkout_supports_external_services_when_provider_lookup_fails(): void
    {
        config()->set('app.url', 'http://localhost');
        config()->set('services.stripe.secret', 'sk_test_123');

        $client = User::factory()->create(['role' => 'CLIENT']);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'booking_mode' => 'EXTERNAL_REDIRECT',
                'payment_mode' => 'EXTERNAL_REDIRECT',
                'currency' => 'EUR',
            ]);

        $availability = Mockery::mock(FareHarborAvailabilityService::class);
        $availability
            ->shouldReceive('forService')
            ->once()
            ->andThrow(new \RuntimeException('provider unavailable'));
        $this->app->instance(FareHarborAvailabilityService::class, $availability);

        $gateway = Mockery::mock(StripeCheckoutGateway::class);
        $gateway
            ->shouldReceive('createSession')
            ->once()
            ->andReturn(Session::constructFrom([
                'id' => 'cs_test_external',
                'url' => 'https://checkout.stripe.test/session/cs_test_external',
            ]));
        $this->app->instance(StripeCheckoutGateway::class, $gateway);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/checkout', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'EXTERNAL_REDIRECT',
            'traveler' => [
                'firstName' => 'Ada',
                'lastName' => 'Lovelace',
                'email' => 'ada@example.com',
                'phone' => '+33123456789',
                'nationality' => 'FR',
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('sessionId', 'cs_test_external')
            ->assertJsonPath('url', 'https://checkout.stripe.test/session/cs_test_external');

        $bookingId = (string) $response->json('bookingId');

        $this->assertDatabaseHas('payments', [
            'user_id' => $client->id,
            'stripe_session_id' => 'cs_test_external',
            'status' => 'pending',
            'currency' => 'EUR',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'client_id' => $client->id,
            'service_id' => $service->id,
            'status' => 'AWAITING_PAYMENT',
            'payment_status' => 'PENDING',
        ]);
    }

    public function test_booking_init_disables_stripe_checkout_for_external_service_when_stripe_is_not_configured(): void
    {
        config()->set('services.stripe.secret', null);

        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/init', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'EXTERNAL_REDIRECT',
        ]);

        $response->assertOk()
            ->assertJsonPath('requiresStripeCheckout', false);
    }

    public function test_external_online_booking_confirms_without_stripe_when_stripe_is_not_configured(): void
    {
        config()->set('services.stripe.secret', null);

        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);

        $externalBookingService = Mockery::mock(ExternalBookingService::class);
        $externalBookingService
            ->shouldReceive('requiresExternalBooking')
            ->once()
            ->andReturn(true);
        $externalBookingService
            ->shouldReceive('syncOrFail')
            ->once()
            ->andReturnUsing(function (Booking $booking): ExternalBookingResult {
                $booking->update([
                    'external_booking_reference' => 'fh-no-stripe-123',
                    'external_booking_status' => 'CONFIRMED',
                ]);

                return new ExternalBookingResult('fh-no-stripe-123', 'CONFIRMED');
            });
        $this->app->instance(ExternalBookingService::class, $externalBookingService);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'EXTERNAL_REDIRECT',
        ]);

        $response->assertCreated();
        $bookingId = (string) $response->json('id');

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'external_booking_reference' => 'fh-no-stripe-123',
            'external_booking_status' => 'CONFIRMED',
        ]);
    }

    public function test_checkout_rejects_fareharbor_deposit_only_services_for_online_payment(): void
    {
        config()->set('app.url', 'http://localhost');
        config()->set('services.stripe.secret', 'sk_test_123');

        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
                'extra_data' => [
                    'fareharbor' => [
                        'priceStatus' => 'DEPOSIT_ONLY',
                    ],
                ],
            ]);

        $gateway = Mockery::mock(StripeCheckoutGateway::class);
        $gateway->shouldNotReceive('createSession');
        $this->app->instance(StripeCheckoutGateway::class, $gateway);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/checkout', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'EXTERNAL_REDIRECT',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('paymentMode');
    }

    public function test_external_offline_booking_is_confirmed_only_after_provider_success(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'FULL_CASH_ON_SITE',
            ]);

        $externalBookingService = Mockery::mock(ExternalBookingService::class);
        $externalBookingService
            ->shouldReceive('requiresExternalBooking')
            ->once()
            ->andReturn(true);
        $externalBookingService
            ->shouldReceive('syncOrFail')
            ->once()
            ->andReturnUsing(function (Booking $booking): ExternalBookingResult {
                $booking->update([
                    'external_booking_reference' => 'fh-offline-123',
                    'external_booking_status' => 'CONFIRMED',
                ]);

                return new ExternalBookingResult('fh-offline-123', 'CONFIRMED');
            });
        $this->app->instance(ExternalBookingService::class, $externalBookingService);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings/confirm', [
            'serviceId' => $service->id,
            'startDate' => now()->addDay()->toDateString(),
            'participants' => 2,
            'paymentMode' => 'FULL_CASH_ON_SITE',
        ]);

        $response->assertCreated();
        $bookingId = (string) $response->json('id');

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'external_booking_reference' => 'fh-offline-123',
            'external_booking_status' => 'CONFIRMED',
        ]);
    }

    public function test_checkout_expiration_cancels_awaiting_payment_booking_and_fails_payment(): void
    {
        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'payment_mode' => 'FULL_ONLINE',
            ]);

        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'AWAITING_PAYMENT',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
            'created_at' => now()->subMinutes(45),
            'updated_at' => now()->subMinutes(45),
        ]);
        $payment = Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_expired',
            'amount' => 120.00,
            'currency' => 'EUR',
            'status' => 'pending',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        app(\App\Services\Payments\PaymentService::class)->expireStaleCheckouts(now());

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
            'payment_status' => 'PENDING',
            'cancellation_reason' => 'checkout_expired_or_abandoned',
        ]);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'failed',
        ]);
    }

    public function test_stripe_webhook_marks_payment_and_booking_as_paid(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test_123');

        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'payment_mode' => 'FULL_ONLINE',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => null,
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
        ]);
        $payment = Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_paid',
            'amount' => 120.00,
            'currency' => 'EUR',
            'status' => 'pending',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $payload = json_encode([
            'id' => 'evt_test_123',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_paid',
                    'payment_status' => 'paid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_123');

        $response = $this->call(
            'POST',
            '/api/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
            ],
            $payload,
        );

        $response->assertOk()
            ->assertJson(['received' => true]);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PAID',
        ]);
    }

    public function test_stripe_webhook_confirms_external_booking_before_local_confirmation(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test_123');

        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'extra_data' => [
                'traveler' => [
                    'firstName' => 'Ada',
                    'lastName' => 'Lovelace',
                ],
            ],
        ]);
        Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_external_paid',
            'amount' => 240.00,
            'currency' => 'EUR',
            'status' => 'pending',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $externalBookingService = Mockery::mock(ExternalBookingService::class);
        $externalBookingService
            ->shouldReceive('requiresExternalBooking')
            ->once()
            ->andReturn(true);
        $externalBookingService
            ->shouldReceive('syncOrFail')
            ->once()
            ->withArgs(fn (Booking $candidate): bool => $candidate->is($booking))
            ->andReturnUsing(function (Booking $candidate): ExternalBookingResult {
                $candidate->update([
                    'external_booking_reference' => 'fh-booking-123',
                    'external_booking_status' => 'CONFIRMED',
                    'external_booking_payload' => ['id' => 'fh-booking-123'],
                ]);

                return new ExternalBookingResult(
                    'fh-booking-123',
                    'CONFIRMED',
                    ['id' => 'fh-booking-123'],
                );
            });
        $this->app->instance(ExternalBookingService::class, $externalBookingService);

        $payload = json_encode([
            'id' => 'evt_test_external_confirmed',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_external_paid',
                    'payment_status' => 'paid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_123');

        $this->call(
            'POST',
            '/api/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
            ],
            $payload,
        )->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PAID',
            'external_booking_reference' => 'fh-booking-123',
            'external_booking_status' => 'CONFIRMED',
        ]);
    }

    public function test_stripe_webhook_refunds_payment_when_external_booking_fails(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test_123');

        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'extra_data' => [],
        ]);
        $payment = Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_external_failed',
            'amount' => 240.00,
            'currency' => 'EUR',
            'status' => 'pending',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $externalBookingService = Mockery::mock(ExternalBookingService::class);
        $externalBookingService
            ->shouldReceive('requiresExternalBooking')
            ->once()
            ->andReturn(true);
        $externalBookingService
            ->shouldReceive('syncOrFail')
            ->once()
            ->andThrow(new ExternalBookingException('Partner stock sync failed.'));
        $this->app->instance(ExternalBookingService::class, $externalBookingService);

        $gateway = Mockery::mock(StripeCheckoutGateway::class);
        $gateway
            ->shouldReceive('refundSessionPayment')
            ->once()
            ->withArgs(fn (string $sessionId, array $metadata): bool => $sessionId === 'cs_test_external_failed'
                && ($metadata['booking_id'] ?? null) === $booking->id)
            ->andReturn(Refund::constructFrom([
                'id' => 're_test_123',
                'status' => 'succeeded',
            ]));
        $this->app->instance(StripeCheckoutGateway::class, $gateway);

        $payload = json_encode([
            'id' => 'evt_test_external_failed',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_external_failed',
                    'payment_status' => 'paid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_123');

        $this->call(
            'POST',
            '/api/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
            ],
            $payload,
        )->assertOk();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'refunded',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
            'payment_status' => 'REFUNDED',
            'external_booking_status' => 'FAILED',
            'external_error_message' => 'Partner stock sync failed.',
        ]);
    }

    public function test_stripe_webhook_is_idempotent_for_external_bookings(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test_123');

        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PENDING',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 120.00,
            'extra_data' => [],
        ]);
        Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_external_idempotent',
            'amount' => 120.00,
            'currency' => 'EUR',
            'status' => 'pending',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        $externalBookingService = Mockery::mock(ExternalBookingService::class);
        $externalBookingService
            ->shouldReceive('requiresExternalBooking')
            ->once()
            ->andReturn(true);
        $externalBookingService
            ->shouldReceive('syncOrFail')
            ->once()
            ->andReturnUsing(function (Booking $candidate): ExternalBookingResult {
                $candidate->update([
                    'external_booking_reference' => 'fh-booking-once',
                    'external_booking_status' => 'CONFIRMED',
                    'external_booking_payload' => ['id' => 'fh-booking-once'],
                ]);

                return new ExternalBookingResult(
                    'fh-booking-once',
                    'CONFIRMED',
                    ['id' => 'fh-booking-once'],
                );
            });
        $this->app->instance(ExternalBookingService::class, $externalBookingService);

        $payload = json_encode([
            'id' => 'evt_test_external_idempotent',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_external_idempotent',
                    'payment_status' => 'paid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'whsec_test_123');

        $server = [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
        ];

        $this->call('POST', '/api/stripe/webhook', [], [], [], $server, $payload)
            ->assertOk();
        $this->call('POST', '/api/stripe/webhook', [], [], [], $server, $payload)
            ->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'external_booking_reference' => 'fh-booking-once',
            'external_booking_status' => 'CONFIRMED',
            'status' => 'CONFIRMED',
        ]);
    }

    public function test_payment_session_status_exposes_external_booking_fields(): void
    {
        $user = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->category('ACTIVITE', 'PAR_PERSONNE')
            ->create([
                'partner_id' => $partner->id,
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
                'payment_mode' => 'EXTERNAL_REDIRECT',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $user->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'CANCELLED',
            'payment_status' => 'REFUNDED',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_reference' => 'fh-booking-status',
            'external_booking_status' => 'FAILED',
            'external_error_message' => 'Partner stock sync failed.',
            'extra_data' => [],
        ]);
        Payment::query()->create([
            'user_id' => $user->id,
            'stripe_session_id' => 'cs_test_status_external',
            'amount' => 240.00,
            'currency' => 'EUR',
            'status' => 'refunded',
            'metadata' => [
                'booking_id' => $booking->id,
            ],
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/payments/session/cs_test_status_external')
            ->assertOk()
            ->assertJsonPath('status', 'refunded')
            ->assertJsonPath('bookingStatus', 'CANCELLED')
            ->assertJsonPath('paymentStatus', 'REFUNDED')
            ->assertJsonPath('externalBookingStatus', 'FAILED')
            ->assertJsonPath('externalBookingReference', 'fh-booking-status')
            ->assertJsonPath('externalErrorMessage', 'Partner stock sync failed.');
    }

    public function test_stripe_webhook_rejects_invalid_signatures(): void
    {
        config()->set('services.stripe.webhook_secret', 'whsec_test_123');

        $payload = json_encode([
            'id' => 'evt_test_invalid',
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_invalid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);

        $response = $this->call(
            'POST',
            '/api/stripe/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Stripe-Signature' => 't=1,v1=bad-signature',
            ],
            $payload,
        );

        $response->assertStatus(400)
            ->assertJson(['error' => 'Invalid signature']);
    }
}
