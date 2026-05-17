<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLogEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /** GET /api/admin/audit-log */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLogEntry::with('actor')->latest();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category')->toString());
        }

        if ($request->filled('action')) {
            $query->where('action', $request->string('action')->toString());
        }

        if ($request->filled('actorId')) {
            $query->where('actor_id', $request->integer('actorId'));
        }

        if ($request->filled('subjectType')) {
            $query->where('subject_type', $request->string('subjectType')->toString());
        }

        if ($request->filled('subjectId')) {
            $query->where('subject_id', $request->integer('subjectId'));
        }

        return response()->json(
            $query
                ->paginate($request->integer('limit', 50))
                ->through(fn (AuditLogEntry $entry): array => $this->formatEntry($entry))
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function formatEntry(AuditLogEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'actorId' => $entry->actor_id,
            'actorName' => $entry->actor?->name,
            'category' => $entry->category,
            'action' => $entry->action,
            'subjectType' => $entry->subject_type,
            'subjectId' => $entry->subject_id,
            'summary' => $entry->summary,
            'metadata' => $entry->metadata ?? [],
            'ipAddress' => $entry->ip_address,
            'userAgent' => $entry->user_agent,
            'createdAt' => $entry->created_at,
        ];
    }
}
