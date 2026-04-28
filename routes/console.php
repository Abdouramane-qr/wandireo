<?php

use App\Models\FareHarborCompany;
use App\Models\Service;
use App\Services\FareHarbor\FareHarborPartnerProvisioner;
use App\Services\FareHarbor\FareHarborSyncService;
use App\Services\PartnerContentTranslationService;
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

Artisan::command('partner-content:translate-backfill {--provider=FAREHARBOR} {--force}', function (
    PartnerContentTranslationService $translator,
) {
    $provider = strtoupper((string) $this->option('provider'));
    $force = (bool) $this->option('force');
    $this->info(sprintf('Scanning %s services for translation backfill...', $provider));

    $services = Service::query()
        ->where('source_provider', $provider)
        ->orderBy('id')
        ->get();
    $translated = 0;
    $unchanged = 0;
    $failed = 0;

    foreach ($services as $service) {
        $sourceFields = $translator->extractServiceSourceFields($service);
        $extraData = is_array($service->extra_data) ? $service->extra_data : [];
        $existingState = is_array(data_get($extraData, 'translations'))
            ? data_get($extraData, 'translations')
            : [];
        $translationState = $translator->buildTranslationState($sourceFields, $existingState, $force);

        if (! $force && data_get($existingState, 'source_hash') === data_get($translationState, 'source_hash')) {
            $unchanged++;

            continue;
        }

        $overrides = is_array(data_get($extraData, 'fareharbor.overrides'))
            ? data_get($extraData, 'fareharbor.overrides')
            : [];
        $titleTranslations = $translator->applyStringOverrides(
            is_array(data_get($translationState, 'fields.title'))
                ? data_get($translationState, 'fields.title')
                : $service->getTranslations('title'),
            data_get($overrides, 'title'),
        );
        $descriptionTranslations = $translator->applyStringOverrides(
            is_array(data_get($translationState, 'fields.description'))
                ? data_get($translationState, 'fields.description')
                : $service->getTranslations('description'),
            data_get($overrides, 'description'),
        );
        $fields = is_array(data_get($translationState, 'fields'))
            ? data_get($translationState, 'fields')
            : [];
        $fields['title'] = $titleTranslations;
        $fields['description'] = $descriptionTranslations;
        $fields['meetingPoint'] = $translator->applyStringOverrides(
            is_array($fields['meetingPoint'] ?? null) ? $fields['meetingPoint'] : [],
            data_get($overrides, 'meetingPoint'),
        );
        $fields['included'] = $translator->applyListOverrides(
            is_array($fields['included'] ?? null) ? $fields['included'] : [],
            data_get($overrides, 'included'),
        );
        $fields['notIncluded'] = $translator->applyListOverrides(
            is_array($fields['notIncluded'] ?? null) ? $fields['notIncluded'] : [],
            data_get($overrides, 'notIncluded'),
        );
        $fields['fareharbor.headline'] = $translator->applyStringOverrides(
            is_array(($fields['fareharbor.headline'] ?? null)) ? $fields['fareharbor.headline'] : [],
            data_get($overrides, 'fareharbor.headline'),
        );
        $fields['fareharbor.shortDescription'] = $translator->applyStringOverrides(
            is_array(($fields['fareharbor.shortDescription'] ?? null)) ? $fields['fareharbor.shortDescription'] : [],
            data_get($overrides, 'fareharbor.shortDescription'),
        );

        data_set($extraData, 'translations', [
            ...$translationState,
            'fields' => $fields,
        ]);

        if ((string) data_get($translationState, 'status') === 'PARTIAL') {
            $failed++;
        }

        $service->forceFill([
            'title' => $titleTranslations,
            'description' => $descriptionTranslations,
            'extra_data' => $extraData,
        ])->save();

        $translated++;
    }

    $this->info(sprintf(
        'Backfill complete. translated=%d unchanged=%d partial=%d',
        $translated,
        $unchanged,
        $failed,
    ));
})->purpose('Backfill stored translations for imported partner services.');
