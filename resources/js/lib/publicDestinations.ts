import type { Service } from "@/types/service";

export interface PublicDestinationOption {
    country: string;
    cities: string[];
}

export const PUBLIC_ALGARVE_DESTINATIONS = [
    "Lagos",
    "Alvor",
    "Portimão",
    "Silves",
    "Benagil",
    "Armação de Pêra",
    "Vilamoura",
    "Albufeira",
];

export function buildPublicDestinationOptions(
    _services: Pick<Service, "location" | "isAvailable">[],
): PublicDestinationOption[] {
    return [
        {
            country: "Portugal",
            cities: PUBLIC_ALGARVE_DESTINATIONS,
        },
    ];
}
