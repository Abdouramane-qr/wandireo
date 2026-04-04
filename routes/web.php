<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

// ============================================================
// Pages publiques
// ============================================================

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/recherche', [PageController::class, 'search'])->name('search');
Route::get('/services/{id}', [PageController::class, 'serviceShow'])->name('service.show');
Route::get('/blog', [PageController::class, 'blogIndex'])->name('blog');
Route::get('/blog/{slug}', [PageController::class, 'blogShow'])->name('blog.post');
Route::get('/mentions-legales', [PageController::class, 'legal'])->name('legal');
Route::get('/conditions-utilisation', [PageController::class, 'terms'])->name('terms');
Route::get('/politique-de-confidentialite', [PageController::class, 'privacy'])->name('privacy');
Route::get('/guide', [PageController::class, 'guide'])->name('guide');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

// Auth pages Wandireo
Route::get('/connexion', [PageController::class, 'login'])->name('login');
Route::post('/connexion', [AuthenticatedSessionController::class, 'store'])
    ->middleware(['guest', 'throttle:login']);
Route::get('/inscription', [PageController::class, 'register'])->name('register');
Route::get('/mot-de-passe-oublie', [PageController::class, 'forgotPassword'])->name('password.request');
Route::get('/reinitialisation-mot-de-passe/{token}', [PageController::class, 'resetPassword'])->middleware('guest')->name('password.reset');
Route::get('/partenaire/inscription', [PageController::class, 'partnerRegister'])->name('partner.register');
Route::get('/double-authentification', [PageController::class, 'twoFactorLogin'])->middleware('guest')->name('two-factor.login');
Route::get('/verification-email', [PageController::class, 'verificationNotice'])->middleware('auth')->name('verification.notice');
Route::get('/confirmation-mot-de-passe', [PageController::class, 'confirmPassword'])
    ->middleware('auth')
    ->name('password.confirm');

// ============================================================
// Tunnel de réservation
// ============================================================

Route::middleware(['auth'])->group(function () {
    Route::get('/panier', [PageController::class, 'cart'])->name('cart');
    Route::get('/commande', [PageController::class, 'checkout'])->name('checkout');
    Route::get('/paiement', [PageController::class, 'payment'])->name('payment');
    Route::get('/confirmation/{bookingId}', [PageController::class, 'confirmation'])->name('confirmation');
});

// ============================================================
// Espace client
// ============================================================

Route::middleware(['auth'])->group(function () {
    Route::redirect('/dashboard', '/mon-espace');
    Route::get('/mon-espace', [PageController::class, 'clientDashboard'])->name('dashboard');
    Route::get('/mon-profil', [PageController::class, 'clientProfile'])->name('profile');
    Route::get('/mes-favoris', [PageController::class, 'clientFavorites'])->name('favorites');
    Route::get('/mes-reservations', [PageController::class, 'bookingsHistory'])->name('bookings.history');
});

// ============================================================
// Espace partenaire
// ============================================================

Route::middleware(['auth', 'role:PARTNER,ADMIN'])->prefix('partenaire')->group(function () {
    Route::get('/', [PageController::class, 'partnerDashboard'])->name('partner.dashboard');
    Route::get('/validation', [PageController::class, 'partnerPending'])->name('partner.pending');
    Route::get('/catalogue', [PageController::class, 'partnerCatalog'])->name('partner.catalog');
    Route::get('/reservations', [PageController::class, 'partnerBookings'])->name('partner.bookings');
    Route::get('/profil', [PageController::class, 'partnerProfile'])->name('partner.profile');
    Route::get('/catalogue/form', [PageController::class, 'partnerServiceForm'])->name('partner.service.form');
    Route::get('/catalogue/form/{serviceId}', [PageController::class, 'partnerServiceForm'])->name('partner.service.form.edit');
});

// ============================================================
// Espace administration
// ============================================================

Route::middleware(['auth', 'role:ADMIN'])->prefix('admin')->group(function () {
    Route::get('/', [PageController::class, 'adminDashboard'])->name('admin.dashboard');
    Route::get('/utilisateurs', [PageController::class, 'adminUsers'])->name('admin.users');
    Route::get('/services', [PageController::class, 'adminServices'])->name('admin.services');
    Route::get('/services/structure', [PageController::class, 'adminServiceStructure'])->name('admin.services.structure');
    Route::get('/services/creation', [PageController::class, 'adminServiceForm'])->name('admin.services.create');
    Route::get('/services/creation/{serviceId}', [PageController::class, 'adminServiceForm'])->name('admin.services.edit');
    Route::get('/avis', [PageController::class, 'adminReviews'])->name('admin.reviews');
    Route::get('/transactions', [PageController::class, 'adminTransactions'])->name('admin.transactions');
    Route::get('/support', [PageController::class, 'adminSupport'])->name('admin.support');
    Route::get('/blog', [PageController::class, 'adminBlogIndex'])->name('admin.blog');
    Route::get('/blog/editeur', [PageController::class, 'adminBlogEditor'])->name('admin.blog.editor');
    Route::get('/blog/editeur/{postId}', [PageController::class, 'adminBlogEditor'])->name('admin.blog.editor.edit');
});

// ============================================================
// Paramètres (pages Laravel starter kit)
// ============================================================

require __DIR__ . '/settings.php';
