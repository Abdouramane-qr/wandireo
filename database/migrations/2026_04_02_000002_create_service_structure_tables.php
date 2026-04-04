<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('service_type');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['service_type', 'is_active']);
        });

        Schema::create('service_subcategories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')
                ->constrained('service_categories')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('service_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')
                ->constrained('service_categories')
                ->cascadeOnDelete();
            $table->string('label');
            $table->string('key');
            $table->string('type');
            $table->boolean('is_required')->default(false);
            $table->boolean('is_filterable')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['service_category_id', 'key']);
        });

        Schema::create('service_attribute_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_attribute_id')
                ->constrained('service_attributes')
                ->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('service_extras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')
                ->constrained('service_categories')
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('default_price', 10, 2)->default(0);
            $table->string('input_type')->default('CHECKBOX');
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('service_category_id')
                ->nullable()
                ->after('category')
                ->constrained('service_categories')
                ->nullOnDelete();
            $table->foreignId('service_subcategory_id')
                ->nullable()
                ->after('service_category_id')
                ->constrained('service_subcategories')
                ->nullOnDelete();
            $table->string('booking_mode')
                ->default('REQUEST')
                ->after('payment_mode');
            $table->boolean('featured')
                ->default(false)
                ->after('booking_mode');
            $table->string('video_url')
                ->nullable()
                ->after('featured');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_subcategory_id');
            $table->dropConstrainedForeignId('service_category_id');
            $table->dropColumn(['booking_mode', 'featured', 'video_url']);
        });

        Schema::dropIfExists('service_extras');
        Schema::dropIfExists('service_attribute_options');
        Schema::dropIfExists('service_attributes');
        Schema::dropIfExists('service_subcategories');
        Schema::dropIfExists('service_categories');
    }
};
