/**
 * @file pages/PartnerCatalogPage/index.tsx
 * @description Gestion du catalogue de services — Espace Partenaire Wandireo.
 *
 * CRUD complet sur les services du partenaire connecte :
 *   - Liste des services filtree par partnerId depuis l'API Laravel
 *   - Creation via formulaire modal avec sections specifiques par categorie
 *   - Modification avec pre-remplissage complet des champs types
 *   - Suppression avec confirmation inline
 *   - Basculement de disponibilite inline
 *
 * Typage strict : aucun cast `as Service`.
 *   buildService() retourne ActivityService | BoatService | AccommodationService | CarService
 *   en fonction du discriminant `category` — verifie statiquement par TypeScript.
 *
 * Calcul des prix (invariant marketplace) :
 *   commissionAmount = partnerPrice * commissionRate
 *   clientPrice      = partnerPrice + commissionAmount
 */

import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { servicesApi } from '@/api/services';
import { Button, useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { usePartnerApprovalGuard } from '@/hooks/usePartnerApprovalGuard';
import { useServicesData } from '@/hooks/useServicesData';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import {
    PaymentModeLabels
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
} from '@/types/service';
import type {Service, ActivityService, BoatService, AccommodationService, CarService, ServiceCategory, ServicePricingUnit, PaymentMode, ActivityType, DifficultyLevel, PhysicalIntensity, GroupType, BoatType, EngineType, RentalMode, AccommodationType, CancellationPolicy, VehicleType, TransmissionType, FuelType, DayOfWeek} from '@/types/service';
import './PartnerCatalogPage.css';

// ============================================================
// Types internes
// ============================================================

/**
 * Etat plat du formulaire couvrant les champs de TOUTES les categories.
 * Seule la section correspondant a la categorie selectionnee est affichee.
 * Les valeurs numeriques sont stockees en chaine pour les <input type="number">.
 * buildService() convertit et valide les types avant creation de l'objet Service.
 */
interface ServiceFormState {
    // ---- Champs communs (BaseService) ----
    title: string;
    description: string;
    category: ServiceCategory;
    pricingUnit: ServicePricingUnit;
    partnerPrice: string;
    currency: string;
    paymentMode: PaymentMode;
    city: string;
    country: string;
    region: string;
    tags: string; // virgule-separees
    isAvailable: boolean;

    // ---- Specifiques ACTIVITE (ActivityService) ----
    activityType: ActivityType;
    duration: string;
    durationUnit: 'MINUTES' | 'HEURES' | 'JOURS';
    difficulty: DifficultyLevel;
    physicalIntensity: PhysicalIntensity;
    minParticipants: string;
    maxParticipants: string;
    minAgeYears: string;
    requiresMedicalClearance: boolean;
    certificationRequired: string; // optionnel ex: "PADI Open Water"
    equipmentProvided: boolean;
    meetingPoint: string;
    languages: string; // virgule-separees (codes ISO ex: "fr, en")
    groupType: GroupType;
    included: string; // un element par ligne
    notIncluded: string; // un element par ligne
    scheduleStartTimes: string; // virgule-separees ex: "09:00, 14:00"
    daysAvailable: string; // virgule-separees ex: "LUNDI, SAMEDI, DIMANCHE"

    // ---- Specifiques BATEAU (BoatService) ----
    boatType: BoatType;
    boatName: string;
    passengerCapacity: string;
    sleepingBerths: string;
    lengthMeters: string;
    manufactureYear: string;
    engineType: EngineType;
    enginePowerKw: string; // optionnel, puissance moteur en kW
    rentalMode: RentalMode;
    boatCabins: string;
    boatBathrooms: string;
    boatAmenities: string; // virgule-separees
    navigationArea: string; // virgule-separees
    licenseRequired: boolean;
    licenseType: string; // optionnel, requis si licenseRequired
    boatFuelIncluded: boolean;
    boatDepositAmountEur: string;
    boatInsuranceIncluded: boolean;
    departurePorts: string; // virgule-separees
    boatAvailableForDayCharter: boolean;
    boatAvailableForWeekCharter: boolean;

    // ---- Specifiques HEBERGEMENT (AccommodationService) ----
    accommodationType: AccommodationType;
    starRating: string; // '' | '1'..'5' (hotels uniquement)
    maxGuests: string;
    bedrooms: string;
    hebBathrooms: string;
    totalSurfaceM2: string; // optionnel, surface en m²
    checkInTime: string;
    checkOutTime: string;
    breakfastIncluded: boolean;
    minimumStayNights: string;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    cancellationPolicy: CancellationPolicy;
    hebAmenities: string; // virgule-separees
    hebAccessibilityFeatures: string; // virgule-separees
    hebHouseRules: string; // un element par ligne
    hebNearbyAttractions: string; // virgule-separees
    distanceToBeachMeters: string; // optionnel
    distanceToCityKm: string; // optionnel

    // ---- Specifiques VOITURE (CarService) ----
    vehicleType: VehicleType;
    brand: string;
    model: string;
    year: string;
    transmission: TransmissionType;
    fuelType: FuelType;
    seats: string;
    doors: string;
    luggageSmallBags: string; // nombre de petits sacs cabine
    luggageLargeSuitcases: string; // nombre de grandes valises
    airConditioning: boolean;
    driverMinAge: string;
    driverLicenseYearsRequired: string;
    carFuelIncluded: boolean;
    carInsuranceIncluded: boolean;
    carDepositAmountEur: string;
    mileageLimit: string; // nombre ou 'ILLIMITE'
    mileageExtraChargePerKm: string; // EUR/km si mileage non ILLIMITE (optionnel)
    deliveryAvailable: boolean;
    deliveryLocations: string; // virgule-separees si deliveryAvailable
    additionalDriverAllowed: boolean;
    additionalDriverFeePerDay: string;
    pickupLocations: string; // virgule-separees
}

const DEFAULT_FORM: ServiceFormState = {
    // Communs
    title: '',
    description: '',
    category: 'ACTIVITE',
    pricingUnit: 'PAR_PERSONNE',
    partnerPrice: '',
    currency: 'EUR',
    paymentMode: 'FULL_ONLINE',
    city: '',
    country: '',
    region: '',
    tags: '',
    isAvailable: true,
    // ACTIVITE
    activityType: 'RANDONNEE',
    duration: '60',
    durationUnit: 'MINUTES',
    difficulty: 'TOUS_NIVEAUX',
    physicalIntensity: 'MODEREE',
    minParticipants: '1',
    maxParticipants: '10',
    minAgeYears: '0',
    requiresMedicalClearance: false,
    certificationRequired: '',
    equipmentProvided: false,
    meetingPoint: '',
    languages: 'fr',
    groupType: 'GROUPE_PARTAGE',
    included: '',
    notIncluded: '',
    scheduleStartTimes: '09:00',
    daysAvailable: 'LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE',
    // BATEAU
    boatType: 'VOILIER',
    boatName: '',
    passengerCapacity: '6',
    sleepingBerths: '2',
    lengthMeters: '10',
    manufactureYear: '2020',
    engineType: 'VOILE_ET_MOTEUR',
    enginePowerKw: '',
    rentalMode: 'AVEC_SKIPPER',
    boatCabins: '2',
    boatBathrooms: '1',
    boatAmenities: '',
    navigationArea: '',
    licenseRequired: false,
    licenseType: '',
    boatFuelIncluded: false,
    boatDepositAmountEur: '0',
    boatInsuranceIncluded: true,
    departurePorts: '',
    boatAvailableForDayCharter: true,
    boatAvailableForWeekCharter: true,
    // HEBERGEMENT
    accommodationType: 'APPARTEMENT',
    starRating: '',
    maxGuests: '4',
    bedrooms: '2',
    hebBathrooms: '1',
    totalSurfaceM2: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    breakfastIncluded: false,
    minimumStayNights: '1',
    petsAllowed: false,
    smokingAllowed: false,
    cancellationPolicy: 'MODEREE',
    hebAmenities: '',
    hebAccessibilityFeatures: '',
    hebHouseRules: '',
    hebNearbyAttractions: '',
    distanceToBeachMeters: '',
    distanceToCityKm: '',
    // VOITURE
    vehicleType: 'SUV',
    brand: '',
    model: '',
    year: '2022',
    transmission: 'AUTOMATIQUE',
    fuelType: 'ESSENCE',
    seats: '5',
    doors: '4',
    luggageSmallBags: '2',
    luggageLargeSuitcases: '1',
    airConditioning: true,
    driverMinAge: '21',
    driverLicenseYearsRequired: '2',
    carFuelIncluded: false,
    carInsuranceIncluded: true,
    carDepositAmountEur: '500',
    mileageLimit: 'ILLIMITE',
    mileageExtraChargePerKm: '',
    deliveryAvailable: false,
    deliveryLocations: '',
    additionalDriverAllowed: true,
    additionalDriverFeePerDay: '15',
    pickupLocations: '',
};

// ============================================================
// initFormFromService : Service → ServiceFormState
// ============================================================

/** Pré-remplit le formulaire depuis un Service existant typé. */
function initFormFromService(service: Service): ServiceFormState {
    const base: ServiceFormState = {
        ...DEFAULT_FORM,
        title: service.title,
        description: service.description,
        category: service.category,
        pricingUnit: service.pricingUnit,
        partnerPrice: String(service.partnerPrice),
        currency: service.currency,
        paymentMode: service.paymentMode,
        city: service.location.city,
        country: service.location.country,
        region: service.location.region ?? '',
        tags: service.tags.join(', '),
        isAvailable: service.isAvailable,
    };

    if (service.category === 'ACTIVITE') {
        return {
            ...base,
            activityType: service.activityType,
            duration: String(service.duration),
            durationUnit: service.durationUnit,
            difficulty: service.difficulty,
            physicalIntensity: service.physicalIntensity,
            minParticipants: String(service.minParticipants),
            maxParticipants: String(service.maxParticipants),
            minAgeYears: String(service.minAgeYears),
            requiresMedicalClearance: service.requiresMedicalClearance,
            equipmentProvided: service.equipmentProvided,
            meetingPoint: service.meetingPoint,
            languages: service.languages.join(', '),
            groupType: service.groupType,
            included: service.included.join('\n'),
            notIncluded: service.notIncluded.join('\n'),
            scheduleStartTimes: service.schedule.startTimes.join(', '),
            daysAvailable: (service.schedule.daysAvailable ?? []).join(', '),
            certificationRequired: service.certificationRequired ?? '',
        };
    }

    if (service.category === 'BATEAU') {
        return {
            ...base,
            boatType: service.boatType,
            boatName: service.boatName,
            passengerCapacity: String(service.passengerCapacity),
            sleepingBerths: String(service.sleepingBerths),
            lengthMeters: String(service.lengthMeters),
            manufactureYear: String(service.manufactureYear),
            engineType: service.engineType,
            rentalMode: service.rentalMode,
            boatCabins: String(service.cabins),
            boatBathrooms: String(service.bathrooms),
            boatAmenities: service.amenities.join(', '),
            navigationArea: service.navigationArea.join(', '),
            licenseRequired: service.licenseRequired,
            boatFuelIncluded: service.fuelIncluded,
            boatDepositAmountEur: String(service.depositAmountEur),
            boatInsuranceIncluded: service.insuranceIncluded,
            departurePorts: service.departurePorts.join(', '),
            licenseType: service.licenseType ?? '',
            enginePowerKw:
                service.enginePowerKw != null
                    ? String(service.enginePowerKw)
                    : '',
            boatAvailableForDayCharter: service.availableForDayCharter,
            boatAvailableForWeekCharter: service.availableForWeekCharter,
        };
    }

    if (service.category === 'HEBERGEMENT') {
        return {
            ...base,
            accommodationType: service.accommodationType,
            maxGuests: String(service.maxGuests),
            bedrooms: String(service.bedrooms),
            hebBathrooms: String(service.bathrooms),
            checkInTime: service.checkInTime,
            checkOutTime: service.checkOutTime,
            breakfastIncluded: service.breakfastIncluded,
            minimumStayNights: String(service.minimumStayNights),
            petsAllowed: service.petsAllowed,
            smokingAllowed: service.smokingAllowed,
            cancellationPolicy: service.cancellationPolicy,
            hebAmenities: service.amenities.join(', '),
            starRating:
                service.starRating != null ? String(service.starRating) : '',
            totalSurfaceM2:
                service.totalSurfaceM2 != null
                    ? String(service.totalSurfaceM2)
                    : '',
            distanceToBeachMeters:
                service.distanceToBeachMeters != null
                    ? String(service.distanceToBeachMeters)
                    : '',
            distanceToCityKm:
                service.distanceToCityKm != null
                    ? String(service.distanceToCityKm)
                    : '',
            hebAccessibilityFeatures: service.accessibilityFeatures.join(', '),
            hebHouseRules: service.houseRules.join('\n'),
            hebNearbyAttractions: service.nearbyAttractions.join(', '),
        };
    }

    // VOITURE
    return {
        ...base,
        vehicleType: service.vehicleType,
        brand: service.brand,
        model: service.model,
        year: String(service.year),
        transmission: service.transmission,
        fuelType: service.fuelType,
        seats: String(service.seats),
        doors: String(service.doors),
        airConditioning: service.airConditioning,
        driverMinAge: String(service.driverMinAge),
        driverLicenseYearsRequired: String(service.driverLicenseYearsRequired),
        carFuelIncluded: service.fuelIncluded,
        carInsuranceIncluded: service.insuranceIncluded,
        carDepositAmountEur: String(service.depositAmountEur),
        deliveryAvailable: service.deliveryAvailable,
        additionalDriverAllowed: service.additionalDriverAllowed,
        additionalDriverFeePerDay: String(service.additionalDriverFeePerDay),
        pickupLocations: service.pickupLocations.join(', '),
        mileageLimit:
            service.mileageLimit === 'ILLIMITE'
                ? 'ILLIMITE'
                : String(service.mileageLimit),
        mileageExtraChargePerKm:
            service.mileageExtraChargePerKm != null
                ? String(service.mileageExtraChargePerKm)
                : '',
        luggageSmallBags: String(service.luggage.smallBags),
        luggageLargeSuitcases: String(service.luggage.largeSuitcases),
        deliveryLocations: (service.deliveryLocations ?? []).join(', '),
    };
}

// ============================================================
// buildService : ServiceFormState → Service (discrimine, typé)
// ============================================================

/**
 * Construit un objet Service valide depuis les donnees du formulaire.
 * Chaque branche retourne le type exact (ActivityService, BoatService, etc.)
 * — aucun cast `as Service`.
 */
function buildService(
    formData: ServiceFormState,
    partnerId: string,
    commissionRate: number,
    existing: Service | null,
): Service {
    const partnerPrice = parseFloat(formData.partnerPrice) || 0;
    const commissionAmount = +(partnerPrice * commissionRate).toFixed(2);
    const clientPrice = +(partnerPrice + commissionAmount).toFixed(2);
    const now = new Date();

    const id = existing?.id ?? `svc_${Date.now()}`;
    const location = {
        city: formData.city.trim(),
        country: formData.country.trim(),
        ...(formData.region.trim() ? { region: formData.region.trim() } : {}),
    };
    const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    if (formData.category === 'ACTIVITE') {
        const s: ActivityService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: 'ACTIVITE',
            pricingUnit:
                formData.pricingUnit === 'PAR_GROUPE'
                    ? 'PAR_GROUPE'
                    : 'PAR_PERSONNE',
            partnerPrice,
            commissionRate,
            commissionAmount,
            clientPrice,
            currency: formData.currency,
            rating: existing?.rating,
            reviewCount: existing?.reviewCount ?? 0,
            isAvailable: formData.isAvailable,
            tags,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            paymentMode: formData.paymentMode,
            activityType: formData.activityType,
            duration: parseFloat(formData.duration) || 60,
            durationUnit: formData.durationUnit,
            difficulty: formData.difficulty,
            physicalIntensity: formData.physicalIntensity,
            minParticipants: parseInt(formData.minParticipants) || 1,
            maxParticipants: parseInt(formData.maxParticipants) || 10,
            minAgeYears: parseInt(formData.minAgeYears) || 0,
            requiresMedicalClearance: formData.requiresMedicalClearance,
            equipmentProvided: formData.equipmentProvided,
            included: formData.included
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            notIncluded: formData.notIncluded
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            meetingPoint: formData.meetingPoint.trim(),
            schedule: {
                startTimes: formData.scheduleStartTimes
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                daysAvailable: formData.daysAvailable
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean) as DayOfWeek[],
            },
            languages: formData.languages
                .split(',')
                .map((l) => l.trim())
                .filter(Boolean),
            groupType: formData.groupType,
            ...(formData.certificationRequired.trim()
                ? {
                      certificationRequired:
                          formData.certificationRequired.trim(),
                  }
                : {}),
        };

        return s;
    }

    if (formData.category === 'BATEAU') {
        const validBoatUnit = [
            'PAR_JOUR',
            'PAR_DEMI_JOURNEE',
            'PAR_SEMAINE',
        ].includes(formData.pricingUnit)
            ? (formData.pricingUnit as
                  | 'PAR_JOUR'
                  | 'PAR_DEMI_JOURNEE'
                  | 'PAR_SEMAINE')
            : 'PAR_JOUR';
        const s: BoatService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: 'BATEAU',
            pricingUnit: validBoatUnit,
            partnerPrice,
            commissionRate,
            commissionAmount,
            clientPrice,
            currency: formData.currency,
            rating: existing?.rating,
            reviewCount: existing?.reviewCount ?? 0,
            isAvailable: formData.isAvailable,
            tags,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            paymentMode: formData.paymentMode,
            boatType: formData.boatType,
            boatName: formData.boatName.trim(),
            passengerCapacity: parseInt(formData.passengerCapacity) || 6,
            sleepingBerths: parseInt(formData.sleepingBerths) || 0,
            lengthMeters: parseFloat(formData.lengthMeters) || 10,
            manufactureYear: parseInt(formData.manufactureYear) || 2020,
            engineType: formData.engineType,
            rentalMode: formData.rentalMode,
            cabins: parseInt(formData.boatCabins) || 1,
            bathrooms: parseInt(formData.boatBathrooms) || 1,
            amenities: formData.boatAmenities
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            navigationArea: formData.navigationArea
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            licenseRequired: formData.licenseRequired,
            ...(formData.licenseType.trim()
                ? { licenseType: formData.licenseType.trim() }
                : {}),
            fuelIncluded: formData.boatFuelIncluded,
            depositAmountEur: parseFloat(formData.boatDepositAmountEur) || 0,
            insuranceIncluded: formData.boatInsuranceIncluded,
            departurePorts: formData.departurePorts
                .split(',')
                .map((p) => p.trim())
                .filter(Boolean),
            ...(formData.enginePowerKw.trim()
                ? { enginePowerKw: parseFloat(formData.enginePowerKw) }
                : {}),
            availableForDayCharter: formData.boatAvailableForDayCharter,
            availableForWeekCharter: formData.boatAvailableForWeekCharter,
        };

        return s;
    }

    if (formData.category === 'HEBERGEMENT') {
        const validHebUnit =
            formData.pricingUnit === 'PAR_SEMAINE' ? 'PAR_SEMAINE' : 'PAR_NUIT';
        const s: AccommodationService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: 'HEBERGEMENT',
            pricingUnit: validHebUnit,
            partnerPrice,
            commissionRate,
            commissionAmount,
            clientPrice,
            currency: formData.currency,
            rating: existing?.rating,
            reviewCount: existing?.reviewCount ?? 0,
            isAvailable: formData.isAvailable,
            tags,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            paymentMode: formData.paymentMode,
            accommodationType: formData.accommodationType,
            maxGuests: parseInt(formData.maxGuests) || 2,
            bedrooms: parseInt(formData.bedrooms) || 1,
            bathrooms: parseInt(formData.hebBathrooms) || 1,
            amenities: formData.hebAmenities
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            breakfastIncluded: formData.breakfastIncluded,
            minimumStayNights: parseInt(formData.minimumStayNights) || 1,
            petsAllowed: formData.petsAllowed,
            smokingAllowed: formData.smokingAllowed,
            accessibilityFeatures: formData.hebAccessibilityFeatures
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            houseRules: formData.hebHouseRules
                .split('\n')
                .map((r) => r.trim())
                .filter(Boolean),
            cancellationPolicy: formData.cancellationPolicy,
            nearbyAttractions: formData.hebNearbyAttractions
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
            ...(formData.starRating
                ? {
                      starRating: parseInt(formData.starRating) as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5,
                  }
                : {}),
            ...(formData.totalSurfaceM2.trim()
                ? { totalSurfaceM2: parseFloat(formData.totalSurfaceM2) }
                : {}),
            ...(formData.distanceToBeachMeters.trim()
                ? {
                      distanceToBeachMeters: parseFloat(
                          formData.distanceToBeachMeters,
                      ),
                  }
                : {}),
            ...(formData.distanceToCityKm.trim()
                ? { distanceToCityKm: parseFloat(formData.distanceToCityKm) }
                : {}),
        };

        return s;
    }

    // VOITURE
    const validCarUnit =
        formData.pricingUnit === 'PAR_SEMAINE' ? 'PAR_SEMAINE' : 'PAR_JOUR';
    const mileageLimit =
        formData.mileageLimit === 'ILLIMITE'
            ? ('ILLIMITE' as const)
            : parseFloat(formData.mileageLimit) || 200;
    const s: CarService = {
        id,
        partnerId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location,
        images: existing?.images ?? [],
        category: 'VOITURE',
        pricingUnit: validCarUnit,
        partnerPrice,
        commissionRate,
        commissionAmount,
        clientPrice,
        currency: formData.currency,
        rating: existing?.rating,
        reviewCount: existing?.reviewCount ?? 0,
        isAvailable: formData.isAvailable,
        tags,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        paymentMode: formData.paymentMode,
        vehicleType: formData.vehicleType,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year) || 2022,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: parseInt(formData.seats) || 5,
        doors: parseInt(formData.doors) || 4,
        luggage: {
            smallBags: parseInt(formData.luggageSmallBags) || 2,
            largeSuitcases: parseInt(formData.luggageLargeSuitcases) || 1,
        },
        airConditioning: formData.airConditioning,
        driverMinAge: parseInt(formData.driverMinAge) || 21,
        driverLicenseYearsRequired:
            parseInt(formData.driverLicenseYearsRequired) || 2,
        fuelIncluded: formData.carFuelIncluded,
        mileageLimit,
        ...(mileageLimit !== 'ILLIMITE' &&
        formData.mileageExtraChargePerKm.trim()
            ? {
                  mileageExtraChargePerKm: parseFloat(
                      formData.mileageExtraChargePerKm,
                  ),
              }
            : {}),
        insuranceIncluded: formData.carInsuranceIncluded,
        depositAmountEur: parseFloat(formData.carDepositAmountEur) || 0,
        deliveryAvailable: formData.deliveryAvailable,
        ...(formData.deliveryAvailable && formData.deliveryLocations.trim()
            ? {
                  deliveryLocations: formData.deliveryLocations
                      .split(',')
                      .map((l) => l.trim())
                      .filter(Boolean),
              }
            : {}),
        additionalDriverAllowed: formData.additionalDriverAllowed,
        additionalDriverFeePerDay:
            parseFloat(formData.additionalDriverFeePerDay) || 0,
        pickupLocations: formData.pickupLocations
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
    };

    return s;
}

// ============================================================
// Icones SVG internes
// ============================================================

const PlusIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6L18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ArrowLeftIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

// ============================================================
// Libelles et options de selects
// ============================================================

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
    ACTIVITE: 'Activité',
    BATEAU: 'Bateau',
    HEBERGEMENT: 'Hébergement',
    VOITURE: 'Voiture',
};

/** Unites de prix valides par categorie */
const PRICING_UNITS_BY_CATEGORY: Record<
    ServiceCategory,
    Array<{ value: ServicePricingUnit; label: string }>
> = {
    ACTIVITE: [
        { value: 'PAR_PERSONNE', label: 'Par personne' },
        { value: 'PAR_GROUPE', label: 'Par groupe' },
    ],
    BATEAU: [
        { value: 'PAR_JOUR', label: 'Par jour' },
        { value: 'PAR_DEMI_JOURNEE', label: 'Par demi-journée' },
        { value: 'PAR_SEMAINE', label: 'Par semaine' },
    ],
    HEBERGEMENT: [
        { value: 'PAR_NUIT', label: 'Par nuit' },
        { value: 'PAR_SEMAINE', label: 'Par semaine' },
    ],
    VOITURE: [
        { value: 'PAR_JOUR', label: 'Par jour' },
        { value: 'PAR_SEMAINE', label: 'Par semaine' },
    ],
};

// ============================================================
// Composant : ServiceFormModal
// ============================================================

interface ServiceFormModalProps {
    editingService: Service | null; // null = création
    commissionRate: number;
    onClose: () => void;
    onSubmit: (formData: ServiceFormState) => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
    editingService,
    commissionRate,
    onClose,
    onSubmit,
}) => {
    const formId = useId();

    const [form, setForm] = useState<ServiceFormState>(() =>
        editingService ? initFormFromService(editingService) : DEFAULT_FORM,
    );

    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    // Apercu tarifaire en temps reel
    const partnerPriceNum = parseFloat(form.partnerPrice) || 0;
    const previewCommission = +(partnerPriceNum * commissionRate).toFixed(2);
    const previewClientPrice = +(partnerPriceNum + previewCommission).toFixed(
        2,
    );

    const set = useCallback(
        <K extends keyof ServiceFormState>(
            field: K,
            value: ServiceFormState[K],
        ) => {
            setForm((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];

                return next;
            });
        },
        [],
    );

    // Quand la categorie change, reset l'unite de prix au premier choix valide
    const handleCategoryChange = useCallback((cat: ServiceCategory) => {
        const firstUnit = PRICING_UNITS_BY_CATEGORY[cat][0].value;
        setForm((prev) => ({ ...prev, category: cat, pricingUnit: firstUnit }));
        setErrors({});
    }, []);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!form.title.trim()) {
errs.title = 'Le titre est obligatoire.';
}

        if (!form.description.trim()) {
errs.description = 'La description est obligatoire.';
}

        if (!form.city.trim()) {
errs.city = 'La ville est obligatoire.';
}

        if (!form.country.trim()) {
errs.country = 'Le pays est obligatoire.';
}

        const price = parseFloat(form.partnerPrice);

        if (!form.partnerPrice || isNaN(price) || price <= 0) {
            errs.partnerPrice = 'Le prix doit être un nombre positif.';
        }

        if (form.category === 'ACTIVITE') {
            if (!form.meetingPoint.trim()) {
errs.meetingPoint = 'Le point de rendez-vous est obligatoire.';
}
        }

        if (form.category === 'BATEAU') {
            if (!form.boatName.trim()) {
errs.boatName = 'Le nom du bateau est obligatoire.';
}
        }

        if (form.category === 'VOITURE') {
            if (!form.brand.trim()) {
errs.brand = 'La marque est obligatoire.';
}

            if (!form.model.trim()) {
errs.model = 'Le modèle est obligatoire.';
}
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);

            return false;
        }

        return true;
    };

    const isEditing = editingService !== null;
    const pricingOptions = PRICING_UNITS_BY_CATEGORY[form.category];

    // Field helper
    const fld = (
        id: string,
        label: string,
        children: React.ReactNode,
        error?: string,
        required = false,
    ) => (
        <div className="wdr-catalog-modal__field">
            <label
                htmlFor={`${formId}-${id}`}
                className="wdr-catalog-modal__label"
            >
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>
            {children}
            {error && <p className="wdr-catalog-modal__error">{error}</p>}
        </div>
    );

    const inp = (
        id: keyof ServiceFormState,
        placeholder?: string,
        type = 'text',
        extra?: React.InputHTMLAttributes<HTMLInputElement>,
    ) => (
        <input
            id={`${formId}-${id}`}
            type={type}
            className={`wdr-catalog-modal__input${errors[id] ? 'wdr-catalog-modal__input--error' : ''}`}
            value={form[id] as string}
            onChange={(e) =>
                set(id, e.target.value as ServiceFormState[typeof id])
            }
            placeholder={placeholder}
            autoComplete="off"
            {...extra}
        />
    );

    const sel = <K extends keyof ServiceFormState>(
        id: K,
        options: Array<{ value: string; label: string }>,
    ) => (
        <select
            id={`${formId}-${id}`}
            className="wdr-catalog-modal__select"
            value={form[id] as string}
            onChange={(e) => set(id, e.target.value as ServiceFormState[K])}
        >
            {options.map(({ value, label }) => (
                <option key={value} value={value}>
                    {label}
                </option>
            ))}
        </select>
    );

    const chk = (id: keyof ServiceFormState, label: string) => (
        <div className="wdr-catalog-modal__field wdr-catalog-modal__field--inline">
            <input
                id={`${formId}-${id}`}
                type="checkbox"
                className="wdr-catalog-modal__checkbox"
                checked={form[id] as boolean}
                onChange={(e) =>
                    set(id, e.target.checked as ServiceFormState[typeof id])
                }
            />
            <label
                htmlFor={`${formId}-${id}`}
                className="wdr-catalog-modal__label wdr-catalog-modal__label--inline"
            >
                {label}
            </label>
        </div>
    );

    return (
        <div
            className="wdr-catalog-modal__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
onClose();
}
            }}
        >
            <div className="wdr-catalog-modal__panel">
                <div className="wdr-catalog-modal__header">
                    <h2
                        id={`${formId}-title`}
                        className="wdr-catalog-modal__title"
                    >
                        {isEditing
                            ? 'Modifier le service'
                            : 'Ajouter un service'}
                    </h2>
                    <button
                        type="button"
                        className="wdr-catalog-modal__close"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* We pass formData directly via a hidden ref pattern — simpler: parent gets form via callback */}
                <form
                    id={`${formId}-form`}
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (validate()) {
onSubmit(form);
}
                    }}
                    noValidate
                >
                    <div className="wdr-catalog-modal__body">
                        {/* ---- Section commune ---- */}
                        <p className="wdr-catalog-modal__section-label">
                            Informations générales
                        </p>

                        {fld(
                            'title',
                            'Titre du service',
                            inp(
                                'title',
                                'Ex. : Croisière privée au coucher du soleil',
                                'text',
                                { maxLength: 120 },
                            ),
                            errors.title,
                            true,
                        )}
                        {fld(
                            'description',
                            'Description',
                            <textarea
                                id={`${formId}-description`}
                                className={`wdr-catalog-modal__textarea${errors.description ? 'wdr-catalog-modal__input--error' : ''}`}
                                value={form.description}
                                onChange={(e) =>
                                    set('description', e.target.value)
                                }
                                placeholder="Décrivez votre service en détail..."
                                rows={4}
                                maxLength={2000}
                            />,
                            errors.description,
                            true,
                        )}

                        {/* Categorie */}
                        <div className="wdr-catalog-modal__row">
                            <div className="wdr-catalog-modal__field">
                                <label
                                    htmlFor={`${formId}-category`}
                                    className="wdr-catalog-modal__label"
                                >
                                    Catégorie
                                </label>
                                <select
                                    id={`${formId}-category`}
                                    className="wdr-catalog-modal__select"
                                    value={form.category}
                                    onChange={(e) =>
                                        handleCategoryChange(
                                            e.target.value as ServiceCategory,
                                        )
                                    }
                                >
                                    {Object.entries(CATEGORY_LABELS).map(
                                        ([v, l]) => (
                                            <option key={v} value={v}>
                                                {l}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div className="wdr-catalog-modal__field">
                                <label
                                    htmlFor={`${formId}-pricingUnit`}
                                    className="wdr-catalog-modal__label"
                                >
                                    Unité de facturation
                                </label>
                                {sel('pricingUnit', pricingOptions)}
                            </div>
                        </div>

                        {/* Tarification */}
                        <p className="wdr-catalog-modal__section-label">
                            Tarification
                        </p>
                        <div className="wdr-catalog-modal__row">
                            {fld(
                                'partnerPrice',
                                'Prix partenaire (HT commission)',
                                inp('partnerPrice', '0.00', 'number', {
                                    min: '0',
                                    step: '0.01',
                                }),
                                errors.partnerPrice,
                                true,
                            )}
                            <div className="wdr-catalog-modal__field">
                                <label
                                    htmlFor={`${formId}-currency`}
                                    className="wdr-catalog-modal__label"
                                >
                                    Devise
                                </label>
                                {sel('currency', [
                                    { value: 'EUR', label: 'EUR — Euro' },
                                    { value: 'USD', label: 'USD — Dollar US' },
                                    {
                                        value: 'GBP',
                                        label: 'GBP — Livre sterling',
                                    },
                                ])}
                            </div>
                        </div>

                        {partnerPriceNum > 0 && (
                            <div className="wdr-catalog-modal__price-preview">
                                <span className="wdr-catalog-modal__price-preview-label">
                                    Commission Wandireo (
                                    {(commissionRate * 100).toFixed(0)}%) :
                                </span>
                                <span>
                                    {formatPrice(
                                        previewCommission,
                                        form.currency,
                                    )}
                                </span>
                                <span className="wdr-catalog-modal__price-preview-label">
                                    Prix affiché client :
                                </span>
                                <strong>
                                    {formatPrice(
                                        previewClientPrice,
                                        form.currency,
                                    )}
                                </strong>
                            </div>
                        )}

                        <div className="wdr-catalog-modal__field">
                            <label
                                htmlFor={`${formId}-paymentMode`}
                                className="wdr-catalog-modal__label"
                            >
                                Mode de paiement
                            </label>
                            {sel(
                                'paymentMode',
                                Object.entries(PaymentModeLabels).map(
                                    ([v, l]) => ({ value: v, label: l }),
                                ),
                            )}
                        </div>

                        {/* Localisation */}
                        <p className="wdr-catalog-modal__section-label">
                            Localisation
                        </p>
                        <div className="wdr-catalog-modal__row">
                            {fld(
                                'city',
                                'Ville',
                                inp('city', 'Paris', 'text', {
                                    autoComplete: 'address-level2',
                                }),
                                errors.city,
                                true,
                            )}
                            {fld(
                                'country',
                                'Pays',
                                inp('country', 'France', 'text', {
                                    autoComplete: 'country-name',
                                }),
                                errors.country,
                                true,
                            )}
                        </div>
                        {fld(
                            'region',
                            'Région (optionnel)',
                            inp('region', 'Île-de-France'),
                        )}
                        {fld(
                            'tags',
                            'Tags (séparés par des virgules)',
                            inp('tags', 'paris, nature, aventure'),
                        )}

                        {/* ---- Section spécifique ACTIVITE ---- */}
                        {form.category === 'ACTIVITE' && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    Détails de l'activité
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-activityType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type d'activité
                                        </label>
                                        {sel('activityType', [
                                            {
                                                value: 'RANDONNEE',
                                                label: 'Randonnée',
                                            },
                                            {
                                                value: 'PLONGEE',
                                                label: 'Plongée',
                                            },
                                            { value: 'KAYAK', label: 'Kayak' },
                                            { value: 'SURF', label: 'Surf' },
                                            {
                                                value: 'SNORKELING',
                                                label: 'Snorkeling',
                                            },
                                            {
                                                value: 'PARACHUTISME',
                                                label: 'Parachutisme',
                                            },
                                            {
                                                value: 'ESCALADE',
                                                label: 'Escalade',
                                            },
                                            {
                                                value: 'CROISIERE_CULTURELLE',
                                                label: 'Croisière culturelle',
                                            },
                                            { value: 'VELO', label: 'Vélo' },
                                            {
                                                value: 'YOGA_PLAGE',
                                                label: 'Yoga plage',
                                            },
                                            {
                                                value: 'QUAD_BUGGY',
                                                label: 'Quad / Buggy',
                                            },
                                            {
                                                value: 'OBSERVATION_CETACES',
                                                label: 'Observation cétacés',
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-groupType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type de groupe
                                        </label>
                                        {sel('groupType', [
                                            {
                                                value: 'GROUPE_PARTAGE',
                                                label: 'Groupe partagé',
                                            },
                                            {
                                                value: 'GROUPE_PRIVE',
                                                label: 'Groupe privé',
                                            },
                                            {
                                                value: 'AU_CHOIX',
                                                label: 'Au choix',
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'duration',
                                        'Durée',
                                        inp('duration', '60', 'number', {
                                            min: '1',
                                        }),
                                    )}
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-durationUnit`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Unité de durée
                                        </label>
                                        {sel('durationUnit', [
                                            {
                                                value: 'MINUTES',
                                                label: 'Minutes',
                                            },
                                            {
                                                value: 'HEURES',
                                                label: 'Heures',
                                            },
                                            { value: 'JOURS', label: 'Jours' },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-difficulty`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Difficulté
                                        </label>
                                        {sel('difficulty', [
                                            {
                                                value: 'TOUS_NIVEAUX',
                                                label: 'Tous niveaux',
                                            },
                                            {
                                                value: 'DEBUTANT',
                                                label: 'Débutant',
                                            },
                                            {
                                                value: 'INTERMEDIAIRE',
                                                label: 'Intermédiaire',
                                            },
                                            {
                                                value: 'AVANCE',
                                                label: 'Avancé',
                                            },
                                            {
                                                value: 'EXPERT',
                                                label: 'Expert',
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-physicalIntensity`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Intensité physique
                                        </label>
                                        {sel('physicalIntensity', [
                                            {
                                                value: 'FAIBLE',
                                                label: 'Faible',
                                            },
                                            {
                                                value: 'MODEREE',
                                                label: 'Modérée',
                                            },
                                            {
                                                value: 'ELEVEE',
                                                label: 'Élevée',
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'minParticipants',
                                        'Participants min.',
                                        inp('minParticipants', '1', 'number', {
                                            min: '1',
                                        }),
                                    )}
                                    {fld(
                                        'maxParticipants',
                                        'Participants max.',
                                        inp('maxParticipants', '10', 'number', {
                                            min: '1',
                                        }),
                                    )}
                                    {fld(
                                        'minAgeYears',
                                        'Âge minimum (ans)',
                                        inp('minAgeYears', '0', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                </div>

                                {fld(
                                    'meetingPoint',
                                    'Point de rendez-vous',
                                    inp(
                                        'meetingPoint',
                                        'Ex. : Port de la Bourdonnais, 75007 Paris',
                                    ),
                                    errors.meetingPoint,
                                    true,
                                )}
                                {fld(
                                    'scheduleStartTimes',
                                    'Horaires de départ (séparés par des virgules)',
                                    inp('scheduleStartTimes', '09:00, 14:00'),
                                )}
                                {fld(
                                    'languages',
                                    'Langues disponibles (codes ISO, virgules)',
                                    inp('languages', 'fr, en, es'),
                                )}

                                {chk(
                                    'requiresMedicalClearance',
                                    "Certificat médical d'aptitude requis",
                                )}
                                {chk(
                                    'equipmentProvided',
                                    'Équipement fourni par le prestataire',
                                )}

                                {fld(
                                    'daysAvailable',
                                    'Jours disponibles (virgules)',
                                    inp(
                                        'daysAvailable',
                                        'LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE',
                                    ),
                                )}
                                {fld(
                                    'certificationRequired',
                                    'Certification requise (optionnel)',
                                    inp(
                                        'certificationRequired',
                                        'Ex. : PADI Open Water, Permis de chasse sous-marine',
                                    ),
                                )}

                                {fld(
                                    'included',
                                    'Inclus dans le prix (un élément par ligne)',
                                    <textarea
                                        id={`${formId}-included`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.included}
                                        onChange={(e) =>
                                            set('included', e.target.value)
                                        }
                                        placeholder={
                                            'Accueil avec boisson\nGuide certifié bilingue\nÉquipement complet'
                                        }
                                        rows={3}
                                    />,
                                )}
                                {fld(
                                    'notIncluded',
                                    'Non inclus (un élément par ligne)',
                                    <textarea
                                        id={`${formId}-notIncluded`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.notIncluded}
                                        onChange={(e) =>
                                            set('notIncluded', e.target.value)
                                        }
                                        placeholder={
                                            'Transport\nAssurance\nRepas'
                                        }
                                        rows={3}
                                    />,
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique BATEAU ---- */}
                        {form.category === 'BATEAU' && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    Détails du bateau
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-boatType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type de bateau
                                        </label>
                                        {sel('boatType', [
                                            {
                                                value: 'VOILIER',
                                                label: 'Voilier',
                                            },
                                            {
                                                value: 'CATAMARAN',
                                                label: 'Catamaran',
                                            },
                                            {
                                                value: 'YACHT_MOTEUR',
                                                label: 'Yacht à moteur',
                                            },
                                            {
                                                value: 'SEMI_RIGIDE',
                                                label: 'Semi-rigide',
                                            },
                                            {
                                                value: 'GOELETTE',
                                                label: 'Goélette',
                                            },
                                            {
                                                value: 'PENICHE',
                                                label: 'Péniche',
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        'boatName',
                                        'Nom du bateau',
                                        inp('boatName', 'Cap Soleil'),
                                        errors.boatName,
                                        true,
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'passengerCapacity',
                                        'Capacité passagers',
                                        inp(
                                            'passengerCapacity',
                                            '8',
                                            'number',
                                            { min: '1' },
                                        ),
                                    )}
                                    {fld(
                                        'sleepingBerths',
                                        'Couchages',
                                        inp('sleepingBerths', '4', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'lengthMeters',
                                        'Longueur (m)',
                                        inp('lengthMeters', '12.5', 'number', {
                                            min: '1',
                                            step: '0.1',
                                        }),
                                    )}
                                    {fld(
                                        'manufactureYear',
                                        'Année de construction',
                                        inp(
                                            'manufactureYear',
                                            '2020',
                                            'number',
                                            { min: '1900' },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-engineType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type de propulsion
                                        </label>
                                        {sel('engineType', [
                                            {
                                                value: 'VOILE',
                                                label: 'Voile uniquement',
                                            },
                                            {
                                                value: 'MOTEUR',
                                                label: 'Moteur uniquement',
                                            },
                                            {
                                                value: 'VOILE_ET_MOTEUR',
                                                label: 'Voile et moteur',
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-rentalMode`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Mode de location
                                        </label>
                                        {sel('rentalMode', [
                                            {
                                                value: 'AVEC_SKIPPER',
                                                label: 'Avec skipper',
                                            },
                                            {
                                                value: 'SANS_SKIPPER',
                                                label: 'Sans skipper',
                                            },
                                            {
                                                value: 'BARE_BOAT',
                                                label: 'Bare-boat',
                                            },
                                            {
                                                value: 'AVEC_EQUIPAGE_COMPLET',
                                                label: 'Avec équipage complet',
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'boatCabins',
                                        'Cabines',
                                        inp('boatCabins', '2', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'boatBathrooms',
                                        'Salles de bain',
                                        inp('boatBathrooms', '1', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'boatDepositAmountEur',
                                        'Caution (EUR)',
                                        inp(
                                            'boatDepositAmountEur',
                                            '0',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                </div>

                                {fld(
                                    'departurePorts',
                                    'Ports de départ (virgules)',
                                    inp(
                                        'departurePorts',
                                        "Port de Cannes, Port d'Antibes",
                                    ),
                                )}
                                {fld(
                                    'navigationArea',
                                    'Zones de navigation (virgules)',
                                    inp(
                                        'navigationArea',
                                        "Côte d'Azur, Îles de Lérins",
                                    ),
                                )}
                                {fld(
                                    'boatAmenities',
                                    'Équipements à bord (virgules)',
                                    inp(
                                        'boatAmenities',
                                        'GPS, VHF, Paddles, Snorkeling',
                                    ),
                                )}

                                {chk(
                                    'licenseRequired',
                                    'Permis de navigation requis',
                                )}
                                {form.licenseRequired &&
                                    fld(
                                        'licenseType',
                                        'Type de permis requis',
                                        inp(
                                            'licenseType',
                                            'Ex. : Permis côtier, Permis hauturier',
                                        ),
                                    )}
                                {chk('boatFuelIncluded', 'Carburant inclus')}
                                {chk(
                                    'boatInsuranceIncluded',
                                    'Assurance incluse',
                                )}
                                {fld(
                                    'enginePowerKw',
                                    'Puissance moteur (kW, optionnel)',
                                    inp('enginePowerKw', '', 'number', {
                                        min: '0',
                                        step: '1',
                                    }),
                                )}
                                {chk(
                                    'boatAvailableForDayCharter',
                                    'Disponible à la journée (day charter)',
                                )}
                                {chk(
                                    'boatAvailableForWeekCharter',
                                    'Disponible à la semaine (week charter)',
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique HEBERGEMENT ---- */}
                        {form.category === 'HEBERGEMENT' && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    Détails de l'hébergement
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-accommodationType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type d'hébergement
                                        </label>
                                        {sel('accommodationType', [
                                            { value: 'HOTEL', label: 'Hôtel' },
                                            { value: 'VILLA', label: 'Villa' },
                                            {
                                                value: 'APPARTEMENT',
                                                label: 'Appartement',
                                            },
                                            {
                                                value: 'BUNGALOW',
                                                label: 'Bungalow',
                                            },
                                            {
                                                value: 'MAISON_HOTES',
                                                label: "Maison d'hôtes",
                                            },
                                            {
                                                value: 'BASTIDE',
                                                label: 'Bastide',
                                            },
                                            { value: 'RIAD', label: 'Riad' },
                                            { value: 'LODGE', label: 'Lodge' },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-cancellationPolicy`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Politique d'annulation
                                        </label>
                                        {sel('cancellationPolicy', [
                                            {
                                                value: 'FLEXIBLE',
                                                label: 'Flexible',
                                            },
                                            {
                                                value: 'MODEREE',
                                                label: 'Modérée',
                                            },
                                            {
                                                value: 'STRICTE',
                                                label: 'Stricte',
                                            },
                                            {
                                                value: 'NON_REMBOURSABLE',
                                                label: 'Non remboursable',
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'maxGuests',
                                        'Voyageurs max.',
                                        inp('maxGuests', '4', 'number', {
                                            min: '1',
                                        }),
                                    )}
                                    {fld(
                                        'bedrooms',
                                        'Chambres',
                                        inp('bedrooms', '2', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'hebBathrooms',
                                        'Salles de bain',
                                        inp('hebBathrooms', '1', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'minimumStayNights',
                                        'Nuits minimum',
                                        inp(
                                            'minimumStayNights',
                                            '1',
                                            'number',
                                            { min: '1' },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'checkInTime',
                                        "Heure d'arrivée",
                                        inp('checkInTime', '14:00', 'time'),
                                    )}
                                    {fld(
                                        'checkOutTime',
                                        'Heure de départ',
                                        inp('checkOutTime', '11:00', 'time'),
                                    )}
                                </div>

                                {fld(
                                    'hebAmenities',
                                    'Équipements (virgules)',
                                    inp(
                                        'hebAmenities',
                                        'Piscine, WiFi, Climatisation, Parking',
                                    ),
                                )}

                                {chk(
                                    'breakfastIncluded',
                                    'Petit-déjeuner inclus',
                                )}
                                {chk(
                                    'petsAllowed',
                                    'Animaux de compagnie acceptés',
                                )}
                                {chk('smokingAllowed', 'Fumeurs autorisés')}

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-starRating`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Classement étoiles (hôtels)
                                        </label>
                                        {sel('starRating', [
                                            { value: '', label: 'Non classé' },
                                            { value: '1', label: '★ 1 étoile' },
                                            {
                                                value: '2',
                                                label: '★★ 2 étoiles',
                                            },
                                            {
                                                value: '3',
                                                label: '★★★ 3 étoiles',
                                            },
                                            {
                                                value: '4',
                                                label: '★★★★ 4 étoiles',
                                            },
                                            {
                                                value: '5',
                                                label: '★★★★★ 5 étoiles',
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        'totalSurfaceM2',
                                        'Surface totale (m², optionnel)',
                                        inp('totalSurfaceM2', '', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                </div>
                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'distanceToBeachMeters',
                                        'Distance à la plage (m)',
                                        inp(
                                            'distanceToBeachMeters',
                                            '',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                    {fld(
                                        'distanceToCityKm',
                                        'Distance centre-ville (km)',
                                        inp('distanceToCityKm', '', 'number', {
                                            min: '0',
                                            step: '0.1',
                                        }),
                                    )}
                                </div>
                                {fld(
                                    'hebHouseRules',
                                    'Règles de la maison (une par ligne)',
                                    <textarea
                                        id={`${formId}-hebHouseRules`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.hebHouseRules}
                                        onChange={(e) =>
                                            set('hebHouseRules', e.target.value)
                                        }
                                        placeholder={
                                            'Arrivée entre 14h et 20h\nPas de fête\nAnimaux interdits dans les chambres'
                                        }
                                        rows={3}
                                    />,
                                )}
                                {fld(
                                    'hebNearbyAttractions',
                                    'Attractions à proximité (virgules)',
                                    inp(
                                        'hebNearbyAttractions',
                                        'Plage, Restaurants, Marché local',
                                    ),
                                )}
                                {fld(
                                    'hebAccessibilityFeatures',
                                    'Accessibilité (virgules, optionnel)',
                                    inp(
                                        'hebAccessibilityFeatures',
                                        'Accès PMR, Ascenseur, Sans escaliers',
                                    ),
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique VOITURE ---- */}
                        {form.category === 'VOITURE' && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    Détails du véhicule
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-vehicleType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Type de véhicule
                                        </label>
                                        {sel('vehicleType', [
                                            {
                                                value: 'CITADINE',
                                                label: 'Citadine',
                                            },
                                            {
                                                value: 'BERLINE',
                                                label: 'Berline',
                                            },
                                            { value: 'SUV', label: 'SUV' },
                                            {
                                                value: 'CABRIOLET',
                                                label: 'Cabriolet',
                                            },
                                            {
                                                value: 'MONOSPACE',
                                                label: 'Monospace',
                                            },
                                            {
                                                value: 'UTILITAIRE',
                                                label: 'Utilitaire',
                                            },
                                            { value: 'QUAD', label: 'Quad' },
                                            {
                                                value: 'SCOOTER_125',
                                                label: 'Scooter 125',
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        'year',
                                        'Année',
                                        inp('year', '2022', 'number', {
                                            min: '1990',
                                            max: '2030',
                                        }),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'brand',
                                        'Marque',
                                        inp('brand', 'Renault'),
                                        errors.brand,
                                        true,
                                    )}
                                    {fld(
                                        'model',
                                        'Modèle',
                                        inp('model', 'Clio'),
                                        errors.model,
                                        true,
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-transmission`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Boîte de vitesses
                                        </label>
                                        {sel('transmission', [
                                            {
                                                value: 'MANUELLE',
                                                label: 'Manuelle',
                                            },
                                            {
                                                value: 'AUTOMATIQUE',
                                                label: 'Automatique',
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-fuelType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            Carburant
                                        </label>
                                        {sel('fuelType', [
                                            {
                                                value: 'ESSENCE',
                                                label: 'Essence',
                                            },
                                            {
                                                value: 'DIESEL',
                                                label: 'Diesel',
                                            },
                                            {
                                                value: 'ELECTRIQUE',
                                                label: 'Électrique',
                                            },
                                            {
                                                value: 'HYBRIDE',
                                                label: 'Hybride',
                                            },
                                            { value: 'GPL', label: 'GPL' },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'seats',
                                        'Places',
                                        inp('seats', '5', 'number', {
                                            min: '1',
                                        }),
                                    )}
                                    {fld(
                                        'doors',
                                        'Portes',
                                        inp('doors', '4', 'number', {
                                            min: '2',
                                        }),
                                    )}
                                    {fld(
                                        'driverMinAge',
                                        'Âge min. conducteur',
                                        inp('driverMinAge', '21', 'number', {
                                            min: '16',
                                        }),
                                    )}
                                    {fld(
                                        'driverLicenseYearsRequired',
                                        'Permis depuis (ans)',
                                        inp(
                                            'driverLicenseYearsRequired',
                                            '2',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'mileageLimit',
                                        'Kilométrage (nombre ou ILLIMITE)',
                                        inp('mileageLimit', 'ILLIMITE'),
                                    )}
                                    {fld(
                                        'carDepositAmountEur',
                                        'Caution (EUR)',
                                        inp(
                                            'carDepositAmountEur',
                                            '500',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                    {fld(
                                        'additionalDriverFeePerDay',
                                        'Conducteur supp. (EUR/jour)',
                                        inp(
                                            'additionalDriverFeePerDay',
                                            '15',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                </div>

                                {fld(
                                    'pickupLocations',
                                    'Lieux de prise en charge (virgules)',
                                    inp(
                                        'pickupLocations',
                                        'Aéroport, Centre-ville',
                                    ),
                                )}

                                {form.mileageLimit !== 'ILLIMITE' &&
                                    form.mileageLimit.trim() !== '' &&
                                    fld(
                                        'mileageExtraChargePerKm',
                                        'Tarif km supplémentaire (EUR/km)',
                                        inp(
                                            'mileageExtraChargePerKm',
                                            '0.25',
                                            'number',
                                            { min: '0', step: '0.01' },
                                        ),
                                    )}

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        'luggageSmallBags',
                                        'Petits bagages (cabine)',
                                        inp('luggageSmallBags', '2', 'number', {
                                            min: '0',
                                        }),
                                    )}
                                    {fld(
                                        'luggageLargeSuitcases',
                                        'Grandes valises',
                                        inp(
                                            'luggageLargeSuitcases',
                                            '1',
                                            'number',
                                            { min: '0' },
                                        ),
                                    )}
                                </div>

                                {chk('airConditioning', 'Climatisation')}
                                {chk('carFuelIncluded', 'Carburant inclus')}
                                {chk(
                                    'carInsuranceIncluded',
                                    'Assurance tous risques incluse',
                                )}
                                {chk('deliveryAvailable', 'Livraison possible')}
                                {form.deliveryAvailable &&
                                    fld(
                                        'deliveryLocations',
                                        'Lieux de livraison (virgules)',
                                        inp(
                                            'deliveryLocations',
                                            'Aéroport CDG, Hôtel, Centre-ville',
                                        ),
                                    )}
                                {chk(
                                    'additionalDriverAllowed',
                                    'Conducteur supplémentaire autorisé',
                                )}
                            </>
                        )}

                        {/* ---- Disponibilite ---- */}
                        <p className="wdr-catalog-modal__section-label">
                            Disponibilité
                        </p>
                        {chk(
                            'isAvailable',
                            'Service disponible à la réservation',
                        )}
                    </div>

                    <div className="wdr-catalog-modal__footer">
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEditing
                                ? 'Enregistrer les modifications'
                                : 'Créer le service'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================
// Composant principal : PartnerCatalogPage
// ============================================================

/** Affiche les details specifiques a la categorie dans la liste. */
const ServiceMeta: React.FC<{ service: Service }> = ({ service }) => {
    if (service.category === 'ACTIVITE') {
        return (
            <span className="wdr-catalog__meta">
                {service.activityType.replace(/_/g, ' ')} · {service.duration}{' '}
                {service.durationUnit.toLowerCase()} ·{' '}
                {service.difficulty.replace(/_/g, ' ')} ·{' '}
                {service.minParticipants}–{service.maxParticipants} pers.
            </span>
        );
    }

    if (service.category === 'BATEAU') {
        return (
            <span className="wdr-catalog__meta">
                {service.boatType} « {service.boatName} » ·{' '}
                {service.passengerCapacity} pass. ·{' '}
                {service.rentalMode.replace(/_/g, ' ')}
            </span>
        );
    }

    if (service.category === 'HEBERGEMENT') {
        return (
            <span className="wdr-catalog__meta">
                {service.accommodationType.replace(/_/g, ' ')} ·{' '}
                {service.maxGuests} voyageurs · {service.bedrooms} ch. · min.{' '}
                {service.minimumStayNights} nuit
                {service.minimumStayNights > 1 ? 's' : ''}
            </span>
        );
    }

    // VOITURE
    return (
        <span className="wdr-catalog__meta">
            {service.vehicleType} {service.brand} {service.model} (
            {service.year}) · {service.seats} places ·{' '}
            {service.transmission.toLowerCase()}
        </span>
    );
};

function toServicePayload(service: Service): {
    title: string;
    description: string;
    category: ServiceCategory;
    location_city: string;
    location_country: string;
    location_region?: string;
    partner_price: number;
    pricing_unit: string;
    payment_mode: string;
    tags: string[];
    is_available: boolean;
    extra_data: Record<string, unknown>;
} {
    const base = {
        title: service.title,
        description: service.description,
        category: service.category,
        location_city: service.location.city,
        location_country: service.location.country,
        location_region: service.location.region,
        partner_price: service.partnerPrice,
        pricing_unit: service.pricingUnit,
        payment_mode: service.paymentMode,
        tags: service.tags,
        is_available: service.isAvailable,
    };

    if (service.category === 'ACTIVITE') {
        return {
            ...base,
            extra_data: {
                activityType: service.activityType,
                duration: service.duration,
                durationUnit: service.durationUnit,
                difficulty: service.difficulty,
                physicalIntensity: service.physicalIntensity,
                minParticipants: service.minParticipants,
                maxParticipants: service.maxParticipants,
                minAgeYears: service.minAgeYears,
                requiresMedicalClearance: service.requiresMedicalClearance,
                certificationRequired: service.certificationRequired,
                equipmentProvided: service.equipmentProvided,
                included: service.included,
                notIncluded: service.notIncluded,
                meetingPoint: service.meetingPoint,
                schedule: service.schedule,
                languages: service.languages,
                groupType: service.groupType,
            },
        };
    }

    if (service.category === 'BATEAU') {
        return {
            ...base,
            extra_data: {
                boatType: service.boatType,
                boatName: service.boatName,
                passengerCapacity: service.passengerCapacity,
                sleepingBerths: service.sleepingBerths,
                lengthMeters: service.lengthMeters,
                manufactureYear: service.manufactureYear,
                engineType: service.engineType,
                enginePowerKw: service.enginePowerKw,
                rentalMode: service.rentalMode,
                cabins: service.cabins,
                bathrooms: service.bathrooms,
                amenities: service.amenities,
                navigationArea: service.navigationArea,
                licenseRequired: service.licenseRequired,
                licenseType: service.licenseType,
                fuelIncluded: service.fuelIncluded,
                depositAmountEur: service.depositAmountEur,
                insuranceIncluded: service.insuranceIncluded,
                departurePorts: service.departurePorts,
                availableForDayCharter: service.availableForDayCharter,
                availableForWeekCharter: service.availableForWeekCharter,
            },
        };
    }

    if (service.category === 'HEBERGEMENT') {
        return {
            ...base,
            extra_data: {
                accommodationType: service.accommodationType,
                starRating: service.starRating,
                maxGuests: service.maxGuests,
                bedrooms: service.bedrooms,
                bathrooms: service.bathrooms,
                totalSurfaceM2: service.totalSurfaceM2,
                amenities: service.amenities,
                checkInTime: service.checkInTime,
                checkOutTime: service.checkOutTime,
                breakfastIncluded: service.breakfastIncluded,
                minimumStayNights: service.minimumStayNights,
                petsAllowed: service.petsAllowed,
                smokingAllowed: service.smokingAllowed,
                accessibilityFeatures: service.accessibilityFeatures,
                houseRules: service.houseRules,
                cancellationPolicy: service.cancellationPolicy,
                nearbyAttractions: service.nearbyAttractions,
                distanceToBeachMeters: service.distanceToBeachMeters,
                distanceToCityKm: service.distanceToCityKm,
            },
        };
    }

    return {
        ...base,
        extra_data: {
            vehicleType: service.vehicleType,
            brand: service.brand,
            model: service.model,
            year: service.year,
            transmission: service.transmission,
            fuelType: service.fuelType,
            seats: service.seats,
            doors: service.doors,
            luggage: service.luggage,
            airConditioning: service.airConditioning,
            driverMinAge: service.driverMinAge,
            driverLicenseYearsRequired: service.driverLicenseYearsRequired,
            fuelIncluded: service.fuelIncluded,
            mileageLimit: service.mileageLimit,
            mileageExtraChargePerKm: service.mileageExtraChargePerKm,
            insuranceIncluded: service.insuranceIncluded,
            depositAmountEur: service.depositAmountEur,
            deliveryAvailable: service.deliveryAvailable,
            deliveryLocations: service.deliveryLocations,
            additionalDriverAllowed: service.additionalDriverAllowed,
            additionalDriverFeePerDay: service.additionalDriverFeePerDay,
            pickupLocations: service.pickupLocations,
        },
    };
}

export const PartnerCatalogPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { isBlocked } = usePartnerApprovalGuard();
    const queryClient = useQueryClient();
    const partnerUser = currentUser?.role === 'PARTNER' ? currentUser : null;
    const { services } = useServicesData({
        partnerId: partnerUser?.id,
        limit: 200,
    });

    const [modalMode, setModalMode] = useState<'new' | Service | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'PARTNER') {
            navigate({ name: 'dashboard' });
        }
    }, [currentUser, navigate]);

    const activeCount = useMemo(
        () => services.filter((s) => s.isAvailable).length,
        [services],
    );

    const refreshServices = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['services'] });
    }, [queryClient]);

    const handleToggleAvailability = useCallback(
        async (service: Service) => {
            setBusyId(service.id);

            try {
                await servicesApi.toggleAvailability(
                    service.id,
                    !service.isAvailable,
                );
                await refreshServices();
                success(
                    service.isAvailable
                        ? 'Service desactive.'
                        : 'Service active.',
                );
            } catch {
                error(
                    'Impossible de mettre a jour la disponibilite du service.',
                );
            } finally {
                setBusyId(null);
            }
        },
        [error, refreshServices, success],
    );

    const handleDeleteConfirm = useCallback(
        async (id: string) => {
            setBusyId(id);

            try {
                await servicesApi.delete(id);
                await refreshServices();
                success('Service supprime.');
            } catch {
                error('Impossible de supprimer le service.');
            } finally {
                setBusyId(null);
            }

            setDeletingId(null);
        },
        [error, refreshServices, success],
    );

    /**
     * Reçoit le ServiceFormState depuis le modal, construit un Service typé via buildService(),
     * puis met a jour la liste locale (CRUD mock sans backend).
     */
    const handleFormSubmit = useCallback(
        async (formData: ServiceFormState) => {
            const built = buildService(
                formData,
                partnerUser?.id ?? '',
                partnerUser?.commissionRate ?? 0.20,
                modalMode !== 'new' && modalMode !== null ? modalMode : null,
            );

            const payload = toServicePayload(built);

            try {
                if (modalMode === 'new') {
                    await servicesApi.create(payload);
                    success('Service cree.');
                } else if (modalMode !== null) {
                    await servicesApi.update(built.id, payload);
                    success('Service mis a jour.');
                }

                await refreshServices();
                setModalMode(null);
            } catch {
                error('Impossible de sauvegarder ce service.');
            }
        },
        [
            error,
            modalMode,
            partnerUser?.commissionRate,
            partnerUser?.id,
            refreshServices,
            success,
        ],
    );

    if (isBlocked || !partnerUser) {
        return null;
    }

    return (
        <div className="wdr-catalog">
            {/* En-tete */}
            <div className="wdr-catalog__header">
                <div className="wdr-catalog__header-inner">
                    <div className="wdr-catalog__header-left">
                        <button
                            type="button"
                            className="wdr-catalog__back-btn"
                            onClick={() =>
                                navigate({ name: 'partner-dashboard' })
                            }
                            aria-label="Retour au tableau de bord"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <div>
                            <h1 className="wdr-catalog__title">
                                Mon Catalogue
                            </h1>
                            <p className="wdr-catalog__subtitle">
                                {services.length} service
                                {services.length !== 1 ? 's' : ''} —{' '}
                                {activeCount} actif
                                {activeCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={<PlusIcon />}
                        onClick={() => setModalMode('new')}
                    >
                        Ajouter un service
                    </Button>
                </div>
            </div>

            {/* Corps */}
            <div className="wdr-catalog__body">
                {services.length === 0 ? (
                    <div className="wdr-catalog__empty">
                        <p className="wdr-catalog__empty-title">
                            Votre catalogue est vide.
                        </p>
                        <p className="wdr-catalog__empty-sub">
                            Ajoutez votre premier service pour le rendre visible
                            sur Wandireo.
                        </p>
                        <Button
                            variant="primary"
                            leftIcon={<PlusIcon />}
                            onClick={() => setModalMode('new')}
                        >
                            Ajouter un service
                        </Button>
                    </div>
                ) : (
                    <ul className="wdr-catalog__list" role="list">
                        {services.map((service) => (
                            <li key={service.id} className="wdr-catalog__item">
                                <span
                                    className={`wdr-catalog__category wdr-catalog__category--${service.category.toLowerCase()}`}
                                >
                                    {CATEGORY_LABELS[service.category]}
                                </span>

                                <div className="wdr-catalog__item-main">
                                    <h2 className="wdr-catalog__item-title">
                                        {service.title}
                                    </h2>
                                    <p className="wdr-catalog__item-location">
                                        {service.location.city},{' '}
                                        {service.location.country}
                                    </p>
                                    <ServiceMeta service={service} />
                                    <p className="wdr-catalog__item-desc">
                                        {service.description}
                                    </p>
                                </div>

                                <div className="wdr-catalog__item-pricing">
                                    <div className="wdr-catalog__price-row">
                                        <span className="wdr-catalog__price-label">
                                            Prix partenaire
                                        </span>
                                        <span className="wdr-catalog__price-value">
                                            {formatPrice(
                                                service.partnerPrice,
                                                service.currency,
                                            )}
                                        </span>
                                    </div>
                                    <div className="wdr-catalog__price-row">
                                        <span className="wdr-catalog__price-label">
                                            Commission (
                                            {(
                                                service.commissionRate * 100
                                            ).toFixed(0)}
                                            %)
                                        </span>
                                        <span className="wdr-catalog__price-value">
                                            {formatPrice(
                                                service.commissionAmount,
                                                service.currency,
                                            )}
                                        </span>
                                    </div>
                                    <div className="wdr-catalog__price-row wdr-catalog__price-row--client">
                                        <span className="wdr-catalog__price-label">
                                            Prix client
                                        </span>
                                        <strong className="wdr-catalog__price-value">
                                            {formatPrice(
                                                service.clientPrice,
                                                service.currency,
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className="wdr-catalog__item-actions">
                                    {service.sourceType === 'EXTERNAL' && (
                                        <span className="wdr-catalog__toggle-label">
                                            Offre synchronisee en lecture seule
                                        </span>
                                    )}
                                    <label
                                        className="wdr-catalog__toggle"
                                        title={
                                            service.isAvailable
                                                ? 'Désactiver'
                                                : 'Activer'
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            className="wdr-catalog__toggle-input"
                                            checked={service.isAvailable}
                                            onChange={() =>
                                                void handleToggleAvailability(
                                                    service,
                                                )
                                            }
                                            disabled={
                                                busyId === service.id ||
                                                service.sourceType ===
                                                    'EXTERNAL'
                                            }
                                            aria-label={`${service.isAvailable ? 'Désactiver' : 'Activer'} ${service.title}`}
                                        />
                                        <span
                                            className="wdr-catalog__toggle-track"
                                            aria-hidden="true"
                                        />
                                        <span className="wdr-catalog__toggle-label">
                                            {service.isAvailable
                                                ? 'Actif'
                                                : 'Inactif'}
                                        </span>
                                    </label>

                                    <div className="wdr-catalog__item-btns">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<EditIcon />}
                                            onClick={() =>
                                                setModalMode(service)
                                            }
                                            aria-label={`Modifier ${service.title}`}
                                            disabled={
                                                busyId === service.id ||
                                                service.sourceType ===
                                                    'EXTERNAL'
                                            }
                                        >
                                            Modifier
                                        </Button>
                                        {deletingId === service.id ? (
                                            <div
                                                className="wdr-catalog__delete-confirm"
                                                role="alert"
                                            >
                                                <span>
                                                    Supprimer définitivement ?
                                                </span>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        void handleDeleteConfirm(
                                                            service.id,
                                                        )
                                                    }
                                                    disabled={
                                                        busyId === service.id
                                                    }
                                                >
                                                    Oui, supprimer
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeletingId(null)
                                                    }
                                                    disabled={
                                                        busyId === service.id
                                                    }
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                leftIcon={<TrashIcon />}
                                                onClick={() =>
                                                    setDeletingId(service.id)
                                                }
                                                aria-label={`Supprimer ${service.title}`}
                                                disabled={
                                                    busyId === service.id ||
                                                    service.sourceType ===
                                                        'EXTERNAL'
                                                }
                                            >
                                                Supprimer
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal */}
            {modalMode !== null && (
                <ServiceFormModal
                    editingService={modalMode === 'new' ? null : modalMode}
                    commissionRate={partnerUser.commissionRate}
                    onClose={() => setModalMode(null)}
                    onSubmit={(formData) => {
                        void handleFormSubmit(formData);
                    }}
                />
            )}
        </div>
    );
};
