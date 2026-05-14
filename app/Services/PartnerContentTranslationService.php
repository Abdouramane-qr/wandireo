<?php

namespace App\Services;

use App\Models\Service;
use App\Services\FastTranslate\FastTranslateClient;
use App\Services\PartnerContent\PartnerContentProviderRegistry;
use App\Support\Locale;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PartnerContentTranslationService
{
    private const VERSION = 1;
    private const REQUIRED_TRANS_FIELDS = ['title', 'description'];
    private const TITLE_SOURCE_MATCH_ALLOWLIST = [
        'banana',
        'jet ski',
        'kayak',
    ];

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
            && $this->shouldReuseExistingState($normalizedFields, $existingState, $sourceHash)
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
     * @return array{
     *   provider: string,
     *   issues: array<int, string>,
     *   blocking_issues: array<int, string>,
     *   warning_issues: array<int, string>,
     *   source_locale: string|null,
     *   status: string|null
     * }
     */
    public function auditServiceTranslations(Service $service): array
    {
        $extraData = is_array($service->extra_data) ? $service->extra_data : [];
        $translationState = is_array(data_get($extraData, 'translations'))
            ? data_get($extraData, 'translations')
            : [];
        $provider = strtoupper((string) ($service->source_provider ?: data_get($translationState, 'provider', '')));
        $sourceLocale = Locale::normalize((string) data_get($translationState, 'source_locale', ''));
        $status = is_string(data_get($translationState, 'status')) ? (string) data_get($translationState, 'status') : null;
        $sourceFields = $this->extractServiceSourceFields($service);
        $blockingIssues = [];
        $warningIssues = [];

        if ($translationState === []) {
            $blockingIssues[] = 'missing_translation_state';
        }

        if ($sourceLocale === null) {
            $blockingIssues[] = 'missing_source_locale';
        }

        if (! is_string(data_get($translationState, 'source_hash')) || trim((string) data_get($translationState, 'source_hash')) === '') {
            $blockingIssues[] = 'missing_source_hash';
        }

        if ($status !== null && $status !== 'READY') {
            $blockingIssues[] = 'translation_status_' . strtolower($status);
        }

        foreach (self::REQUIRED_TRANS_FIELDS as $field) {
            $translations = $field === 'title'
                ? $service->getTranslations('title')
                : $service->getTranslations('description');

            if (! isset($translations['fr']) || ! is_string($translations['fr']) || trim($translations['fr']) === '') {
                $blockingIssues[] = "missing_fr_{$field}";
            }

            if ($sourceLocale !== null && $sourceLocale !== 'fr') {
                $sourceValue = $translations[$sourceLocale] ?? null;
                $frenchValue = $translations['fr'] ?? null;

                if (
                    is_string($sourceValue)
                    && is_string($frenchValue)
                    && trim($sourceValue) !== ''
                    && trim($frenchValue) !== ''
                    && trim($sourceValue) === trim($frenchValue)
                    && ! $this->isAllowedFrenchSourceMatch($field, $sourceValue)
                ) {
                    $warningIssues[] = "fr_matches_source_{$field}";
                }
            }
        }

        foreach ($this->providers->stringFields($provider) as $field => $config) {
            if (! array_key_exists($field, $sourceFields)) {
                continue;
            }

            $fieldTranslations = $this->translationField($translationState, $field);

            if (! is_array($fieldTranslations)) {
                $blockingIssues[] = "missing_field_{$field}";
            }
        }

        foreach ($this->providers->listFields($provider) as $field => $config) {
            if (! array_key_exists($field, $sourceFields)) {
                continue;
            }

            $fieldTranslations = $this->translationField($translationState, $field);

            if (! is_array($fieldTranslations)) {
                $blockingIssues[] = "missing_field_{$field}";
            }
        }

        $blockingIssues = array_values(array_unique($blockingIssues));
        $warningIssues = array_values(array_unique($warningIssues));

        return [
            'provider' => $provider,
            'issues' => [...$blockingIssues, ...$warningIssues],
            'blocking_issues' => $blockingIssues,
            'warning_issues' => $warningIssues,
            'source_locale' => $sourceLocale,
            'status' => $status,
        ];
    }

    public function serviceHasIncompleteTranslations(Service $service): bool
    {
        return $this->auditServiceTranslations($service)['blocking_issues'] !== [];
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
                $this->existingStringFieldTranslation($existingFields, $field, $targetLocale),
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
                    $this->existingListFieldTranslation($existingFields, $field, $targetLocale, $index),
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
        $existingTranslation = $this->normalizeString($existingFallback);

        if (! $this->client->isEnabled()) {
            if ($this->canReuseExistingTranslation($targetLocale, $existingTranslation)) {
                return $existingTranslation;
            }

            $errors[] = [
                'field' => $field,
                'locale' => $targetLocale,
                'message' => 'Translation client disabled.',
            ];

            return $existingTranslation ?? $value;
        }

        try {
            return $this->client->translate($value, $sourceLocale, $targetLocale);
        } catch (\Throwable $exception) {
            if ($this->canReuseExistingTranslation($targetLocale, $existingTranslation)) {
                Log::warning('Partner content translation failed and reused the previous translation.', [
                    'field' => $field,
                    'target_locale' => $targetLocale,
                    'message' => $exception->getMessage(),
                ]);

                return $existingTranslation;
            }

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

            return $existingTranslation ?? $value;
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

    private function translationField(array $translationState, string $field): mixed
    {
        $fields = data_get($translationState, 'fields');

        if (! is_array($fields)) {
            return null;
        }

        return $fields[$field] ?? null;
    }

    private function existingStringFieldTranslation(array $existingFields, string $field, string $targetLocale): mixed
    {
        $translations = $existingFields[$field] ?? null;

        if (! is_array($translations)) {
            return null;
        }

        return $translations[$targetLocale] ?? null;
    }

    private function existingListFieldTranslation(
        array $existingFields,
        string $field,
        string $targetLocale,
        int $index,
    ): mixed {
        $translations = $existingFields[$field] ?? null;

        if (! is_array($translations)) {
            return null;
        }

        $localeValues = $translations[$targetLocale] ?? null;

        if (! is_array($localeValues)) {
            return null;
        }

        return $localeValues[$index] ?? null;
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

    /**
     * @param  array<string, mixed>  $normalizedFields
     * @param  array<string, mixed>  $existingState
     */
    private function shouldReuseExistingState(
        array $normalizedFields,
        array $existingState,
        string $sourceHash,
    ): bool {
        if ($sourceHash !== (string) data_get($existingState, 'source_hash')) {
            return false;
        }

        $existingFields = data_get($existingState, 'fields');

        if (! is_array($existingFields)) {
            return false;
        }

        $sourceLocale = Locale::normalize((string) data_get($existingState, 'source_locale', ''))
            ?? $this->detectSourceLocale($normalizedFields, []);

        foreach ($normalizedFields as $field => $value) {
            $translations = $existingFields[$field] ?? null;

            if (is_string($value)) {
                if (! $this->stringFieldStateLooksReusable($field, $value, $sourceLocale, $translations)) {
                    return false;
                }

                continue;
            }

            if (is_array($value) && ! $this->listFieldStateLooksReusable($value, $sourceLocale, $translations)) {
                return false;
            }
        }

        return true;
    }

    private function stringFieldStateLooksReusable(
        string $field,
        string $sourceValue,
        string $sourceLocale,
        mixed $translations,
    ): bool {
        if (! is_array($translations)) {
            return false;
        }

        foreach (Locale::supported() as $targetLocale) {
            $translatedValue = $translations[$targetLocale] ?? null;

            if (! is_string($translatedValue) || trim($translatedValue) === '') {
                return false;
            }

            if ($targetLocale === $sourceLocale && trim($translatedValue) !== $sourceValue) {
                return false;
            }

            if (
                $targetLocale !== $sourceLocale
                && in_array($field, self::REQUIRED_TRANS_FIELDS, true)
                && $this->looksLikeUntranslatedCopy($sourceValue, $translatedValue)
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, string>  $sourceValues
     */
    private function listFieldStateLooksReusable(
        array $sourceValues,
        string $sourceLocale,
        mixed $translations,
    ): bool {
        if (! is_array($translations)) {
            return false;
        }

        foreach (Locale::supported() as $targetLocale) {
            $translatedValues = $translations[$targetLocale] ?? null;

            if (! is_array($translatedValues)) {
                return false;
            }

            if ($targetLocale === $sourceLocale && $translatedValues !== $sourceValues) {
                return false;
            }
        }

        return true;
    }

    private function looksLikeUntranslatedCopy(string $sourceValue, string $translatedValue): bool
    {
        $normalizedSource = trim($sourceValue);
        $normalizedTranslated = trim($translatedValue);

        if ($normalizedSource === '' || $normalizedTranslated === '') {
            return false;
        }

        if ($normalizedSource !== $normalizedTranslated) {
            return false;
        }

        return mb_strlen($normalizedSource) >= 20
            || preg_match('/\s/u', $normalizedSource) === 1;
    }

    private function canReuseExistingTranslation(string $targetLocale, ?string $existingTranslation): bool
    {
        return $existingTranslation !== null && $targetLocale !== 'fr';
    }

    private function isAllowedFrenchSourceMatch(string $field, string $value): bool
    {
        if ($field !== 'title') {
            return false;
        }

        $normalized = Str::of($value)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->squish()
            ->value();

        return in_array($normalized, self::TITLE_SOURCE_MATCH_ALLOWLIST, true);
    }
}
