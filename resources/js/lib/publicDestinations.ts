import type { Service } from "@/types/service";

export interface PublicDestinationOption {
    country: string;
    region?: string;
    cities: string[];
}

export const PUBLIC_ALGARVE_DESTINATIONS = [
    "Armação de Pêra",
    "Lagos",
    "Silves",
    "Alvor",
    "Portimão",
    "Albufeira",
    "Vilamoura",
    "Benagil",
];

export function buildPublicDestinationOptions(
    _services: Pick<Service, "location" | "isAvailable">[],
): PublicDestinationOption[] {
    return [
        {
            country: "Portugal",
            region: "Algarve",
            cities: PUBLIC_ALGARVE_DESTINATIONS,
        },
    ];
}
