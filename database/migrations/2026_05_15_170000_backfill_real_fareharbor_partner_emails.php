<?php

use App\Models\FareHarborCompany;
use App\Models\User;
use App\Support\FareHarborPartnerEmailDirectory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        FareHarborCompany::query()
            ->whereNotNull('partner_id')
            ->get()
            ->each(function (FareHarborCompany $company): void {
                $partner = $company->partner()->first();

                if (! $partner instanceof User) {
                    return;
                }

                if (! str_ends_with($partner->email, '@partners.wandireo.local')) {
                    return;
                }

                $realEmail = FareHarborPartnerEmailDirectory::emailForSlug($company->company_slug);

                if ($realEmail === null) {
                    return;
                }

                $alreadyUsed = User::query()
                    ->where('email', $realEmail)
                    ->whereKeyNot($partner->id)
                    ->exists();

                if ($alreadyUsed) {
                    return;
                }

                $partner->forceFill([
                    'email' => $realEmail,
                    'email_verified_at' => null,
                ])->save();
            });
    }

    public function down(): void
    {
        FareHarborCompany::query()
            ->whereNotNull('partner_id')
            ->get()
            ->each(function (FareHarborCompany $company): void {
                $partner = $company->partner()->first();

                if (! $partner instanceof User) {
                    return;
                }

                $expectedEmail = FareHarborPartnerEmailDirectory::emailForSlug($company->company_slug);

                if ($expectedEmail === null || $partner->email !== $expectedEmail) {
                    return;
                }

                $fallbackEmail = sprintf(
                    'fareharbor+%s@partners.wandireo.local',
                    Str::slug($company->company_slug),
                );

                $alreadyUsed = User::query()
                    ->where('email', $fallbackEmail)
                    ->whereKeyNot($partner->id)
                    ->exists();

                if ($alreadyUsed) {
                    return;
                }

                $partner->forceFill([
                    'email' => $fallbackEmail,
                    'email_verified_at' => null,
                ])->save();
            });
    }
};
