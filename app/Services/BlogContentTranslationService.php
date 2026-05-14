<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Services\FastTranslate\FastTranslateClient;
use App\Support\Locale;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BlogContentTranslationService
{
    private const VERSION = 1;

    public function __construct(
        private readonly FastTranslateClient $client,
    ) {
    }

    /**
     * @param  array<string, string>  $sourceFields
     * @param  array<string, array<string, string>>  $currentTranslations
     * @param  array<string, mixed>  $existingState
     * @return array{
     *   state: array<string, mixed>,
     *   translations: array<string, array<string, string>>
     * }
     */
    public function prepareTranslations(
        array $sourceFields,
        array $currentTranslations,
        array $existingState = [],
        bool $force = false,
    ): array {
        $normalizedSourceFields = $this->normalizeSourceFields($sourceFields);
        $normalizedCurrentTranslations = $this->normalizeCurrentTranslations($currentTranslations);
        $sourceHash = hash(
            'sha256',
            json_encode($normalizedSourceFields, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}',
        );
        $existingGeneratedFields = $this->normalizeGeneratedFields(data_get($existingState, 'fields', []));
        $hashChanged = $force
            || $sourceHash !== (string) data_get($existingState, 'source_hash')
            || $existingGeneratedFields === [];
        $sourceLocale = $this->resolveSourceLocale(
            $normalizedSourceFields,
            $existingState,
            $hashChanged,
        );

        [$generatedFields, $errors] = $hashChanged
            ? $this->generateFields($normalizedSourceFields, $sourceLocale)
            : [$existingGeneratedFields, []];

        $resolvedTranslations = [];

        foreach (array_keys($normalizedSourceFields) as $field) {
            $resolvedTranslations[$field] = $this->mergeFieldTranslations(
                $normalizedCurrentTranslations[$field] ?? [],
                $generatedFields[$field] ?? [],
                $existingGeneratedFields[$field] ?? [],
                $sourceLocale,
                $normalizedSourceFields[$field] ?? '',
                $force,
            );
        }

        return [
            'state' => [
                'provider' => 'BLOG',
                'version' => self::VERSION,
                'status' => ! $this->client->isEnabled()
                    ? 'DISABLED'
                    : ($errors === [] ? 'READY' : 'PARTIAL'),
                'source_locale' => $sourceLocale,
                'source_hash' => $sourceHash,
                'generated_at' => now()->toIso8601String(),
                'fields' => $generatedFields,
                'errors' => $errors,
            ],
            'translations' => $resolvedTranslations,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function extractSourceFields(BlogPost $post, array $existingState = []): array
    {
        $sourceLocale = $this->preferredSourceLocale(
            $post->getTranslations('title'),
            (string) data_get($existingState, 'source_locale', ''),
        );

        return $this->normalizeSourceFields([
            'title' => $this->resolveLocalizedValue($post->getTranslations('title'), $sourceLocale),
            'excerpt' => $this->resolveLocalizedValue($post->getTranslations('excerpt'), $sourceLocale),
            'content' => $this->resolveLocalizedValue($post->getTranslations('content'), $sourceLocale),
        ]);
    }

    /**
     * @param  array<string, mixed>  $fields
     * @return array<string, string>
     */
    public function normalizeSourceFields(array $fields): array
    {
        return [
            'title' => $this->normalizeString($fields['title'] ?? null) ?? '',
            'excerpt' => $this->normalizeString($fields['excerpt'] ?? null) ?? '',
            'content' => $this->normalizeString($fields['content'] ?? null) ?? '',
        ];
    }

    /**
     * @param  array<string, mixed>  $translations
     * @return array<string, string>
     */
    public function normalizeTranslationMap(array $translations): array
    {
        $normalized = [];

        foreach ($translations as $locale => $value) {
            $normalizedLocale = Locale::normalize(is_string($locale) ? $locale : null);
            $normalizedValue = $this->normalizeString($value);

            if ($normalizedLocale === null || $normalizedValue === null) {
                continue;
            }

            $normalized[$normalizedLocale] = $normalizedValue;
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $currentTranslations
     * @return array<string, array<string, string>>
     */
    private function normalizeCurrentTranslations(array $currentTranslations): array
    {
        return [
            'title' => $this->normalizeTranslationMap(
                is_array($currentTranslations['title'] ?? null) ? $currentTranslations['title'] : [],
            ),
            'excerpt' => $this->normalizeTranslationMap(
                is_array($currentTranslations['excerpt'] ?? null) ? $currentTranslations['excerpt'] : [],
            ),
            'content' => $this->normalizeTranslationMap(
                is_array($currentTranslations['content'] ?? null) ? $currentTranslations['content'] : [],
            ),
        ];
    }

    /**
     * @param  array<string, mixed>  $generatedFields
     * @return array<string, array<string, string>>
     */
    private function normalizeGeneratedFields(array $generatedFields): array
    {
        return [
            'title' => $this->normalizeTranslationMap(
                is_array($generatedFields['title'] ?? null) ? $generatedFields['title'] : [],
            ),
            'excerpt' => $this->normalizeTranslationMap(
                is_array($generatedFields['excerpt'] ?? null) ? $generatedFields['excerpt'] : [],
            ),
            'content' => $this->normalizeTranslationMap(
                is_array($generatedFields['content'] ?? null) ? $generatedFields['content'] : [],
            ),
        ];
    }

    /**
     * @param  array<string, mixed>  $existingState
     */
    private function resolveSourceLocale(
        array $sourceFields,
        array $existingState,
        bool $hashChanged,
    ): string {
        $existingSourceLocale = Locale::normalize((string) data_get($existingState, 'source_locale', ''));

        if (! $hashChanged && $existingSourceLocale !== null) {
            return $existingSourceLocale;
        }

        $seedText = collect($sourceFields)
            ->filter(fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->implode("\n");

        if ($seedText === '') {
            return $existingSourceLocale ?? 'fr';
        }

        if (! $this->client->isEnabled()) {
            return $existingSourceLocale ?? 'fr';
        }

        try {
            $detectedLocale = Locale::normalize($this->client->detectLanguage($seedText)['language'] ?? null);

            return $detectedLocale ?? $existingSourceLocale ?? 'fr';
        } catch (\Throwable $exception) {
            Log::warning('Blog content language detection failed.', [
                'message' => $exception->getMessage(),
            ]);

            return $existingSourceLocale ?? 'fr';
        }
    }

    /**
     * @return array{0: array<string, array<string, string>>, 1: array<int, array<string, string>>}
     */
    private function generateFields(array $sourceFields, string $sourceLocale): array
    {
        $errors = [];
        $generatedFields = [];

        foreach ($sourceFields as $field => $value) {
            $generatedFields[$field] = [];

            foreach (Locale::supported() as $targetLocale) {
                if ($targetLocale === $sourceLocale) {
                    $generatedFields[$field][$targetLocale] = $value;

                    continue;
                }

                if ($value === '') {
                    continue;
                }

                if (! $this->client->isEnabled()) {
                    continue;
                }

                try {
                    $generatedFields[$field][$targetLocale] = $this->client->translate(
                        $value,
                        $sourceLocale,
                        $targetLocale,
                    );
                } catch (\Throwable $exception) {
                    Log::warning('Blog content translation failed.', [
                        'field' => $field,
                        'target_locale' => $targetLocale,
                        'message' => $exception->getMessage(),
                    ]);

                    $errors[] = [
                        'field' => $field,
                        'locale' => $targetLocale,
                        'message' => Str::limit($exception->getMessage(), 250),
                    ];
                }
            }
        }

        return [$generatedFields, $errors];
    }

    /**
     * @param  array<string, string>  $currentFieldTranslations
     * @param  array<string, string>  $generatedFieldTranslations
     * @param  array<string, string>  $previousGeneratedFieldTranslations
     * @return array<string, string>
     */
    private function mergeFieldTranslations(
        array $currentFieldTranslations,
        array $generatedFieldTranslations,
        array $previousGeneratedFieldTranslations,
        string $sourceLocale,
        string $sourceValue,
        bool $force,
    ): array {
        $resolvedTranslations = $currentFieldTranslations;
        $resolvedTranslations[$sourceLocale] = $sourceValue;

        foreach (Locale::supported() as $locale) {
            if ($locale === $sourceLocale) {
                continue;
            }

            $generatedTranslation = $generatedFieldTranslations[$locale] ?? null;

            if ($generatedTranslation === null) {
                continue;
            }

            $currentTranslation = $currentFieldTranslations[$locale] ?? null;
            $previousGeneratedTranslation = $previousGeneratedFieldTranslations[$locale] ?? null;
            $shouldReplace = $force
                || $currentTranslation === null
                || $currentTranslation === ''
                || (
                    $previousGeneratedTranslation !== null
                    && $currentTranslation === $previousGeneratedTranslation
                );

            if ($shouldReplace) {
                $resolvedTranslations[$locale] = $generatedTranslation;
            }
        }

        return $resolvedTranslations;
    }

    /**
     * @param  array<string, string>  $translations
     */
    private function preferredSourceLocale(array $translations, string $existingSourceLocale): string
    {
        $normalizedExisting = Locale::normalize($existingSourceLocale);

        return $normalizedExisting
            ?? (array_key_exists('fr', $translations) ? 'fr' : array_key_first($translations))
            ?? 'fr';
    }

    /**
     * @param  array<string, string>  $translations
     */
    private function resolveLocalizedValue(array $translations, string $locale): string
    {
        return $translations[$locale]
            ?? $translations[Locale::fallback()]
            ?? $translations['fr']
            ?? Arr::first($translations)
            ?? '';
    }

    private function normalizeString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $normalized = trim($value);

        return $normalized === '' ? null : $normalized;
    }
}
