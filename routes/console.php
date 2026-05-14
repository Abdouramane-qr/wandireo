<?php

use App\Models\FareHarborCompany;
use App\Models\BlogPost;
use App\Models\Service;
use App\Services\BlogContentTranslationService;
use App\Services\FareHarbor\FareHarborPartnerProvisioner;
use App\Services\FareHarbor\FareHarborSyncService;
use App\Services\PartnerContent\PartnerContentProviderRegistry;
use App\Services\PartnerContentTranslationService;
use App\Services\Payments\PaymentService;
use App\Support\FareHarborDefaultCompanies;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bookings:expire-stale-checkouts', function (
    PaymentService $paymentService,
) {
    $expired = $paymentService->expireStaleCheckouts();
    $this->info(sprintf('Expired %d stale checkout bookings.', $expired));

    return self::SUCCESS;
})->purpose('Expire stale checkout bookings that are still awaiting payment.');

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
    PartnerContentProviderRegistry $providers,
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
    $remainingIncomplete = 0;

    foreach ($services as $service) {
        $needsRepair = $translator->serviceHasIncompleteTranslations($service);
        $sourceFields = $translator->extractServiceSourceFields($service);
        $extraData = is_array($service->extra_data) ? $service->extra_data : [];
        $existingState = is_array(data_get($extraData, 'translations'))
            ? data_get($extraData, 'translations')
            : [];
        $translationState = $translator->buildTranslationState(
            $provider,
            $sourceFields,
            $existingState,
            $force || $needsRepair,
        );

        if (
            ! $force
            && ! $needsRepair
            && data_get($existingState, 'source_hash') === data_get($translationState, 'source_hash')
        ) {
            $unchanged++;

            continue;
        }

        $overrides = $providers->overrides($extraData, $provider);
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

        foreach ($providers->stringFields($provider) as $field => $config) {
            $fields[$field] = $translator->applyStringOverrides(
                is_array($fields[$field] ?? null) ? $fields[$field] : [],
                data_get($overrides, $config['override_path']),
            );
        }

        foreach ($providers->listFields($provider) as $field => $config) {
            $fields[$field] = $translator->applyListOverrides(
                is_array($fields[$field] ?? null) ? $fields[$field] : [],
                data_get($overrides, $config['override_path']),
            );
        }

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

        $service->refresh();

        if ($translator->serviceHasIncompleteTranslations($service)) {
            $remainingIncomplete++;
            $this->warn(sprintf(
                'Translation incomplete for service %s (%s): %s',
                $service->id,
                $service->source_external_id,
                implode(', ', $translator->auditServiceTranslations($service)['issues']),
            ));
        }

        $translated++;
    }

    $this->info(sprintf(
        'Backfill complete. translated=%d unchanged=%d partial=%d remaining_incomplete=%d',
        $translated,
        $unchanged,
        $failed,
        $remainingIncomplete,
    ));
})->purpose('Backfill stored translations for imported partner services.');

Artisan::command('partner-content:audit-translations {--provider=} {--limit=20}', function (
    PartnerContentTranslationService $translator,
) {
    $provider = strtoupper(trim((string) $this->option('provider')));
    $limit = max(1, (int) $this->option('limit'));
    $query = Service::query()
        ->where('source_type', 'EXTERNAL')
        ->when($provider !== '', fn ($builder) => $builder->where('source_provider', $provider))
        ->orderBy('source_provider')
        ->orderBy('source_external_id');
    $services = $query->get();
    $total = $services->count();
    $blocking = [];
    $warnings = [];

    foreach ($services as $service) {
        $audit = $translator->auditServiceTranslations($service);

        if ($audit['blocking_issues'] !== []) {
            $blocking[] = [
                'id' => (string) $service->id,
                'provider' => (string) $service->source_provider,
                'source_external_id' => (string) $service->source_external_id,
                'source_locale' => $audit['source_locale'] ?? '',
                'status' => $audit['status'] ?? '',
                'issues' => implode(', ', $audit['blocking_issues']),
                'severity' => 'blocking',
            ];
        }

        if ($audit['warning_issues'] !== []) {
            $warnings[] = [
                'id' => (string) $service->id,
                'provider' => (string) $service->source_provider,
                'source_external_id' => (string) $service->source_external_id,
                'source_locale' => $audit['source_locale'] ?? '',
                'status' => $audit['status'] ?? '',
                'issues' => implode(', ', $audit['warning_issues']),
                'severity' => 'warning',
            ];
        }
    }

    $this->info(sprintf(
        'Partner translation audit: total=%d blocking=%d warnings=%d provider=%s',
        $total,
        count($blocking),
        count($warnings),
        $provider !== '' ? $provider : 'ALL',
    ));

    foreach (array_slice([...$blocking, ...$warnings], 0, $limit) as $row) {
        $this->line(sprintf(
            '- %s | %s | %s | severity=%s | source_locale=%s | status=%s | %s',
            $row['id'],
            $row['provider'],
            $row['source_external_id'],
            $row['severity'],
            $row['source_locale'] !== '' ? $row['source_locale'] : 'n/a',
            $row['status'] !== '' ? $row['status'] : 'n/a',
            $row['issues'],
        ));
    }

    return count($blocking) === 0 ? self::SUCCESS : self::FAILURE;
})->purpose('Audit imported partner services missing stored translations or localized content.');

Artisan::command('blog-content:translate-backfill {--status=PUBLISHED} {--force}', function (
    BlogContentTranslationService $translator,
) {
    $status = strtoupper((string) $this->option('status'));
    $force = (bool) $this->option('force');
    $this->info(sprintf('Scanning blog posts with status %s for translation backfill...', $status));

    $posts = BlogPost::query()
        ->when($status !== 'ALL', fn ($query) => $query->where('status', $status))
        ->orderBy('published_at')
        ->orderBy('created_at')
        ->get();
    $translated = 0;
    $unchanged = 0;
    $partial = 0;

    foreach ($posts as $post) {
        $existingState = is_array($post->translation_state) ? $post->translation_state : [];
        $sourceFields = $translator->extractSourceFields($post, $existingState);
        $currentTranslations = [
            'title' => $post->getTranslations('title'),
            'excerpt' => $post->getTranslations('excerpt'),
            'content' => $post->getTranslations('content'),
        ];
        $result = $translator->prepareTranslations(
            $sourceFields,
            $currentTranslations,
            $existingState,
            $force,
        );
        $translationState = $result['state'];

        if (! $force && data_get($existingState, 'source_hash') === data_get($translationState, 'source_hash')) {
            $unchanged++;

            continue;
        }

        if ((string) data_get($translationState, 'status') === 'PARTIAL') {
            $partial++;
        }

        $post->forceFill([
            'title' => $result['translations']['title'],
            'excerpt' => $result['translations']['excerpt'],
            'content' => $result['translations']['content'],
            'translation_state' => $translationState,
        ])->save();

        $translated++;
    }

    $this->info(sprintf(
        'Blog backfill complete. translated=%d unchanged=%d partial=%d',
        $translated,
        $unchanged,
        $partial,
    ));
})->purpose('Backfill stored translations for blog posts.');
