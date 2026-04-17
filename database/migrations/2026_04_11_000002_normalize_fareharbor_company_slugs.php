<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $legacySlug = 'momentosdinaminos';
        $targetSlug = 'momentosdinamicos';

        $legacyCompany = DB::table('fareharbor_companies')
            ->where('company_slug', $legacySlug)
            ->first();
        $targetExists = DB::table('fareharbor_companies')
            ->where('company_slug', $targetSlug)
            ->exists();

        if ($legacyCompany !== null && ! $targetExists) {
            DB::table('fareharbor_companies')
                ->where('id', $legacyCompany->id)
                ->update([
                    'company_slug' => $targetSlug,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        $legacySlug = 'momentosdinaminos';
        $targetSlug = 'momentosdinamicos';

        $targetCompany = DB::table('fareharbor_companies')
            ->where('company_slug', $targetSlug)
            ->first();
        $legacyExists = DB::table('fareharbor_companies')
            ->where('company_slug', $legacySlug)
            ->exists();

        if ($targetCompany !== null && ! $legacyExists) {
            DB::table('fareharbor_companies')
                ->where('id', $targetCompany->id)
                ->update([
                    'company_slug' => $legacySlug,
                    'updated_at' => now(),
                ]);
        }
    }
};
