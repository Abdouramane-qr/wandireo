<?php

namespace App\Support;

use App\Services\PartnerContent\PartnerContentProviderRegistry;
use Illuminate\Support\Arr;

class ServiceExtraDataLocalizer
{
    /**
     * @param  array<string, mixed>  $extraData
     * @return array<string, mixed>
     */
    public static function localize(array $extraData): array
    {
        /** @var PartnerContentProviderRegistry $providers */
        $providers = app(PartnerContentProviderRegistry::class);
        $translations = is_array(data_get($extraData, 'translations.fields'))
            ? data_get($extraData, 'translations.fields')
            : [];
        $provider = data_get($extraData, 'translations.provider')
            ?? data_get($extraData, 'provider_content.provider');
        $overrides = $providers->overrides($extraData, is_string($provider) ? $provider : null);
        $resolvedFields = [];

        foreach ($providers->stringFields(is_string($provider) ? $provider : null) as $field => $config) {
            $resolvedFields[$field] = self::resolveLocalizedString(
                data_get($overrides, $config['override_path']),
                $translations[$field] ?? null,
                data_get($extraData, $config['target_path']),
            );

            if ($resolvedFields[$field] !== null) {
                data_set($extraData, $config['target_path'], $resolvedFields[$field]);
            }
        }

        foreach ($providers->listFields(is_string($provider) ? $provider : null) as $field => $config) {
            $resolvedFields[$field] = self::resolveLocalizedList(
                data_get($overrides, $config['override_path']),
                $translations[$field] ?? null,
                data_get($extraData, $config['target_path'], []),
            );

            data_set($extraData, $config['target_path'], $resolvedFields[$field]);
        }

        $extraData['meetingPoint'] = is_string($resolvedFields['meetingPoint'] ?? null)
            ? $resolvedFields['meetingPoint']
            : '';
        $extraData['included'] = is_array($resolvedFields['included'] ?? null) ? $resolvedFields['included'] : [];
        $extraData['notIncluded'] = is_array($resolvedFields['notIncluded'] ?? null) ? $resolvedFields['notIncluded'] : [];

        return $providers->hydrateExtraData(
            $extraData,
            is_string($provider) ? $provider : null,
            $resolvedFields,
        );
    }

    /**
     * @param  array<string, mixed>|string|null  $override
     * @param  array<string, string>|null  $translations
     */
    private static function resolveLocalizedString(
        mixed $override,
        ?array $translations,
        mixed $fallback,
    ): ?string {
        $resolved = self::resolveLocalizedMapValue($override);

        if (is_string($resolved) && $resolved !== '') {
            return $resolved;
        }

        $resolved = self::resolveLocalizedMapValue($translations);

        if (is_string($resolved) && $resolved !== '') {
            return $resolved;
        }

        return is_string($fallback) && trim($fallback) !== '' ? trim($fallback) : null;
    }

    /**
     * @param  array<string, array<int, string>>|array<int, string>|null  $translations
     * @return array<int, string>
     */
    private static function resolveLocalizedList(
        mixed $override,
        mixed $translations,
        mixed $fallback,
    ): array {
        $resolved = self::resolveLocalizedMapValue($override);

        if (is_array($resolved) && array_is_list($resolved)) {
            return self::normalizeList($resolved);
        }

        $resolved = self::resolveLocalizedMapValue($translations);

        if (is_array($resolved) && array_is_list($resolved)) {
            return self::normalizeList($resolved);
        }

        return self::normalizeList($fallback);
    }

    private static function resolveLocalizedMapValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (array_is_list($value)) {
            return $value;
        }

        $locale = app()->getLocale();
        $fallbackLocale = Locale::fallback();

        return $value[$locale]
            ?? $value[$fallbackLocale]
            ?? $value['fr']
            ?? Arr::first($value);
    }

    /**
     * @return array<int, string>
     */
    private static function normalizeList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(fn (mixed $entry): string => is_scalar($entry) ? trim((string) $entry) : '')
            ->filter()
            ->values()
            ->all();
    }
}
