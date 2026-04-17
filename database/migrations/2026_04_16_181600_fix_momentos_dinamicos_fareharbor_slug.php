<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $legacySlug = 'momentosdinaminos';
        $targetSlug = 'momentosdinamicos';

        DB::table('fareharbor_companies')
            ->where('company_slug', $legacySlug)
            ->update([
                'display_name' => 'Momentos Dinamicos',
                'company_slug' => $targetSlug,
                'updated_at' => now(),
            ]);

        DB::table('services')
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'like', $legacySlug . ':%')
            ->orderBy('id')
            ->get(['id', 'source_external_id', 'extra_data'])
            ->each(function (object $service) use ($legacySlug, $targetSlug): void {
                $extraData = $service->extra_data;

                if (is_string($extraData)) {
                    $decoded = json_decode($extraData, true);
                    $extraData = is_array($decoded) ? $decoded : [];
                }

                if (! is_array($extraData)) {
                    $extraData = [];
                }

                data_set($extraData, 'fareharbor.company', $targetSlug);

                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'source_external_id' => preg_replace(
                            '/^' . preg_quote($legacySlug, '/') . ':/',
                            $targetSlug . ':',
                            (string) $service->source_external_id,
                            1,
                        ),
                        'extra_data' => json_encode($extraData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);
            });
    }

    public function down(): void
    {
        $legacySlug = 'momentosdinaminos';
        $targetSlug = 'momentosdinamicos';

        DB::table('fareharbor_companies')
            ->where('company_slug', $targetSlug)
            ->update([
                'display_name' => 'Momentos Dinaminos',
                'company_slug' => $legacySlug,
                'updated_at' => now(),
            ]);

        DB::table('services')
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'like', $targetSlug . ':%')
            ->orderBy('id')
            ->get(['id', 'source_external_id', 'extra_data'])
            ->each(function (object $service) use ($legacySlug, $targetSlug): void {
                $extraData = $service->extra_data;

                if (is_string($extraData)) {
                    $decoded = json_decode($extraData, true);
                    $extraData = is_array($decoded) ? $decoded : [];
                }

                if (! is_array($extraData)) {
                    $extraData = [];
                }

                data_set($extraData, 'fareharbor.company', $legacySlug);

                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'source_external_id' => preg_replace(
                            '/^' . preg_quote($targetSlug, '/') . ':/',
                            $legacySlug . ':',
                            (string) $service->source_external_id,
                            1,
                        ),
                        'extra_data' => json_encode($extraData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);
            });
    }
};
