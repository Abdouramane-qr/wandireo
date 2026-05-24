<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Support\Locale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class HomeCatalogPreviewController extends Controller
{
    private const CACHE_TTL_SECONDS = 300;

    public function __invoke(Request $request): JsonResponse
    {
        $locale = Locale::negotiateFromRequest($request);
        $cacheKey = "home_catalog_preview:{$locale}";

        return response()->json(Cache::remember(
            $cacheKey,
            self::CACHE_TTL_SECONDS,
            fn (): array => [
                'featuredServices' => $this->featuredServices($locale),
                'categoryCounts' => $this->categoryCounts(),
                'destinations' => $this->destinations(),
            ],
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function featuredServices(string $locale): array
    {
        $activities = $this->baseServiceQuery()
            ->with(['partner', 'serviceCategory', 'serviceSubcategory'])
            ->whereRaw('UPPER(category) = ?', ['ACTIVITE'])
            ->orderByDesc('featured')
            ->orderByDesc('rating')
            ->latest('created_at')
            ->limit(8)
            ->get();

        if ($activities->count() < 4) {
            $fallbacks = $this->baseServiceQuery()
                ->with(['partner', 'serviceCategory', 'serviceSubcategory'])
                ->whereRaw('UPPER(category) != ?', ['ACTIVITE'])
                ->orderByDesc('featured')
                ->orderByDesc('rating')
                ->latest('created_at')
                ->limit(8 - $activities->count())
                ->get();

            $activities = $activities->concat($fallbacks);
        }

        return $activities
            ->map(fn (Service $service): array => $this->formatServiceCard($service, $locale))
            ->values()
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function categoryCounts(): array
    {
        $counts = $this->baseServiceQuery()
            ->selectRaw('UPPER(category) as category_upper, COUNT(*) as aggregate')
            ->groupBy('category_upper')
            ->pluck('aggregate', 'category_upper');

        return [
            'ACTIVITE' => (int) ($counts['ACTIVITE'] ?? 0),
            'BATEAU' => (int) ($counts['BATEAU'] ?? 0),
            'HEBERGEMENT' => (int) ($counts['HEBERGEMENT'] ?? 0),
            'VOITURE' => (int) ($counts['VOITURE'] ?? 0),
        ];
    }

    /**
     * @return array<int, array{country: string, region: string, cities: array<int, string>}>
     */
    private function destinations(): array
    {
        return [
            [
                'country' => 'Portugal',
                'region' => 'Algarve',
                'cities' => [
                    'Armação de Pêra',
                    'Lagos',
                    'Silves',
                    'Alvor',
                    'Portimão',
                    'Albufeira',
                    'Vilamoura',
                    'Benagil',
                ],
            ],
        ];
    }

    private function baseServiceQuery()
    {
        return Service::query()
            ->where('is_available', true)
            ->where('moderation_status', Service::MODERATION_PUBLISHED);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatServiceCard(Service $service, string $locale): array
    {
        $extraData = is_array($service->extra_data) ? $service->extra_data : [];
        $fareHarbor = data_get($extraData, 'fareharbor', []);
        $description = $this->localizedValue($service, 'description', $locale);
        $fallbackDescription = collect([
            data_get($fareHarbor, 'shortDescription'),
            data_get($fareHarbor, 'headline'),
        ])
            ->filter(fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->first();

        return [
            'id' => (string) $service->id,
            'title' => $this->localizedValue($service, 'title', $locale),
            'shortDescription' => Str::limit($this->plainText($description ?: (string) $fallbackDescription), 190),
            'thumbnailUrl' => (string) data_get($service->images, '0', ''),
            'price' => (float) $service->client_price,
            'currency' => (string) $service->currency,
            'category' => (string) $service->category,
            'location' => [
                'city' => (string) $service->location_city,
                'country' => $this->countryName((string) $service->location_country),
                'region' => $service->location_region,
            ],
            'durationMinutes' => $this->durationMinutes($extraData),
            'rating' => (float) ($service->rating ?? 0),
            'reviewCount' => (int) $service->review_count,
            'partnerName' => $this->partnerName($service, $fareHarbor),
            'isAvailable' => (bool) $service->is_available,
            'isFeatured' => (bool) $service->featured,
            'tags' => is_array($service->tags) ? array_values($service->tags) : [],
            'highlights' => array_values(array_filter([
                $service->serviceSubcategory?->name,
                $service->serviceCategory?->name,
            ])),
            'isExternalRedirect' => $service->is_external_redirect,
            'sourceProvider' => $service->source_provider,
            'externalPriceStatus' => data_get($fareHarbor, 'priceStatus'),
            'externalDepositAmount' => data_get($fareHarbor, 'depositAmount') ?? data_get($fareHarbor, 'depositAmountEur'),
            'externalDepositCurrency' => data_get($fareHarbor, 'processorCurrency') ?? $service->currency,
        ];
    }

    private function localizedValue(Service $service, string $field, string $locale): string
    {
        $fallback = Locale::fallback();

        return trim((string) (
            $service->getTranslation($field, $locale, false)
            ?: $service->getTranslation($field, $fallback, false)
            ?: $service->getTranslation($field, 'fr', false)
            ?: ''
        ));
    }

    private function plainText(string $value): string
    {
        return trim(preg_replace('/\s+/', ' ', strip_tags(Str::markdown($value))) ?? '');
    }

    /**
     * @param  array<string, mixed>  $extraData
     */
    private function durationMinutes(array $extraData): int
    {
        $value = (int) (data_get($extraData, 'duration') ?? data_get($extraData, 'fareharbor.durationMinutes') ?? 0);
        $unit = (string) (data_get($extraData, 'durationUnit') ?? 'MINUTES');

        return match ($unit) {
            'HEURES' => $value * 60,
            'JOURS' => $value * 1440,
            default => $value,
        };
    }

    /**
     * @param  array<string, mixed>  $fareHarbor
     */
    private function partnerName(Service $service, array $fareHarbor): string
    {
        if ($service->partner?->company_name) {
            return (string) $service->partner->company_name;
        }

        if (is_string(data_get($fareHarbor, 'company'))) {
            return Str::of((string) data_get($fareHarbor, 'company'))
                ->replace(['-', '_'], ' ')
                ->title()
                ->toString();
        }

        return 'Wandireo';
    }

    private function countryName(string $country): string
    {
        return match (strtoupper($country)) {
            'PT' => 'Portugal',
            default => $country,
        };
    }
}
