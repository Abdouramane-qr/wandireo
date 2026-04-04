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

import type { Service, ServiceCardData } from '@/types/service';

// ---- Mapping statique partnerId -> nom affiche ----

const PARTNER_NAMES: Record<string, string> = {
    partner_001: 'Exp-Travel Ltd',
    partner_002: 'Canary Tours',
};

/**
 * Normalise une duree numerique et son unite en minutes.
 *   2 JOURS    -> 2880
 *   3 HEURES   -> 180
 *   45 MINUTES -> 45
 */
function toDurationMinutes(
    value: number,
    unit: 'MINUTES' | 'HEURES' | 'JOURS',
): number {
    switch (unit) {
        case 'MINUTES':
            return value;
        case 'HEURES':
            return value * 60;
        case 'JOURS':
            return value * 1440;
    }
}

/**
 * Transforme un Service complet en vue normalisee ServiceCardData.
 * Cette fonction est pure : elle ne produit aucun effet de bord.
 */
export function toServiceCardData(service: Service): ServiceCardData {
    const thumbnail = service.images[0] ?? '';
    const partnerName = service.partnerId
        ? (PARTNER_NAMES[service.partnerId] ?? service.partnerId)
        : 'Wandireo';
    const structuredAttributes = Object.entries(
        (service.extraData?.attributes as Record<string, string | boolean>) ?? {},
    )
        .filter(([, value]) => value !== '' && value !== false && value != null)
        .map(([key, value]) => {
            const label = key.replaceAll('_', ' ');

            return typeof value === 'boolean' ? label : `${label}: ${value}`;
        });

    const durationMinutes =
        service.category === 'ACTIVITE'
            ? toDurationMinutes(service.duration, service.durationUnit)
            : 0;

    const raw = service.description;
    const shortDescription =
        raw.length > 160 ? raw.slice(0, 160).trimEnd() + '...' : raw;

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
        highlights: [
            service.serviceSubcategoryName ?? service.serviceCategoryName ?? '',
            ...structuredAttributes,
        ]
            .filter(Boolean)
            .slice(0, 3),
    };
}

/**
 * Transforme un tableau de Service en ServiceCardData[].
 */
export function toServiceCardDataList(services: Service[]): ServiceCardData[] {
    return services.map(toServiceCardData);
}
