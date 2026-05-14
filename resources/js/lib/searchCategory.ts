import type { Locale } from "@/lib/locale";
import type { ServiceCategory } from "@/types/service";

const CATEGORY_ALIASES: Record<ServiceCategory, string[]> = {
    ACTIVITE: [
        "activite",
        "activites",
        "activity",
        "activities",
        "atividade",
        "atividades",
        "actividad",
        "actividades",
        "attivita",
        "bootsfahrten",
        "aktivitat",
        "aktivitaten",
    ],
    BATEAU: [
        "bateau",
        "bateaux",
        "boat",
        "boats",
        "barco",
        "barcos",
        "barca",
        "barche",
        "boot",
        "boote",
    ],
    HEBERGEMENT: [
        "hebergement",
        "hebergements",
        "accommodation",
        "accommodations",
        "stay",
        "stays",
        "alojamento",
        "alojamentos",
        "alojamiento",
        "alojamientos",
        "alloggio",
        "alloggi",
        "unterkunft",
        "unterkunfte",
    ],
    VOITURE: [
        "voiture",
        "voitures",
        "car",
        "cars",
        "carro",
        "carros",
        "coche",
        "coches",
        "auto",
        "autos",
    ],
};

const LOCALE_CATEGORY_LABELS: Record<
    Locale,
    Record<ServiceCategory, { singular: string; plural: string }>
> = {
    fr: {
        ACTIVITE: { singular: "Activité", plural: "Activités" },
        BATEAU: { singular: "Bateau", plural: "Bateaux" },
        HEBERGEMENT: { singular: "Hébergement", plural: "Hébergements" },
        VOITURE: { singular: "Voiture", plural: "Voitures" },
    },
    en: {
        ACTIVITE: { singular: "Activity", plural: "Activities" },
        BATEAU: { singular: "Boat", plural: "Boats" },
        HEBERGEMENT: {
            singular: "Accommodation",
            plural: "Accommodations",
        },
        VOITURE: { singular: "Car", plural: "Cars" },
    },
    pt: {
        ACTIVITE: { singular: "Atividade", plural: "Atividades" },
        BATEAU: { singular: "Barco", plural: "Barcos" },
        HEBERGEMENT: { singular: "Alojamento", plural: "Alojamentos" },
        VOITURE: { singular: "Carro", plural: "Carros" },
    },
    es: {
        ACTIVITE: { singular: "Actividad", plural: "Actividades" },
        BATEAU: { singular: "Barco", plural: "Barcos" },
        HEBERGEMENT: { singular: "Alojamiento", plural: "Alojamientos" },
        VOITURE: { singular: "Coche", plural: "Coches" },
    },
    it: {
        ACTIVITE: { singular: "Attività", plural: "Attività" },
        BATEAU: { singular: "Barca", plural: "Barche" },
        HEBERGEMENT: { singular: "Alloggio", plural: "Alloggi" },
        VOITURE: { singular: "Auto", plural: "Auto" },
    },
    de: {
        ACTIVITE: { singular: "Aktivität", plural: "Aktivitäten" },
        BATEAU: { singular: "Boot", plural: "Boote" },
        HEBERGEMENT: { singular: "Unterkunft", plural: "Unterkünfte" },
        VOITURE: { singular: "Auto", plural: "Autos" },
    },
};

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
}

export function inferCategoryFromSearchTerm(
    value: string,
    locale?: Locale,
): ServiceCategory | "" {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue) {
        return "";
    }

    for (const [category, aliases] of Object.entries(CATEGORY_ALIASES) as Array<
        [ServiceCategory, string[]]
    >) {
        if (aliases.includes(normalizedValue)) {
            return category;
        }
    }

    if (locale && locale in LOCALE_CATEGORY_LABELS) {
        const labels = LOCALE_CATEGORY_LABELS[locale];

        for (const [category, copy] of Object.entries(labels) as Array<
            [ServiceCategory, { singular: string; plural: string }]
        >) {
            if (
                normalizeText(copy.singular) === normalizedValue ||
                normalizeText(copy.plural) === normalizedValue
            ) {
                return category;
            }
        }
    }

    return "";
}

export function resolveSearchRouteParams(
    query: string,
    locale?: Locale,
): { query?: string; category?: ServiceCategory } {
    const trimmedQuery = query.trim();
    const inferredCategory = inferCategoryFromSearchTerm(trimmedQuery, locale);

    if (inferredCategory) {
        return {
            category: inferredCategory,
        };
    }

    return trimmedQuery
        ? {
              query: trimmedQuery,
          }
        : {};
}
