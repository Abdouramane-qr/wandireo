<?php

namespace App\Services\Audit;

use App\Models\AuditLogEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function record(
        Request $request,
        string $category,
        string $action,
        ?Model $subject = null,
        ?string $summary = null,
        array $metadata = [],
        ?User $actor = null,
    ): AuditLogEntry {
        $requestUser = $request->user();

        return AuditLogEntry::create([
            'actor_id' => $actor?->id ?? ($requestUser instanceof User ? $requestUser->id : null),
            'category' => $category,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'summary' => $summary,
            'metadata' => $metadata === [] ? null : $metadata,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
