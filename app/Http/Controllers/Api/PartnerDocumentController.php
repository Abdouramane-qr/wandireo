<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartnerDocument;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PartnerDocumentController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /** GET /api/partner/documents */
    public function partnerIndex(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()
                ->partnerDocuments()
                ->latest()
                ->get()
                ->map(fn (PartnerDocument $document): array => $this->formatDocument($document))
                ->values(),
        ]);
    }

    /** POST /api/partner/documents */
    public function partnerStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'document_type' => ['required', Rule::in($this->documentTypes())],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        /** @var User $partner */
        $partner = $request->user();
        $file = $data['document'];
        $storedPath = $file->store("partner-documents/{$partner->id}", 'public');

        $document = PartnerDocument::create([
            'partner_id' => $partner->id,
            'uploaded_by' => $partner->id,
            'document_type' => $data['document_type'],
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => Storage::disk('public')->url($storedPath),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        $this->auditLogger->record(
            $request,
            'partner_document',
            'UPLOADED',
            $document,
            'Partner uploaded compliance document.',
            [
                'partner_id' => $partner->id,
                'document_type' => $document->document_type,
                'status' => $document->status,
            ],
        );

        return response()->json($this->formatDocument($document->fresh()), 201);
    }

    /** GET /api/partner-documents */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = PartnerDocument::with(['partner', 'uploadedBy', 'reviewedBy'])->latest();

        if ($request->filled('partnerId')) {
            $query->where('partner_id', $request->integer('partnerId'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        return response()->json(
            $query
                ->paginate($request->integer('limit', 50))
                ->through(fn (PartnerDocument $document): array => $this->formatDocument($document))
        );
    }

    /** PATCH /api/partner-documents/{id} */
    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $document = PartnerDocument::findOrFail($id);
        $previousStatus = $document->status;

        $data = $request->validate([
            'status' => ['required', Rule::in([
                PartnerDocument::STATUS_UNDER_REVIEW,
                PartnerDocument::STATUS_VALIDATED,
                PartnerDocument::STATUS_REJECTED,
                PartnerDocument::STATUS_EXPIRED,
            ])],
            'rejection_reason' => [
                Rule::requiredIf(fn (): bool => $request->input('status') === PartnerDocument::STATUS_REJECTED),
                'nullable',
                'string',
                'max:5000',
            ],
            'expires_at' => ['nullable', 'date'],
        ]);

        $document->update([
            'status' => $data['status'],
            'rejection_reason' => $data['status'] === PartnerDocument::STATUS_REJECTED
                ? $data['rejection_reason']
                : null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'expires_at' => $data['expires_at'] ?? $document->expires_at,
        ]);

        $this->auditLogger->record(
            $request,
            'partner_document',
            $data['status'],
            $document,
            'Admin reviewed partner compliance document.',
            [
                'partner_id' => $document->partner_id,
                'document_type' => $document->document_type,
                'from_status' => $previousStatus,
                'to_status' => $data['status'],
                'rejection_reason' => $data['status'] === PartnerDocument::STATUS_REJECTED
                    ? $data['rejection_reason']
                    : null,
            ],
        );

        return response()->json($this->formatDocument($document->fresh(['partner', 'uploadedBy', 'reviewedBy'])));
    }

    /**
     * @return array<int, string>
     */
    private function documentTypes(): array
    {
        return [
            PartnerDocument::TYPE_BUSINESS_REGISTRATION,
            PartnerDocument::TYPE_TAX_CERTIFICATE,
            PartnerDocument::TYPE_INSURANCE,
            PartnerDocument::TYPE_IDENTITY,
            PartnerDocument::TYPE_OTHER,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatDocument(PartnerDocument $document): array
    {
        return [
            'id' => $document->id,
            'partnerId' => $document->partner_id,
            'partnerName' => $document->partner?->company_name
                ?? $document->partner?->name
                ?? $document->partner?->email,
            'uploadedBy' => $document->uploaded_by,
            'reviewedBy' => $document->reviewed_by,
            'documentType' => $document->document_type,
            'status' => $document->status,
            'filePath' => $document->file_path,
            'originalName' => $document->original_name,
            'mimeType' => $document->mime_type,
            'sizeBytes' => $document->size_bytes,
            'rejectionReason' => $document->rejection_reason,
            'reviewedAt' => $document->reviewed_at,
            'expiresAt' => $document->expires_at,
            'createdAt' => $document->created_at,
            'updatedAt' => $document->updated_at,
        ];
    }
}
