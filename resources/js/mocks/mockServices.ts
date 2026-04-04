/**
 * @file mockServices.ts
 * @description Catalogue de services factices pour Wandireo.com.
 *
 * Structure du catalogue :
 *   - 3 Activités  (act_001 à act_003)
 *   - 2 Bateaux    (boat_001, boat_002)
 *   - 2 Hébergements (heb_001, heb_002)
 *   - 2 Voitures   (car_001, car_002)
 *
 * Logique de prix appliquée (modèle marketplace) :
 *   clientPrice     = partnerPrice * (1 + commissionRate)
 *   commissionAmount = partnerPrice * commissionRate
 *
 * Les IDs de partenaires correspondent aux entrées de mockUsers.ts :
 *   - partner_001 : Exp-Travel Ltd (Paris) — commissionRate: 0.15
 *   - partner_002 : Canary Tours (Lanzarote) — commissionRate: 0.12
 */

import {
    ServiceCategoryNames,
    PaymentModeNames
    
    
    
    
    
} from '@/types/service';
import type {ActivityService, BoatService, AccommodationService, CarService, Service} from '@/types/service';

// ============================================================
// ACTIVITES
// ============================================================

/**
 * act_001 — Croisière privée en Seine & Paris by Night
 * Partenaire : Exp-Travel Ltd (partner_001) | Commission : 15%
 * partnerPrice: 120 EUR | commissionAmount: 18 EUR | clientPrice: 138 EUR
 */
const act001: ActivityService = {
    id: 'act_001',
    partnerId: 'partner_001',
    title: 'Croisière Privée en Seine & Paris by Night',
    description:
        "Embarquez pour une croisière privatisée sur la Seine à bord d'une vedette de 12 passagers. Depuis le pont, admirez les illuminations de la Tour Eiffel, de Notre-Dame et des berges classées au patrimoine UNESCO. Un accompagnateur culturel bilingue vous partage l'histoire des monuments tout au long du parcours.",
    location: {
        city: 'Paris',
        country: 'France',
        region: 'Île-de-France',
        addressLine: 'Port de la Bourdonnais, 75007 Paris',
        coordinates: { latitude: 48.8606, longitude: 2.2969 },
    },
    images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1499856374-3da4c2c5b82a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.ACTIVITE,
    pricingUnit: 'PAR_PERSONNE',
    partnerPrice: 120,
    commissionRate: 0.15,
    commissionAmount: 18,
    clientPrice: 138,
    currency: 'EUR',
    rating: 4.9,
    reviewCount: 247,
    isAvailable: true,
    tags: ['paris', 'croisiere', 'nuit', 'romantique', 'culturel', 'seine'],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-15'),
    paymentMode: PaymentModeNames.FULL_ONLINE,
    // Attributs spécifiques à la catégorie ACTIVITE
    activityType: 'CROISIERE_CULTURELLE',
    duration: 150,
    durationUnit: 'MINUTES',
    difficulty: 'TOUS_NIVEAUX',
    physicalIntensity: 'FAIBLE',
    minParticipants: 2,
    maxParticipants: 8,
    minAgeYears: 4,
    requiresMedicalClearance: false,
    equipmentProvided: true,
    included: [
        'Accueil avec coupe de champagne ou jus de fruits',
        'Audioguide multilingue intégré',
        'Couvertures polaires pour les soirées fraîches',
        'Accompagnateur culturel bilingue (FR/EN)',
    ],
    notIncluded: [
        'Dîner ou restauration',
        "Transport jusqu'au port de départ",
        'Pourboires',
    ],
    meetingPoint: "Port de la Bourdonnais, face au Pont d'Iéna, 75007 Paris",
    schedule: {
        startTimes: ['20:30', '22:00'],
        daysAvailable: [
            'LUNDI',
            'MARDI',
            'MERCREDI',
            'JEUDI',
            'VENDREDI',
            'SAMEDI',
            'DIMANCHE',
        ],
    },
    languages: ['fr', 'en', 'es'],
    groupType: 'GROUPE_PRIVE',
};

/**
 * act_002 — Randonnée Alpine & Bivouac Haute Montagne
 * Partenaire : Exp-Travel Ltd (partner_001) | Commission : 15%
 * partnerPrice: 280 EUR | commissionAmount: 42 EUR | clientPrice: 322 EUR
 */
const act002: ActivityService = {
    id: 'act_002',
    partnerId: 'partner_001',
    title: 'Randonnée Alpine & Bivouac Haute Montagne — Massif du Mont-Blanc',
    description:
        "Expérience immersive de deux jours en haute montagne avec un guide certifié IFMGA. Programme : ascension par le glacier du Tour, nuit en bivouac sous les étoiles à 2 800 m d'altitude, lever de soleil sur les Aiguilles de Chamonix. Un défi physique exigeant dans un cadre naturel exceptionnel.",
    location: {
        city: 'Chamonix-Mont-Blanc',
        country: 'France',
        region: 'Auvergne-Rhône-Alpes',
        addressLine:
            "Office du Tourisme, Place du Triangle de l'Amitié, 74400 Chamonix",
        coordinates: { latitude: 45.9237, longitude: 6.8694 },
    },
    images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.ACTIVITE,
    pricingUnit: 'PAR_PERSONNE',
    partnerPrice: 280,
    commissionRate: 0.15,
    commissionAmount: 42,
    clientPrice: 322,
    currency: 'EUR',
    rating: 4.8,
    reviewCount: 89,
    isAvailable: true,
    tags: [
        'chamonix',
        'randonnee',
        'montagne',
        'bivouac',
        'glacier',
        'aventure',
        'altitude',
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-25'),
    paymentMode: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    // Attributs spécifiques à la catégorie ACTIVITE
    activityType: 'RANDONNEE',
    duration: 2,
    durationUnit: 'JOURS',
    difficulty: 'AVANCE',
    physicalIntensity: 'ELEVEE',
    minParticipants: 2,
    maxParticipants: 6,
    minAgeYears: 16,
    requiresMedicalClearance: true,
    equipmentProvided: true,
    included: [
        'Guide certifié IFMGA (Fédération Internationale des Associations de Guides de Montagne)',
        'Matériel de bivouac (tente, sac de couchage -10°C, matelas)',
        'Crampons et piolet',
        'Casque et baudrier',
        'Repas du soir J1 et petit-déjeuner J2',
        'Trousse de premiers secours en montagne',
    ],
    notIncluded: [
        "Transport jusqu'à Chamonix",
        'Assurance rapatriement montagne (obligatoire — à souscrire avant)',
        'Hébergement la veille du départ',
        'Vêtements techniques personnels',
    ],
    meetingPoint: 'Office du Tourisme de Chamonix, 74400 Chamonix-Mont-Blanc',
    schedule: {
        startTimes: ['07:30'],
        daysAvailable: ['LUNDI', 'MERCREDI', 'VENDREDI', 'SAMEDI'],
        seasonAvailability: { from: '06-15', to: '09-30' },
    },
    languages: ['fr', 'en'],
    groupType: 'GROUPE_PRIVE',
};

/**
 * act_003 — Baptême de Plongée aux Tunnels de Jameos del Agua
 * Partenaire : Canary Tours (partner_002) | Commission : 12%
 * partnerPrice: 65 EUR | commissionAmount: 7.80 EUR | clientPrice: 72.80 EUR
 */
const act003: ActivityService = {
    id: 'act_003',
    partnerId: 'partner_002',
    title: 'Baptême de Plongée aux Tunnels Volcaniques Sous-Marins — Lanzarote',
    description:
        "Découvrez les tunnels de lave sous-marins de Lanzarote, parmi les plus spectaculaires de l'Atlantique. Encadré par des instructeurs certifiés PADI, ce baptême de plongée accessible à tous vous permet d'explorer des formations géologiques uniques et une faune marine endémique des Canaries, dont la crevette aveugle albinos Munida.",
    location: {
        city: 'Órzola',
        country: 'Espagne',
        region: 'Lanzarote, Îles Canaries',
        addressLine: 'Centro de Buceo Canary Dive, Puerto de Órzola, 35540',
        coordinates: { latitude: 29.2167, longitude: -13.4333 },
    },
    images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582939171-eecc47e4ba57?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.ACTIVITE,
    pricingUnit: 'PAR_PERSONNE',
    partnerPrice: 65,
    commissionRate: 0.12,
    commissionAmount: 7.8,
    clientPrice: 72.8,
    currency: 'EUR',
    rating: 4.7,
    reviewCount: 312,
    isAvailable: true,
    tags: [
        'lanzarote',
        'plongee',
        'canaries',
        'volcanique',
        'snorkeling',
        'padi',
        'mer',
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-28'),
    paymentMode: PaymentModeNames.FULL_CASH_ON_SITE,
    // Attributs spécifiques à la catégorie ACTIVITE
    activityType: 'PLONGEE',
    duration: 180,
    durationUnit: 'MINUTES',
    difficulty: 'DEBUTANT',
    physicalIntensity: 'MODEREE',
    minParticipants: 1,
    maxParticipants: 10,
    minAgeYears: 8,
    requiresMedicalClearance: false,
    certificationRequired: undefined,
    equipmentProvided: true,
    included: [
        'Équipement de plongée complet (bouteille, détendeur, gilet)',
        'Masque, tuba et palmes',
        'Instructeur certifié PADI bilingue',
        'Photos sous-marines numériques',
        'Brevet PADI Discover Scuba Diving remis en fin de session',
    ],
    notIncluded: [
        'Transport depuis votre hébergement',
        'Combinaison humide (location disponible sur place : 8 EUR)',
        'Assurance individuelle',
    ],
    meetingPoint: 'Centro de Buceo Canary Dive, Puerto de Órzola, Lanzarote',
    schedule: {
        startTimes: ['09:00', '14:00'],
        daysAvailable: [
            'LUNDI',
            'MARDI',
            'MERCREDI',
            'JEUDI',
            'VENDREDI',
            'SAMEDI',
            'DIMANCHE',
        ],
        seasonAvailability: { from: '01-01', to: '12-31' },
    },
    languages: ['es', 'en', 'fr', 'de'],
    groupType: 'GROUPE_PARTAGE',
};

// ============================================================
// BATEAUX
// ============================================================

/**
 * boat_001 — Catamaran "Cap Soleil" — Côte d'Azur
 * Partenaire : Canary Tours (partner_002) | Commission : 12%
 * partnerPrice: 750 EUR/jour | commissionAmount: 90 EUR | clientPrice: 840 EUR
 */
const boat001: BoatService = {
    id: 'boat_001',
    partnerId: 'partner_002',
    title: 'Catamaran "Cap Soleil" — Journée Privée Côte d\'Azur & Îles de Lérins',
    description:
        "Naviguez en toute sérénité à bord du catamaran Cap Soleil (12,5 m), avec skipper professionnel inclus. Explorez les eaux turquoise de la Côte d'Azur, ancrez-vous au large des Îles de Lérins et profitez du matériel de snorkeling et des paddles mis à disposition. Une journée inoubliable pour jusqu'à 10 passagers.",
    location: {
        city: 'Cannes',
        country: 'France',
        region: "Provence-Alpes-Côte d'Azur",
        addressLine: 'Vieux-Port de Cannes, Quai Saint-Pierre, 06400 Cannes',
        coordinates: { latitude: 43.5513, longitude: 7.0128 },
    },
    images: [
        'https://images.unsplash.com/photo-1500514966906-fe245eea9344?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548574520-7ba3e3f7f52e?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.BATEAU,
    pricingUnit: 'PAR_JOUR',
    partnerPrice: 750,
    commissionRate: 0.12,
    commissionAmount: 90,
    clientPrice: 840,
    currency: 'EUR',
    rating: 4.9,
    reviewCount: 64,
    isAvailable: true,
    tags: [
        'catamaran',
        'cote-d-azur',
        'cannes',
        'iles-de-lerins',
        'skipper',
        'privatise',
        'luxe',
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-20'),
    paymentMode: PaymentModeNames.FULL_ONLINE,
    // Attributs spécifiques à la catégorie BATEAU
    boatType: 'CATAMARAN',
    boatName: 'Cap Soleil',
    passengerCapacity: 10,
    sleepingBerths: 6,
    lengthMeters: 12.5,
    manufactureYear: 2019,
    engineType: 'VOILE_ET_MOTEUR',
    enginePowerKw: 2 * 30,
    rentalMode: 'AVEC_SKIPPER',
    cabins: 3,
    bathrooms: 2,
    amenities: [
        'GPS Chartplotter',
        'VHF',
        'Cuisine équipée (réfrigérateur, plaque gaz)',
        'Matériel de snorkeling (masques + palmes)',
        '2 Paddles',
        'Douche eau douce',
        'Enceinte Bluetooth',
        'Glacière',
    ],
    navigationArea: [
        "Côte d'Azur",
        'Esterel',
        'Îles de Lérins',
        'Principauté de Monaco',
    ],
    licenseRequired: false,
    fuelIncluded: true,
    depositAmountEur: 2000,
    insuranceIncluded: true,
    departurePorts: ['Vieux-Port de Cannes', "Port d'Antibes", 'Port de Nice'],
    availableForDayCharter: true,
    availableForWeekCharter: true,
};

/**
 * boat_002 — Voilier "L'Aventurier" — Méditerranée, location bare-boat
 * Partenaire : Exp-Travel Ltd (partner_001) | Commission : 15%
 * partnerPrice: 520 EUR/jour | commissionAmount: 78 EUR | clientPrice: 598 EUR
 */
const boat002: BoatService = {
    id: 'boat_002',
    partnerId: 'partner_001',
    title: 'Voilier "L\'Aventurier" — Location Bare-Boat Méditerranée (Marseille / Corse)',
    description:
        "Partez à la barre de ce voilier Jeanneau 38 sans skipper (bare-boat) pour explorer la Méditerranée à votre rythme. Navigation entre Marseille, les Calanques, Cassis, et la Corse. Bateau parfaitement entretenu, équipé d'un chartplotter récent et d'un pilote automatique. Permis hauturier requis.",
    location: {
        city: 'Marseille',
        country: 'France',
        region: "Provence-Alpes-Côte d'Azur",
        addressLine: 'Marina de Marseille, Capitainerie, 13008 Marseille',
        coordinates: { latitude: 43.2965, longitude: 5.3698 },
    },
    images: [
        'https://images.unsplash.com/photo-1559628233-100c798642d3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523287409476-a9e72a7c8da7?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.BATEAU,
    pricingUnit: 'PAR_JOUR',
    partnerPrice: 520,
    commissionRate: 0.15,
    commissionAmount: 78,
    clientPrice: 598,
    currency: 'EUR',
    rating: 4.6,
    reviewCount: 38,
    isAvailable: true,
    tags: [
        'voilier',
        'marseille',
        'corse',
        'calanques',
        'bare-boat',
        'autonomie',
        'mediterranee',
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-18'),
    paymentMode: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    // Attributs spécifiques à la catégorie BATEAU
    boatType: 'VOILIER',
    boatName: "L'Aventurier",
    passengerCapacity: 6,
    sleepingBerths: 4,
    lengthMeters: 11.5,
    manufactureYear: 2016,
    engineType: 'VOILE_ET_MOTEUR',
    enginePowerKw: 30,
    rentalMode: 'BARE_BOAT',
    cabins: 2,
    bathrooms: 1,
    amenities: [
        "GPS Chartplotter Garmin 7'",
        'VHF fixe + portable',
        'Pilote automatique',
        'Sondeur',
        'Annexe pneumatique avec moteur 5cv',
        'Gilets de sauvetage homologués (6 adultes)',
        'Radeau de survie',
        'Winch électrique',
    ],
    navigationArea: [
        "Côte d'Azur",
        'Calanques de Marseille',
        'Cassis',
        'Corse (Porto-Vecchio)',
        'Italie du Nord (Cinque Terre)',
    ],
    licenseRequired: true,
    licenseType: 'Permis Hauturier (ou équivalent européen ICC)',
    fuelIncluded: false,
    depositAmountEur: 3000,
    insuranceIncluded: true,
    departurePorts: ['Marina de Marseille', 'Port de La Ciotat'],
    availableForDayCharter: true,
    availableForWeekCharter: true,
};

// ============================================================
// HEBERGEMENTS
// ============================================================

/**
 * heb_001 — Villa "La Palmera" — Lanzarote
 * Partenaire : Canary Tours (partner_002) | Commission : 12%
 * partnerPrice: 180 EUR/nuit | commissionAmount: 21.60 EUR | clientPrice: 201.60 EUR
 */
const heb001: AccommodationService = {
    id: 'heb_001',
    partnerId: 'partner_002',
    title: 'Villa "La Palmera" — Piscine Privée & Vue Mer — Famara, Lanzarote',
    description:
        "Villa de style canarien implantée sur les hauteurs de Famara, avec vue panoramique sur l'Atlantique et le Parc National de Timanfaya. Trois chambres indépendantes, piscine privée chauffée, terrasse barbecue et jardin tropical. Idéale pour les familles et les groupes en quête d'authenticité et de calme absolu.",
    location: {
        city: 'Famara',
        country: 'Espagne',
        region: 'Lanzarote, Îles Canaries',
        addressLine:
            'Urbanización El Risco, Calle Las Palmeras 12, 35560 Caleta de Famara',
        coordinates: { latitude: 29.1167, longitude: -13.5667 },
    },
    images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9028d81?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.HEBERGEMENT,
    pricingUnit: 'PAR_NUIT',
    partnerPrice: 180,
    commissionRate: 0.12,
    commissionAmount: 21.6,
    clientPrice: 201.6,
    currency: 'EUR',
    rating: 4.8,
    reviewCount: 127,
    isAvailable: true,
    tags: [
        'lanzarote',
        'villa',
        'piscine',
        'vue-mer',
        'famara',
        'canaries',
        'famille',
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-22'),
    paymentMode: PaymentModeNames.FULL_ONLINE,
    // Attributs spécifiques à la catégorie HEBERGEMENT
    accommodationType: 'VILLA',
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    totalSurfaceM2: 180,
    amenities: [
        'Piscine privée chauffée',
        'Terrasse avec barbecue',
        'Salon extérieur avec vue mer',
        'WiFi fibre optique',
        'Climatisation réversible (toutes les pièces)',
        'Cuisine entièrement équipée (lave-vaisselle, Nespresso)',
        'Jardin tropical avec palmiers',
        'Parking privé (2 voitures)',
        'Télévision 4K',
    ],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    breakfastIncluded: false,
    minimumStayNights: 3,
    petsAllowed: false,
    smokingAllowed: false,
    accessibilityFeatures: [
        'Accès en plain-pied depuis le parking',
        "Absence d'escaliers intérieurs entre les chambres principales",
    ],
    houseRules: [
        'Non-fumeur (intérieur et extérieur)',
        'Animaux de compagnie non autorisés',
        'Fêtes et événements non autorisés',
        'Silence entre 23h00 et 08h00',
    ],
    cancellationPolicy: 'MODEREE',
    nearbyAttractions: [
        'Plage de Famara — surf et kitesurf (800 m)',
        'Caleta de Famara — village de pêcheurs (1,2 km)',
        'Parc National de Timanfaya — volcans (15 km)',
        'Jameos del Agua — tunnel volcanique (8 km)',
    ],
    distanceToBeachMeters: 800,
    distanceToCityKm: 12,
};

/**
 * heb_002 — Appartement Haussmannien — Paris 7e
 * Partenaire : Exp-Travel Ltd (partner_001) | Commission : 15%
 * partnerPrice: 220 EUR/nuit | commissionAmount: 33 EUR | clientPrice: 253 EUR
 */
const heb002: AccommodationService = {
    id: 'heb_002',
    partnerId: 'partner_001',
    title: 'Appartement Haussmannien Parquet Ancien — Paris 7e, Vue Toits',
    description:
        "Au 4e étage d'un immeuble haussmannien avec ascenseur, cet appartement de 90 m² associe le charme de l'architecture parisienne du XIXe siècle (parquet point de Hongrie, moulures, cheminée) au confort moderne. Deux chambres, idéal pour 4 personnes. Situé à 800 m de la Tour Eiffel et 400 m du Musée d'Orsay.",
    location: {
        city: 'Paris',
        country: 'France',
        region: 'Île-de-France',
        addressLine: '42 Rue de Grenelle, 75007 Paris',
        coordinates: { latitude: 48.855, longitude: 2.3193 },
    },
    images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.HEBERGEMENT,
    pricingUnit: 'PAR_NUIT',
    partnerPrice: 220,
    commissionRate: 0.15,
    commissionAmount: 33,
    clientPrice: 253,
    currency: 'EUR',
    rating: 4.7,
    reviewCount: 85,
    isAvailable: true,
    tags: [
        'paris',
        'haussmannien',
        'appartement',
        '7eme',
        'eiffel',
        'luxe',
        'charme',
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-03-19'),
    paymentMode: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    // Attributs spécifiques à la catégorie HEBERGEMENT
    accommodationType: 'APPARTEMENT',
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    totalSurfaceM2: 90,
    amenities: [
        'WiFi fibre haut débit',
        'Climatisation réversible (salon + chambres)',
        'Machine à laver et sèche-linge',
        'Lave-vaisselle',
        'Four et micro-ondes',
        'Télévision 55" avec Netflix',
        'Vue sur les toits parisiens',
        "Parquet en point de Hongrie d'époque",
        'Cheminée décorative',
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    breakfastIncluded: false,
    minimumStayNights: 2,
    petsAllowed: false,
    smokingAllowed: false,
    accessibilityFeatures: [
        'Ascenseur (accès au 4e étage)',
        "Porte d'entrée de 90 cm de large",
        'Douche italienne (niveau zéro)',
    ],
    houseRules: [
        'Non-fumeur (intérieur strictement)',
        'Animaux de compagnie non autorisés (règlement de copropriété)',
        'Nuisances sonores interdites après 22h00',
        'Fêtes non autorisées',
    ],
    cancellationPolicy: 'STRICTE',
    nearbyAttractions: [
        'Tour Eiffel (800 m)',
        "Musée d'Orsay (400 m)",
        "Hôtel des Invalides & Musée de l'Armée (300 m)",
        'Musée Rodin (600 m)',
        'Bon Marché (1,2 km)',
    ],
    distanceToCityKm: 0,
};

// ============================================================
// VOITURES
// ============================================================

/**
 * car_001 — Toyota Yaris Cross Hybride — Lanzarote
 * Partenaire : Canary Tours (partner_002) | Commission : 12%
 * partnerPrice: 35 EUR/jour | commissionAmount: 4.20 EUR | clientPrice: 39.20 EUR
 */
const car001: CarService = {
    id: 'car_001',
    partnerId: 'partner_002',
    title: 'Toyota Yaris Cross Hybride — Location Flex, Aéroport Lanzarote',
    description:
        "Crossover hybride économique et confortable, idéal pour explorer Lanzarote : routes volcaniques du Timanfaya, côtes nord sauvages, villages de vignerons de La Geria. Consommation réduite, automatique, climatisation puissante pour les journées canariennes. Kilométrage illimité, livraison à l'aéroport disponible.",
    location: {
        city: 'Arrecife',
        country: 'Espagne',
        region: 'Lanzarote, Îles Canaries',
        addressLine: 'Aéroport de Lanzarote (ACE), 35500 San Bartolomé',
        coordinates: { latitude: 28.9455, longitude: -13.6052 },
    },
    images: [
        'https://images.unsplash.com/photo-1549924777-3e41bd86f70c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.VOITURE,
    pricingUnit: 'PAR_JOUR',
    partnerPrice: 35,
    commissionRate: 0.12,
    commissionAmount: 4.2,
    clientPrice: 39.2,
    currency: 'EUR',
    rating: 4.6,
    reviewCount: 203,
    isAvailable: true,
    tags: [
        'lanzarote',
        'hybride',
        'automatique',
        'suv',
        'aeroport',
        'canaries',
        'ecologique',
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-29'),
    paymentMode: PaymentModeNames.FULL_CASH_ON_SITE,
    // Attributs spécifiques à la catégorie VOITURE
    vehicleType: 'SUV',
    brand: 'Toyota',
    model: 'Yaris Cross',
    year: 2023,
    transmission: 'AUTOMATIQUE',
    fuelType: 'HYBRIDE',
    seats: 5,
    doors: 5,
    luggage: {
        smallBags: 2,
        largeSuitcases: 1,
    },
    airConditioning: true,
    driverMinAge: 21,
    driverLicenseYearsRequired: 1,
    fuelIncluded: false,
    mileageLimit: 'ILLIMITE',
    insuranceIncluded: true,
    depositAmountEur: 500,
    deliveryAvailable: true,
    deliveryLocations: [
        'Aéroport de Lanzarote (ACE)',
        'Puerto del Carmen — Centre',
        'Costa Teguise — Zone Hôtelière',
        'Playa Blanca — Centre',
    ],
    additionalDriverAllowed: true,
    additionalDriverFeePerDay: 8,
    pickupLocations: [
        'Aéroport de Lanzarote (ACE) — Hall Arrivées',
        'Bureau Arrecife — Centre-ville',
    ],
};

/**
 * car_002 — Peugeot 3008 SUV — Paris Aéroport CDG
 * Partenaire : Exp-Travel Ltd (partner_001) | Commission : 15%
 * partnerPrice: 55 EUR/jour | commissionAmount: 8.25 EUR | clientPrice: 63.25 EUR
 */
const car002: CarService = {
    id: 'car_002',
    partnerId: 'partner_001',
    title: 'Peugeot 3008 SUV Automatique — Aéroport Paris CDG & Orly',
    description:
        "SUV premium familial pour explorer la région parisienne ou descendre vers la Loire et la Normandie. Boîte automatique 8 rapports, régulateur de vitesse adaptatif, grand coffre et écran central panoramique. Livraison possible aux terminaux CDG et Orly. Kilométrage illimité inclus d'office.",
    location: {
        city: 'Roissy-en-France',
        country: 'France',
        region: 'Île-de-France',
        addressLine:
            'Aéroport Paris-Charles de Gaulle, Terminal 2, 95700 Roissy-en-France',
        coordinates: { latitude: 49.0097, longitude: 2.5479 },
    },
    images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    category: ServiceCategoryNames.VOITURE,
    pricingUnit: 'PAR_JOUR',
    partnerPrice: 55,
    commissionRate: 0.15,
    commissionAmount: 8.25,
    clientPrice: 63.25,
    currency: 'EUR',
    rating: 4.5,
    reviewCount: 156,
    isAvailable: true,
    tags: [
        'paris',
        'cdg',
        'orly',
        'suv',
        'peugeot',
        'automatique',
        'premium',
        'famille',
    ],
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-29'),
    paymentMode: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    // Attributs spécifiques à la catégorie VOITURE
    vehicleType: 'SUV',
    brand: 'Peugeot',
    model: '3008',
    year: 2022,
    transmission: 'AUTOMATIQUE',
    fuelType: 'DIESEL',
    seats: 5,
    doors: 5,
    luggage: {
        smallBags: 2,
        largeSuitcases: 2,
    },
    airConditioning: true,
    driverMinAge: 23,
    driverLicenseYearsRequired: 2,
    fuelIncluded: false,
    mileageLimit: 'ILLIMITE',
    insuranceIncluded: true,
    depositAmountEur: 1000,
    deliveryAvailable: true,
    deliveryLocations: [
        'CDG Terminal 1',
        'CDG Terminal 2 (E, F, G)',
        'Orly Terminal 1',
        'Orly Terminal 2',
        'Paris Centre (75001—75020)',
    ],
    additionalDriverAllowed: true,
    additionalDriverFeePerDay: 15,
    pickupLocations: [
        'CDG Terminal 1 — Hall Arrivées',
        'CDG Terminal 2E — Hall Arrivées',
        'Orly Terminal 2 — Hall Arrivées',
    ],
};

// ============================================================
// EXPORTS
// ============================================================

/** Catalogue des activités de la plateforme Wandireo. */
export const mockActivities: ActivityService[] = [act001, act002, act003];

/** Catalogue des locations de bateaux de la plateforme Wandireo. */
export const mockBoats: BoatService[] = [boat001, boat002];

/** Catalogue des hébergements de la plateforme Wandireo. */
export const mockAccommodations: AccommodationService[] = [heb001, heb002];

/** Catalogue des locations de voitures de la plateforme Wandireo. */
export const mockCars: CarService[] = [car001, car002];

/**
 * Catalogue global combinant tous les services toutes catégories confondues.
 * Peut être filtré par `service.category` pour obtenir une catégorie spécifique.
 */
export const mockServices: Service[] = [
    ...mockActivities,
    ...mockBoats,
    ...mockAccommodations,
    ...mockCars,
];
