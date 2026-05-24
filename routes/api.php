<?php

use App\Http\Controllers\Api\AdminServiceStructureController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\FareHarborCompanyController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\HomeCatalogPreviewController;
use App\Http\Controllers\Api\PartnerDocumentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceCalendarSyncController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServicePricingRuleController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Support\AdminPermission;
use Illuminate\Support\Facades\Route;

// ============================================================
// Webhooks (public — verified by signature, excluded from CSRF)
// ============================================================

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->middleware('throttle:webhooks');
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->middleware('throttle:webhooks');

// ============================================================
// Authentification (public) — throttled more aggressively
// ============================================================

Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register-partner', [AuthController::class, 'registerPartner']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

// ============================================================
// Services (lecture publique)
// ============================================================

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/search', [ServiceController::class, 'search']);
Route::get('/home/catalog-preview', HomeCatalogPreviewController::class);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::get('/services/{id}/calendar.ics', [ServiceCalendarSyncController::class, 'export']);

// ============================================================
// Blog (lecture publique)
// ============================================================

Route::get('/blog/posts', [BlogController::class, 'index']);
Route::get('/blog/posts/{slug}', [BlogController::class, 'show']);

// ============================================================
// Reviews + Availability (lecture publique)
// ============================================================

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/availability', [AvailabilityController::class, 'index']);
Route::get('/service-structure', [AdminServiceStructureController::class, 'index']);
Route::post('/analytics/events', [AnalyticsController::class, 'store'])
    ->middleware('throttle:60,1');

// ============================================================
// Routes protegees (token Sanctum requis)
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ────────────────────────────────────────────────────────────────
    Route::get('/users/me', [AuthController::class, 'me']);
    Route::delete('/auth/logout', [AuthController::class, 'logout']);

    // ── Profil utilisateur ─────────────────────────────────────────────────
    Route::patch('/users/me', [UserController::class, 'updateMe']);
    Route::post('/partner/contract/sign', [UserController::class, 'partnerSignContract'])
        ->middleware('role:PARTNER');
    Route::get('/partner/documents', [PartnerDocumentController::class, 'partnerIndex'])
        ->middleware('role:PARTNER');
    Route::post('/partner/documents', [PartnerDocumentController::class, 'partnerStore'])
        ->middleware('role:PARTNER');
    Route::get('/partner/finance/summary', [BookingController::class, 'partnerFinanceSummary'])
        ->middleware('role:PARTNER');

    // ── Reservations (client) ─────────────────────────────────────────────
    Route::post('/bookings/init', [BookingController::class, 'init']);
    Route::post('/bookings/confirm', [BookingController::class, 'confirm']);
    Route::get('/bookings/mine', [BookingController::class, 'mine']);
    Route::post('/checkout', [PaymentController::class, 'checkout']);
    Route::get('/payments/session/{sessionId}', [PaymentController::class, 'showBySession']);

    // ── Avis ──────────────────────────────────────────────────────────────
    Route::post('/reviews', [ReviewController::class, 'store']);

    // ── Favoris ───────────────────────────────────────────────────────────
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{serviceId}', [FavoriteController::class, 'destroy']);

    // ── Disponibilites + Services (ecriture partenaire/admin) ────────────
    Route::middleware('role:PARTNER,ADMIN')->group(function () {
        Route::post('/availability', [AvailabilityController::class, 'store']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::patch('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
        Route::post('/services/{id}/submit-review', [ServiceController::class, 'submitReview']);
        Route::get('/services/{id}/calendar-sync', [ServiceCalendarSyncController::class, 'show']);
        Route::put('/services/{id}/calendar-sync', [ServiceCalendarSyncController::class, 'upsert']);
        Route::post('/services/{id}/calendar-sync/sync', [ServiceCalendarSyncController::class, 'sync']);
        Route::get('/services/{id}/pricing-rules', [ServicePricingRuleController::class, 'index']);
        Route::post('/services/{id}/pricing-rules', [ServicePricingRuleController::class, 'store']);
        Route::patch('/services/{id}/pricing-rules/{ruleId}', [ServicePricingRuleController::class, 'update']);
        Route::delete('/services/{id}/pricing-rules/{ruleId}', [ServicePricingRuleController::class, 'destroy']);
        Route::patch('/services/{id}/toggle-availability', [ServiceController::class, 'toggleAvailability']);
        Route::get('/bookings/partner-incoming', [BookingController::class, 'partnerIncoming']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });

    // ── Blog + Admin (ecriture admin uniquement) ──────────────────────────
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/support/tickets', [SupportController::class, 'index']);
        Route::post('/support/tickets', [SupportController::class, 'store'])->middleware('permission:'.AdminPermission::SUPPORT_MANAGE);
        Route::patch('/support/tickets/{id}', [SupportController::class, 'update'])->middleware('permission:'.AdminPermission::SUPPORT_MANAGE);
        Route::delete('/support/tickets/{id}', [SupportController::class, 'destroy'])->middleware('permission:'.AdminPermission::SUPPORT_MANAGE);
        Route::get('/blog/posts/by-id/{id}', [BlogController::class, 'showById']);
        Route::post('/blog/posts', [BlogController::class, 'store'])->middleware('permission:'.AdminPermission::CONTENT_MANAGE);
        Route::patch('/blog/posts/{id}', [BlogController::class, 'update'])->middleware('permission:'.AdminPermission::CONTENT_MANAGE);
        Route::delete('/blog/posts/{id}', [BlogController::class, 'destroy'])->middleware('permission:'.AdminPermission::CONTENT_MANAGE);
        Route::post('/service-structure/categories', [AdminServiceStructureController::class, 'storeCategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::patch('/service-structure/categories/{id}', [AdminServiceStructureController::class, 'updateCategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::delete('/service-structure/categories/{id}', [AdminServiceStructureController::class, 'destroyCategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::post('/service-structure/subcategories', [AdminServiceStructureController::class, 'storeSubcategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::patch('/service-structure/subcategories/{id}', [AdminServiceStructureController::class, 'updateSubcategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::delete('/service-structure/subcategories/{id}', [AdminServiceStructureController::class, 'destroySubcategory'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::post('/service-structure/attributes', [AdminServiceStructureController::class, 'storeAttribute'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::patch('/service-structure/attributes/{id}', [AdminServiceStructureController::class, 'updateAttribute'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::delete('/service-structure/attributes/{id}', [AdminServiceStructureController::class, 'destroyAttribute'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::post('/service-structure/extras', [AdminServiceStructureController::class, 'storeExtra'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::patch('/service-structure/extras/{id}', [AdminServiceStructureController::class, 'updateExtra'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::delete('/service-structure/extras/{id}', [AdminServiceStructureController::class, 'destroyExtra'])->middleware('permission:'.AdminPermission::SERVICE_STRUCTURE_MANAGE);
        Route::get('/admin/audit-log', [AuditLogController::class, 'index'])->middleware('permission:'.AdminPermission::AUDIT_LOG_VIEW);
        Route::get('/admin/services/moderation', [ServiceController::class, 'moderationQueue'])->middleware('permission:'.AdminPermission::SERVICE_MODERATION_MANAGE);
        Route::post('/services/{id}/approve', [ServiceController::class, 'approve'])->middleware('permission:'.AdminPermission::SERVICE_MODERATION_MANAGE);
        Route::post('/services/{id}/publish', [ServiceController::class, 'publish'])->middleware('permission:'.AdminPermission::SERVICE_MODERATION_MANAGE);
        Route::post('/services/{id}/reject', [ServiceController::class, 'reject'])->middleware('permission:'.AdminPermission::SERVICE_MODERATION_MANAGE);
        Route::post('/services/{id}/suspend', [ServiceController::class, 'suspend'])->middleware('permission:'.AdminPermission::SERVICE_MODERATION_MANAGE);
        Route::get('/partner-documents', [PartnerDocumentController::class, 'adminIndex'])->middleware('permission:'.AdminPermission::PARTNER_DOCUMENT_REVIEW);
        Route::patch('/partner-documents/{id}', [PartnerDocumentController::class, 'adminUpdate'])->middleware('permission:'.AdminPermission::PARTNER_DOCUMENT_REVIEW);
        Route::get('/users/contract-template', [UserController::class, 'adminContractTemplate'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::patch('/users/contract-template', [UserController::class, 'adminUpdateContractTemplate'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::get('/users', [UserController::class, 'adminIndex']);
        Route::post('/users', [UserController::class, 'adminCreate'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::post('/users/partners', [UserController::class, 'adminCreatePartner'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::post('/users/{id}/contract', [UserController::class, 'adminUploadContract'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::post('/users/{id}/contract/mark-signed', [UserController::class, 'adminMarkContractSigned'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::post('/users/{id}/password', [UserController::class, 'adminResetPassword'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::patch('/users/{id}', [UserController::class, 'adminUpdate'])->middleware('permission:'.AdminPermission::PARTNER_GOVERNANCE_MANAGE);
        Route::get('/bookings', [BookingController::class, 'adminList'])->middleware('permission:'.AdminPermission::BOOKINGS_VIEW);
        Route::get('/admin/finance/summary', [BookingController::class, 'adminFinanceSummary'])->middleware('permission:'.AdminPermission::FINANCE_VIEW);
        Route::get('/admin/finance/export', [BookingController::class, 'adminFinanceExport'])->middleware('permission:'.AdminPermission::FINANCE_VIEW);
        Route::patch('/admin/finance/bookings/{id}/payout-status', [BookingController::class, 'adminUpdatePayoutStatus'])->middleware('permission:'.AdminPermission::FINANCE_VIEW);
        Route::get('/analytics/funnel', [AnalyticsController::class, 'funnel'])->middleware('permission:'.AdminPermission::ANALYTICS_VIEW);
        Route::get('/admin-reviews', [ReviewController::class, 'adminList']);
        Route::patch('/admin-reviews/{id}', [ReviewController::class, 'adminUpdate'])->middleware('permission:'.AdminPermission::REVIEWS_MANAGE);
        Route::delete('/admin-reviews/{id}', [ReviewController::class, 'adminDestroy'])->middleware('permission:'.AdminPermission::REVIEWS_MANAGE);
        Route::get('/fareharbor/companies', [FareHarborCompanyController::class, 'index'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
        Route::post('/fareharbor/companies', [FareHarborCompanyController::class, 'store'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
        Route::patch('/fareharbor/companies/{id}', [FareHarborCompanyController::class, 'update'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
        Route::post('/fareharbor/companies/{id}/partner-account', [FareHarborCompanyController::class, 'createPartnerAccount'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
        Route::post('/fareharbor/companies/{id}/sync', [FareHarborCompanyController::class, 'sync'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
        Route::post('/fareharbor/companies/sync-all', [FareHarborCompanyController::class, 'syncAll'])->middleware('permission:'.AdminPermission::FAREHARBOR_MANAGE);
    });

    // ── Upload (S3 pre-signe) — tout utilisateur authentifie ─────────────
    Route::post('/uploads/presign', [UploadController::class, 'presign'])
        ->middleware('throttle:uploads');
    Route::post('/uploads/direct', [UploadController::class, 'directUpload'])
        ->name('uploads.direct')
        ->middleware('throttle:uploads');
});
