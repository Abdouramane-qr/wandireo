<?php

namespace App\Services\FareHarbor;

use App\Models\FareHarborCompany;
use App\Models\Service;
use App\Models\ServiceCalendarSync;
use App\Models\ServiceCategory;
use App\Services\PartnerContentTranslationService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class FareHarborSyncService
{
    public function __construct(
        private readonly FareHarborClient $client,
        private readonly PartnerContentTranslationService $partnerContentTranslator,
    ) {
    }

    public function syncCompany(FareHarborCompany $company): array
    {
        $company->update([
            'last_status' => 'SYNCING',
            'last_error' => null,
        ]);

        try {
            $itemsResponse = $company->sync_items_enabled
                ? $this->client->listItems($company->company_slug)
                : [];
            $items = $this->extractItems($itemsResponse);
            $seenExternalIds = [];
            $importedCount = 0;

            foreach ($items as $item) {
                $externalId = $this->extractItemId($item);

                if ($externalId === null) {
                    continue;
                }

                $providerExternalId = $this->providerExternalId(
                    $company->company_slug,
                    $externalId,
                );

                $detail = $company->sync_details_enabled
                    ? $this->client->getItem($company->company_slug, $externalId)
                    : $item;
                $this->upsertService($company, $item, $detail, $externalId);
                $seenExternalIds[] = $providerExternalId;
                $importedCount++;
            }

            if ($company->sync_items_enabled) {
                $companySlugs = $this->companySlugAliases($company->company_slug);
                $staleServices = Service::query()
                    ->where('source_provider', 'FAREHARBOR')
                    ->whereIn(
                        'source_external_id',
                        Service::query()
                            ->where('source_provider', 'FAREHARBOR')
                            ->where(function ($query) use ($companySlugs) {
                                foreach ($companySlugs as $slug) {
                                    $query->orWhereJsonContains(
                                        'extra_data->fareharbor->company',
                                        $slug,
                                    );
                                }
                            })
                            ->pluck('source_external_id'),
                    )
                    ->where(function ($query) use ($companySlugs) {
                        foreach ($companySlugs as $slug) {
                            $query->orWhereJsonContains(
                                'extra_data->fareharbor->company',
                                $slug,
                            );
                        }
                    })
                    ->when(
                        $seenExternalIds !== [],
                        fn ($query) => $query->whereNotIn('source_external_id', $seenExternalIds),
                        fn ($query) => $query,
                    )
                    ->get();

                foreach ($staleServices as $service) {
                    $extraData = is_array($service->extra_data)
                        ? $service->extra_data
                        : [];
                    data_set($extraData, 'fareharbor.lastSeenInLatestSync', false);
                    data_set($extraData, 'fareharbor.lastMissingAt', now()->toIso8601String());

                    $service->update([
                        'extra_data' => $extraData,
                        'last_synced_at' => now(),
                    ]);

                    $this->touchCalendarSync($service, 'SUCCESS', null);
                }
            }

            $company->update([
                'last_synced_at' => now(),
                'last_status' => 'SUCCESS',
                'last_imported_items_count' => $importedCount,
                'last_error' => null,
            ]);

            $this->flushServicesCache();

            return [
                'company' => $company->company_slug,
                'importedCount' => $importedCount,
            ];
        } catch (\Throwable $exception) {
            $company->update([
                'last_status' => 'FAILED',
                'last_error' => Str::limit($exception->getMessage(), 1500),
            ]);

            Service::query()
                ->where('source_provider', 'FAREHARBOR')
                ->where(function ($query) use ($company) {
                    foreach ($this->companySlugAliases($company->company_slug) as $slug) {
                        $query->orWhereJsonContains(
                            'extra_data->fareharbor->company',
                            $slug,
                        );
                    }
                })
                ->get()
                ->each(fn (Service $service) => $this->touchCalendarSync(
                    $service,
                    'FAILED',
                    Str::limit($exception->getMessage(), 1500),
                ));

            throw $exception;
        }
    }

    public function syncEnabledCompanies(): array
    {
        return FareHarborCompany::query()
            ->where('is_enabled', true)
            ->orderBy('display_name')
            ->get()
            ->map(fn (FareHarborCompany $company) => $this->syncCompany($company))
            ->all();
    }

    private function upsertService(
        FareHarborCompany $company,
        array $item,
        array $detail,
        string $externalId,
    ): void {
        $providerExternalId = $this->providerExternalId($company->company_slug, $externalId);
        $existingService = Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where('source_external_id', $providerExternalId)
            ->first();
        $payload = $this->mapServicePayload(
            $company,
            $item,
            $detail,
            $externalId,
            $providerExternalId,
            $existingService,
        );

        $service = Service::query()->updateOrCreate(
            [
                'source_provider' => 'FAREHARBOR',
                'source_external_id' => $providerExternalId,
            ],
            $payload,
        );

        $this->touchCalendarSync($service, 'SUCCESS', null);
    }

    private function mapServicePayload(
        FareHarborCompany $company,
        array $item,
        array $detail,
        string $externalId,
        string $providerExternalId,
        ?Service $existingService = null,
    ): array {
        $detailItem = $this->normalizeItemPayload($detail);
        $catalogItem = $this->normalizeItemPayload($item);
        $title = $this->stringValue(
            $detailItem,
            ['name', 'title', 'headline'],
            $this->stringValue($catalogItem, ['name', 'title'], $company->display_name),
        );
        $description = $this->stringValue(
            $detailItem,
            ['description', 'short_description', 'headline', 'summary'],
            $title,
        );
        $price = $this->priceValue($detailItem, $catalogItem);
        $images = $this->imageList($detailItem, $catalogItem);
        $meetingPoint = $this->stringValue(
            $detailItem,
            ['meeting_point', 'meetingPoint', 'location.name'],
            $company->display_name,
        );
        [$duration, $durationUnit] = $this->durationValue($detailItem, $catalogItem);
        $bookingUrl = $this->stringValue(
            $detailItem,
            ['booking_url', 'bookingUrl', 'public_url', 'url'],
            sprintf('https://fareharbor.com/%s/', $company->company_slug),
        );
        $priceContext = $this->priceContext($detailItem, $catalogItem, $price);
        $existingExtraData = is_array($existingService?->extra_data)
            ? $existingService->extra_data
            : [];
        $wandireoData = $this->resolveWandireoData($existingExtraData);
        $overrides = is_array(data_get($existingExtraData, 'fareharbor.overrides'))
            ? data_get($existingExtraData, 'fareharbor.overrides')
            : [];
        $wandireoAttributes = is_array(data_get($wandireoData, 'attributes'))
            ? data_get($wandireoData, 'attributes')
            : [];
        $manualPartnerPrice = $this->resolveManualPartnerPrice($wandireoData, $overrides);
        $images = $this->overrideValue($overrides, 'images', $images);
        $tags = $this->overrideValue($overrides, 'tags', $this->tagList($detail, $item));
        $paymentMode = (string) $this->overrideValue(
            $overrides,
            'payment_mode',
            $existingService?->payment_mode ?: 'COMMISSION_ONLINE_REST_ON_SITE',
        );
        $bookingMode = (string) $this->overrideValue(
            $overrides,
            'booking_mode',
            $existingService?->booking_mode ?: 'REQUEST',
        );

        $categoryType = 'ACTIVITE';
        $category = ServiceCategory::where('service_type', $categoryType)->first();
        $sourceFields = $this->partnerContentTranslator->normalizeSourceFields([
            'title' => $title,
            'description' => $description,
            'meetingPoint' => $meetingPoint,
            'included' => $this->stringList($detailItem, ['included', 'includes']),
            'notIncluded' => $this->stringList($detailItem, ['not_included', 'excludes']),
            'provider.headline' => $this->stringValue($detailItem, ['headline'], $title),
            'provider.shortDescription' => $this->stringValue(
                $detailItem,
                ['short_description', 'summary'],
                $description,
            ),
        ]);
        $translationState = $this->partnerContentTranslator->buildTranslationState(
            'FAREHARBOR',
            $sourceFields,
            is_array(data_get($existingExtraData, 'translations'))
                ? data_get($existingExtraData, 'translations')
                : [],
        );
        $titleTranslations = $this->partnerContentTranslator->applyStringOverrides(
            is_array(data_get($translationState, 'fields.title'))
                ? data_get($translationState, 'fields.title')
                : $this->localizedImportedText($title, [], 'en'),
            data_get($overrides, 'title'),
        );
        $descriptionTranslations = $this->partnerContentTranslator->applyStringOverrides(
            is_array(data_get($translationState, 'fields.description'))
                ? data_get($translationState, 'fields.description')
                : $this->localizedImportedText($description, [], 'en'),
            data_get($overrides, 'description'),
        );
        $included = $this->partnerContentTranslator->applyListOverrides(
            is_array(data_get($translationState, 'fields.included'))
                ? data_get($translationState, 'fields.included')
                : [],
            data_get($overrides, 'included'),
        );
        $notIncluded = $this->partnerContentTranslator->applyListOverrides(
            is_array(data_get($translationState, 'fields.notIncluded'))
                ? data_get($translationState, 'fields.notIncluded')
                : [],
            data_get($overrides, 'notIncluded'),
        );
        $meetingPointTranslations = $this->partnerContentTranslator->applyStringOverrides(
            is_array(data_get($translationState, 'fields.meetingPoint'))
                ? data_get($translationState, 'fields.meetingPoint')
                : [],
            data_get($overrides, 'meetingPoint'),
        );
        $headlineTranslations = $this->partnerContentTranslator->applyStringOverrides(
            is_array(($translationState['fields']['provider.headline'] ?? null))
                ? $translationState['fields']['provider.headline']
                : [],
            data_get($overrides, 'fareharbor.headline'),
        );
        $shortDescriptionTranslations = $this->partnerContentTranslator->applyStringOverrides(
            is_array(($translationState['fields']['provider.shortDescription'] ?? null))
                ? $translationState['fields']['provider.shortDescription']
                : [],
            data_get($overrides, 'fareharbor.shortDescription'),
        );

        return [
            'partner_id' => $company->partner_id,
            'title' => $titleTranslations,
            'description' => $descriptionTranslations,
            'category' => $categoryType,
            'service_category_id' => $this->overrideValue(
                $overrides,
                'service_category_id',
                $existingService?->service_category_id ?? $category?->id,
            ),
            'service_subcategory_id' => $this->overrideValue(
                $overrides,
                'service_subcategory_id',
                $existingService?->service_subcategory_id,
            ),
            'location_city' => $this->overrideValue(
                $overrides,
                'location_city',
                $this->stringValue(
                    $detailItem,
                    ['location.city', 'city', 'start_location.city', 'primary_location.city'],
                    $company->display_name,
                ),
            ),
            'location_country' => $this->overrideValue(
                $overrides,
                'location_country',
                $this->stringValue(
                    $detailItem,
                    ['location.country', 'country', 'start_location.country', 'primary_location.country'],
                    'Portugal',
                ),
            ),
            'location_region' => $this->overrideValue(
                $overrides,
                'location_region',
                $this->stringValue(
                    $detailItem,
                    ['location.region', 'region', 'start_location.province', 'primary_location.province'],
                    null,
                ),
            ),
            'images' => $images,
            'pricing_unit' => $this->overrideValue($overrides, 'pricing_unit', 'PAR_PERSONNE'),
            'partner_price' => $manualPartnerPrice ?? (float) $this->overrideValue(
                $overrides,
                'partner_price',
                $price,
            ),
            'commission_rate' => 0.20,
            'currency' => strtoupper($this->stringValue($detail, ['currency'], 'EUR')),
            'payment_mode' => $paymentMode,
            'booking_mode' => in_array($bookingMode, ['INSTANT', 'REQUEST'], true)
                ? $bookingMode
                : 'REQUEST',
            'source_type' => 'EXTERNAL',
            'source_provider' => 'FAREHARBOR',
            'source_external_id' => $providerExternalId,
            'last_synced_at' => now(),
            'is_available' => (bool) $this->overrideValue(
                $overrides,
                'is_available',
                $existingService?->is_available ?? true,
            ),
            'featured' => (bool) $this->overrideValue($overrides, 'featured', $existingService?->featured ?? false),
            'video_url' => $this->overrideValue($overrides, 'video_url', $existingService?->video_url),
            'tags' => $tags,
            'extra_data' => [
                'activityType' => 'RANDONNEE',
                'duration' => $duration,
                'durationUnit' => $durationUnit,
                'difficulty' => 'TOUS_NIVEAUX',
                'physicalIntensity' => 'MODEREE',
                'minParticipants' => 1,
                'maxParticipants' => max(
                    1,
                    $this->intValue($detailItem, ['max_participants', 'maxParticipants'], 12),
                ),
                'minAgeYears' => max(
                    0,
                    $this->intValue($detailItem, ['minimum_age', 'minAge'], 0),
                ),
                'requiresMedicalClearance' => false,
                'equipmentProvided' => false,
                'included' => data_get($sourceFields, 'included', []),
                'notIncluded' => data_get($sourceFields, 'notIncluded', []),
                'meetingPoint' => data_get($sourceFields, 'meetingPoint'),
                'schedule' => [
                    'startTimes' => [],
                    'daysAvailable' => [],
                ],
                'languages' => $this->stringList($detailItem, ['languages']),
                'provider_content' => [
                    'provider' => 'FAREHARBOR',
                    'fields' => [
                        'headline' => $sourceFields['provider.headline'] ?? null,
                        'shortDescription' => $sourceFields['provider.shortDescription'] ?? null,
                    ],
                ],
                'groupType' => 'GROUPE_PARTAGE',
                'wandireo' => [
                    ...$wandireoData,
                    'attributes' => $wandireoAttributes,
                    'manual_partner_price' => $manualPartnerPrice,
                ],
                'fareharbor' => [
                    'company' => $company->company_slug,
                    'itemId' => $externalId,
                    'lastSeenInLatestSync' => true,
                    'lastSeenAt' => now()->toIso8601String(),
                    'bookingUrl' => $bookingUrl,
                    'bookingFlow' => 'LOCAL_WANDIREO',
                    'paymentCollection' => 'WANDIREO',
                    'isDepositRequired' => $priceContext['isDepositRequired'],
                    'depositAmount' => $priceContext['depositAmount'],
                    'depositAmountEur' => $priceContext['depositAmountEur'],
                    'processorCurrency' => $priceContext['processorCurrency'],
                    'priceStatus' => $priceContext['priceStatus'],
                    'headline' => $sourceFields['provider.headline'] ?? null,
                    'shortDescription' => $sourceFields['provider.shortDescription'] ?? null,
                    'meetingPoint' => data_get($sourceFields, 'meetingPoint'),
                    'duration' => sprintf('%d %s', $duration, strtolower($durationUnit)),
                    'images' => $images,
                    'calendarTimezone' => $this->stringValue(
                        $detailItem,
                        ['timezone', 'calendar_timezone'],
                        'Europe/Lisbon',
                    ),
                    'overrides' => $overrides,
                    'raw' => $detailItem,
                ],
                'translations' => [
                    ...$translationState,
                    'fields' => [
                        ...data_get($translationState, 'fields', []),
                        'title' => $titleTranslations,
                        'description' => $descriptionTranslations,
                        'meetingPoint' => $meetingPointTranslations,
                        'included' => $included,
                        'notIncluded' => $notIncluded,
                        'provider.headline' => $headlineTranslations,
                        'provider.shortDescription' => $shortDescriptionTranslations,
                    ],
                ],
            ],
        ];
    }

    public function assignCompanyPartner(FareHarborCompany $company): void
    {
        Service::query()
            ->where('source_provider', 'FAREHARBOR')
            ->where(function ($query) use ($company) {
                foreach ($this->companySlugAliases($company->company_slug) as $slug) {
                    $query->orWhereJsonContains('extra_data->fareharbor->company', $slug);
                }
            })
            ->update(['partner_id' => $company->partner_id]);

        $this->flushServicesCache();
    }

    private function providerExternalId(string $companySlug, string $itemId): string
    {
        return sprintf('%s:%s', $companySlug, $itemId);
    }

    private function normalizeItemPayload(array $payload): array
    {
        $item = Arr::get($payload, 'item');

        return is_array($item) ? $item : $payload;
    }

    private function extractItems(array $response): array
    {
        $candidates = [
            Arr::get($response, 'items', []),
            Arr::get($response, 'results', []),
            $response,
        ];

        foreach ($candidates as $candidate) {
            if (is_array($candidate) && $this->isList($candidate)) {
                return $candidate;
            }
        }

        return [];
    }

    private function extractItemId(array $item): ?string
    {
        foreach (['pk', 'id', 'item_id', 'itemId', 'uuid'] as $key) {
            $value = Arr::get($item, $key);

            if (is_string($value) || is_numeric($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    private function priceValue(array $detail, array $item): float
    {
        foreach ([
            Arr::get($detail, 'price'),
            Arr::get($detail, 'starting_price'),
            Arr::get($detail, 'adult_price'),
            Arr::get($item, 'price'),
            Arr::get($item, 'starting_price'),
        ] as $value) {
            if (is_numeric($value)) {
                $number = (float) $value;

                return $number > 1000 ? round($number / 100, 2) : round($number, 2);
            }
        }

        return 0.0;
    }

    /**
     * @return array{
     *   isDepositRequired: bool,
     *   depositAmount: ?float,
     *   depositAmountEur: ?float,
     *   processorCurrency: string,
     *   priceStatus: string
     * }
     */
    private function priceContext(array $detail, array $item, float $price): array
    {
        $rawDepositRequired = $this->firstNonNullValue(
            $detail,
            $item,
            [
                'is_deposit_required',
                'settings.is_deposit_required',
            ],
        );

        $depositRequired = filter_var(
            $rawDepositRequired,
            FILTER_VALIDATE_BOOL,
            FILTER_NULL_ON_FAILURE,
        );
        $isDepositRequired = $depositRequired ?? false;

        $processorCurrency = strtoupper($this->stringValue(
            $detail,
            ['processor_currency', 'currency', 'company.processor_currency'],
            $this->stringValue(
                $item,
                ['processor_currency', 'currency', 'company.processor_currency'],
                'EUR',
            ),
        ));

        $rawDepositOffset = $this->firstNonNullValue(
            $detail,
            $item,
            [
                'deposit_offset',
                'settings.deposit_offset',
            ],
        );

        $depositOffset = is_numeric($rawDepositOffset)
            ? (float) $rawDepositOffset
            : null;

        $depositAmount = $depositOffset !== null && $depositOffset > 0
            ? round($depositOffset / 100, 2)
            : null;

        $priceStatus = 'UNKNOWN';

        if ($price > 0) {
            $priceStatus = 'KNOWN';
        } elseif ($isDepositRequired && $depositAmount !== null) {
            $priceStatus = 'DEPOSIT_ONLY';
        }

        return [
            'isDepositRequired' => $isDepositRequired,
            'depositAmount' => $depositAmount,
            'depositAmountEur' => $processorCurrency === 'EUR' ? $depositAmount : null,
            'processorCurrency' => $processorCurrency,
            'priceStatus' => $priceStatus,
        ];
    }

    private function resolveWandireoData(array $existingExtraData): array
    {
        $wandireoData = is_array(data_get($existingExtraData, 'wandireo'))
            ? data_get($existingExtraData, 'wandireo')
            : [];

        if (! array_key_exists('attributes', $wandireoData)) {
            $legacyOverrideAttributes = data_get($existingExtraData, 'fareharbor.overrides.attributes');
            $legacyAttributes = data_get($existingExtraData, 'attributes');

            if (is_array($legacyOverrideAttributes)) {
                $wandireoData['attributes'] = $legacyOverrideAttributes;
            } elseif (is_array($legacyAttributes)) {
                $wandireoData['attributes'] = $legacyAttributes;
            } else {
                $wandireoData['attributes'] = [];
            }
        }

        if (! array_key_exists('manual_partner_price', $wandireoData)) {
            $legacyManualPrice = data_get($existingExtraData, 'fareharbor.overrides.partner_price');

            if (is_numeric($legacyManualPrice)) {
                $wandireoData['manual_partner_price'] = (float) $legacyManualPrice;
            }
        }

        return $wandireoData;
    }

    private function resolveManualPartnerPrice(array $wandireoData, array $overrides): ?float
    {
        $wandireoManualPrice = data_get($wandireoData, 'manual_partner_price');

        if (is_numeric($wandireoManualPrice)) {
            return round((float) $wandireoManualPrice, 2);
        }

        $legacyManualPrice = data_get($overrides, 'partner_price');

        if (is_numeric($legacyManualPrice)) {
            return round((float) $legacyManualPrice, 2);
        }

        return null;
    }

    private function firstNonNullValue(
        array $primary,
        array $fallback,
        array $paths,
    ): mixed {
        foreach ($paths as $path) {
            $value = Arr::get($primary, $path);

            if ($value !== null) {
                return $value;
            }
        }

        foreach ($paths as $path) {
            $value = Arr::get($fallback, $path);

            if ($value !== null) {
                return $value;
            }
        }

        return null;
    }

    private function imageList(array $detail, array $item): array
    {
        $rawImages = Arr::get($detail, 'images')
            ?? Arr::get($item, 'images')
            ?? [];

        if (! is_array($rawImages)) {
            return [];
        }

        $images = collect($rawImages)
            ->map(function (mixed $image): ?string {
                if (is_string($image) && $image !== '') {
                    return $image;
                }

                if (is_array($image)) {
                    foreach (['image_url', 'image_cdn_url', 'cropped_url', 'cropped_cdn_url', 'url', 'full', 'large', 'src'] as $key) {
                        $value = Arr::get($image, $key);

                        if (is_string($value) && $value !== '') {
                            return $value;
                        }
                    }
                }

                return null;
            })
            ->filter()
            ->values()
            ->all();

        return $images;
    }

    private function tagList(array $detail, array $item): array
    {
        $tags = $this->stringList($detail, ['tags', 'categories']);

        if ($tags !== []) {
            return $tags;
        }

        return $this->stringList($item, ['tags', 'categories']);
    }

    private function stringList(array $payload, array $keys): array
    {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);

            if (is_array($value)) {
                return collect($value)
                    ->map(fn (mixed $entry): string => is_scalar($entry) ? trim((string) $entry) : '')
                    ->filter()
                    ->values()
                    ->all();
            }
        }

        return [];
    }

    private function intValue(array $payload, array $keys, int $fallback): int
    {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);

            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return $fallback;
    }

    private function stringValue(
        array $payload,
        array $keys,
        ?string $fallback = '',
    ): ?string {
        foreach ($keys as $key) {
            $value = Arr::get($payload, $key);

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return $fallback;
    }

    private function overrideValue(array $overrides, string $key, mixed $fallback): mixed
    {
        return array_key_exists($key, $overrides) ? $overrides[$key] : $fallback;
    }

    /**
     * @param  array<string, mixed>  $existingTranslations
     * @return array<string, string>
     */
    private function localizedImportedText(
        mixed $value,
        array $existingTranslations,
        string $sourceLocale = 'en',
    ): array {
        $translations = $this->sanitizeTranslations($existingTranslations);

        if (is_array($value)) {
            return array_replace($translations, $this->sanitizeTranslations($value));
        }

        if (! is_string($value) || trim($value) === '') {
            return $translations;
        }

        $normalizedValue = trim($value);
        $legacyLocale = array_key_first($translations);

        if (
            count($translations) === 1
            && $legacyLocale !== null
            && $legacyLocale !== $sourceLocale
            && $translations[$legacyLocale] === $normalizedValue
        ) {
            unset($translations[$legacyLocale]);
        }

        $translations[$sourceLocale] = $normalizedValue;

        return $translations;
    }

    /**
     * @param  array<string, mixed>  $translations
     * @return array<string, string>
     */
    private function sanitizeTranslations(array $translations): array
    {
        $sanitized = [];

        foreach ($translations as $locale => $text) {
            if (! is_string($locale) || ! is_string($text)) {
                continue;
            }

            $normalizedLocale = strtolower(trim($locale));
            $normalizedText = trim($text);

            if ($normalizedLocale === '' || $normalizedText === '') {
                continue;
            }

            $sanitized[$normalizedLocale] = $normalizedText;
        }

        return $sanitized;
    }

    /**
     * @return string[]
     */
    private function companySlugAliases(string $companySlug): array
    {
        if (in_array($companySlug, ['momentosdinaminos', 'momentosdinamicos'], true)) {
            return ['momentosdinamicos', 'momentosdinaminos'];
        }

        return [$companySlug];
    }

    private function durationValue(array $detail, array $item): array
    {
        foreach ([
            Arr::get($detail, 'duration_minutes'),
            Arr::get($detail, 'durationMinutes'),
            Arr::get($item, 'duration_minutes'),
        ] as $value) {
            if (is_numeric($value)) {
                $minutes = max(1, (int) $value);

                if ($minutes % 60 === 0) {
                    return [max(1, (int) ($minutes / 60)), 'HEURES'];
                }

                return [$minutes, 'MINUTES'];
            }
        }

        $rawDuration = $this->stringValue($detail, ['duration', 'duration_label']);

        if ($rawDuration !== null && preg_match('/(\d+)/', $rawDuration, $matches) === 1) {
            $number = max(1, (int) $matches[1]);

            if (str_contains(strtolower($rawDuration), 'hour') || str_contains(strtolower($rawDuration), 'heure')) {
                return [$number, 'HEURES'];
            }

            if (str_contains(strtolower($rawDuration), 'day') || str_contains(strtolower($rawDuration), 'jour')) {
                return [$number, 'JOURS'];
            }

            return [$number, 'MINUTES'];
        }

        return [60, 'MINUTES'];
    }

    private function isList(array $value): bool
    {
        return array_keys($value) === range(0, count($value) - 1);
    }

    private function touchCalendarSync(
        Service $service,
        string $status,
        ?string $error,
    ): void {
        ServiceCalendarSync::query()->updateOrCreate(
            [
                'service_id' => $service->id,
                'provider' => 'FAREHARBOR',
            ],
            [
                'import_url' => null,
                'last_synced_at' => now(),
                'last_status' => $status,
                'imported_events_count' => 0,
                'last_error' => $error,
            ],
        );
    }

    private function flushServicesCache(): void
    {
        Cache::flush();
    }
}
