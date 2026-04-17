<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')
            ->select(['id', 'source_external_id', 'extra_data'])
            ->where('source_provider', 'FAREHARBOR')
            ->orderBy('id')
            ->get()
            ->each(function (object $service): void {
                $extraData = json_decode($service->extra_data ?? 'null', true);

                if (! is_array($extraData)) {
                    return;
                }

                $companySlug = data_get($extraData, 'fareharbor.company');
                $itemId = data_get($extraData, 'fareharbor.itemId', $service->source_external_id);

                if (! is_string($companySlug) || $companySlug === '') {
                    return;
                }

                if (! is_string($itemId) || $itemId === '') {
                    return;
                }

                $providerExternalId = sprintf('%s:%s', $companySlug, $itemId);

                if ($service->source_external_id === $providerExternalId) {
                    return;
                }

                $duplicateExists = DB::table('services')
                    ->where('source_provider', 'FAREHARBOR')
                    ->where('source_external_id', $providerExternalId)
                    ->where('id', '!=', $service->id)
                    ->exists();

                if ($duplicateExists) {
                    return;
                }

                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'source_external_id' => $providerExternalId,
                        'updated_at' => now(),
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('services')
            ->select(['id', 'source_external_id', 'extra_data'])
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', 'like', '%:%')
            ->orderBy('id')
            ->get()
            ->each(function (object $service): void {
                $extraData = json_decode($service->extra_data ?? 'null', true);
                $itemId = data_get($extraData, 'fareharbor.itemId');

                if (! is_string($itemId) || $itemId === '') {
                    return;
                }

                $duplicateExists = DB::table('services')
                    ->where('source_provider', 'FAREHARBOR')
                    ->where('source_external_id', $itemId)
                    ->where('id', '!=', $service->id)
                    ->exists();

                if ($duplicateExists) {
                    return;
                }

                DB::table('services')
                    ->where('id', $service->id)
                    ->update([
                        'source_external_id' => $itemId,
                        'updated_at' => now(),
                    ]);
            });
    }
};
