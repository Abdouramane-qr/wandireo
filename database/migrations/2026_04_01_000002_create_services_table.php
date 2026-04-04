<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('partner_id')->constrained('users')->cascadeOnDelete();

            // Infos générales
            $table->string('title');
            $table->text('description');
            $table->string('category'); // ACTIVITE | BATEAU | HEBERGEMENT | VOITURE

            // Localisation
            $table->string('location_city');
            $table->string('location_country');
            $table->string('location_region')->nullable();
            $table->string('location_address_line')->nullable();
            $table->decimal('location_latitude', 10, 7)->nullable();
            $table->decimal('location_longitude', 10, 7)->nullable();

            // Images (tableau JSON)
            $table->json('images')->default('[]');

            // Tarification
            $table->string('pricing_unit'); // PAR_PERSONNE | PAR_JOUR | etc.
            $table->decimal('partner_price', 10, 2);
            $table->decimal('commission_rate', 5, 4)->default(0.15);
            $table->decimal('commission_amount', 10, 2)->storedAs('partner_price * commission_rate');
            $table->decimal('client_price', 10, 2)->storedAs('partner_price * (1 + commission_rate)');
            $table->string('currency', 3)->default('EUR');
            $table->string('payment_mode')->default('COMMISSION_ONLINE_REST_ON_SITE');

            // Métriques
            $table->decimal('rating', 3, 2)->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->boolean('is_available')->default(true);

            // Tags et données spécifiques à la catégorie
            $table->json('tags')->default('[]');
            $table->json('extra_data')->nullable(); // champs spécifiques (durée, type bateau, etc.)

            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('is_available');
            $table->index('partner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
