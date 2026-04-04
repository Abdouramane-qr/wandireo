<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indexes supplémentaires pour les requêtes fréquentes en production.
 * Priorité sur les colonnes utilisées dans les WHERE, ORDER BY et JOIN.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Services — recherche par catégorie + tri prix/note
        Schema::table('services', function (Blueprint $table) {
            $table->index(['category', 'is_available'], 'idx_services_category_available');
            $table->index(['is_available', 'client_price'], 'idx_services_available_price');
            $table->index(['is_available', 'rating'], 'idx_services_available_rating');
            $table->index('partner_id', 'idx_services_partner');
        });

        // Bookings — recherche par client/partenaire + statut
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['client_id', 'status'], 'idx_bookings_client_status');
            $table->index(['service_id', 'status'], 'idx_bookings_service_status');
            $table->index('stripe_payment_intent_id', 'idx_bookings_stripe');
        });

        // Reviews — récupération par service (tri note)
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['service_id', 'rating'], 'idx_reviews_service_rating');
        });

        // Blog — requêtes published triées par date
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index(['status', 'published_at'], 'idx_blog_status_published');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('idx_services_category_available');
            $table->dropIndex('idx_services_available_price');
            $table->dropIndex('idx_services_available_rating');
            $table->dropIndex('idx_services_partner');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_client_status');
            $table->dropIndex('idx_bookings_service_status');
            $table->dropIndex('idx_bookings_stripe');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_service_rating');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropIndex('idx_blog_status_published');
        });
    }
};
