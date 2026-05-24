import type { PublicDestinationOption } from "@/lib/publicDestinations";
import type { ServiceCardData, ServiceCategory } from "@/types/service";
import api from "./client";

export interface HomeCatalogPreview {
    featuredServices: ServiceCardData[];
    categoryCounts: Record<ServiceCategory, number>;
    destinations: PublicDestinationOption[];
}

const emptyCounts: Record<ServiceCategory, number> = {
    ACTIVITE: 0,
    BATEAU: 0,
    HEBERGEMENT: 0,
    VOITURE: 0,
};

function normalizeCategoryCounts(
    counts: Partial<Record<ServiceCategory, number>> | undefined,
): Record<ServiceCategory, number> {
    return {
        ...emptyCounts,
        ...(counts ?? {}),
    };
}

export const homeApi = {
    catalogPreview: () =>
        api
            .get<HomeCatalogPreview>("/home/catalog-preview")
            .then((response) => ({
                featuredServices: response.data.featuredServices ?? [],
                categoryCounts: normalizeCategoryCounts(
                    response.data.categoryCounts,
                ),
                destinations: response.data.destinations ?? [],
            })),
};
