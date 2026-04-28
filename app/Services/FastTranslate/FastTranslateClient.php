<?php

namespace App\Services\FastTranslate;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class FastTranslateClient
{
    public function __construct(
        private readonly HttpFactory $http,
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) config('services.fast_translate.enabled', false)
            && filled(config('services.fast_translate.base_url'))
            && filled(config('services.fast_translate.api_key'));
    }

    /**
     * @return array{language: string, confidence: float}
     */
    public function detectLanguage(string $text): array
    {
        $response = $this->request()
            ->post('/detect/', [
                'text' => $text,
            ])
            ->throw()
            ->json();

        return [
            'language' => Str::lower(substr((string) Arr::get($response, 'language', ''), 0, 2)),
            'confidence' => (float) Arr::get($response, 'confidence', 0.0),
        ];
    }

    public function translate(
        string $text,
        string $sourceLanguage,
        string $targetLanguage,
    ): string {
        $response = $this->request()
            ->post('/translate/', [
                'text' => $text,
                'source_language' => $sourceLanguage,
                'target_language' => $targetLanguage,
            ])
            ->throw()
            ->json();

        $translatedText = trim((string) Arr::get($response, 'translated_text', ''));

        if ($translatedText === '') {
            throw new \RuntimeException('The translation service returned an empty result.');
        }

        return $translatedText;
    }

    private function request(): PendingRequest
    {
        return $this->http
            ->baseUrl(rtrim((string) config('services.fast_translate.base_url'), '/'))
            ->timeout((int) config('services.fast_translate.timeout', 15))
            ->withHeaders([
                'X-API-Key' => (string) config('services.fast_translate.api_key'),
                'Accept' => 'application/json',
            ]);
    }
}
