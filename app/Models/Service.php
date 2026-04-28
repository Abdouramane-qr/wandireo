<?php

namespace App\Models;

use App\Models\Concerns\SerializesTranslatableAttributes;
use App\Support\ServiceExtraDataLocalizer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Service extends Model
{
    use HasFactory, HasTranslations, HasUuids, SerializesTranslatableAttributes, SoftDeletes;

    public array $translatable = [
        'title',
        'description',
    ];

    protected $appends = [
        'is_external_redirect',
    ];

    protected $fillable = [
        'partner_id', 'title', 'description', 'category',
        'service_category_id', 'service_subcategory_id',
        'location_city', 'location_country', 'location_region',
        'location_address_line', 'location_latitude', 'location_longitude',
        'images', 'pricing_unit', 'partner_price', 'commission_rate',
        'currency', 'payment_mode', 'booking_mode', 'featured', 'video_url',
        'rating', 'review_count',
        'source_type', 'source_provider', 'source_external_id', 'last_synced_at',
        'is_available', 'tags', 'extra_data',
    ];

    protected function casts(): array
    {
        return [
            'images'          => 'array',
            'tags'            => 'array',
            'extra_data'      => 'array',
            'title'           => 'array',
            'description'     => 'array',
            'partner_price'   => 'decimal:2',
            'commission_rate' => 'decimal:4',
            'commission_amount' => 'decimal:2',
            'client_price'    => 'decimal:2',
            'rating'          => 'decimal:2',
            'is_available'    => 'boolean',
            'featured'        => 'boolean',
            'last_synced_at'  => 'datetime',
            'location_latitude'  => 'decimal:7',
            'location_longitude' => 'decimal:7',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────────

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function serviceSubcategory(): BelongsTo
    {
        return $this->belongsTo(ServiceSubcategory::class, 'service_subcategory_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function availabilitySlots(): HasMany
    {
        return $this->hasMany(AvailabilitySlot::class);
    }

    public function pricingRules(): HasMany
    {
        return $this->hasMany(ServicePricingRule::class);
    }

    public function calendarSync(): HasOne
    {
        return $this->hasOne(ServiceCalendarSync::class);
    }

    // ── Accesseurs ────────────────────────────────────────────────────────────

    /** Localisation normalisée sous forme de tableau. */
    public function getLocationAttribute(): array
    {
        return [
            'city'        => $this->location_city,
            'country'     => $this->location_country,
            'region'      => $this->location_region,
            'addressLine' => $this->location_address_line,
            'coordinates' => $this->location_latitude
                ? ['latitude' => $this->location_latitude, 'longitude' => $this->location_longitude]
                : null,
        ];
    }

    public function getIsExternalRedirectAttribute(): bool
    {
        return $this->booking_mode === 'EXTERNAL_REDIRECT'
            || $this->payment_mode === 'EXTERNAL_REDIRECT';
    }

    // ── Méthodes ──────────────────────────────────────────────────────────────

    /**
     * Recalcule et sauvegarde rating + review_count après un nouvel avis.
     */
    public function recalculateRating(): void
    {
        $approvedReviews = $this->reviews()->where('status', 'APPROVED');
        $avg = $approvedReviews->avg('rating');
        $count = $approvedReviews->count();
        $this->update(['rating' => $avg, 'review_count' => $count]);
    }

    public function toArray(): array
    {
        $attributes = $this->serializeTranslatableAttributes(parent::toArray());

        if (is_array($attributes['extra_data'] ?? null)) {
            $attributes['extra_data'] = ServiceExtraDataLocalizer::localize($attributes['extra_data']);
        }

        return $attributes;
    }
}
