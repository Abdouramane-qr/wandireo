/**
 * @file service.ts
 * @description Définition des types et interfaces pour les services de la plateforme Wandireo.
 *
 * Architecture des prix (modèle marketplace) :
 *   partnerPrice      = Prix perçu par le partenaire (avant commission)
 *   commissionAmount  = partnerPrice * commissionRate
 *   clientPrice       = partnerPrice * (1 + commissionRate)
 *
 * Le modèle est cohérent avec un taux de commission appliqué en sortant de marge
 * sur le prix partenaire, et non en retenant une partie du prix client.
 */

// ============================================================
// CONSTANTES ET TYPES COMMUNS
// ============================================================

import type { Locale } from '@/lib/locale';

export type LocalizedTextMap = Partial<Record<Locale, string>>;

export const ServiceCategoryNames = {
    ACTIVITE: 'ACTIVITE',
    BATEAU: 'BATEAU',
    HEBERGEMENT: 'HEBERGEMENT',
    VOITURE: 'VOITURE',
} as const;

export type ServiceCategory =
    (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames];

export type BookingMode = 'INSTANT' | 'REQUEST' | 'EXTERNAL_REDIRECT';
export type FareHarborPriceStatus = 'KNOWN' | 'DEPOSIT_ONLY' | 'UNKNOWN';
export type ServiceAttributeType = 'text' | 'number' | 'boolean' | 'select';
export type ServiceExtraInputType = 'CHECKBOX' | 'REQUIRED';

export interface ServiceAttributeOptionDefinition {
    id: string;
    label: string;
    value: string;
    sortOrder: number;
}

export interface ServiceAttributeDefinition {
    id: string;
    serviceCategoryId: string;
    label: string;
    key: string;
    type: ServiceAttributeType;
    isRequired: boolean;
    isFilterable: boolean;
    sortOrder: number;
    options: ServiceAttributeOptionDefinition[];
}

export interface ServiceExtraDefinition {
    id: string;
    serviceCategoryId: string;
    name: string;
    description?: string;
    defaultPrice: number;
    inputType: ServiceExtraInputType;
    isRequired: boolean;
    isActive: boolean;
    sortOrder: number;
}

export interface ServiceSubcategoryDefinition {
    id: string;
    serviceCategoryId: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface ServiceCategoryDefinition {
    id: string;
    serviceType: ServiceCategory;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
    subcategories: ServiceSubcategoryDefinition[];
    attributes: ServiceAttributeDefinition[];
    extras: ServiceExtraDefinition[];
}

/** Unité de facturation. Chaque catégorie restreint l'ensemble à ses valeurs pertinentes. */
export type ServicePricingUnit =
    | 'PAR_PERSONNE'
    | 'PAR_GROUPE'
    | 'PAR_JOUR'
    | 'PAR_DEMI_JOURNEE'
    | 'PAR_SEMAINE'
    | 'PAR_NUIT';

// ============================================================
// MODE DE PAIEMENT (configure par le prestataire)
// ============================================================

/**
 * Mode de paiement configure par le prestataire pour ce service.
 *
 * FULL_CASH_ON_SITE            : Le client paye la totalite sur place en especes.
 *                                amountDueOnline = 0
 *                                amountDueOnSite = clientPrice * units
 *
 * COMMISSION_ONLINE_REST_ON_SITE: Wandireo preleve la commission en ligne.
 *                                amountDueOnline = commissionAmount * units
 *                                amountDueOnSite = partnerPrice * units
 *
 * FULL_ONLINE                  : Paiement integral en ligne.
 *                                amountDueOnline = clientPrice * units
 *                                amountDueOnSite = 0
 *
 * Invariant : amountDueOnline + amountDueOnSite = clientTotal (pour tous les modes)
 */
export const PaymentModeNames = {
    FULL_CASH_ON_SITE: 'FULL_CASH_ON_SITE',
    COMMISSION_ONLINE_REST_ON_SITE: 'COMMISSION_ONLINE_REST_ON_SITE',
    FULL_ONLINE: 'FULL_ONLINE',
    CONNECTED_ACCOUNT: 'CONNECTED_ACCOUNT',
    EXTERNAL_REDIRECT: 'EXTERNAL_REDIRECT',
} as const;

export type PaymentMode =
    (typeof PaymentModeNames)[keyof typeof PaymentModeNames];

export const PaymentModeLabels: Record<PaymentMode, string> = {
    FULL_CASH_ON_SITE: 'Paiement sur place',
    COMMISSION_ONLINE_REST_ON_SITE: 'Commission en ligne + reste sur place',
    FULL_ONLINE: 'Paiement en ligne',
    CONNECTED_ACCOUNT: 'Compte connecte Stripe',
    EXTERNAL_REDIRECT: 'Reservation externe',
};

export const PaymentModeDescriptions: Record<PaymentMode, string> = {
    FULL_CASH_ON_SITE:
        'Aucun paiement en ligne. Vous reglez la totalite sur place en especes.',
    COMMISSION_ONLINE_REST_ON_SITE:
        'Les frais de service Wandireo sont debites maintenant. Le solde est regle directement au prestataire.',
    FULL_ONLINE:
        'Le montant total est preleve en ligne. Aucun paiement supplementaire sur place.',
    CONNECTED_ACCOUNT:
        'Le paiement est traite en ligne via un compte connecte du partenaire.',
    EXTERNAL_REDIRECT:
        'La reservation et le paiement sont geres sur la plateforme du partenaire.',
};

export interface ServiceLocation {
    city: string;
    country: string;
    region?: string;
    addressLine?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

/**
 * Interface de base commune à tous les services de la plateforme.
 * Ne pas instancier directement : utiliser les sous-types spécialisés.
 */
export interface BaseService {
    id: string;
    /** Référence au PartnerUser.id propriétaire du service. */
    partnerId?: string;
    title: string;
    titleTranslations?: LocalizedTextMap;
    description: string;
    descriptionTranslations?: LocalizedTextMap;
    location: ServiceLocation;
    /** Chemins d'images, format : '/assets/images/services/<id>_<index>.jpg' */
    images: string[];
    category: ServiceCategory;
    pricingUnit: ServicePricingUnit;
    /** Prix hors commission que reçoit le partenaire, en `currency`. */
    partnerPrice: number;
    /** Taux de commission Wandireo appliqué sur le partnerPrice (ex: 0.15 = 15%). */
    commissionRate: number;
    /** Montant de la commission = partnerPrice * commissionRate. */
    commissionAmount: number;
    /** Prix final payé par le client = partnerPrice * (1 + commissionRate). */
    clientPrice: number;
    /** Code devise ISO 4217 (ex: 'EUR'). */
    currency: string;
    /** Note moyenne sur 5. Undefined si aucun avis. */
    rating?: number;
    reviewCount: number;
    isAvailable: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    /** Mode de paiement configure par le prestataire pour ce service. */
    paymentMode: PaymentMode;
    bookingMode?: BookingMode;
    featured?: boolean;
    videoUrl?: string;
    sourceType?: 'LOCAL' | 'EXTERNAL';
    sourceProvider?: string;
    sourceExternalId?: string;
    isExternalRedirect?: boolean;
    lastSyncedAt?: Date;
    serviceCategoryId?: string;
    serviceSubcategoryId?: string;
    serviceCategoryName?: string;
    serviceSubcategoryName?: string;
    extraData?: Record<string, unknown> & {
        fareharbor?: {
            company?: string;
            itemId?: string;
            bookingUrl?: string;
            bookingFlow?: string;
            paymentCollection?: string;
            isDepositRequired?: boolean;
            depositAmount?: number;
            depositAmountEur?: number;
            processorCurrency?: string;
            priceStatus?: FareHarborPriceStatus;
            headline?: string;
            shortDescription?: string;
            meetingPoint?: string;
            duration?: string;
            images?: string[];
            calendarTimezone?: string;
            raw?: Record<string, unknown>;
        };
    };
}

// ============================================================
// CATEGORIE : ACTIVITE
// ============================================================

export type ActivityType =
    | 'PLONGEE'
    | 'RANDONNEE'
    | 'KAYAK'
    | 'SURF'
    | 'SNORKELING'
    | 'PARACHUTISME'
    | 'ESCALADE'
    | 'CROISIERE_CULTURELLE'
    | 'VELO'
    | 'YOGA_PLAGE'
    | 'QUAD_BUGGY'
    | 'OBSERVATION_CETACES';

export type DifficultyLevel =
    | 'TOUS_NIVEAUX'
    | 'DEBUTANT'
    | 'INTERMEDIAIRE'
    | 'AVANCE'
    | 'EXPERT';

export type PhysicalIntensity = 'FAIBLE' | 'MODEREE' | 'ELEVEE';

export type GroupType = 'GROUPE_PRIVE' | 'GROUPE_PARTAGE' | 'AU_CHOIX';

export type DayOfWeek =
    | 'LUNDI'
    | 'MARDI'
    | 'MERCREDI'
    | 'JEUDI'
    | 'VENDREDI'
    | 'SAMEDI'
    | 'DIMANCHE';

export interface ActivitySchedule {
    /** Horaires de départ disponibles, format "HH:MM". */
    startTimes: string[];
    daysAvailable: DayOfWeek[];
    /** Fenêtre de disponibilité saisonnière, format "MM-DD". */
    seasonAvailability?: {
        from: string;
        to: string;
    };
}

export interface ActivityService extends BaseService {
    category: 'ACTIVITE';
    pricingUnit: 'PAR_PERSONNE' | 'PAR_GROUPE';
    activityType: ActivityType;
    /** Valeur numérique de la durée, interprétée avec `durationUnit`. */
    duration: number;
    durationUnit: 'MINUTES' | 'HEURES' | 'JOURS';
    difficulty: DifficultyLevel;
    physicalIntensity: PhysicalIntensity;
    minParticipants: number;
    maxParticipants: number;
    /** Age minimum requis, en années. */
    minAgeYears: number;
    /** Indique si un certificat médical d'aptitude est obligatoire. */
    requiresMedicalClearance: boolean;
    /** Certification technique requise du participant (ex: 'PADI Open Water'). */
    certificationRequired?: string;
    /** Indique si l'équipement spécialisé est fourni par le prestataire. */
    equipmentProvided: boolean;
    /** Liste des éléments inclus dans le prix. */
    included: string[];
    /** Liste des éléments non inclus dans le prix. */
    notIncluded: string[];
    meetingPoint: string;
    schedule: ActivitySchedule;
    /** Codes de langue ISO 639-1 disponibles pour l'encadrement. */
    languages: string[];
    groupType: GroupType;
}

// ============================================================
// CATEGORIE : BATEAU
// ============================================================

export type BoatType =
    | 'VOILIER'
    | 'CATAMARAN'
    | 'YACHT_MOTEUR'
    | 'SEMI_RIGIDE'
    | 'GOELETTE'
    | 'PENICHE';

export type EngineType = 'VOILE' | 'MOTEUR' | 'VOILE_ET_MOTEUR';

export type RentalMode =
    | 'AVEC_SKIPPER'
    | 'SANS_SKIPPER'
    | 'BARE_BOAT'
    | 'AVEC_EQUIPAGE_COMPLET';

export interface BoatService extends BaseService {
    category: 'BATEAU';
    pricingUnit: 'PAR_JOUR' | 'PAR_DEMI_JOURNEE' | 'PAR_SEMAINE';
    boatType: BoatType;
    /** Nom propre du bateau (ex: "Cap Soleil"). */
    boatName: string;
    /** Nombre maximum de passagers à bord en navigation. */
    passengerCapacity: number;
    /** Nombre de couchages disponibles. */
    sleepingBerths: number;
    /** Longueur hors-tout en mètres. */
    lengthMeters: number;
    manufactureYear: number;
    engineType: EngineType;
    /** Puissance moteur en kW (si applicable). */
    enginePowerKw?: number;
    rentalMode: RentalMode;
    cabins: number;
    bathrooms: number;
    /** Équipements et commodités disponibles à bord. */
    amenities: string[];
    /** Zones de navigation autorisées ou recommandées. */
    navigationArea: string[];
    licenseRequired: boolean;
    /** Type de permis requis si licenseRequired est true. */
    licenseType?: string;
    fuelIncluded: boolean;
    /** Montant de la caution en EUR, remboursé en fin de location. */
    depositAmountEur: number;
    insuranceIncluded: boolean;
    departurePorts: string[];
    availableForDayCharter: boolean;
    availableForWeekCharter: boolean;
}

// ============================================================
// CATEGORIE : HEBERGEMENT
// ============================================================

export type AccommodationType =
    | 'HOTEL'
    | 'VILLA'
    | 'APPARTEMENT'
    | 'BUNGALOW'
    | 'MAISON_HOTES'
    | 'BASTIDE'
    | 'RIAD'
    | 'LODGE';

export type CancellationPolicy =
    | 'FLEXIBLE'
    | 'MODEREE'
    | 'STRICTE'
    | 'NON_REMBOURSABLE';

export interface AccommodationService extends BaseService {
    category: 'HEBERGEMENT';
    pricingUnit: 'PAR_NUIT' | 'PAR_SEMAINE';
    accommodationType: AccommodationType;
    /** Classification officielle en étoiles (hôtels uniquement). */
    starRating?: 1 | 2 | 3 | 4 | 5;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    /** Surface totale en mètres carrés. */
    totalSurfaceM2?: number;
    amenities: string[];
    /** Heure d'arrivée minimale, format "HH:MM". */
    checkInTime: string;
    /** Heure de départ maximale, format "HH:MM". */
    checkOutTime: string;
    breakfastIncluded: boolean;
    minimumStayNights: number;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    accessibilityFeatures: string[];
    houseRules: string[];
    cancellationPolicy: CancellationPolicy;
    nearbyAttractions: string[];
    /** Distance à la plage la plus proche, en mètres. */
    distanceToBeachMeters?: number;
    /** Distance au centre-ville le plus proche, en km. */
    distanceToCityKm?: number;
}

// ============================================================
// CATEGORIE : VOITURE
// ============================================================

export type VehicleType =
    | 'CITADINE'
    | 'BERLINE'
    | 'SUV'
    | 'CABRIOLET'
    | 'MONOSPACE'
    | 'UTILITAIRE'
    | 'QUAD'
    | 'SCOOTER_125';

export type TransmissionType = 'MANUELLE' | 'AUTOMATIQUE';

export type FuelType = 'ESSENCE' | 'DIESEL' | 'ELECTRIQUE' | 'HYBRIDE' | 'GPL';

/** Kilométrage journalier inclus, ou 'ILLIMITE'. */
export type MileageLimit = number | 'ILLIMITE';

export interface CarService extends BaseService {
    category: 'VOITURE';
    pricingUnit: 'PAR_JOUR' | 'PAR_SEMAINE';
    vehicleType: VehicleType;
    brand: string;
    model: string;
    year: number;
    transmission: TransmissionType;
    fuelType: FuelType;
    seats: number;
    doors: number;
    luggage: {
        /** Nombre de sacs cabine ou petits bagages pouvant être stockés. */
        smallBags: number;
        /** Nombre de valises grandes formats pouvant être stockées. */
        largeSuitcases: number;
    };
    airConditioning: boolean;
    /** Age minimum du conducteur principal, en années. */
    driverMinAge: number;
    /** Ancienneté du permis de conduire requise, en années. */
    driverLicenseYearsRequired: number;
    /** Indique si le plein de carburant est inclus au départ et retour. */
    fuelIncluded: boolean;
    mileageLimit: MileageLimit;
    /** Tarif par kilomètre supplémentaire si mileageLimit est numérique. */
    mileageExtraChargePerKm?: number;
    /** Assurance tous risques incluse. */
    insuranceIncluded: boolean;
    /** Montant de la caution bloquée en EUR. */
    depositAmountEur: number;
    deliveryAvailable: boolean;
    /** Lieux de livraison disponibles si deliveryAvailable est true. */
    deliveryLocations?: string[];
    additionalDriverAllowed: boolean;
    /** Frais journalier par conducteur supplémentaire, en EUR. */
    additionalDriverFeePerDay: number;
    pickupLocations: string[];
}

// ============================================================
// TYPE UNION GLOBAL
// ============================================================

/** Type discriminant global représentant n'importe quel service de la plateforme. */
export type Service =
    | ActivityService
    | BoatService
    | AccommodationService
    | CarService;

// ============================================================
// TYPES D'AFFICHAGE (UI)
// Destinés aux composants de présentation (ServiceCard, listes de résultats).
// ============================================================

/** Labels lisibles en français pour chaque catégorie de service */
export const ServiceCategoryLabels: Record<ServiceCategory, string> = {
    ACTIVITE: 'Activité',
    BATEAU: 'Bateau',
    HEBERGEMENT: 'Hébergement',
    VOITURE: 'Voiture',
};

/**
 * Vue normalisée d'un service, destinée aux composants d'affichage (ServiceCard, etc.).
 * Produite en transformant n'importe quel type `Service` via un adaptateur.
 * Permet de rendre les composants agnostiques aux sous-types spécialisés.
 */
export interface ServiceCardData {
    id: string;
    title: string;
    shortDescription: string;
    thumbnailUrl: string;
    price: number;
    currency: string;
    category: ServiceCategory;
    location: ServiceLocation;
    /** Durée exprimée en minutes, à afficher formatée (ex: 90 -> "1h30") */
    durationMinutes: number;
    rating: number;
    reviewCount: number;
    partnerName: string;
    partnerAvatar?: string;
    isAvailable: boolean;
    isFeatured?: boolean;
    tags: string[];
    highlights: string[];
    isExternalRedirect?: boolean;
    sourceProvider?: string;
    externalPriceStatus?: FareHarborPriceStatus;
    externalDepositAmount?: number;
    externalDepositCurrency?: string;
}
