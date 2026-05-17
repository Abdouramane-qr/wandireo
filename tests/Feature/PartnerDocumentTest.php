<?php

namespace Tests\Feature;

use App\Models\PartnerDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PartnerDocumentTest extends TestCase
{
    use RefreshDatabase;

    public function test_partner_can_upload_a_compliance_document(): void
    {
        Storage::fake('public');

        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        $response = $this->actingAs($partner)->postJson('/api/partner/documents', [
            'document_type' => PartnerDocument::TYPE_INSURANCE,
            'document' => UploadedFile::fake()->create('insurance.pdf', 128, 'application/pdf'),
            'expires_at' => now()->addYear()->toDateString(),
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('partnerId', $partner->id)
            ->assertJsonPath('documentType', PartnerDocument::TYPE_INSURANCE)
            ->assertJsonPath('status', PartnerDocument::STATUS_UPLOADED);

        $document = PartnerDocument::firstOrFail();

        $this->assertSame($partner->id, $document->partner_id);
        $this->assertSame($partner->id, $document->uploaded_by);
        Storage::disk('public')->assertExists("partner-documents/{$partner->id}/".basename($document->file_path));
    }

    public function test_partner_document_listing_is_scoped_to_current_partner(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $otherPartner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        $ownDocument = PartnerDocument::create([
            'partner_id' => $partner->id,
            'uploaded_by' => $partner->id,
            'document_type' => PartnerDocument::TYPE_TAX_CERTIFICATE,
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => '/storage/partner-documents/own.pdf',
        ]);
        PartnerDocument::create([
            'partner_id' => $otherPartner->id,
            'uploaded_by' => $otherPartner->id,
            'document_type' => PartnerDocument::TYPE_INSURANCE,
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => '/storage/partner-documents/other.pdf',
        ]);

        $this->actingAs($partner)
            ->getJson('/api/partner/documents')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownDocument->id);
    }

    public function test_admin_can_list_and_validate_partner_documents(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $document = PartnerDocument::create([
            'partner_id' => $partner->id,
            'uploaded_by' => $partner->id,
            'document_type' => PartnerDocument::TYPE_BUSINESS_REGISTRATION,
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => '/storage/partner-documents/business.pdf',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/partner-documents')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $document->id)
            ->assertJsonPath('data.0.partnerId', $partner->id);

        $this->actingAs($admin)
            ->patchJson("/api/partner-documents/{$document->id}", [
                'status' => PartnerDocument::STATUS_VALIDATED,
            ])
            ->assertOk()
            ->assertJsonPath('status', PartnerDocument::STATUS_VALIDATED)
            ->assertJsonPath('reviewedBy', $admin->id);

        $document->refresh();

        $this->assertSame(PartnerDocument::STATUS_VALIDATED, $document->status);
        $this->assertSame($admin->id, $document->reviewed_by);
        $this->assertNotNull($document->reviewed_at);
    }

    public function test_admin_rejection_requires_a_reason(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $document = PartnerDocument::create([
            'partner_id' => $partner->id,
            'uploaded_by' => $partner->id,
            'document_type' => PartnerDocument::TYPE_INSURANCE,
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => '/storage/partner-documents/insurance.pdf',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/partner-documents/{$document->id}", [
                'status' => PartnerDocument::STATUS_REJECTED,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('rejection_reason');
    }

    public function test_partner_cannot_access_admin_document_review_endpoints(): void
    {
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);
        $document = PartnerDocument::create([
            'partner_id' => $partner->id,
            'uploaded_by' => $partner->id,
            'document_type' => PartnerDocument::TYPE_IDENTITY,
            'status' => PartnerDocument::STATUS_UPLOADED,
            'file_path' => '/storage/partner-documents/identity.pdf',
        ]);

        $this->actingAs($partner)
            ->getJson('/api/partner-documents')
            ->assertForbidden();

        $this->actingAs($partner)
            ->patchJson("/api/partner-documents/{$document->id}", [
                'status' => PartnerDocument::STATUS_VALIDATED,
            ])
            ->assertForbidden();
    }
}
