<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FareHarborCompany;
use App\Models\Service;
use App\Models\ServiceExtra;
use App\Services\Analytics\ProductAnalyticsTracker;
use App\Services\Audit\AuditLogger;
use App\Services\Availability\AvailabilityResolver;
use App\Services\ExternalBookings\ExternalBookingException;
use App\Services\ExternalBookings\ExternalBookingService;
use App\Services\Payments\PaymentAmountResolver;
use App\Services\Pricing\PricingEngine;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingController extends Controller
{
    public function __construct(
        private readonly AvailabilityResolver $availabilityResolver,
        private readonly PaymentAmountResolver $paymentAmountResolver,
        private readonly ProductAnalyticsTracker $analyticsTracker,
        private readonly PricingEngine $pricingEngine,
        private readonly ExternalBookingService $externalBookingService,
        private readonly AuditLogger $auditLogger,
    ) {}

    /**
     * POST /api/bookings/init
     * Recalcule le pricing serveur avant le passage dans Stripe Checkout.
     */
    public function init(Request $request): JsonResponse
    {
        $data = $request->validate([
            'serviceId' => 'required',
            'startDate' => 'required|date',
            'endDate' => 'nullable|date',
            'participants' => 'required|integer|min:1',
            'paymentMode' => 'required|string',
            'selectedExtras' => 'nullable|array',
            'selectedExtras.*.id' => 'required_with:selectedExtras|string',
            'selectedExtras.*.quantity' => 'nullable|integer|min:1',
            'extrasTotal' => 'nullable|numeric|min:0',
        ]);

        $units = max(1, $data['participants']);
        $service = Service::with(['serviceCategory.extras', 'pricingRules'])->findOrFail($data['serviceId']);
        $this->guardUnavailableFareHarborOnlinePricing($service, (string) $data['paymentMode']);
        $startDate = Carbon::parse($data['startDate'])->startOfDay();
        $endDate = ! empty($data['endDate'])
            ? Carbon::parse($data['endDate'])->startOfDay()
            : null;
        $this->availabilityResolver->assertBookingCanBeConfirmed(
            $service,
            $startDate,
            $endDate,
            $units,
        );
        $normalizedExtras = $this->normalizeSelectedExtras(
            $service,
            $data['selectedExtras'] ?? [],
        );
        $extrasTotal = collect($normalizedExtras)->sum('total_price');
        $pricing = $this->pricingEngine->calculate(
            $service,
            $startDate,
            $endDate,
            $units,
        );
        $total = $pricing['client_total'] + $extrasTotal;
        $online = $this->paymentAmountResolver->resolveOnlineAmount(
            $data['paymentMode'],
            (float) $total,
            (float) $pricing['commission_total'],
            (float) $extrasTotal,
        );

        $bookingDraftId = (string) Str::uuid();
        $stripeEnabled = (bool) config('services.stripe.secret');
        $requiresStripeCheckout = $online > 0
            && (
                $service->source_type !== 'EXTERNAL'
                || $stripeEnabled
            );

        $this->analyticsTracker->track($request, 'booking_started', [
            'service_id' => $service->id,
            'category' => $service->category,
            'participants' => $units,
            'amount_online' => $online,
        ]);

        $payload = [
            'clientSecret' => null,
            'bookingDraftId' => $bookingDraftId,
            'amountOnline' => $online,
            'requiresStripeCheckout' => $requiresStripeCheckout,
            'pricing' => $pricing,
            'selectedExtras' => $normalizedExtras,
            'extrasTotal' => $extrasTotal,
        ];

        return $service->source_type === 'EXTERNAL'
            ? response()->json($payload, 200, [], JSON_PRESERVE_ZERO_FRACTION)
            : response()->json($payload);
    }

    /**
     * POST /api/bookings/confirm
     * Crée la réservation après confirmation du paiement Stripe.
     */
    public function confirm(Request $request): JsonResponse
    {
        $data = $request->validate([
            'serviceId' => 'required',
            'startDate' => 'required|date',
            'endDate' => 'nullable|date',
            'participants' => 'required|integer|min:1',
            'paymentMode' => 'required|string',
            'selectedExtras' => 'nullable|array',
            'selectedExtras.*.id' => 'required_with:selectedExtras|string',
            'selectedExtras.*.quantity' => 'nullable|integer|min:1',
            'extrasTotal' => 'nullable|numeric|min:0',
            'stripePaymentIntentId' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $service = Service::with(['serviceCategory.extras', 'pricingRules'])->findOrFail($data['serviceId']);
        $this->guardUnavailableFareHarborOnlinePricing($service, (string) $data['paymentMode']);
        $startDate = Carbon::parse($data['startDate'])->startOfDay();
        $endDate = ! empty($data['endDate'])
            ? Carbon::parse($data['endDate'])->startOfDay()
            : null;
        $this->availabilityResolver->assertBookingCanBeConfirmed(
            $service,
            $startDate,
            $endDate,
            (int) $data['participants'],
        );
        $normalizedExtras = $this->normalizeSelectedExtras(
            $service,
            $data['selectedExtras'] ?? [],
        );
        $extrasTotal = collect($normalizedExtras)->sum('total_price');
        $pricing = $this->pricingEngine->calculate(
            $service,
            $startDate,
            $endDate,
            (int) $data['participants'],
        );
        $total = $pricing['client_total'] + $extrasTotal;
        $online = $this->paymentAmountResolver->resolveOnlineAmount(
            $data['paymentMode'],
            (float) $total,
            (float) $pricing['commission_total'],
            (float) $extrasTotal,
        );
        $stripeEnabled = (bool) config('services.stripe.secret');
        $requiresOnlinePayment = $online > 0;
        $requiresDeferredExternalConfirmation = $requiresOnlinePayment
            && $service->source_type === 'EXTERNAL'
            && $stripeEnabled;
        $requiresStripePaymentIntent = $requiresOnlinePayment
            && $service->source_type !== 'EXTERNAL';

        if ($requiresDeferredExternalConfirmation) {
            return response()->json([
                'message' => 'External online bookings must be completed through Stripe Checkout before confirmation.',
            ], 422);
        }

        if ($requiresStripePaymentIntent && ! $stripeEnabled) {
            return response()->json([
                'message' => 'Stripe checkout is required for this booking but is not configured.',
            ], 422);
        }

        if (
            $requiresStripePaymentIntent
            && empty($data['stripePaymentIntentId'])
        ) {
            return response()->json([
                'message' => 'stripePaymentIntentId is required for online payments.',
            ], 422);
        }

        $booking = DB::transaction(function () use (
            $request,
            $service,
            $requiresOnlinePayment,
            $data,
            $total,
            $online,
            $normalizedExtras,
            $extrasTotal,
            $startDate,
            $endDate,
            $pricing,
        ) {
            $this->availabilityResolver->assertBookingCanBeConfirmed(
                $service->fresh(),
                $startDate,
                $endDate,
                (int) $data['participants'],
            );

            return Booking::create([
                'client_id' => $request->user()->id,
                'partner_id' => $this->resolveBookingPartnerId($service, $request),
                'service_id' => $service->id,
                'status' => $requiresOnlinePayment
                    ? Booking::STATUS_AWAITING_PAYMENT
                    : Booking::STATUS_PENDING,
                'payment_status' => Booking::PAYMENT_STATUS_PENDING,
                'start_date' => $data['startDate'],
                'end_date' => $data['endDate'] ?? null,
                'participants' => $data['participants'],
                'unit_price' => $pricing['client_unit_price'],
                'total_price' => $total,
                'currency' => $service->currency,
                'payment_mode' => $data['paymentMode'],
                'amount_paid_online' => $online,
                'extra_data' => [
                    'selected_extras' => $normalizedExtras,
                    'extras_total' => $extrasTotal,
                    'pricing' => $pricing,
                ],
                'stripe_payment_intent_id' => $data['stripePaymentIntentId'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
        });

        if ($this->externalBookingService->requiresExternalBooking($booking)) {
            try {
                $this->externalBookingService->syncOrFail($booking);
            } catch (ExternalBookingException $exception) {
                $booking->forceFill([
                    'status' => Booking::STATUS_CANCELLED,
                    'external_booking_status' => 'FAILED',
                    'external_error_message' => $exception->getMessage(),
                ])->save();

                return response()->json([
                    'message' => 'External provider booking creation failed.',
                    'bookingId' => $booking->id,
                    'externalBookingStatus' => 'FAILED',
                    'externalErrorMessage' => $exception->getMessage(),
                ], 422);
            }

            if ($this->externalBookingService->hasConfirmedExternalBooking($booking)) {
                $booking->forceFill([
                    'status' => Booking::STATUS_CONFIRMED,
                    'external_booking_status' => $booking->external_booking_status
                        ?: ExternalBookingService::STATUS_CONFIRMED,
                    'external_error_message' => null,
                ])->save();
            }
        } elseif (! $requiresOnlinePayment) {
            $booking->forceFill([
                'status' => Booking::STATUS_CONFIRMED,
            ])->save();
        }

        $this->analyticsTracker->track($request, 'booking_confirmed', [
            'service_id' => $service->id,
            'booking_id' => $booking->id,
            'category' => $service->category,
            'participants' => (int) $data['participants'],
            'total_price' => $total,
        ]);

        return response()->json($booking->load('service'), 201);
    }

    /** GET /api/bookings/mine */
    public function mine(Request $request): JsonResponse
    {
        try {
            return response()->json(
                Booking::with('service')
                    ->where('client_id', $request->user()->id)
                    ->latest()
                    ->get()
            );
        } catch (QueryException) {
            return response()->json([]);
        }
    }

    /** GET /api/bookings/partner-incoming */
    public function partnerIncoming(Request $request): JsonResponse
    {
        try {
            return response()->json(
                Booking::with(['service', 'client'])
                    ->where('partner_id', $request->user()->id)
                    ->latest()
                    ->get()
            );
        } catch (QueryException) {
            return response()->json([]);
        }
    }

    /** GET /api/partner/finance/summary */
    public function partnerFinanceSummary(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['service', 'client', 'partner'])
            ->where('partner_id', $request->user()->id)
            ->where('status', Booking::STATUS_CONFIRMED)
            ->where('payment_status', '!=', Booking::PAYMENT_STATUS_REFUNDED)
            ->latest()
            ->get();

        $snapshots = $bookings->map(fn (Booking $booking): array => $this->financeSnapshot($booking));

        return response()->json([
            'generated_at' => now()->toISOString(),
            'totals' => [
                'bookings_count' => $snapshots->count(),
                'gross_volume' => round($snapshots->sum('gross_volume'), 2),
                'commission_total' => round($snapshots->sum('commission_total'), 2),
                'partner_net_total' => round($snapshots->sum('partner_net_total'), 2),
                'pending_payout_total' => $this->sumPayoutStatus($snapshots, Booking::PAYOUT_STATUS_PENDING),
                'on_hold_payout_total' => $this->sumPayoutStatus($snapshots, Booking::PAYOUT_STATUS_ON_HOLD),
                'scheduled_payout_total' => $this->sumPayoutStatus($snapshots, Booking::PAYOUT_STATUS_SCHEDULED),
                'paid_payout_total' => $this->sumPayoutStatus($snapshots, Booking::PAYOUT_STATUS_PAID),
                'failed_payout_total' => $this->sumPayoutStatus($snapshots, Booking::PAYOUT_STATUS_FAILED),
            ],
        ]);
    }

    /** GET /api/bookings (admin) */
    public function adminList(Request $request): JsonResponse
    {
        try {
            $query = Booking::with(['service', 'client', 'partner'])->latest();

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->paymentStatus) {
                $query->where('payment_status', $request->paymentStatus);
            }

            if ($request->payoutStatus) {
                $query->where('payout_status', $request->payoutStatus);
            }

            if ($request->filled('externalBookingStatus')) {
                $externalBookingStatus = (string) $request->externalBookingStatus;

                if ($externalBookingStatus === 'NONE') {
                    $query->whereNull('external_booking_status');
                } else {
                    $query->where('external_booking_status', $externalBookingStatus);
                }
            }

            if ($request->filled('partnerId')) {
                $query->where('partner_id', $request->partnerId);
            }

            if ($request->filled('clientId')) {
                $query->where('client_id', $request->clientId);
            }

            if ($request->filled('q')) {
                $term = trim((string) $request->q);
                $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

                $query->where(function ($builder) use ($term, $operator) {
                    if (config('database.default') === 'pgsql') {
                        $builder->whereRaw('id::text ilike ?', ["%{$term}%"]);
                    } else {
                        $builder->where('id', $operator, "%{$term}%");
                    }

                    $builder
                        ->orWhere('external_booking_reference', $operator, "%{$term}%")
                        ->orWhere('external_error_message', $operator, "%{$term}%")
                        ->orWhereHas('service', function ($serviceQuery) use ($term, $operator) {
                            $serviceQuery->where('title', $operator, "%{$term}%");
                        })
                        ->orWhereHas('client', function ($clientQuery) use ($term, $operator) {
                            $clientQuery
                                ->where('name', $operator, "%{$term}%")
                                ->orWhere('email', $operator, "%{$term}%");
                        })
                        ->orWhereHas('partner', function ($partnerQuery) use ($term, $operator) {
                            $partnerQuery
                                ->where('name', $operator, "%{$term}%")
                                ->orWhere('email', $operator, "%{$term}%")
                                ->orWhere('company_name', $operator, "%{$term}%");
                        });
                });
            }

            return response()->json($query->paginate(50));
        } catch (QueryException) {
            return response()->json(new LengthAwarePaginator([], 0, 50, 1));
        }
    }

    /** GET /api/admin/finance/summary */
    public function adminFinanceSummary(Request $request): JsonResponse
    {
        $bookings = $this->financeBookingsQuery($request)->get();
        $snapshots = $bookings->map(fn (Booking $booking): array => $this->financeSnapshot($booking));

        $partnerSummaries = $snapshots
            ->groupBy('partner_id')
            ->map(function (Collection $entries): array {
                $first = $entries->first();

                return [
                    'partner_id' => $first['partner_id'],
                    'partner_name' => $first['partner_name'],
                    'stripe_connected_account_id' => $first['stripe_connected_account_id'],
                    'legal_company_name' => $first['legal_company_name'],
                    'tax_country' => $first['tax_country'],
                    'vat_number' => $first['vat_number'],
                    'business_registration_number' => $first['business_registration_number'],
                    'billing_email' => $first['billing_email'],
                    'bookings_count' => $entries->count(),
                    'payout_pending_count' => $entries->where('payout_status', Booking::PAYOUT_STATUS_PENDING)->count(),
                    'payout_on_hold_count' => $entries->where('payout_status', Booking::PAYOUT_STATUS_ON_HOLD)->count(),
                    'payout_scheduled_count' => $entries->where('payout_status', Booking::PAYOUT_STATUS_SCHEDULED)->count(),
                    'payout_paid_count' => $entries->where('payout_status', Booking::PAYOUT_STATUS_PAID)->count(),
                    'payout_failed_count' => $entries->where('payout_status', Booking::PAYOUT_STATUS_FAILED)->count(),
                    'gross_volume' => round($entries->sum('gross_volume'), 2),
                    'commission_total' => round($entries->sum('commission_total'), 2),
                    'partner_net_total' => round($entries->sum('partner_net_total'), 2),
                    'online_collected_total' => round($entries->sum('online_collected_total'), 2),
                    'currency' => $first['currency'],
                ];
            })
            ->values();

        return response()->json([
            'generated_at' => now()->toISOString(),
            'filters' => $this->financeFilters($request),
            'totals' => [
                'bookings_count' => $snapshots->count(),
                'gross_volume' => round($snapshots->sum('gross_volume'), 2),
                'commission_total' => round($snapshots->sum('commission_total'), 2),
                'partner_net_total' => round($snapshots->sum('partner_net_total'), 2),
                'online_collected_total' => round($snapshots->sum('online_collected_total'), 2),
            ],
            'partners' => $partnerSummaries,
        ]);
    }

    /** GET /api/admin/finance/export */
    public function adminFinanceExport(Request $request): StreamedResponse
    {
        $filename = 'wandireo-finance-export-'.now()->format('Y-m-d-His').'.csv';
        $bookings = $this->financeBookingsQuery($request)->get();

        return response()->streamDownload(function () use ($bookings): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'booking_id',
                'created_at',
                'start_date',
                'partner_id',
                'partner_name',
                'legal_company_name',
                'tax_country',
                'vat_number',
                'business_registration_number',
                'billing_email',
                'client_id',
                'client_email',
                'service_id',
                'service_title',
                'gross_volume',
                'commission_total',
                'partner_net_total',
                'online_collected_total',
                'currency',
                'payment_mode',
                'payment_status',
                'payout_status',
                'payout_marked_at',
                'payout_notes',
                'external_booking_reference',
            ]);

            foreach ($bookings as $booking) {
                $snapshot = $this->financeSnapshot($booking);

                fputcsv($handle, [
                    $snapshot['booking_id'],
                    $snapshot['created_at'],
                    $snapshot['start_date'],
                    $snapshot['partner_id'],
                    $snapshot['partner_name'],
                    $snapshot['legal_company_name'],
                    $snapshot['tax_country'],
                    $snapshot['vat_number'],
                    $snapshot['business_registration_number'],
                    $snapshot['billing_email'],
                    $snapshot['client_id'],
                    $snapshot['client_email'],
                    $snapshot['service_id'],
                    $snapshot['service_title'],
                    $snapshot['gross_volume'],
                    $snapshot['commission_total'],
                    $snapshot['partner_net_total'],
                    $snapshot['online_collected_total'],
                    $snapshot['currency'],
                    $snapshot['payment_mode'],
                    $snapshot['payment_status'],
                    $snapshot['payout_status'],
                    $snapshot['payout_marked_at'],
                    $snapshot['payout_notes'],
                    $snapshot['external_booking_reference'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /** PATCH /api/admin/finance/bookings/{id}/payout-status */
    public function adminUpdatePayoutStatus(Request $request, string $id): JsonResponse
    {
        $booking = Booking::query()->findOrFail($id);
        $data = $request->validate([
            'payout_status' => 'required|in:PENDING,ON_HOLD,SCHEDULED,PAID,FAILED',
            'payout_notes' => 'sometimes|nullable|string|max:2000',
        ]);

        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return response()->json([
                'message' => 'Only confirmed bookings can be included in payout operations.',
            ], 422);
        }

        if ($booking->payment_status === Booking::PAYMENT_STATUS_REFUNDED) {
            return response()->json([
                'message' => 'Refunded bookings cannot be included in payout operations.',
            ], 422);
        }

        $previous = [
            'payout_status' => $booking->payout_status,
            'payout_notes' => $booking->payout_notes,
        ];

        $booking->forceFill([
            'payout_status' => $data['payout_status'],
            'payout_marked_at' => now(),
            'payout_marked_by' => $request->user()->id,
            'payout_notes' => $data['payout_notes'] ?? null,
        ])->save();

        $this->auditLogger->record(
            $request,
            'finance',
            'PAYOUT_STATUS_UPDATED',
            $booking,
            'Admin updated booking payout status.',
            [
                'from' => $previous,
                'to' => [
                    'payout_status' => $booking->payout_status,
                    'payout_notes' => $booking->payout_notes,
                ],
            ],
        );

        return response()->json($booking->fresh(['service', 'client', 'partner']));
    }

    /** PATCH /api/bookings/{id}/status */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $booking = Booking::with('service')->findOrFail($id);

        if ($request->user()->role === 'PARTNER' && $booking->partner_id !== $request->user()->id) {
            throw new HttpResponseException(
                response()->json(['message' => 'You can only update bookings for your own services.'], 403)
            );
        }

        $data = $request->validate(['status' => 'required|in:PENDING,CONFIRMED,CANCELLED']);

        if (
            $data['status'] === Booking::STATUS_CONFIRMED
            && $booking->service?->source_type === 'EXTERNAL'
        ) {
            return response()->json([
                'message' => 'External bookings cannot be confirmed manually.',
            ], 422);
        }

        $update = ['status' => $data['status']];
        if ($data['status'] === 'CANCELLED' && $request->reason) {
            $update['cancellation_reason'] = $request->reason;
        }

        $booking->update($update);

        return response()->json($booking);
    }

    private function financeBookingsQuery(Request $request)
    {
        $data = $request->validate([
            'partnerId' => 'sometimes|string',
            'currency' => 'sometimes|string|size:3',
            'dateFrom' => 'sometimes|date',
            'dateTo' => 'sometimes|date',
            'payoutStatus' => 'sometimes|in:PENDING,ON_HOLD,SCHEDULED,PAID,FAILED',
        ]);

        $query = Booking::query()
            ->with(['service', 'client', 'partner'])
            ->where('status', Booking::STATUS_CONFIRMED)
            ->where('payment_status', '!=', Booking::PAYMENT_STATUS_REFUNDED)
            ->latest();

        if (! empty($data['partnerId'])) {
            $query->where('partner_id', $data['partnerId']);
        }

        if (! empty($data['currency'])) {
            $query->where('currency', strtoupper((string) $data['currency']));
        }

        if (! empty($data['dateFrom'])) {
            $query->whereDate('created_at', '>=', Carbon::parse($data['dateFrom'])->toDateString());
        }

        if (! empty($data['dateTo'])) {
            $query->whereDate('created_at', '<=', Carbon::parse($data['dateTo'])->toDateString());
        }

        if (! empty($data['payoutStatus'])) {
            $query->where('payout_status', $data['payoutStatus']);
        }

        return $query;
    }

    private function financeFilters(Request $request): array
    {
        return [
            'partner_id' => $request->string('partnerId')->toString() ?: null,
            'currency' => $request->string('currency')->toString() ?: null,
            'date_from' => $request->string('dateFrom')->toString() ?: null,
            'date_to' => $request->string('dateTo')->toString() ?: null,
            'payout_status' => $request->string('payoutStatus')->toString() ?: null,
        ];
    }

    private function financeSnapshot(Booking $booking): array
    {
        $commission = $this->resolveBookingCommission($booking);
        $grossVolume = round((float) $booking->total_price, 2);
        $partner = $booking->partner;
        $service = $booking->service;
        $client = $booking->client;

        return [
            'booking_id' => (string) $booking->id,
            'created_at' => $booking->created_at?->toISOString(),
            'start_date' => $booking->start_date?->toDateString(),
            'partner_id' => (string) $booking->partner_id,
            'partner_name' => $partner?->company_name ?: ($partner?->name ?: (string) $booking->partner_id),
            'stripe_connected_account_id' => $partner?->stripe_connected_account_id,
            'legal_company_name' => $partner?->legal_company_name,
            'tax_country' => $partner?->tax_country,
            'vat_number' => $partner?->vat_number,
            'business_registration_number' => $partner?->business_registration_number,
            'billing_email' => $partner?->billing_email,
            'client_id' => (string) $booking->client_id,
            'client_email' => $client?->email,
            'service_id' => (string) $booking->service_id,
            'service_title' => $this->resolveServiceTitle($service),
            'gross_volume' => $grossVolume,
            'commission_total' => $commission,
            'partner_net_total' => round($grossVolume - $commission, 2),
            'online_collected_total' => round((float) $booking->amount_paid_online, 2),
            'currency' => $booking->currency,
            'payment_mode' => $booking->payment_mode,
            'payment_status' => $booking->payment_status,
            'payout_status' => $booking->payout_status ?? Booking::PAYOUT_STATUS_PENDING,
            'payout_marked_at' => $booking->payout_marked_at?->toISOString(),
            'payout_notes' => $booking->payout_notes,
            'external_booking_reference' => $booking->external_booking_reference,
        ];
    }

    private function resolveBookingCommission(Booking $booking): float
    {
        $snapshotCommission = data_get($booking->extra_data, 'pricing.commission_total');

        if (is_numeric($snapshotCommission)) {
            return round((float) $snapshotCommission, 2);
        }

        $rate = (float) ($booking->service?->commission_rate ?? $booking->partner?->commission_rate ?? 0);

        if ($rate <= 0) {
            return 0.0;
        }

        return round(((float) $booking->total_price * $rate) / (1 + $rate), 2);
    }

    private function sumPayoutStatus(Collection $snapshots, string $status): float
    {
        return round(
            $snapshots
                ->where('payout_status', $status)
                ->sum('partner_net_total'),
            2,
        );
    }

    private function resolveServiceTitle(?Service $service): ?string
    {
        if (! $service) {
            return null;
        }

        $title = $service->getTranslations('title');

        return $title['fr']
            ?? $title['en']
            ?? collect($title)->filter()->first()
            ?? (string) $service->id;
    }

    /**
     * Normalise les extras reservez depuis la structure de la categorie du service.
     *
     * @param  array<int, array{id:string, quantity?:int}>  $selectedExtras
     * @return array<int, array{id:string, name:string, unit_price:float, quantity:int, total_price:float, input_type:string}>
     */
    private function normalizeSelectedExtras(Service $service, array $selectedExtras): array
    {
        $service->loadMissing('serviceCategory.extras');

        /** @var Collection<int, ServiceExtra> $availableExtras */
        $availableExtras = $service->serviceCategory?->extras
            ? $service->serviceCategory->extras
                ->where('is_active', true)
                ->values()
            : collect();

        if ($availableExtras->isEmpty()) {
            if ($selectedExtras !== []) {
                throw new HttpResponseException(
                    response()->json([
                        'message' => 'Ce service ne permet pas de reserver des extras.',
                        'errors' => [
                            'selectedExtras' => ['Aucun extra actif n est configure pour ce service.'],
                        ],
                    ], 422)
                );
            }

            return [];
        }

        $selectedById = collect($selectedExtras)->keyBy(
            fn (array $extra): string => (string) ($extra['id'] ?? '')
        );

        $unknownExtras = $selectedById
            ->keys()
            ->filter(fn (string $id): bool => ! $availableExtras->contains('id', $id))
            ->values();

        if ($unknownExtras->isNotEmpty()) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Des extras invalides ont ete soumis.',
                    'errors' => [
                        'selectedExtras' => [
                            'Au moins un extra ne correspond pas a la categorie de ce service.',
                        ],
                    ],
                ], 422)
            );
        }

        $missingRequired = $availableExtras
            ->filter(fn (ServiceExtra $extra): bool => $extra->is_required)
            ->filter(fn (ServiceExtra $extra): bool => ! $selectedById->has((string) $extra->id))
            ->pluck('name')
            ->values();

        if ($missingRequired->isNotEmpty()) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Des extras obligatoires sont manquants.',
                    'errors' => [
                        'selectedExtras' => $missingRequired
                            ->map(fn (string $name): string => sprintf('Extra obligatoire manquant: %s.', $name))
                            ->all(),
                    ],
                ], 422)
            );
        }

        return $availableExtras
            ->filter(
                fn (ServiceExtra $extra): bool => $extra->is_required || $selectedById->has((string) $extra->id)
            )
            ->map(function (ServiceExtra $extra) use ($selectedById): array {
                $submitted = (array) ($selectedById->get((string) $extra->id) ?? []);
                $quantity = max(1, (int) ($submitted['quantity'] ?? 1));
                $unitPrice = (float) $extra->default_price;

                return [
                    'id' => (string) $extra->id,
                    'name' => $extra->name,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'total_price' => round($unitPrice * $quantity, 2),
                    'input_type' => $extra->input_type,
                ];
            })
            ->values()
            ->all();
    }

    private function guardUnavailableFareHarborOnlinePricing(Service $service, string $paymentMode): void
    {
        $isOnlineMode = in_array($paymentMode, [
            'FULL_ONLINE',
            'CONNECTED_ACCOUNT',
            'EXTERNAL_REDIRECT',
        ], true);

        if (! $isOnlineMode) {
            return;
        }

        if (
            $service->source_type !== 'EXTERNAL'
            || strtoupper((string) $service->source_provider) !== 'FAREHARBOR'
        ) {
            return;
        }

        $priceStatus = strtoupper((string) data_get($service->extra_data, 'fareharbor.priceStatus', ''));

        if ($priceStatus !== 'DEPOSIT_ONLY') {
            return;
        }

        throw new HttpResponseException(
            response()->json([
                'message' => 'Le tarif final de cette activite n est pas encore disponible pour une reservation en ligne.',
                'errors' => [
                    'paymentMode' => [
                        'Le tarif final de cette activite n est pas encore disponible pour une reservation en ligne.',
                    ],
                ],
            ], 422)
        );
    }

    private function resolveBookingPartnerId(Service $service, Request $request): int
    {
        if ($service->partner_id !== null) {
            return (int) $service->partner_id;
        }

        $companySlug = (string) data_get($service->extra_data, 'fareharbor.company', '');

        if ($companySlug !== '') {
            $companyPartnerId = FareHarborCompany::query()
                ->where('company_slug', $companySlug)
                ->value('partner_id');

            if ($companyPartnerId !== null) {
                return (int) $companyPartnerId;
            }
        }

        return (int) $request->user()->id;
    }
}
