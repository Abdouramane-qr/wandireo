<?php

namespace App\Services\PartnerContent\Provider;

class FareHarborPartnerContentProvider implements PartnerContentProvider
{
    public function key(): string
    {
        return 'FAREHARBOR';
    }

    public function overrideRootPath(): string
    {
        return 'fareharbor.overrides';
    }

    public function legacySourceFields(array $extraData): array
    {
        return [
            'provider.headline' => data_get($extraData, 'fareharbor.headline'),
            'provider.shortDescription' => data_get($extraData, 'fareharbor.shortDescription'),
        ];
    }

    public function stringFields(): array
    {
        return [
            'provider.headline' => [
                'target_path' => 'fareharbor.headline',
                'override_path' => 'fareharbor.headline',
            ],
            'provider.shortDescription' => [
                'target_path' => 'fareharbor.shortDescription',
                'override_path' => 'fareharbor.shortDescription',
            ],
        ];
    }

    public function listFields(): array
    {
        return [];
    }

    public function hydrateExtraData(array $extraData, array $resolvedFields): array
    {
        if (is_string($resolvedFields['meetingPoint'] ?? null) && $resolvedFields['meetingPoint'] !== '') {
            data_set($extraData, 'fareharbor.meetingPoint', $resolvedFields['meetingPoint']);
        }

        if (is_string($resolvedFields['provider.headline'] ?? null) && $resolvedFields['provider.headline'] !== '') {
            data_set($extraData, 'fareharbor.headline', $resolvedFields['provider.headline']);
        }

        if (
            is_string($resolvedFields['provider.shortDescription'] ?? null)
            && $resolvedFields['provider.shortDescription'] !== ''
        ) {
            data_set($extraData, 'fareharbor.shortDescription', $resolvedFields['provider.shortDescription']);
        }

        return $extraData;
    }
}
