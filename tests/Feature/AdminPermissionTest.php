<?php

namespace Tests\Feature;

use App\Models\AuditLogEntry;
use App\Models\PartnerDocument;
use App\Models\Service;
use App\Models\User;
use App\Support\AdminPermission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_admin_without_permissions_keeps_full_access(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'permissions' => null,
        ]);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/approve")
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_APPROVED);
    }

    public function test_legacy_admin_with_wildcard_permission_keeps_full_access(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'permissions' => [AdminPermission::LEGACY_ALL],
        ]);
        $service = Service::factory()->create([
            'moderation_status' => Service::MODERATION_PENDING_REVIEW,
            'is_available' => false,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/services/{$service->id}/approve")
            ->assertOk()
            ->assertJsonPath('moderation_status', Service::MODERATION_APPROVED);
    }

    public function test_scoped_admin_needs_matching_permission_for_sensitive_action(): void
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'permissions' => [AdminPermission::AUDIT_LOG_VIEW],
        ]);
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
        ])->assertForbidden();

        AuditLogEntry::create([
            'actor_id' => $admin->id,
            'category' => 'partner_document',
            'action' => 'UPLOADED',
            'subject_type' => PartnerDocument::class,
            'subject_id' => $document->id,
        ]);

        $this->getJson('/api/admin/audit-log')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_be_granted_permissions_through_user_update(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'ADMIN',
            'permissions' => [AdminPermission::ALL],
        ]);
        $scopedAdmin = User::factory()->create([
            'role' => 'ADMIN',
            'permissions' => [AdminPermission::AUDIT_LOG_VIEW],
        ]);

        Sanctum::actingAs($superAdmin);

        $this->patchJson("/api/users/{$scopedAdmin->id}", [
            'permissions' => [
                AdminPermission::AUDIT_LOG_VIEW,
                AdminPermission::PARTNER_DOCUMENT_REVIEW,
            ],
        ])
            ->assertOk()
            ->assertJsonPath('permissions.1', AdminPermission::PARTNER_DOCUMENT_REVIEW);

        $this->assertDatabaseHas('users', [
            'id' => $scopedAdmin->id,
        ]);

        $this->assertSame(
            [
                AdminPermission::AUDIT_LOG_VIEW,
                AdminPermission::PARTNER_DOCUMENT_REVIEW,
            ],
            $scopedAdmin->fresh()->permissions,
        );
    }
}
