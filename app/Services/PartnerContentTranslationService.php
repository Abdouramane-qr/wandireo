<?php

namespace App\Services;

use App\Models\Service;
use App\Services\FastTranslate\FastTranslateClient;
use App\Services\PartnerContent\PartnerContentProviderRegistry;
use App\Support\Locale;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class PartnerContentTranslationService
{
    private const VERSION = 1;

    public function __construct(
        private readonly FastTranslateClient $client,
        private readonly PartnerContentProviderRegistry $providers,
    ) {
    }

    /**
     * @param  array<string, mixed>  $sourceFields
     * @param  array<string, mixed>  $existingState
     * @return array<string, mixed>
     */
    public function buildTranslationState(
        string $provider,
        array $sourceFields,
        array $existingState = [],
        bool $force = false,
    ): array {
        $normalizedFields = $this->normalizeSourceFields($sourceFields);
        $sourceHash = hash(
            'sha256',
            json_encode($normalizedFields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}',
        );

        if (
            ! $force
            && $sourceHash === (string) data_get($existingState, 'source_hash')
            && is_array(data_get($existingState, 'fields'))
        ) {
            return $existingState;
        }

        $sourceLocale = $this->detectSourceLocale($normalizedFields, $existingState);
        $existingFields = is_array(data_get($existingState, 'fields'))
            ? data_get($existingState, 'fields')
            : [];
        $errors = [];
        $translatedFields = [];

        foreach ($normalizedFields as $field => $value) {
            if (is_string($value)) {
                $translatedFields[$field] = $this->translateStringField(
                    $field,
                    $value,
                    $sourceLocale,
                    $existingFields,
                    $errors,
                );

                continue;
            }

            if (is_array($value)) {
                $translatedFields[$field] = $this->translateListField(
                    $field,
                    $value,
                    $sourceLocale,
                    $existingFields,
                    $errors,
                );
            }
        }

        return [
            'provider' => strtoupper($provider),
            'version' => self::VERSION,
            'status' => $errors === [] ? 'READY' : 'PARTIAL',
            'source_locale' => $sourceLocale,
            'source_hash' => $sourceHash,
            'generated_at' => now()->toIso8601String(),
            'fields' => $translatedFields,
            'errors' => $errors,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function extractServiceSourceFields(Service $service): array
    {
        $extraData = is_array($service->extra_data) ? $service->extra_data : [];
        $translationState = is_array(data_get($extraData, 'translations'))
            ? data_get($extraData, 'translations')
            : [];
        $provider = (string) data_get($translationState, 'provider', $service->source_provider);
        $sourceLocale = (string) data_get($translationState, 'source_locale', '');
        $titleTranslations = $service->getTranslations('title');
        $descriptionTranslations = $service->getTranslations('description');
        $providerFields = is_array(data_get($extraData, 'provider_content.fields'))
            ? data_get($extraData, 'provider_content.fields')
            : [];
        $normalizedProviderFields = [];

        foreach ($providerFields as $key => $value) {
            if (! is_string($key) || trim($key) === '') {
                continue;
            }

            $normalizedProviderFields['provider.' . trim($key)] = $value;
        }

        return $this->normalizeSourceFields([
            'title' => $this->resolveLocalizedValue($titleTranslations, $sourceLocale),
            'description' => $this->resolveLocalizedValue($descriptionTranslations, $sourceLocale),
            'meetingPoint' => data_get($extraData, 'fareharbor.meetingPoint')
                ?? data_get($extraData, 'meetingPoint'),
            'included' => data_get($extraData, 'included', []),
            'notIncluded' => data_get($extraData, 'notIncluded', []),
            ...$this->providers->legacySourceFields($extraData, $provider),
            ...$normalizedProviderFields,
        ]);
    }

    /**
     * @param  array<string, mixed>  $fields
     * @return array<string, mixed>
     */
    public function normalizeSourceFields(array $fields): array
    {
        $normalized = [];

        foreach ($fields as $field => $value) {
            if (! is_string($field) || trim($field) === '') {
                continue;
            }

            $normalizedValue = is_array($value)
                ? $this->normalizeStringList($value)
                : $this->normalizeString($value);

            if ($normalizedValue === null) {
                continue;
            }

            if (is_array($normalizedValue) && $normalizedValue === []) {
                continue;
            }

            $normalized[$field] = $normalizedValue;
        }

        return $normalized;
    }

    /**
     * @param  array<string, string>  $translations
     * @return array<string, string>
     */
    public function applyStringOverrides(array $translations, mixed $override): array
    {
        foreach ($this->normalizeLocalizedStringMap($override) as $locale => $value) {
            $translations[$locale] = $value;
        }

        return $translations;
    }

    /**
     * @param  array<string, array<int, string>>  $translations
     * @return array<string, array<int, string>>
     */
    public function applyListOverrides(array $translations, mixed $override): array
    {
        foreach ($this->normalizeLocalizedListMap($override) as $locale => $value) {
            $translations[$locale] = $value;
        }

        return $translations;
    }

    /**
     * @return array<string, string>
     */
    public function normalizeLocalizedStringMap(mixed $value): array
    {
        if (is_string($value)) {
            $normalized = $this->normalizeString($value);

            return $normalized === null
                ? []
                : [app()->getLocale() => $normalized];
        }

        if (! is_array($value)) {
            return [];
        }

        $localized = [];

        foreach ($value as $locale => $translation) {
            $normalizedLocale = Locale::normalize(is_string($locale) ? $locale : null);
            $normalizedValue = $this->normalizeString($translation);

            if ($normalizedLocale === null || $normalizedValue === null) {
                continue;
            }

            $localized[$normalizedLocale] = $normalizedValue;
        }

        return $localized;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function normalizeLocalizedListMap(mixed $value): array
    {
        if ($this->isList($value)) {
            $normalized = $this->normalizeStringList($value);

            return $normalized === []
                ? []
                : [app()->getLocale() => $normalized];
        }

        if (! is_array($value)) {
            return [];
        }

        $localized = [];

        foreach ($value as $locale => $translations) {
            $normalizedLocale = Locale::normalize(is_string($locale) ? $locale : null);
            $normalizedValue = $this->normalizeStringList($translations);

            if ($normalizedLocale === null || $normalizedValue === []) {
                continue;
            }

            $localized[$normalizedLocale] = $normalizedValue;
        }

        return $localized;
    }

    /**
     * @param  array<string, mixed>  $existingState
     */
    private function detectSourceLocale(array $fields, array $existingState): string
    {
        $seedText = collect($fields)
            ->flatMap(function (mixed $value): array {
                if (is_string($value)) {
                    return [$value];
                }

                if (is_array($value)) {
                    return $value;
                }

                return [];
            })
            ->filter(fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->implode("\n");

        if ($seedText === '') {
            return (string) data_get($existingState, 'source_locale', 'en');
        }

        if (! $this->client->isEnabled()) {
            return (string) data_get($existingState, 'source_locale', 'en');
        }

        try {
            $detectedLocale = Locale::normalize($this->client->detectLanguage($seedText)['language'] ?? null);

            return $detectedLocale ?? 'en';
        } catch (\Throwable $exception) {
            Log::warning('Partner content language detection failed.', [
                'message' => $exception->getMessage(),
            ]);

            return (string) data_get($existingState, 'source_locale', 'en');
        }
    }

    /**
     * @param  array<string, mixed>  $existingFields
     * @param  array<int, array<string, string>>  $errors
     * @return array<string, string>
     */
    private function translateStringField(
        string $field,
        string $value,
        string $sourceLocale,
        array $existingFields,
        array &$errors,
    ): array {
        $translations = [];

        foreach (Locale::supported() as $targetLocale) {
            if ($targetLocale === $sourceLocale) {
                $translations[$targetLocale] = $value;

                continue;
            }

            $translations[$targetLocale] = $this->translateText(
                $field,
                $value,
                $sourceLocale,
                $targetLocale,
                data_get($existingFields, "{$field}.{$targetLocale}"),
                $errors,
            );
        }

        if (! array_key_exists($sourceLocale, $translations)) {
            $translations[$sourceLocale] = $value;
        }

        return $translations;
    }

    /**
     * @param  array<int, string>  $values
     * @param  array<string, mixed>  $existingFields
     * @param  array<int, array<string, string>>  $errors
     * @return array<string, array<int, string>>
     */
    private function translateListField(
        string $field,
        array $values,
        string $sourceLocale,
        array $existingFields,
        array &$errors,
    ): array {
        $translations = [];

        foreach (Locale::supported() as $targetLocale) {
            if ($targetLocale === $sourceLocale) {
                $translations[$targetLocale] = $values;

                continue;
            }

            $translatedValues = [];

            foreach ($values as $index => $value) {
                $translatedValues[] = $this->translateText(
                    "{$field}.{$index}",
                    $value,
                    $sourceLocale,
                    $targetLocale,
                    data_get($existingFields, "{$field}.{$targetLocale}.{$index}"),
                    $errors,
                );
            }

            $translations[$targetLocale] = $translatedValues;
        }

        if (! array_key_exists($sourceLocale, $translations)) {
            $translations[$sourceLocale] = $values;
        }

        return $translations;
    }

    /**
     * @param  array<int, array<string, string>>  $errors
     */
    private function translateText(
        string $field,
        string $value,
        string $sourceLocale,
        string $targetLocale,
        mixed $existingFallback,
        array &$errors,
    ): string {
        if (! $this->client->isEnabled()) {
            $errors[] = [
                'field' => $field,
                'locale' => $targetLocale,
                'message' => 'Translation client disabled.',
            ];

            return is_string($existingFallback) && trim($existingFallback) !== ''
                ? trim($existingFallback)
                : $value;
        }

        try {
            return $this->client->translate($value, $sourceLocale, $targetLocale);
        } catch (\Throwable $exception) {
            Log::warning('Partner content translation failed.', [
                'field' => $field,
                'target_locale' => $targetLocale,
                'message' => $exception->getMessage(),
            ]);

            $errors[] = [
                'field' => $field,
                'locale' => $targetLocale,
                'message' => mb_strimwidth($exception->getMessage(), 0, 250, '...'),
            ];

            return is_string($existingFallback) && trim($existingFallback) !== ''
                ? trim($existingFallback)
                : $value;
        }
    }

    private function normalizeString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $normalized = trim($value);

        return $normalized === '' ? null : $normalized;
    }

    /**
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
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

    /**
     * @param  array<string, string>  $translations
     */
    private function resolveLocalizedValue(array $translations, string $locale): ?string
    {
        $normalizedLocale = Locale::normalize($locale);

        return $translations[$normalizedLocale]
            ?? $translations[Locale::fallback()]
            ?? $translations['fr']
            ?? Arr::first($translations);
    }

    private function isList(mixed $value): bool
    {
        return is_array($value) && array_is_list($value);
    }
}
