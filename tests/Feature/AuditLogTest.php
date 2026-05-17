<?php

namespace Tests\Feature;

use App\Models\AuditLogEntry;
use App\Models\PartnerDocument;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_document_review_writes_audit_log_entry(): void
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

        Sanctum::actingAs($admin);

        $this->patchJson("/api/partner-documents/{$document->id}", [
            'status' => PartnerDocument::STATUS_VALIDATED,
        ])->assertOk();

        $this->assertDatabaseHas('audit_log_entries', [
            'actor_id' => $admin->id,
            'category' => 'partner_document',
            'action' => PartnerDocument::STATUS_VALIDATED,
            'subject_type' => PartnerDocument::class,
            'subject_id' => $document->id,
        ]);
    }

    public function test_admin_partner_status_update_writes_audit_log_entry(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'PENDING',
            'mandate_contract_status' => 'NOT_SENT',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/users/{$partner->id}", [
            'partner_status' => 'APPROVED',
            'mandate_contract_status' => 'SIGNED',
        ])->assertOk();

        $entry = AuditLogEntry::firstOrFail();

        $this->assertSame($admin->id, $entry->actor_id);
        $this->assertSame('partner_governance', $entry->category);
        $this->assertSame('USER_UPDATED', $entry->action);
        $this->assertSame(User::class, $entry->subject_type);
        $this->assertSame($partner->id, $entry->subject_id);
        $this->assertSame('PENDING', $entry->metadata['changes']['partner_status']['from']);
        $this->assertSame('APPROVED', $entry->metadata['changes']['partner_status']['to']);
    }

    public function test_service_moderation_action_writes_audit_log_entry(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/approve", [
            'reason' => 'Compliant.',
        ])->assertOk();

        $this->assertDatabaseHas('audit_log_entries', [
            'actor_id' => $admin->id,
            'category' => 'service_moderation',
            'action' => 'APPROVED',
            'subject_type' => Service::class,
            'subject_id' => $service->id,
        ]);
    }

    public function test_admin_can_read_audit_log_and_partner_cannot(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $partner = User::factory()->create([
            'role' => 'PARTNER',
            'partner_status' => 'APPROVED',
        ]);

        AuditLogEntry::create([
            'actor_id' => $admin->id,
            'category' => 'partner_governance',
            'action' => 'USER_UPDATED',
            'subject_type' => User::class,
            'subject_id' => $partner->id,
            'summary' => 'Admin updated sensitive user governance fields.',
            'metadata' => [
                'changes' => [
                    'partner_status' => [
                        'from' => 'PENDING',
                        'to' => 'APPROVED',
                    ],
                ],
            ],
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/audit-log?category=partner_governance')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.actorId', $admin->id)
            ->assertJsonPath('data.0.category', 'partner_governance')
            ->assertJsonPath('data.0.action', 'USER_UPDATED');

        Sanctum::actingAs($partner);

        $this->getJson('/api/admin/audit-log')
            ->assertForbidden();
    }
}
