/**
 * @file utils/serviceAdapter.ts
 * @description Adaptateur Service -> ServiceCardData.
 *   Normalise les sous-types specialises (ActivityService, BoatService, etc.)
 *   en une vue uniforme destinee aux composants d'affichage.
 *
 * Regles de transformation :
 *   - shortDescription : 160 premiers caracteres + ellipse si necessaire.
 *   - thumbnailUrl     : premiere entree du tableau images[].
 *   - durationMinutes  : normalise uniquement pour les activites.
 *   - partnerName      : resolu via un mapping statique partnerId -> label.
 */

import type { Service, ServiceCardData } from "@/types/service";
import { markdownToSingleLineText } from "@/lib/textSanitizers";

// ---- Mapping statique partnerId -> nom affiche ----

const PARTNER_NAMES: Record<string, string> = {
    partner_001: "Exp-Travel Ltd",
    partner_002: "Canary Tours",
};

function toDisplayName(value: string): string {
    return value
        .replaceAll(/[-_]+/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim()
        .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function truncateText(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength).trimEnd()}...`;
}

function toPositiveNumber(value: unknown): number | undefined {
    if (typeof value === "number" && value > 0) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (!Number.isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return undefined;
}

function getExternalDepositAmount(service: Service): number | undefined {
    const fareHarbor = service.extraData?.fareharbor;
    const directAmount = toPositiveNumber(fareHarbor?.depositAmount);

    if (directAmount !== undefined) {
        return directAmount;
    }

    const eurAmount = toPositiveNumber(fareHarbor?.depositAmountEur);

    if (eurAmount !== undefined) {
        return eurAmount;
    }

    const rawOffset = toPositiveNumber(
        fareHarbor?.raw &&
            typeof fareHarbor.raw === "object" &&
            fareHarbor.raw !== null
            ? (fareHarbor.raw as Record<string, unknown>).deposit_offset
            : undefined,
    );

    return rawOffset !== undefined ? +(rawOffset / 100).toFixed(2) : undefined;
}

function getExternalPriceStatus(service: Service): ServiceCardData["externalPriceStatus"] {
    const fareHarbor = service.extraData?.fareharbor;
    const explicitStatus = fareHarbor?.priceStatus;

    if (
        explicitStatus === "KNOWN" ||
        explicitStatus === "DEPOSIT_ONLY" ||
        explicitStatus === "UNKNOWN"
    ) {
        return explicitStatus;
    }

    const depositAmount = getExternalDepositAmount(service);
    const rawDepositRequired =
        fareHarbor?.isDepositRequired ??
        (fareHarbor?.raw &&
        typeof fareHarbor.raw === "object" &&
        fareHarbor.raw !== null
            ? (fareHarbor.raw as Record<string, unknown>).is_deposit_required
            : undefined);
    const isDepositRequired =
        rawDepositRequired === true || rawDepositRequired === "true";

    if (service.clientPrice > 0) {
        return "KNOWN";
    }

    if (isDepositRequired && typeof depositAmount === "number" && depositAmount > 0) {
        return "DEPOSIT_ONLY";
    }

    return undefined;
}

/**
 * Normalise une duree numerique et son unite en minutes.
 *   2 JOURS    -> 2880
 *   3 HEURES   -> 180
 *   45 MINUTES -> 45
 */
function toDurationMinutes(
    value: number,
    unit: "MINUTES" | "HEURES" | "JOURS",
): number {
    switch (unit) {
        case "MINUTES":
            return value;
        case "HEURES":
            return value * 60;
        case "JOURS":
            return value * 1440;
    }
}

/**
 * Transforme un Service complet en vue normalisee ServiceCardData.
 * Cette fonction est pure : elle ne produit aucun effet de bord.
 */
export function toServiceCardData(service: Service): ServiceCardData {
    const thumbnail = service.images[0] ?? "";
    const externalCompany =
        typeof service.extraData?.fareharbor?.company === "string"
            ? service.extraData.fareharbor.company
            : "";
    const externalHeadline =
        typeof service.extraData?.fareharbor?.headline === "string"
            ? markdownToSingleLineText(service.extraData.fareharbor.headline)
            : "";
    const externalShortDescription =
        typeof service.extraData?.fareharbor?.shortDescription === "string"
            ? markdownToSingleLineText(
                  service.extraData.fareharbor.shortDescription,
              )
            : "";
    const partnerName = service.partnerId
        ? (PARTNER_NAMES[service.partnerId] ?? service.partnerId)
        : externalCompany
          ? toDisplayName(externalCompany)
          : "Wandireo";
    const externalPriceStatus = getExternalPriceStatus(service);
    const externalDepositAmount = getExternalDepositAmount(service);
    const externalDepositCurrency =
        typeof service.extraData?.fareharbor?.processorCurrency === "string"
            ? service.extraData.fareharbor.processorCurrency
            : service.currency;
    const structuredAttributes = Object.entries(
        (service.extraData?.attributes as Record<string, string | boolean>) ??
            {},
    )
        .filter(([, value]) => value !== "" && value !== false && value != null)
        .map(([key, value]) => {
            const label = key.replaceAll("_", " ");

            return typeof value === "boolean" ? label : `${label}: ${value}`;
        });

    const durationMinutes =
        service.category === "ACTIVITE"
            ? toDurationMinutes(service.duration, service.durationUnit)
            : 0;

    const cleanedDescription = markdownToSingleLineText(service.description);
    const descriptionSource =
        cleanedDescription || externalShortDescription || externalHeadline;
    const shortDescription = truncateText(descriptionSource, 190);
    const headlineHighlight =
        externalHeadline && externalHeadline !== shortDescription
            ? truncateText(externalHeadline, 60)
            : "";

    return {
        id: service.id,
        title: service.title,
        shortDescription,
        thumbnailUrl: thumbnail,
        price: service.clientPrice,
        currency: service.currency,
        category: service.category,
        location: service.location,
        durationMinutes,
        rating: service.rating ?? 0,
        reviewCount: service.reviewCount,
        partnerName,
        isAvailable: service.isAvailable,
        tags: service.tags,
        isFeatured: service.featured,
        isExternalRedirect: service.isExternalRedirect,
        sourceProvider: service.sourceProvider,
        highlights: [
            headlineHighlight,
            service.serviceSubcategoryName ?? service.serviceCategoryName ?? "",
            ...structuredAttributes,
        ]
            .filter(Boolean)
            .slice(0, 3),
        externalPriceStatus,
        externalDepositAmount,
        externalDepositCurrency,
    };
}

/**
 * Transforme un tableau de Service en ServiceCardData[].
 */
export function toServiceCardDataList(services: Service[]): ServiceCardData[] {
    return services.map(toServiceCardData);
}
