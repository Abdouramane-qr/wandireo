<?php

namespace App\Models;

use App\Support\AdminPermission;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'partner_status',
        'partner_validated_at',
        'partner_validated_by',
        'partner_rejection_reason',
        'mandate_contract_status',
        'mandate_contract_file_path',
        'mandate_contract_text',
        'mandate_contract_text_updated_at',
        'mandate_signed_at',
        'onboarding_completed_at',
        'phone_number',
        'language',
        'profile_picture',
        'preferred_currency',
        'company_name',
        'stripe_connected_account_id',
        'business_address',
        'legal_company_name',
        'tax_country',
        'vat_number',
        'business_registration_number',
        'billing_email',
        'commission_rate',
        'total_sales',
        'permissions',
        'managed_languages',
        'managed_locations',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'partner_validated_at' => 'datetime',
            'mandate_contract_text_updated_at' => 'datetime',
            'mandate_signed_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'commission_rate' => 'decimal:4',
            'total_sales' => 'decimal:2',
            'permissions' => 'array',
            'managed_languages' => 'array',
            'managed_locations' => 'array',
        ];
    }

    // ── Rôles ─────────────────────────────────────────────────────────────────

    public function isClient(): bool
    {
        return $this->role === 'CLIENT';
    }

    public function isPartner(): bool
    {
        return $this->role === 'PARTNER';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    public function canPerform(string $permission): bool
    {
        if (! $this->isAdmin()) {
            return false;
        }

        $permissions = $this->permissions;

        if (! is_array($permissions) || $permissions === []) {
            return true;
        }

        return in_array(AdminPermission::ALL, $permissions, true)
            || in_array(AdminPermission::LEGACY_ALL, $permissions, true)
            || in_array($permission, $permissions, true);
    }

    public function isApprovedPartner(): bool
    {
        return $this->isPartner() && $this->partner_status === 'APPROVED';
    }

    public function hasSignedMandateContract(): bool
    {
        return $this->isPartner() && $this->mandate_contract_status === 'SIGNED';
    }

    public function hasCompletedPartnerOnboarding(): bool
    {
        return $this->isApprovedPartner() && $this->hasSignedMandateContract();
    }

    // ── Relations ─────────────────────────────────────────────────────────────

    /** Services proposés par ce partenaire. */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'partner_id');
    }

    /** Réservations passées en tant que client. */
    public function bookingsAsClient(): HasMany
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    /** Réservations reçues en tant que partenaire. */
    public function bookingsAsPartner(): HasMany
    {
        return $this->hasMany(Booking::class, 'partner_id');
    }

    /** Avis laissés par ce client. */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    /** Favoris de ce client. */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class, 'client_id');
    }

    /** Paiements Stripe inities par cet utilisateur. */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /** Articles de blog rédigés par cet admin ou partenaire. */
    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }

    public function partnerDocuments(): HasMany
    {
        return $this->hasMany(PartnerDocument::class, 'partner_id');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(self::class, 'partner_validated_by');
    }
}
