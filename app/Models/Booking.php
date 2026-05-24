<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public const STATUS_AWAITING_PAYMENT = 'AWAITING_PAYMENT';

    public const STATUS_PENDING = 'PENDING';

    public const STATUS_CONFIRMED = 'CONFIRMED';

    public const STATUS_CANCELLED = 'CANCELLED';

    public const PAYMENT_STATUS_PENDING = 'PENDING';

    public const PAYMENT_STATUS_PAID = 'PAID';

    public const PAYMENT_STATUS_REFUNDED = 'REFUNDED';

    public const PAYOUT_STATUS_PENDING = 'PENDING';

    public const PAYOUT_STATUS_ON_HOLD = 'ON_HOLD';

    public const PAYOUT_STATUS_SCHEDULED = 'SCHEDULED';

    public const PAYOUT_STATUS_PAID = 'PAID';

    public const PAYOUT_STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'client_id', 'partner_id', 'service_id',
        'status', 'payment_status',
        'payout_status', 'payout_marked_at', 'payout_marked_by', 'payout_notes',
        'start_date', 'end_date', 'participants',
        'unit_price', 'total_price', 'currency',
        'payment_mode', 'amount_paid_online',
        'extra_data',
        'stripe_payment_intent_id',
        'external_booking_reference',
        'external_booking_status',
        'external_booking_payload',
        'external_error_message',
        'notes', 'cancellation_reason',
        'created_at', 'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'payout_marked_at' => 'datetime',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'amount_paid_online' => 'decimal:2',
            'extra_data' => 'array',
            'external_booking_payload' => 'array',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────────

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function payoutMarkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payout_marked_by');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'CONFIRMED');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'CANCELLED');
    }

    public function scopeAwaitingPayment($query)
    {
        return $query->where('status', self::STATUS_AWAITING_PAYMENT);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }
}
