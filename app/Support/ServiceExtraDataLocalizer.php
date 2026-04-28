<?php

namespace App\Support;

use Illuminate\Support\Arr;

class ServiceExtraDataLocalizer
{
    /**
     * @param  array<string, mixed>  $extraData
     * @return array<string, mixed>
     */
    public static function localize(array $extraData): array
    {
        $translations = is_array(data_get($extraData, 'translations.fields'))
            ? data_get($extraData, 'translations.fields')
            : [];
        $overrides = is_array(data_get($extraData, 'fareharbor.overrides'))
            ? data_get($extraData, 'fareharbor.overrides')
            : [];

        $meetingPoint = self::resolveLocalizedString(
            $overrides['meetingPoint'] ?? null,
            $translations['meetingPoint'] ?? null,
            data_get($extraData, 'meetingPoint'),
        );
        $included = self::resolveLocalizedList(
            $overrides['included'] ?? null,
            $translations['included'] ?? null,
            data_get($extraData, 'included', []),
        );
        $notIncluded = self::resolveLocalizedList(
            $overrides['notIncluded'] ?? null,
            $translations['notIncluded'] ?? null,
            data_get($extraData, 'notIncluded', []),
        );
        $headline = self::resolveLocalizedString(
            data_get($overrides, 'fareharbor.headline'),
            $translations['fareharbor.headline'] ?? null,
            data_get($extraData, 'fareharbor.headline'),
        );
        $shortDescription = self::resolveLocalizedString(
            data_get($overrides, 'fareharbor.shortDescription'),
            $translations['fareharbor.shortDescription'] ?? null,
            data_get($extraData, 'fareharbor.shortDescription'),
        );

        $extraData['meetingPoint'] = $meetingPoint ?? '';
        $extraData['included'] = $included;
        $extraData['notIncluded'] = $notIncluded;

        if ($meetingPoint !== null) {
            data_set($extraData, 'fareharbor.meetingPoint', $meetingPoint);
        }

        if ($headline !== null) {
            data_set($extraData, 'fareharbor.headline', $headline);
        }

        if ($shortDescription !== null) {
            data_set($extraData, 'fareharbor.shortDescription', $shortDescription);
        }

        return $extraData;
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
