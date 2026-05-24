<?php

namespace Tests\Feature;

use App\Models\AuditLogEntry;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBookingOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_booking_list_supports_payment_provider_and_search_filters(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create([
            'role' => 'CLIENT',
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
        ]);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'company_name' => 'Ocean Trails',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create([
                'title' => ['fr' => 'Croisiere Ocean'],
                'description' => ['fr' => 'Description'],
            ]);

        $failedBooking = Booking::query()->create([
            'client_id' => $client->id,
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
            'external_booking_reference' => 'fh-failed-123',
            'external_booking_status' => 'FAILED',
            'external_error_message' => 'Partner stock sync failed.',
        ]);

        $pendingProviderBooking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PAID',
            'start_date' => now()->addDays(2)->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_reference' => 'fh-pending-234',
            'external_booking_status' => 'PENDING',
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'CONFIRMED',
            'payment_status' => 'PAID',
            'start_date' => now()->addDays(2)->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_reference' => 'fh-confirmed-456',
            'external_booking_status' => 'CONFIRMED',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/bookings?paymentStatus=REFUNDED')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $failedBooking->id);

        $this->getJson('/api/bookings?externalBookingStatus=FAILED')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.external_booking_reference', 'fh-failed-123');

        $this->getJson('/api/bookings?externalBookingStatus=PENDING')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $pendingProviderBooking->id);

        $this->getJson('/api/bookings?q=stock%20sync')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $failedBooking->id);

        $this->getJson('/api/bookings?q=Ocean%20Trails')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_cannot_manually_confirm_external_booking(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create([
                'source_type' => 'EXTERNAL',
                'source_provider' => 'FAREHARBOR',
            ]);
        $booking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
            'payment_status' => 'PAID',
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 120.00,
            'total_price' => 240.00,
            'currency' => 'EUR',
            'payment_mode' => 'EXTERNAL_REDIRECT',
            'amount_paid_online' => 240.00,
            'external_booking_status' => 'PENDING',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'CONFIRMED',
        ])->assertStatus(422)
            ->assertJsonPath('message', 'External bookings cannot be confirmed manually.');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'PENDING',
            'external_booking_status' => 'PENDING',
        ]);
    }

    public function test_admin_finance_summary_uses_confirmed_non_refunded_bookings(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'company_name' => 'Finance Partner',
            'stripe_connected_account_id' => 'acct_finance',
            'legal_company_name' => 'Finance Partner Legal',
            'tax_country' => 'FR',
            'vat_number' => 'FR123456789',
            'business_registration_number' => 'RCS-FINANCE',
            'billing_email' => 'billing.finance@example.test',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create([
                'title' => ['fr' => 'Balade finance'],
                'commission_rate' => 0.20,
            ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 2,
            'unit_price' => 60.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'extra_data' => [
                'pricing' => [
                    'commission_total' => 24.00,
                ],
            ],
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_REFUNDED,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
            'extra_data' => [
                'pricing' => [
                    'commission_total' => 24.00,
                ],
            ],
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/finance/summary')
            ->assertOk()
            ->assertJsonPath('totals.bookings_count', 1)
            ->assertJsonPath('totals.gross_volume', 120)
            ->assertJsonPath('totals.commission_total', 24)
            ->assertJsonPath('totals.partner_net_total', 96)
            ->assertJsonPath('totals.online_collected_total', 120)
            ->assertJsonPath('partners.0.partner_name', 'Finance Partner')
            ->assertJsonPath('partners.0.payout_pending_count', 1)
            ->assertJsonPath('partners.0.payout_paid_count', 0)
            ->assertJsonPath('partners.0.stripe_connected_account_id', 'acct_finance')
            ->assertJsonPath('partners.0.legal_company_name', 'Finance Partner Legal')
            ->assertJsonPath('partners.0.tax_country', 'FR')
            ->assertJsonPath('partners.0.vat_number', 'FR123456789')
            ->assertJsonPath('partners.0.business_registration_number', 'RCS-FINANCE')
            ->assertJsonPath('partners.0.billing_email', 'billing.finance@example.test');
    }

    public function test_admin_finance_export_returns_csv_rows(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create([
            'role' => 'CLIENT',
            'email' => 'client.finance@example.test',
        ]);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
            'company_name' => 'CSV Partner',
            'legal_company_name' => 'CSV Partner Legal',
            'tax_country' => 'PT',
            'vat_number' => 'PT987654321',
            'business_registration_number' => 'CSV-REG-42',
            'billing_email' => 'billing.csv@example.test',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create([
                'title' => ['fr' => 'Export finance'],
                'commission_rate' => 0.20,
            ]);
        $booking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
            'extra_data' => [
                'pricing' => [
                    'commission_total' => 24.00,
                ],
            ],
        ]);

        Sanctum::actingAs($admin);

        $response = $this->get('/api/admin/finance/export');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $csv = $response->streamedContent();

        $this->assertStringContainsString('legal_company_name,tax_country,vat_number,business_registration_number,billing_email', $csv);
        $this->assertStringContainsString((string) $booking->id, $csv);
        $this->assertStringContainsString('CSV Partner', $csv);
        $this->assertStringContainsString('CSV Partner Legal', $csv);
        $this->assertStringContainsString('PT987654321', $csv);
        $this->assertStringContainsString('billing.csv@example.test', $csv);
        $this->assertStringContainsString('Export finance', $csv);
    }

    public function test_admin_can_update_payout_status_and_audit_it(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create();
        $booking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/finance/bookings/{$booking->id}/payout-status", [
            'payout_status' => Booking::PAYOUT_STATUS_PAID,
            'payout_notes' => 'Paid in May batch.',
        ])
            ->assertOk()
            ->assertJsonPath('payout_status', Booking::PAYOUT_STATUS_PAID)
            ->assertJsonPath('payout_notes', 'Paid in May batch.');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'payout_status' => Booking::PAYOUT_STATUS_PAID,
            'payout_marked_by' => $admin->id,
            'payout_notes' => 'Paid in May batch.',
        ]);

        $entry = AuditLogEntry::query()
            ->where('category', 'finance')
            ->where('action', 'PAYOUT_STATUS_UPDATED')
            ->first();

        $this->assertNotNull($entry);
        $this->assertSame(Booking::PAYOUT_STATUS_PENDING, $entry->metadata['from']['payout_status']);
        $this->assertSame(Booking::PAYOUT_STATUS_PAID, $entry->metadata['to']['payout_status']);
    }

    public function test_refunded_booking_cannot_be_marked_paid_for_payout(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create();
        $booking = Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_REFUNDED,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/finance/bookings/{$booking->id}/payout-status", [
            'payout_status' => Booking::PAYOUT_STATUS_PAID,
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Refunded bookings cannot be included in payout operations.');
    }

    public function test_partner_finance_summary_only_includes_own_non_refunded_bookings(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $otherPartner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $service = Service::factory()
            ->for($partner, 'partner')
            ->create(['commission_rate' => 0.20]);
        $otherService = Service::factory()
            ->for($otherPartner, 'partner')
            ->create(['commission_rate' => 0.20]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'start_date' => now()->addDay()->toDateString(),
            'participants' => 1,
            'unit_price' => 120.00,
            'total_price' => 120.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 120.00,
            'extra_data' => ['pricing' => ['commission_total' => 24.00]],
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'payout_status' => Booking::PAYOUT_STATUS_PAID,
            'start_date' => now()->addDays(2)->toDateString(),
            'participants' => 1,
            'unit_price' => 60.00,
            'total_price' => 60.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 60.00,
            'extra_data' => ['pricing' => ['commission_total' => 12.00]],
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $partner->id,
            'service_id' => $service->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_REFUNDED,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'start_date' => now()->addDays(3)->toDateString(),
            'participants' => 1,
            'unit_price' => 300.00,
            'total_price' => 300.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 300.00,
            'extra_data' => ['pricing' => ['commission_total' => 60.00]],
        ]);

        Booking::query()->create([
            'client_id' => $client->id,
            'partner_id' => $otherPartner->id,
            'service_id' => $otherService->id,
            'status' => Booking::STATUS_CONFIRMED,
            'payment_status' => Booking::PAYMENT_STATUS_PAID,
            'payout_status' => Booking::PAYOUT_STATUS_PENDING,
            'start_date' => now()->addDays(4)->toDateString(),
            'participants' => 1,
            'unit_price' => 900.00,
            'total_price' => 900.00,
            'currency' => 'EUR',
            'payment_mode' => 'FULL_ONLINE',
            'amount_paid_online' => 900.00,
            'extra_data' => ['pricing' => ['commission_total' => 180.00]],
        ]);

        Sanctum::actingAs($partner);

        $this->getJson('/api/partner/finance/summary')
            ->assertOk()
            ->assertJsonPath('totals.bookings_count', 2)
            ->assertJsonPath('totals.gross_volume', 180)
            ->assertJsonPath('totals.commission_total', 36)
            ->assertJsonPath('totals.partner_net_total', 144)
            ->assertJsonPath('totals.pending_payout_total', 96)
            ->assertJsonPath('totals.paid_payout_total', 48);
    }

    public function test_client_cannot_access_partner_finance_summary(): void
    {
        $client = User::factory()->create(['role' => 'CLIENT']);

        Sanctum::actingAs($client);

        $this->getJson('/api/partner/finance/summary')->assertForbidden();
    }
}
