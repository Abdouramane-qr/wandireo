<?php

namespace App\Services\PartnerContent\Provider;

interface PartnerContentProvider
{
    public function key(): string;

    public function overrideRootPath(): string;

    /**
     * @return array<string, mixed>
     */
    public function legacySourceFields(array $extraData): array;

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    public function stringFields(): array;

    /**
     * @return array<string, array{target_path: string, override_path: string}>
     */
    public function listFields(): array;

    /**
     * @param  array<string, mixed>  $extraData
     * @param  array<string, mixed>  $resolvedFields
     * @return array<string, mixed>
     */
    public function hydrateExtraData(array $extraData, array $resolvedFields): array;
}
