<?php

use App\Models\BlogPost;
use App\Models\Service;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->json('title_i18n')->nullable()->after('partner_id');
            $table->json('description_i18n')->nullable()->after('title_i18n');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->json('title_i18n')->nullable()->after('slug');
            $table->json('excerpt_i18n')->nullable()->after('title_i18n');
            $table->json('content_i18n')->nullable()->after('excerpt_i18n');
        });

        Service::query()->select(['id', 'title', 'description'])->chunkById(100, function ($services): void {
            foreach ($services as $service) {
                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'title_i18n' => json_encode(['fr' => $service->getRawOriginal('title')]),
                        'description_i18n' => json_encode(['fr' => $service->getRawOriginal('description')]),
                    ]);
            }
        }, 'id');

        BlogPost::query()->select(['id', 'title', 'excerpt', 'content'])->chunkById(100, function ($posts): void {
            foreach ($posts as $post) {
                DB::table('blog_posts')
                    ->where('id', $post->id)
                    ->update([
                        'title_i18n' => json_encode(['fr' => $post->getRawOriginal('title')]),
                        'excerpt_i18n' => json_encode(['fr' => $post->getRawOriginal('excerpt')]),
                        'content_i18n' => json_encode(['fr' => $post->getRawOriginal('content')]),
                    ]);
            }
        }, 'id');

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['title', 'description']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'content']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->renameColumn('title_i18n', 'title');
            $table->renameColumn('description_i18n', 'description');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->renameColumn('title_i18n', 'title');
            $table->renameColumn('excerpt_i18n', 'excerpt');
            $table->renameColumn('content_i18n', 'content');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('title_plain')->nullable()->after('partner_id');
            $table->text('description_plain')->nullable()->after('title_plain');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('title_plain')->nullable()->after('slug');
            $table->text('excerpt_plain')->nullable()->after('title_plain');
            $table->longText('content_plain')->nullable()->after('excerpt_plain');
        });

        Service::query()->select(['id', 'title', 'description'])->chunkById(100, function ($services): void {
            foreach ($services as $service) {
                $title = json_decode((string) $service->getRawOriginal('title'), true);
                $description = json_decode((string) $service->getRawOriginal('description'), true);

                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'title_plain' => is_string($title['fr'] ?? null) ? $title['fr'] : '',
                        'description_plain' => is_string($description['fr'] ?? null) ? $description['fr'] : '',
                    ]);
            }
        }, 'id');

        BlogPost::query()->select(['id', 'title', 'excerpt', 'content'])->chunkById(100, function ($posts): void {
            foreach ($posts as $post) {
                $title = json_decode((string) $post->getRawOriginal('title'), true);
                $excerpt = json_decode((string) $post->getRawOriginal('excerpt'), true);
                $content = json_decode((string) $post->getRawOriginal('content'), true);

                DB::table('blog_posts')
                    ->where('id', $post->id)
                    ->update([
                        'title_plain' => is_string($title['fr'] ?? null) ? $title['fr'] : '',
                        'excerpt_plain' => is_string($excerpt['fr'] ?? null) ? $excerpt['fr'] : '',
                        'content_plain' => is_string($content['fr'] ?? null) ? $content['fr'] : '',
                    ]);
            }
        }, 'id');

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['title', 'description']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'content']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->renameColumn('title_plain', 'title');
            $table->renameColumn('description_plain', 'description');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->renameColumn('title_plain', 'title');
            $table->renameColumn('excerpt_plain', 'excerpt');
            $table->renameColumn('content_plain', 'content');
        });
    }
};
