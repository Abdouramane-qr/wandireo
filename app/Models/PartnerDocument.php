<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerDocument extends Model
{
    use HasFactory;

    public const TYPE_BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION';

    public const TYPE_TAX_CERTIFICATE = 'TAX_CERTIFICATE';

    public const TYPE_INSURANCE = 'INSURANCE';

    public const TYPE_IDENTITY = 'IDENTITY';

    public const TYPE_OTHER = 'OTHER';

    public const STATUS_UPLOADED = 'UPLOADED';

    public const STATUS_UNDER_REVIEW = 'UNDER_REVIEW';

    public const STATUS_VALIDATED = 'VALIDATED';

    public const STATUS_REJECTED = 'REJECTED';

    public const STATUS_EXPIRED = 'EXPIRED';

    protected $fillable = [
        'partner_id',
        'uploaded_by',
        'reviewed_by',
        'document_type',
        'status',
        'file_path',
        'original_name',
        'mime_type',
        'size_bytes',
        'rejection_reason',
        'reviewed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'expires_at' => 'date',
            'size_bytes' => 'integer',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
