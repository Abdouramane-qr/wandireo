<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminServiceStructureController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\ServiceCalendarSyncController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\FareHarborCompanyController;
use App\Http\Controllers\Api\ServicePricingRuleController;
use Illuminate\Support\Facades\Route;

// ============================================================
// Webhooks (public — verified by signature, excluded from CSRF)
// ============================================================

Route::post('/webhooks/stripe', [WebhookController::class, 'stripe'])
    ->middleware('throttle:webhooks');

// ============================================================
// Authentification (public) — throttled more aggressively
// ============================================================

Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/login',             [AuthController::class, 'login']);
    Route::post('/register',          [AuthController::class, 'register']);
    Route::post('/register-partner',  [AuthController::class, 'registerPartner']);
    Route::post('/refresh',           [AuthController::class, 'refresh']);
    Route::post('/forgot-password',   [AuthController::class, 'forgotPassword']);
});

// ============================================================
// Services (lecture publique)
// ============================================================

Route::get('/services',              [ServiceController::class, 'index']);
Route::get('/search',                [ServiceController::class, 'search']);
Route::get('/services/{id}',         [ServiceController::class, 'show']);
Route::get('/services/{id}/calendar.ics', [ServiceCalendarSyncController::class, 'export']);

// ============================================================
// Blog (lecture publique)
// ============================================================

Route::get('/blog/posts',            [BlogController::class, 'index']);
Route::get('/blog/posts/{slug}',     [BlogController::class, 'show']);

// ============================================================
// Reviews + Availability (lecture publique)
// ============================================================

Route::get('/reviews',               [ReviewController::class, 'index']);
Route::get('/availability',          [AvailabilityController::class, 'index']);
Route::get('/service-structure',     [AdminServiceStructureController::class, 'index']);
Route::post('/analytics/events',     [AnalyticsController::class, 'store'])
    ->middleware('throttle:60,1');

// ============================================================
// Routes protegees (token Sanctum requis)
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ────────────────────────────────────────────────────────────────
    Route::get('/users/me',           [AuthController::class, 'me']);
    Route::delete('/auth/logout',     [AuthController::class, 'logout']);

    // ── Profil utilisateur ─────────────────────────────────────────────────
    Route::patch('/users/me',         [UserController::class, 'updateMe']);

    // ── Reservations (client) ─────────────────────────────────────────────
    Route::post('/bookings/init',                 [BookingController::class, 'init']);
    Route::post('/bookings/confirm',              [BookingController::class, 'confirm']);
    Route::get('/bookings/mine',                  [BookingController::class, 'mine']);

    // ── Avis ──────────────────────────────────────────────────────────────
    Route::post('/reviews',                       [ReviewController::class, 'store']);

    // ── Favoris ───────────────────────────────────────────────────────────
    Route::get('/favorites',                      [FavoriteController::class, 'index']);
    Route::post('/favorites',                     [FavoriteController::class, 'store']);
    Route::delete('/favorites/{serviceId}',       [FavoriteController::class, 'destroy']);

    // ── Disponibilites + Services (ecriture partenaire/admin) ────────────
    Route::middleware('role:PARTNER,ADMIN')->group(function () {
        Route::post('/availability',                      [AvailabilityController::class, 'store']);
        Route::post('/services',                          [ServiceController::class, 'store']);
        Route::patch('/services/{id}',                    [ServiceController::class, 'update']);
        Route::delete('/services/{id}',                   [ServiceController::class, 'destroy']);
        Route::get('/services/{id}/calendar-sync',        [ServiceCalendarSyncController::class, 'show']);
        Route::put('/services/{id}/calendar-sync',        [ServiceCalendarSyncController::class, 'upsert']);
        Route::post('/services/{id}/calendar-sync/sync',  [ServiceCalendarSyncController::class, 'sync']);
        Route::get('/services/{id}/pricing-rules',        [ServicePricingRuleController::class, 'index']);
        Route::post('/services/{id}/pricing-rules',       [ServicePricingRuleController::class, 'store']);
        Route::patch('/services/{id}/pricing-rules/{ruleId}', [ServicePricingRuleController::class, 'update']);
        Route::delete('/services/{id}/pricing-rules/{ruleId}', [ServicePricingRuleController::class, 'destroy']);
        Route::patch('/services/{id}/toggle-availability',[ServiceController::class, 'toggleAvailability']);
        Route::get('/bookings/partner-incoming',          [BookingController::class, 'partnerIncoming']);
        Route::patch('/bookings/{id}/status',             [BookingController::class, 'updateStatus']);
    });

    // ── Blog + Admin (ecriture admin uniquement) ──────────────────────────
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/support/tickets',                    [SupportController::class, 'index']);
        Route::post('/support/tickets',                   [SupportController::class, 'store']);
        Route::patch('/support/tickets/{id}',             [SupportController::class, 'update']);
        Route::delete('/support/tickets/{id}',            [SupportController::class, 'destroy']);
        Route::get('/blog/posts/by-id/{id}',              [BlogController::class, 'showById']);
        Route::post('/blog/posts',                        [BlogController::class, 'store']);
        Route::patch('/blog/posts/{id}',                  [BlogController::class, 'update']);
        Route::delete('/blog/posts/{id}',                 [BlogController::class, 'destroy']);
        Route::post('/service-structure/categories',      [AdminServiceStructureController::class, 'storeCategory']);
        Route::patch('/service-structure/categories/{id}', [AdminServiceStructureController::class, 'updateCategory']);
        Route::delete('/service-structure/categories/{id}', [AdminServiceStructureController::class, 'destroyCategory']);
        Route::post('/service-structure/subcategories',   [AdminServiceStructureController::class, 'storeSubcategory']);
        Route::patch('/service-structure/subcategories/{id}', [AdminServiceStructureController::class, 'updateSubcategory']);
        Route::delete('/service-structure/subcategories/{id}', [AdminServiceStructureController::class, 'destroySubcategory']);
        Route::post('/service-structure/attributes',      [AdminServiceStructureController::class, 'storeAttribute']);
        Route::patch('/service-structure/attributes/{id}', [AdminServiceStructureController::class, 'updateAttribute']);
        Route::delete('/service-structure/attributes/{id}', [AdminServiceStructureController::class, 'destroyAttribute']);
        Route::post('/service-structure/extras',          [AdminServiceStructureController::class, 'storeExtra']);
        Route::patch('/service-structure/extras/{id}',    [AdminServiceStructureController::class, 'updateExtra']);
        Route::delete('/service-structure/extras/{id}',   [AdminServiceStructureController::class, 'destroyExtra']);
        Route::get('/users',                              [UserController::class, 'adminIndex']);
        Route::post('/users',                             [UserController::class, 'adminCreate']);
        Route::post('/users/partners',                    [UserController::class, 'adminCreatePartner']);
        Route::post('/users/{id}/contract',               [UserController::class, 'adminUploadContract']);
        Route::patch('/users/{id}',                       [UserController::class, 'adminUpdate']);
        Route::get('/bookings',                           [BookingController::class, 'adminList']);
        Route::get('/analytics/funnel',                  [AnalyticsController::class, 'funnel']);
        Route::get('/admin-reviews',                     [ReviewController::class, 'adminList']);
        Route::patch('/admin-reviews/{id}',              [ReviewController::class, 'adminUpdate']);
        Route::delete('/admin-reviews/{id}',             [ReviewController::class, 'adminDestroy']);
        Route::get('/fareharbor/companies',              [FareHarborCompanyController::class, 'index']);
        Route::post('/fareharbor/companies',             [FareHarborCompanyController::class, 'store']);
        Route::patch('/fareharbor/companies/{id}',       [FareHarborCompanyController::class, 'update']);
        Route::post('/fareharbor/companies/{id}/partner-account', [FareHarborCompanyController::class, 'createPartnerAccount']);
        Route::post('/fareharbor/companies/{id}/sync',   [FareHarborCompanyController::class, 'sync']);
        Route::post('/fareharbor/companies/sync-all',    [FareHarborCompanyController::class, 'syncAll']);
    });

    // ── Upload (S3 pre-signe) — tout utilisateur authentifie ─────────────
    Route::post('/uploads/presign',               [UploadController::class, 'presign'])
        ->middleware('throttle:uploads');
    Route::post('/uploads/direct',                [UploadController::class, 'directUpload'])
        ->name('uploads.direct')
        ->middleware('throttle:uploads');
});
