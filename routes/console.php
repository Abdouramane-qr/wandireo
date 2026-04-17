<?php

use App\Models\FareHarborCompany;
use App\Services\FareHarbor\FareHarborPartnerProvisioner;
use App\Services\FareHarbor\FareHarborSyncService;
use App\Support\FareHarborDefaultCompanies;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('fareharbor:sync {companySlug?}', function (
    FareHarborSyncService $syncService,
) {
    $companySlug = $this->argument('companySlug');

    if ($companySlug) {
        $company = FareHarborCompany::query()
            ->where('company_slug', $companySlug)
            ->firstOrFail();
        $stats = $syncService->syncCompany($company);
        $this->info(json_encode($stats, JSON_PRETTY_PRINT));

        return self::SUCCESS;
    }

    $stats = $syncService->syncEnabledCompanies();
    $this->info(json_encode($stats, JSON_PRETTY_PRINT));

    return self::SUCCESS;
})->purpose('Synchronize one FareHarbor company or all enabled companies.');

Artisan::command('fareharbor:sync-all', function (
    FareHarborSyncService $syncService,
) {
    $stats = $syncService->syncEnabledCompanies();
    $this->info(json_encode($stats, JSON_PRETTY_PRINT));

    return self::SUCCESS;
})->purpose('Synchronize all enabled FareHarbor companies.');

Artisan::command('fareharbor:bootstrap-companies {--sync} {--create-partners}', function (
    FareHarborPartnerProvisioner $partnerProvisioner,
    FareHarborSyncService $syncService,
) {
    foreach (FareHarborDefaultCompanies::all() as $company) {
        $record = FareHarborCompany::query()->updateOrCreate(
            ['company_slug' => $company['company_slug']],
            [
                'display_name' => $company['display_name'],
                'is_enabled' => true,
                'sync_items_enabled' => true,
                'sync_details_enabled' => true,
            ],
        );

        if ($this->option('create-partners')) {
            if (! $record->partner_id) {
                $partnerProvisioner->createForCompany($record);
            }

            $syncService->assignCompanyPartner($record->fresh());
        }
    }

    $this->info('FareHarbor V1 companies bootstrapped.');

    if ($this->option('sync')) {
        $stats = $syncService->syncEnabledCompanies();
        $this->info(json_encode($stats, JSON_PRETTY_PRINT));
    }

    return self::SUCCESS;
})->purpose('Bootstrap the default FareHarbor V1 company list, optionally creating partner accounts and syncing it.');
