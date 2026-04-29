<?php

namespace App\Services\PartnerContent;

use App\Services\PartnerContent\Provider\PartnerContentProvider;
use Illuminate\Support\Str;

class PartnerContentProviderRegistry
{
    /**
     * @param  iterable<int, PartnerContentProvider>  $providers
     */
    public function __construct(
        iterable $providers = [],
    ) {
        foreach ($providers as $provider) {
            $this->providers[Str::upper($provider->key())] = $provider;
        }
    }

    /**
     * @var array<string, PartnerContentProvider>
     */
    private array $providers = [];

    public function resolve(?string $provider): ?PartnerContentProvider
    {
        if (! is_string($provider) || trim($provider) === '') {
            return null;
        }

        return $this->providers[Str::upper(trim($provider))] ?? null;
    }

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    public function stringFields(?string $provider): array
    {
        return array_merge($this->commonStringFields(), $this->resolve($provider)?->stringFields() ?? []);
    }

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    public function listFields(?string $provider): array
    {
        return array_merge($this->commonListFields(), $this->resolve($provider)?->listFields() ?? []);
    }

    /**
     * @return array<string, mixed>
     */
    public function overrides(array $extraData, ?string $provider): array
    {
        $providerInstance = $this->resolve($provider);

        if ($providerInstance === null) {
            return [];
        }

        $overrides = data_get($extraData, $providerInstance->overrideRootPath());

        return is_array($overrides) ? $overrides : [];
    }

    /**
     * @return array<string, mixed>
     */
    public function legacySourceFields(array $extraData, ?string $provider): array
    {
        return $this->resolve($provider)?->legacySourceFields($extraData) ?? [];
    }

    /**
     * @param  array<string, mixed>  $extraData
     * @param  array<string, mixed>  $resolvedFields
     * @return array<string, mixed>
     */
    public function hydrateExtraData(array $extraData, ?string $provider, array $resolvedFields): array
    {
        $providerInstance = $this->resolve($provider);

        if ($providerInstance === null) {
            return $extraData;
        }

        return $providerInstance->hydrateExtraData($extraData, $resolvedFields);
    }

    /**
     * @return array<string, array{field: string, override_path: string}>
     */
    public function inputStringFields(?string $provider): array
    {
        return $this->invertFields($this->stringFields($provider));
    }

    /**
     * @return array<string, array{field: string, override_path: string}>
     */
    public function inputListFields(?string $provider): array
    {
        return $this->invertFields($this->listFields($provider));
    }

    /**
     * @param  array<string, array{target_path: string, override_path: string}>  $fields
     * @return array<string, array{field: string, override_path: string}>
     */
    private function invertFields(array $fields): array
    {
        $inverted = [];

        foreach ($fields as $field => $config) {
            $inverted[$config['target_path']] = [
                'field' => $field,
                'override_path' => $config['override_path'],
            ];
        }

        return $inverted;
    }

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    private function commonStringFields(): array
    {
        return [
            'meetingPoint' => [
                'target_path' => 'meetingPoint',
                'override_path' => 'meetingPoint',
            ],
        ];
    }

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    private function commonListFields(): array
    {
        return [
            'included' => [
                'target_path' => 'included',
                'override_path' => 'included',
            ],
            'notIncluded' => [
                'target_path' => 'notIncluded',
                'override_path' => 'notIncluded',
            ],
        ];
    }
}
