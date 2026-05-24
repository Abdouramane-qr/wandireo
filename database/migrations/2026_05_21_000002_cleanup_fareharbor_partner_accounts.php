<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * @var array<string, string>
     */
    private const REAL_EMAILS = [
        'btoursadventures' => 'btoursadventures@gmail.com',
        'momentswatersports' => 'info@momentswatersports.com',
        'tridenteboattrips' => 'info@tridenteboattrips.com',
        'xplorebenagil' => 'supkayaktours@gmail.com',
    ];

    public function up(): void
    {
        DB::transaction(function (): void {
            DB::table('fareharbor_companies')
                ->orderBy('id')
                ->get()
                ->each(function (object $company): void {
                    $realEmail = $this->realEmailForSlug((string) $company->company_slug);

                    if ($realEmail === null) {
                        $this->detachSyntheticPartner((string) $company->id, (string) $company->company_slug, $company->partner_id ? (int) $company->partner_id : null);

                        return;
                    }

                    $this->assignRealPartner((string) $company->id, (string) $company->company_slug, $realEmail, $company->partner_id ? (int) $company->partner_id : null);
                });
        });
    }

    public function down(): void
    {
        // Data cleanup is intentionally not reversed.
    }

    private function assignRealPartner(string $companyId, string $companySlug, string $realEmail, ?int $currentPartnerId): void
    {
        $realUser = DB::table('users')->where('email', $realEmail)->first();
        $currentPartner = $currentPartnerId !== null
            ? DB::table('users')->where('id', $currentPartnerId)->first()
            : null;

        if ($realUser !== null) {
            $partnerId = (int) $realUser->id;
        } elseif ($currentPartner !== null && $this->isSyntheticFareHarborEmail((string) $currentPartner->email)) {
            DB::table('users')
                ->where('id', $currentPartnerId)
                ->update([
                    'email' => $realEmail,
                    'email_verified_at' => null,
                    'updated_at' => now(),
                ]);
            $partnerId = $currentPartnerId;
        } else {
            return;
        }

        DB::table('fareharbor_companies')
            ->where('id', $companyId)
            ->update(['partner_id' => $partnerId, 'updated_at' => now()]);

        $this->assignServicesForCompany($companySlug, $partnerId);

        if ($currentPartnerId !== null && $currentPartnerId !== $partnerId) {
            $this->deleteUnusedSyntheticPartner($currentPartnerId);
        }
    }

    private function detachSyntheticPartner(string $companyId, string $companySlug, ?int $partnerId): void
    {
        if ($partnerId === null) {
            return;
        }

        $partner = DB::table('users')->where('id', $partnerId)->first();

        if ($partner === null || ! $this->isSyntheticFareHarborEmail((string) $partner->email)) {
            return;
        }

        DB::table('fareharbor_companies')
            ->where('id', $companyId)
            ->update(['partner_id' => null, 'updated_at' => now()]);

        $this->assignServicesForCompany($companySlug, null);
        $this->deleteUnusedSyntheticPartner($partnerId);
    }

    private function assignServicesForCompany(string $companySlug, ?int $partnerId): void
    {
        if (! Schema::hasTable('services')) {
            return;
        }

        foreach ($this->companySlugAliases($companySlug) as $slug) {
            DB::table('services')
                ->where('source_provider', 'FAREHARBOR')
                ->whereJsonContains('extra_data->fareharbor->company', $slug)
                ->update(['partner_id' => $partnerId, 'updated_at' => now()]);
        }
    }

    private function deleteUnusedSyntheticPartner(int $partnerId): void
    {
        $partner = DB::table('users')->where('id', $partnerId)->first();

        if ($partner === null || ! $this->isSyntheticFareHarborEmail((string) $partner->email)) {
            return;
        }

        $referencingTables = [
            'fareharbor_companies',
            'services',
            'bookings',
            'partner_documents',
            'support_tickets',
        ];

        foreach ($referencingTables as $table) {
            if (Schema::hasTable($table) && DB::table($table)->where('partner_id', $partnerId)->exists()) {
                return;
            }
        }

        DB::table('users')->where('id', $partnerId)->delete();
    }

    private function realEmailForSlug(string $slug): ?string
    {
        foreach ($this->candidateKeys($slug) as $candidate) {
            if (array_key_exists($candidate, self::REAL_EMAILS)) {
                return self::REAL_EMAILS[$candidate];
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function candidateKeys(string $slug): array
    {
        $slugified = Str::slug($slug);

        return array_values(array_unique(array_filter([
            Str::of($slug)->lower()->trim()->value(),
            $slugified,
            str_replace('-', '', $slugified),
        ])));
    }

    /**
     * @return array<int, string>
     */
    private function companySlugAliases(string $slug): array
    {
        return array_values(array_unique(array_filter([
            $slug,
            Str::slug($slug),
            str_replace('-', '', Str::slug($slug)),
        ])));
    }

    private function isSyntheticFareHarborEmail(string $email): bool
    {
        return str_starts_with($email, 'fareharbor+') && str_ends_with($email, '@partners.wandireo.local');
    }
};
