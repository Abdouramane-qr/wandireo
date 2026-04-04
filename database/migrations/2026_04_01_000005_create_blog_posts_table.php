<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('excerpt');
            $table->longText('content'); // HTML assaini
            $table->string('cover_image')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT | PUBLISHED
            $table->json('tags')->default('[]');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
