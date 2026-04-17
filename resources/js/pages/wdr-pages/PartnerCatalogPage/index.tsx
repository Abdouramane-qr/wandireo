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

import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { servicesApi } from "@/api/services";
import { Button, useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { usePartnerApprovalGuard } from "@/hooks/usePartnerApprovalGuard";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import type {
    Service,
    ActivityService,
    BoatService,
    AccommodationService,
    CarService,
    ServiceCategory,
    ServicePricingUnit,
    PaymentMode,
    ActivityType,
    DifficultyLevel,
    PhysicalIntensity,
    GroupType,
    BoatType,
    EngineType,
    RentalMode,
    AccommodationType,
    CancellationPolicy,
    VehicleType,
    TransmissionType,
    FuelType,
    DayOfWeek,
} from "@/types/service";
import "./PartnerCatalogPage.css";

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
    durationUnit: "MINUTES" | "HEURES" | "JOURS";
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
    title: "",
    description: "",
    category: "ACTIVITE",
    pricingUnit: "PAR_PERSONNE",
    partnerPrice: "",
    currency: "EUR",
    paymentMode: "FULL_ONLINE",
    city: "",
    country: "",
    region: "",
    tags: "",
    isAvailable: true,
    // ACTIVITE
    activityType: "RANDONNEE",
    duration: "60",
    durationUnit: "MINUTES",
    difficulty: "TOUS_NIVEAUX",
    physicalIntensity: "MODEREE",
    minParticipants: "1",
    maxParticipants: "10",
    minAgeYears: "0",
    requiresMedicalClearance: false,
    certificationRequired: "",
    equipmentProvided: false,
    meetingPoint: "",
    languages: "fr",
    groupType: "GROUPE_PARTAGE",
    included: "",
    notIncluded: "",
    scheduleStartTimes: "09:00",
    daysAvailable: "LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE",
    // BATEAU
    boatType: "VOILIER",
    boatName: "",
    passengerCapacity: "6",
    sleepingBerths: "2",
    lengthMeters: "10",
    manufactureYear: "2020",
    engineType: "VOILE_ET_MOTEUR",
    enginePowerKw: "",
    rentalMode: "AVEC_SKIPPER",
    boatCabins: "2",
    boatBathrooms: "1",
    boatAmenities: "",
    navigationArea: "",
    licenseRequired: false,
    licenseType: "",
    boatFuelIncluded: false,
    boatDepositAmountEur: "0",
    boatInsuranceIncluded: true,
    departurePorts: "",
    boatAvailableForDayCharter: true,
    boatAvailableForWeekCharter: true,
    // HEBERGEMENT
    accommodationType: "APPARTEMENT",
    starRating: "",
    maxGuests: "4",
    bedrooms: "2",
    hebBathrooms: "1",
    totalSurfaceM2: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    breakfastIncluded: false,
    minimumStayNights: "1",
    petsAllowed: false,
    smokingAllowed: false,
    cancellationPolicy: "MODEREE",
    hebAmenities: "",
    hebAccessibilityFeatures: "",
    hebHouseRules: "",
    hebNearbyAttractions: "",
    distanceToBeachMeters: "",
    distanceToCityKm: "",
    // VOITURE
    vehicleType: "SUV",
    brand: "",
    model: "",
    year: "2022",
    transmission: "AUTOMATIQUE",
    fuelType: "ESSENCE",
    seats: "5",
    doors: "4",
    luggageSmallBags: "2",
    luggageLargeSuitcases: "1",
    airConditioning: true,
    driverMinAge: "21",
    driverLicenseYearsRequired: "2",
    carFuelIncluded: false,
    carInsuranceIncluded: true,
    carDepositAmountEur: "500",
    mileageLimit: "ILLIMITE",
    mileageExtraChargePerKm: "",
    deliveryAvailable: false,
    deliveryLocations: "",
    additionalDriverAllowed: true,
    additionalDriverFeePerDay: "15",
    pickupLocations: "",
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
        region: service.location.region ?? "",
        tags: service.tags.join(", "),
        isAvailable: service.isAvailable,
    };

    if (service.category === "ACTIVITE") {
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
            languages: service.languages.join(", "),
            groupType: service.groupType,
            included: service.included.join("\n"),
            notIncluded: service.notIncluded.join("\n"),
            scheduleStartTimes: service.schedule.startTimes.join(", "),
            daysAvailable: (service.schedule.daysAvailable ?? []).join(", "),
            certificationRequired: service.certificationRequired ?? "",
        };
    }

    if (service.category === "BATEAU") {
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
            boatAmenities: service.amenities.join(", "),
            navigationArea: service.navigationArea.join(", "),
            licenseRequired: service.licenseRequired,
            boatFuelIncluded: service.fuelIncluded,
            boatDepositAmountEur: String(service.depositAmountEur),
            boatInsuranceIncluded: service.insuranceIncluded,
            departurePorts: service.departurePorts.join(", "),
            licenseType: service.licenseType ?? "",
            enginePowerKw:
                service.enginePowerKw != null
                    ? String(service.enginePowerKw)
                    : "",
            boatAvailableForDayCharter: service.availableForDayCharter,
            boatAvailableForWeekCharter: service.availableForWeekCharter,
        };
    }

    if (service.category === "HEBERGEMENT") {
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
            hebAmenities: service.amenities.join(", "),
            starRating:
                service.starRating != null ? String(service.starRating) : "",
            totalSurfaceM2:
                service.totalSurfaceM2 != null
                    ? String(service.totalSurfaceM2)
                    : "",
            distanceToBeachMeters:
                service.distanceToBeachMeters != null
                    ? String(service.distanceToBeachMeters)
                    : "",
            distanceToCityKm:
                service.distanceToCityKm != null
                    ? String(service.distanceToCityKm)
                    : "",
            hebAccessibilityFeatures: service.accessibilityFeatures.join(", "),
            hebHouseRules: service.houseRules.join("\n"),
            hebNearbyAttractions: service.nearbyAttractions.join(", "),
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
        pickupLocations: service.pickupLocations.join(", "),
        mileageLimit:
            service.mileageLimit === "ILLIMITE"
                ? "ILLIMITE"
                : String(service.mileageLimit),
        mileageExtraChargePerKm:
            service.mileageExtraChargePerKm != null
                ? String(service.mileageExtraChargePerKm)
                : "",
        luggageSmallBags: String(service.luggage.smallBags),
        luggageLargeSuitcases: String(service.luggage.largeSuitcases),
        deliveryLocations: (service.deliveryLocations ?? []).join(", "),
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
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    if (formData.category === "ACTIVITE") {
        const s: ActivityService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: "ACTIVITE",
            pricingUnit:
                formData.pricingUnit === "PAR_GROUPE"
                    ? "PAR_GROUPE"
                    : "PAR_PERSONNE",
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
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            notIncluded: formData.notIncluded
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            meetingPoint: formData.meetingPoint.trim(),
            schedule: {
                startTimes: formData.scheduleStartTimes
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                daysAvailable: formData.daysAvailable
                    .split(",")
                    .map((d) => d.trim())
                    .filter(Boolean) as DayOfWeek[],
            },
            languages: formData.languages
                .split(",")
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

    if (formData.category === "BATEAU") {
        const validBoatUnit = [
            "PAR_JOUR",
            "PAR_DEMI_JOURNEE",
            "PAR_SEMAINE",
        ].includes(formData.pricingUnit)
            ? (formData.pricingUnit as
                  | "PAR_JOUR"
                  | "PAR_DEMI_JOURNEE"
                  | "PAR_SEMAINE")
            : "PAR_JOUR";
        const s: BoatService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: "BATEAU",
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
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
            navigationArea: formData.navigationArea
                .split(",")
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
                .split(",")
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

    if (formData.category === "HEBERGEMENT") {
        const validHebUnit =
            formData.pricingUnit === "PAR_SEMAINE" ? "PAR_SEMAINE" : "PAR_NUIT";
        const s: AccommodationService = {
            id,
            partnerId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            location,
            images: existing?.images ?? [],
            category: "HEBERGEMENT",
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
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            breakfastIncluded: formData.breakfastIncluded,
            minimumStayNights: parseInt(formData.minimumStayNights) || 1,
            petsAllowed: formData.petsAllowed,
            smokingAllowed: formData.smokingAllowed,
            accessibilityFeatures: formData.hebAccessibilityFeatures
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
            houseRules: formData.hebHouseRules
                .split("\n")
                .map((r) => r.trim())
                .filter(Boolean),
            cancellationPolicy: formData.cancellationPolicy,
            nearbyAttractions: formData.hebNearbyAttractions
                .split(",")
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
        formData.pricingUnit === "PAR_SEMAINE" ? "PAR_SEMAINE" : "PAR_JOUR";
    const mileageLimit =
        formData.mileageLimit === "ILLIMITE"
            ? ("ILLIMITE" as const)
            : parseFloat(formData.mileageLimit) || 200;
    const s: CarService = {
        id,
        partnerId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location,
        images: existing?.images ?? [],
        category: "VOITURE",
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
        ...(mileageLimit !== "ILLIMITE" &&
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
                      .split(",")
                      .map((l) => l.trim())
                      .filter(Boolean),
              }
            : {}),
        additionalDriverAllowed: formData.additionalDriverAllowed,
        additionalDriverFeePerDay:
            parseFloat(formData.additionalDriverFeePerDay) || 0,
        pickupLocations: formData.pickupLocations
            .split(",")
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

type TranslateFn = (key: string) => string;

function getCategoryLabels(t: TranslateFn): Record<ServiceCategory, string> {
    return {
        ACTIVITE: t("partner.catalog.category.activity"),
        BATEAU: t("partner.catalog.category.boat"),
        HEBERGEMENT: t("partner.catalog.category.stay"),
        VOITURE: t("partner.catalog.category.car"),
    };
}

function getPricingUnitsByCategory(
    t: TranslateFn,
): Record<
    ServiceCategory,
    Array<{ value: ServicePricingUnit; label: string }>
> {
    return {
        ACTIVITE: [
            {
                value: "PAR_PERSONNE",
                label: t("partner.catalog.pricing_unit.person"),
            },
            {
                value: "PAR_GROUPE",
                label: t("partner.catalog.pricing_unit.group"),
            },
        ],
        BATEAU: [
            { value: "PAR_JOUR", label: t("partner.catalog.pricing_unit.day") },
            {
                value: "PAR_DEMI_JOURNEE",
                label: t("partner.catalog.pricing_unit.half_day"),
            },
            {
                value: "PAR_SEMAINE",
                label: t("partner.catalog.pricing_unit.week"),
            },
        ],
        HEBERGEMENT: [
            {
                value: "PAR_NUIT",
                label: t("partner.catalog.pricing_unit.night"),
            },
            {
                value: "PAR_SEMAINE",
                label: t("partner.catalog.pricing_unit.week"),
            },
        ],
        VOITURE: [
            { value: "PAR_JOUR", label: t("partner.catalog.pricing_unit.day") },
            {
                value: "PAR_SEMAINE",
                label: t("partner.catalog.pricing_unit.week"),
            },
        ],
    };
}

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
    const { t } = useTranslation();

    const [form, setForm] = useState<ServiceFormState>(() =>
        editingService ? initFormFromService(editingService) : DEFAULT_FORM,
    );

    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const categoryLabels = useMemo(() => getCategoryLabels(t), [t]);
    const pricingUnitsByCategory = useMemo(
        () => getPricingUnitsByCategory(t),
        [t],
    );
    const paymentModeOptions = useMemo(
        () => [
            {
                value: "FULL_CASH_ON_SITE",
                label: t("partner.catalog.payment_mode.on_site"),
            },
            {
                value: "COMMISSION_ONLINE_REST_ON_SITE",
                label: t("partner.catalog.payment_mode.commission_online"),
            },
            {
                value: "FULL_ONLINE",
                label: t("partner.catalog.payment_mode.full_online"),
            },
            {
                value: "CONNECTED_ACCOUNT",
                label: t("partner.catalog.payment_mode.connected_account"),
            },
        ],
        [t],
    );

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
    const handleCategoryChange = useCallback(
        (cat: ServiceCategory) => {
            const firstUnit = pricingUnitsByCategory[cat][0].value;
            setForm((prev) => ({
                ...prev,
                category: cat,
                pricingUnit: firstUnit,
            }));
            setErrors({});
        },
        [pricingUnitsByCategory],
    );

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!form.title.trim()) {
            errs.title = t("partner.catalog.error.title_required");
        }

        if (!form.description.trim()) {
            errs.description = t("partner.catalog.error.description_required");
        }

        if (!form.city.trim()) {
            errs.city = t("partner.catalog.error.city_required");
        }

        if (!form.country.trim()) {
            errs.country = t("partner.catalog.error.country_required");
        }

        const price = parseFloat(form.partnerPrice);

        if (!form.partnerPrice || isNaN(price) || price <= 0) {
            errs.partnerPrice = t("partner.catalog.error.price_positive");
        }

        if (form.category === "ACTIVITE") {
            if (!form.meetingPoint.trim()) {
                errs.meetingPoint = t(
                    "partner.catalog.error.meeting_point_required",
                );
            }
        }

        if (form.category === "BATEAU") {
            if (!form.boatName.trim()) {
                errs.boatName = t("partner.catalog.error.boat_name_required");
            }
        }

        if (form.category === "VOITURE") {
            if (!form.brand.trim()) {
                errs.brand = t("partner.catalog.error.brand_required");
            }

            if (!form.model.trim()) {
                errs.model = t("partner.catalog.error.model_required");
            }
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);

            return false;
        }

        return true;
    };

    const isEditing = editingService !== null;
    const pricingOptions = pricingUnitsByCategory[form.category];

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
        type = "text",
        extra?: React.InputHTMLAttributes<HTMLInputElement>,
    ) => (
        <input
            id={`${formId}-${id}`}
            type={type}
            className={`wdr-catalog-modal__input${errors[id] ? "wdr-catalog-modal__input--error" : ""}`}
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
                            ? t("partner.catalog.modal.edit_title")
                            : t("partner.catalog.modal.create_title")}
                    </h2>
                    <button
                        type="button"
                        className="wdr-catalog-modal__close"
                        onClick={onClose}
                        aria-label={t("partner.catalog.modal.close")}
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
                            {t("partner.catalog.section.general")}
                        </p>

                        {fld(
                            "title",
                            t("partner.catalog.field.title"),
                            inp(
                                "title",
                                t("partner.catalog.placeholder.title"),
                                "text",
                                { maxLength: 120 },
                            ),
                            errors.title,
                            true,
                        )}
                        {fld(
                            "description",
                            t("partner.catalog.field.description"),
                            <textarea
                                id={`${formId}-description`}
                                className={`wdr-catalog-modal__textarea${errors.description ? "wdr-catalog-modal__input--error" : ""}`}
                                value={form.description}
                                onChange={(e) =>
                                    set("description", e.target.value)
                                }
                                placeholder={t(
                                    "partner.catalog.placeholder.description",
                                )}
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
                                    {t("partner.catalog.field.category")}
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
                                    {Object.entries(categoryLabels).map(
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
                                    {t("partner.catalog.field.pricing_unit")}
                                </label>
                                {sel("pricingUnit", pricingOptions)}
                            </div>
                        </div>

                        {/* Tarification */}
                        <p className="wdr-catalog-modal__section-label">
                            {t("partner.catalog.section.pricing")}
                        </p>
                        <div className="wdr-catalog-modal__row">
                            {fld(
                                "partnerPrice",
                                t("partner.catalog.field.partner_price"),
                                inp("partnerPrice", "0.00", "number", {
                                    min: "0",
                                    step: "0.01",
                                }),
                                errors.partnerPrice,
                                true,
                            )}
                            <div className="wdr-catalog-modal__field">
                                <label
                                    htmlFor={`${formId}-currency`}
                                    className="wdr-catalog-modal__label"
                                >
                                    {t("partner.catalog.field.currency")}
                                </label>
                                {sel("currency", [
                                    { value: "EUR", label: "EUR — Euro" },
                                    { value: "USD", label: "USD — Dollar US" },
                                    {
                                        value: "GBP",
                                        label: "GBP — Livre sterling",
                                    },
                                ])}
                            </div>
                        </div>

                        {partnerPriceNum > 0 && (
                            <div className="wdr-catalog-modal__price-preview">
                                <span className="wdr-catalog-modal__price-preview-label">
                                    {t(
                                        "partner.catalog.preview.commission",
                                    ).replace(
                                        "{rate}",
                                        (commissionRate * 100).toFixed(0),
                                    )}
                                </span>
                                <span>
                                    {formatPrice(
                                        previewCommission,
                                        form.currency,
                                    )}
                                </span>
                                <span className="wdr-catalog-modal__price-preview-label">
                                    {t("partner.catalog.preview.client_price")}
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
                                {t("partner.catalog.field.payment_mode")}
                            </label>
                            {sel("paymentMode", paymentModeOptions)}
                        </div>

                        {/* Localisation */}
                        <p className="wdr-catalog-modal__section-label">
                            {t("partner.catalog.section.location")}
                        </p>
                        <div className="wdr-catalog-modal__row">
                            {fld(
                                "city",
                                t("partner.catalog.field.city"),
                                inp(
                                    "city",
                                    t("partner.catalog.placeholder.city"),
                                    "text",
                                    {
                                        autoComplete: "address-level2",
                                    },
                                ),
                                errors.city,
                                true,
                            )}
                            {fld(
                                "country",
                                t("partner.catalog.field.country"),
                                inp(
                                    "country",
                                    t("partner.catalog.placeholder.country"),
                                    "text",
                                    {
                                        autoComplete: "country-name",
                                    },
                                ),
                                errors.country,
                                true,
                            )}
                        </div>
                        {fld(
                            "region",
                            t("partner.catalog.field.region"),
                            inp(
                                "region",
                                t("partner.catalog.placeholder.region"),
                            ),
                        )}
                        {fld(
                            "tags",
                            t("partner.catalog.field.tags"),
                            inp("tags", t("partner.catalog.placeholder.tags")),
                        )}

                        {/* ---- Section spécifique ACTIVITE ---- */}
                        {form.category === "ACTIVITE" && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    {t("partner.catalog.section.activity")}
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-activityType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.activity_type",
                                            )}
                                        </label>
                                        {sel("activityType", [
                                            {
                                                value: "RANDONNEE",
                                                label: t(
                                                    "partner.catalog.activity_type.hiking",
                                                ),
                                            },
                                            {
                                                value: "PLONGEE",
                                                label: t(
                                                    "partner.catalog.activity_type.diving",
                                                ),
                                            },
                                            {
                                                value: "KAYAK",
                                                label: t(
                                                    "partner.catalog.activity_type.kayak",
                                                ),
                                            },
                                            {
                                                value: "SURF",
                                                label: t(
                                                    "partner.catalog.activity_type.surf",
                                                ),
                                            },
                                            {
                                                value: "SNORKELING",
                                                label: t(
                                                    "partner.catalog.activity_type.snorkeling",
                                                ),
                                            },
                                            {
                                                value: "PARACHUTISME",
                                                label: t(
                                                    "partner.catalog.activity_type.skydiving",
                                                ),
                                            },
                                            {
                                                value: "ESCALADE",
                                                label: t(
                                                    "partner.catalog.activity_type.climbing",
                                                ),
                                            },
                                            {
                                                value: "CROISIERE_CULTURELLE",
                                                label: t(
                                                    "partner.catalog.activity_type.cultural_cruise",
                                                ),
                                            },
                                            {
                                                value: "VELO",
                                                label: t(
                                                    "partner.catalog.activity_type.cycling",
                                                ),
                                            },
                                            {
                                                value: "YOGA_PLAGE",
                                                label: t(
                                                    "partner.catalog.activity_type.beach_yoga",
                                                ),
                                            },
                                            {
                                                value: "QUAD_BUGGY",
                                                label: t(
                                                    "partner.catalog.activity_type.quad_buggy",
                                                ),
                                            },
                                            {
                                                value: "OBSERVATION_CETACES",
                                                label: t(
                                                    "partner.catalog.activity_type.whale_watching",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-groupType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.group_type",
                                            )}
                                        </label>
                                        {sel("groupType", [
                                            {
                                                value: "GROUPE_PARTAGE",
                                                label: t(
                                                    "partner.catalog.group_type.shared",
                                                ),
                                            },
                                            {
                                                value: "GROUPE_PRIVE",
                                                label: t(
                                                    "partner.catalog.group_type.private",
                                                ),
                                            },
                                            {
                                                value: "AU_CHOIX",
                                                label: t(
                                                    "partner.catalog.group_type.choice",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "duration",
                                        t("partner.catalog.field.duration"),
                                        inp("duration", "60", "number", {
                                            min: "1",
                                        }),
                                    )}
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-durationUnit`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.duration_unit",
                                            )}
                                        </label>
                                        {sel("durationUnit", [
                                            {
                                                value: "MINUTES",
                                                label: t(
                                                    "partner.catalog.duration_unit.minutes",
                                                ),
                                            },
                                            {
                                                value: "HEURES",
                                                label: t(
                                                    "partner.catalog.duration_unit.hours",
                                                ),
                                            },
                                            {
                                                value: "JOURS",
                                                label: t(
                                                    "partner.catalog.duration_unit.days",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-difficulty`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.difficulty",
                                            )}
                                        </label>
                                        {sel("difficulty", [
                                            {
                                                value: "TOUS_NIVEAUX",
                                                label: t(
                                                    "partner.catalog.difficulty.all_levels",
                                                ),
                                            },
                                            {
                                                value: "DEBUTANT",
                                                label: t(
                                                    "partner.catalog.difficulty.beginner",
                                                ),
                                            },
                                            {
                                                value: "INTERMEDIAIRE",
                                                label: t(
                                                    "partner.catalog.difficulty.intermediate",
                                                ),
                                            },
                                            {
                                                value: "AVANCE",
                                                label: t(
                                                    "partner.catalog.difficulty.advanced",
                                                ),
                                            },
                                            {
                                                value: "EXPERT",
                                                label: t(
                                                    "partner.catalog.difficulty.expert",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-physicalIntensity`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.intensity",
                                            )}
                                        </label>
                                        {sel("physicalIntensity", [
                                            {
                                                value: "FAIBLE",
                                                label: t(
                                                    "partner.catalog.intensity.low",
                                                ),
                                            },
                                            {
                                                value: "MODEREE",
                                                label: t(
                                                    "partner.catalog.intensity.moderate",
                                                ),
                                            },
                                            {
                                                value: "ELEVEE",
                                                label: t(
                                                    "partner.catalog.intensity.high",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "minParticipants",
                                        t(
                                            "partner.catalog.field.min_participants",
                                        ),
                                        inp("minParticipants", "1", "number", {
                                            min: "1",
                                        }),
                                    )}
                                    {fld(
                                        "maxParticipants",
                                        t(
                                            "partner.catalog.field.max_participants",
                                        ),
                                        inp("maxParticipants", "10", "number", {
                                            min: "1",
                                        }),
                                    )}
                                    {fld(
                                        "minAgeYears",
                                        t("partner.catalog.field.min_age"),
                                        inp("minAgeYears", "0", "number", {
                                            min: "0",
                                        }),
                                    )}
                                </div>

                                {fld(
                                    "meetingPoint",
                                    t("partner.catalog.field.meeting_point"),
                                    inp(
                                        "meetingPoint",
                                        t(
                                            "partner.catalog.placeholder.meeting_point",
                                        ),
                                    ),
                                    errors.meetingPoint,
                                    true,
                                )}
                                {fld(
                                    "scheduleStartTimes",
                                    t(
                                        "partner.catalog.field.schedule_start_times",
                                    ),
                                    inp("scheduleStartTimes", "09:00, 14:00"),
                                )}
                                {fld(
                                    "languages",
                                    t("partner.catalog.field.languages"),
                                    inp("languages", "fr, en, es"),
                                )}

                                {chk(
                                    "requiresMedicalClearance",
                                    t(
                                        "partner.catalog.field.medical_clearance",
                                    ),
                                )}
                                {chk(
                                    "equipmentProvided",
                                    t(
                                        "partner.catalog.field.equipment_provided",
                                    ),
                                )}

                                {fld(
                                    "daysAvailable",
                                    t("partner.catalog.field.days_available"),
                                    inp(
                                        "daysAvailable",
                                        t(
                                            "partner.catalog.placeholder.days_available",
                                        ),
                                    ),
                                )}
                                {fld(
                                    "certificationRequired",
                                    t(
                                        "partner.catalog.field.certification_required",
                                    ),
                                    inp(
                                        "certificationRequired",
                                        t(
                                            "partner.catalog.placeholder.certification_required",
                                        ),
                                    ),
                                )}

                                {fld(
                                    "included",
                                    t("partner.catalog.field.included"),
                                    <textarea
                                        id={`${formId}-included`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.included}
                                        onChange={(e) =>
                                            set("included", e.target.value)
                                        }
                                        placeholder={t(
                                            "partner.catalog.placeholder.included",
                                        )}
                                        rows={3}
                                    />,
                                )}
                                {fld(
                                    "notIncluded",
                                    t("partner.catalog.field.not_included"),
                                    <textarea
                                        id={`${formId}-notIncluded`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.notIncluded}
                                        onChange={(e) =>
                                            set("notIncluded", e.target.value)
                                        }
                                        placeholder={t(
                                            "partner.catalog.placeholder.not_included",
                                        )}
                                        rows={3}
                                    />,
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique BATEAU ---- */}
                        {form.category === "BATEAU" && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    {t("partner.catalog.section.boat")}
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-boatType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.boat_type",
                                            )}
                                        </label>
                                        {sel("boatType", [
                                            {
                                                value: "VOILIER",
                                                label: t(
                                                    "partner.catalog.boat_type.sailboat",
                                                ),
                                            },
                                            {
                                                value: "CATAMARAN",
                                                label: t(
                                                    "partner.catalog.boat_type.catamaran",
                                                ),
                                            },
                                            {
                                                value: "YACHT_MOTEUR",
                                                label: t(
                                                    "partner.catalog.boat_type.motor_yacht",
                                                ),
                                            },
                                            {
                                                value: "SEMI_RIGIDE",
                                                label: t(
                                                    "partner.catalog.boat_type.rib",
                                                ),
                                            },
                                            {
                                                value: "GOELETTE",
                                                label: t(
                                                    "partner.catalog.boat_type.schooner",
                                                ),
                                            },
                                            {
                                                value: "PENICHE",
                                                label: t(
                                                    "partner.catalog.boat_type.barge",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        "boatName",
                                        t("partner.catalog.field.boat_name"),
                                        inp(
                                            "boatName",
                                            t(
                                                "partner.catalog.placeholder.boat_name",
                                            ),
                                        ),
                                        errors.boatName,
                                        true,
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "passengerCapacity",
                                        t(
                                            "partner.catalog.field.passenger_capacity",
                                        ),
                                        inp(
                                            "passengerCapacity",
                                            "8",
                                            "number",
                                            { min: "1" },
                                        ),
                                    )}
                                    {fld(
                                        "sleepingBerths",
                                        t(
                                            "partner.catalog.field.sleeping_berths",
                                        ),
                                        inp("sleepingBerths", "4", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "lengthMeters",
                                        t(
                                            "partner.catalog.field.length_meters",
                                        ),
                                        inp("lengthMeters", "12.5", "number", {
                                            min: "1",
                                            step: "0.1",
                                        }),
                                    )}
                                    {fld(
                                        "manufactureYear",
                                        t(
                                            "partner.catalog.field.manufacture_year",
                                        ),
                                        inp(
                                            "manufactureYear",
                                            "2020",
                                            "number",
                                            { min: "1900" },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-engineType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.engine_type",
                                            )}
                                        </label>
                                        {sel("engineType", [
                                            {
                                                value: "VOILE",
                                                label: t(
                                                    "partner.catalog.engine_type.sail_only",
                                                ),
                                            },
                                            {
                                                value: "MOTEUR",
                                                label: t(
                                                    "partner.catalog.engine_type.motor_only",
                                                ),
                                            },
                                            {
                                                value: "VOILE_ET_MOTEUR",
                                                label: t(
                                                    "partner.catalog.engine_type.sail_and_motor",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-rentalMode`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.rental_mode",
                                            )}
                                        </label>
                                        {sel("rentalMode", [
                                            {
                                                value: "AVEC_SKIPPER",
                                                label: t(
                                                    "partner.catalog.rental_mode.with_skipper",
                                                ),
                                            },
                                            {
                                                value: "SANS_SKIPPER",
                                                label: t(
                                                    "partner.catalog.rental_mode.without_skipper",
                                                ),
                                            },
                                            {
                                                value: "BARE_BOAT",
                                                label: t(
                                                    "partner.catalog.rental_mode.bareboat",
                                                ),
                                            },
                                            {
                                                value: "AVEC_EQUIPAGE_COMPLET",
                                                label: t(
                                                    "partner.catalog.rental_mode.full_crew",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "boatCabins",
                                        t("partner.catalog.field.boat_cabins"),
                                        inp("boatCabins", "2", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "boatBathrooms",
                                        t(
                                            "partner.catalog.field.boat_bathrooms",
                                        ),
                                        inp("boatBathrooms", "1", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "boatDepositAmountEur",
                                        t("partner.catalog.field.deposit_eur"),
                                        inp(
                                            "boatDepositAmountEur",
                                            "0",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                </div>

                                {fld(
                                    "departurePorts",
                                    t("partner.catalog.field.departure_ports"),
                                    inp(
                                        "departurePorts",
                                        t(
                                            "partner.catalog.placeholder.departure_ports",
                                        ),
                                    ),
                                )}
                                {fld(
                                    "navigationArea",
                                    t("partner.catalog.field.navigation_area"),
                                    inp(
                                        "navigationArea",
                                        t(
                                            "partner.catalog.placeholder.navigation_area",
                                        ),
                                    ),
                                )}
                                {fld(
                                    "boatAmenities",
                                    t("partner.catalog.field.boat_amenities"),
                                    inp(
                                        "boatAmenities",
                                        t(
                                            "partner.catalog.placeholder.boat_amenities",
                                        ),
                                    ),
                                )}

                                {chk(
                                    "licenseRequired",
                                    t("partner.catalog.field.license_required"),
                                )}
                                {form.licenseRequired &&
                                    fld(
                                        "licenseType",
                                        t("partner.catalog.field.license_type"),
                                        inp(
                                            "licenseType",
                                            t(
                                                "partner.catalog.placeholder.license_type",
                                            ),
                                        ),
                                    )}
                                {chk(
                                    "boatFuelIncluded",
                                    t("partner.catalog.field.fuel_included"),
                                )}
                                {chk(
                                    "boatInsuranceIncluded",
                                    t(
                                        "partner.catalog.field.insurance_included",
                                    ),
                                )}
                                {fld(
                                    "enginePowerKw",
                                    t("partner.catalog.field.engine_power_kw"),
                                    inp("enginePowerKw", "", "number", {
                                        min: "0",
                                        step: "1",
                                    }),
                                )}
                                {chk(
                                    "boatAvailableForDayCharter",
                                    t("partner.catalog.field.day_charter"),
                                )}
                                {chk(
                                    "boatAvailableForWeekCharter",
                                    t("partner.catalog.field.week_charter"),
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique HEBERGEMENT ---- */}
                        {form.category === "HEBERGEMENT" && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    {t("partner.catalog.section.stay")}
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-accommodationType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.accommodation_type",
                                            )}
                                        </label>
                                        {sel("accommodationType", [
                                            {
                                                value: "HOTEL",
                                                label: t(
                                                    "partner.catalog.stay_type.hotel",
                                                ),
                                            },
                                            {
                                                value: "VILLA",
                                                label: t(
                                                    "partner.catalog.stay_type.villa",
                                                ),
                                            },
                                            {
                                                value: "APPARTEMENT",
                                                label: t(
                                                    "partner.catalog.stay_type.apartment",
                                                ),
                                            },
                                            {
                                                value: "BUNGALOW",
                                                label: t(
                                                    "partner.catalog.stay_type.bungalow",
                                                ),
                                            },
                                            {
                                                value: "MAISON_HOTES",
                                                label: t(
                                                    "partner.catalog.stay_type.guest_house",
                                                ),
                                            },
                                            {
                                                value: "BASTIDE",
                                                label: t(
                                                    "partner.catalog.stay_type.bastide",
                                                ),
                                            },
                                            {
                                                value: "RIAD",
                                                label: t(
                                                    "partner.catalog.stay_type.riad",
                                                ),
                                            },
                                            {
                                                value: "LODGE",
                                                label: t(
                                                    "partner.catalog.stay_type.lodge",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-cancellationPolicy`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.cancellation_policy",
                                            )}
                                        </label>
                                        {sel("cancellationPolicy", [
                                            {
                                                value: "FLEXIBLE",
                                                label: t(
                                                    "partner.catalog.cancellation.flexible",
                                                ),
                                            },
                                            {
                                                value: "MODEREE",
                                                label: t(
                                                    "partner.catalog.cancellation.moderate",
                                                ),
                                            },
                                            {
                                                value: "STRICTE",
                                                label: t(
                                                    "partner.catalog.cancellation.strict",
                                                ),
                                            },
                                            {
                                                value: "NON_REMBOURSABLE",
                                                label: t(
                                                    "partner.catalog.cancellation.non_refundable",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "maxGuests",
                                        t("partner.catalog.field.max_guests"),
                                        inp("maxGuests", "4", "number", {
                                            min: "1",
                                        }),
                                    )}
                                    {fld(
                                        "bedrooms",
                                        t("partner.catalog.field.bedrooms"),
                                        inp("bedrooms", "2", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "hebBathrooms",
                                        t(
                                            "partner.catalog.field.stay_bathrooms",
                                        ),
                                        inp("hebBathrooms", "1", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "minimumStayNights",
                                        t(
                                            "partner.catalog.field.minimum_stay_nights",
                                        ),
                                        inp(
                                            "minimumStayNights",
                                            "1",
                                            "number",
                                            { min: "1" },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "checkInTime",
                                        t(
                                            "partner.catalog.field.check_in_time",
                                        ),
                                        inp("checkInTime", "14:00", "time"),
                                    )}
                                    {fld(
                                        "checkOutTime",
                                        t(
                                            "partner.catalog.field.check_out_time",
                                        ),
                                        inp("checkOutTime", "11:00", "time"),
                                    )}
                                </div>

                                {fld(
                                    "hebAmenities",
                                    t("partner.catalog.field.stay_amenities"),
                                    inp(
                                        "hebAmenities",
                                        t(
                                            "partner.catalog.placeholder.stay_amenities",
                                        ),
                                    ),
                                )}

                                {chk(
                                    "breakfastIncluded",
                                    t(
                                        "partner.catalog.field.breakfast_included",
                                    ),
                                )}
                                {chk(
                                    "petsAllowed",
                                    t("partner.catalog.field.pets_allowed"),
                                )}
                                {chk(
                                    "smokingAllowed",
                                    t("partner.catalog.field.smoking_allowed"),
                                )}

                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-starRating`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.star_rating",
                                            )}
                                        </label>
                                        {sel("starRating", [
                                            {
                                                value: "",
                                                label: t(
                                                    "partner.catalog.star_rating.unrated",
                                                ),
                                            },
                                            {
                                                value: "1",
                                                label: t(
                                                    "partner.catalog.star_rating.1",
                                                ),
                                            },
                                            {
                                                value: "2",
                                                label: t(
                                                    "partner.catalog.star_rating.2",
                                                ),
                                            },
                                            {
                                                value: "3",
                                                label: t(
                                                    "partner.catalog.star_rating.3",
                                                ),
                                            },
                                            {
                                                value: "4",
                                                label: t(
                                                    "partner.catalog.star_rating.4",
                                                ),
                                            },
                                            {
                                                value: "5",
                                                label: t(
                                                    "partner.catalog.star_rating.5",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        "totalSurfaceM2",
                                        t(
                                            "partner.catalog.field.total_surface",
                                        ),
                                        inp("totalSurfaceM2", "", "number", {
                                            min: "0",
                                        }),
                                    )}
                                </div>
                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "distanceToBeachMeters",
                                        t(
                                            "partner.catalog.field.distance_to_beach",
                                        ),
                                        inp(
                                            "distanceToBeachMeters",
                                            "",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                    {fld(
                                        "distanceToCityKm",
                                        t(
                                            "partner.catalog.field.distance_to_city",
                                        ),
                                        inp("distanceToCityKm", "", "number", {
                                            min: "0",
                                            step: "0.1",
                                        }),
                                    )}
                                </div>
                                {fld(
                                    "hebHouseRules",
                                    t("partner.catalog.field.house_rules"),
                                    <textarea
                                        id={`${formId}-hebHouseRules`}
                                        className="wdr-catalog-modal__textarea"
                                        value={form.hebHouseRules}
                                        onChange={(e) =>
                                            set("hebHouseRules", e.target.value)
                                        }
                                        placeholder={t(
                                            "partner.catalog.placeholder.house_rules",
                                        )}
                                        rows={3}
                                    />,
                                )}
                                {fld(
                                    "hebNearbyAttractions",
                                    t(
                                        "partner.catalog.field.nearby_attractions",
                                    ),
                                    inp(
                                        "hebNearbyAttractions",
                                        t(
                                            "partner.catalog.placeholder.nearby_attractions",
                                        ),
                                    ),
                                )}
                                {fld(
                                    "hebAccessibilityFeatures",
                                    t(
                                        "partner.catalog.field.accessibility_features",
                                    ),
                                    inp(
                                        "hebAccessibilityFeatures",
                                        t(
                                            "partner.catalog.placeholder.accessibility_features",
                                        ),
                                    ),
                                )}
                            </>
                        )}

                        {/* ---- Section spécifique VOITURE ---- */}
                        {form.category === "VOITURE" && (
                            <>
                                <p className="wdr-catalog-modal__section-label">
                                    {t("partner.catalog.section.car")}
                                </p>
                                <div className="wdr-catalog-modal__row">
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-vehicleType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.vehicle_type",
                                            )}
                                        </label>
                                        {sel("vehicleType", [
                                            {
                                                value: "CITADINE",
                                                label: t(
                                                    "partner.catalog.vehicle_type.city_car",
                                                ),
                                            },
                                            {
                                                value: "BERLINE",
                                                label: t(
                                                    "partner.catalog.vehicle_type.sedan",
                                                ),
                                            },
                                            {
                                                value: "SUV",
                                                label: t(
                                                    "partner.catalog.vehicle_type.suv",
                                                ),
                                            },
                                            {
                                                value: "CABRIOLET",
                                                label: t(
                                                    "partner.catalog.vehicle_type.convertible",
                                                ),
                                            },
                                            {
                                                value: "MONOSPACE",
                                                label: t(
                                                    "partner.catalog.vehicle_type.minivan",
                                                ),
                                            },
                                            {
                                                value: "UTILITAIRE",
                                                label: t(
                                                    "partner.catalog.vehicle_type.utility",
                                                ),
                                            },
                                            {
                                                value: "QUAD",
                                                label: t(
                                                    "partner.catalog.vehicle_type.quad",
                                                ),
                                            },
                                            {
                                                value: "SCOOTER_125",
                                                label: t(
                                                    "partner.catalog.vehicle_type.scooter_125",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    {fld(
                                        "year",
                                        t("partner.catalog.field.year"),
                                        inp("year", "2022", "number", {
                                            min: "1990",
                                            max: "2030",
                                        }),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "brand",
                                        t("partner.catalog.field.brand"),
                                        inp(
                                            "brand",
                                            t(
                                                "partner.catalog.placeholder.brand",
                                            ),
                                        ),
                                        errors.brand,
                                        true,
                                    )}
                                    {fld(
                                        "model",
                                        t("partner.catalog.field.model"),
                                        inp(
                                            "model",
                                            t(
                                                "partner.catalog.placeholder.model",
                                            ),
                                        ),
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
                                            {t(
                                                "partner.catalog.field.transmission",
                                            )}
                                        </label>
                                        {sel("transmission", [
                                            {
                                                value: "MANUELLE",
                                                label: t(
                                                    "partner.catalog.transmission.manual",
                                                ),
                                            },
                                            {
                                                value: "AUTOMATIQUE",
                                                label: t(
                                                    "partner.catalog.transmission.automatic",
                                                ),
                                            },
                                        ])}
                                    </div>
                                    <div className="wdr-catalog-modal__field">
                                        <label
                                            htmlFor={`${formId}-fuelType`}
                                            className="wdr-catalog-modal__label"
                                        >
                                            {t(
                                                "partner.catalog.field.fuel_type",
                                            )}
                                        </label>
                                        {sel("fuelType", [
                                            {
                                                value: "ESSENCE",
                                                label: t(
                                                    "partner.catalog.fuel.gasoline",
                                                ),
                                            },
                                            {
                                                value: "DIESEL",
                                                label: t(
                                                    "partner.catalog.fuel.diesel",
                                                ),
                                            },
                                            {
                                                value: "ELECTRIQUE",
                                                label: t(
                                                    "partner.catalog.fuel.electric",
                                                ),
                                            },
                                            {
                                                value: "HYBRIDE",
                                                label: t(
                                                    "partner.catalog.fuel.hybrid",
                                                ),
                                            },
                                            {
                                                value: "GPL",
                                                label: t(
                                                    "partner.catalog.fuel.lpg",
                                                ),
                                            },
                                        ])}
                                    </div>
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "seats",
                                        t("partner.catalog.field.seats"),
                                        inp("seats", "5", "number", {
                                            min: "1",
                                        }),
                                    )}
                                    {fld(
                                        "doors",
                                        t("partner.catalog.field.doors"),
                                        inp("doors", "4", "number", {
                                            min: "2",
                                        }),
                                    )}
                                    {fld(
                                        "driverMinAge",
                                        t(
                                            "partner.catalog.field.driver_min_age",
                                        ),
                                        inp("driverMinAge", "21", "number", {
                                            min: "16",
                                        }),
                                    )}
                                    {fld(
                                        "driverLicenseYearsRequired",
                                        t(
                                            "partner.catalog.field.license_years_required",
                                        ),
                                        inp(
                                            "driverLicenseYearsRequired",
                                            "2",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                </div>

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "mileageLimit",
                                        t(
                                            "partner.catalog.field.mileage_limit",
                                        ),
                                        inp(
                                            "mileageLimit",
                                            t(
                                                "partner.catalog.placeholder.mileage_limit",
                                            ),
                                        ),
                                    )}
                                    {fld(
                                        "carDepositAmountEur",
                                        t("partner.catalog.field.deposit_eur"),
                                        inp(
                                            "carDepositAmountEur",
                                            "500",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                    {fld(
                                        "additionalDriverFeePerDay",
                                        t(
                                            "partner.catalog.field.additional_driver_fee",
                                        ),
                                        inp(
                                            "additionalDriverFeePerDay",
                                            "15",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                </div>

                                {fld(
                                    "pickupLocations",
                                    t("partner.catalog.field.pickup_locations"),
                                    inp(
                                        "pickupLocations",
                                        t(
                                            "partner.catalog.placeholder.pickup_locations",
                                        ),
                                    ),
                                )}

                                {form.mileageLimit !== "ILLIMITE" &&
                                    form.mileageLimit.trim() !== "" &&
                                    fld(
                                        "mileageExtraChargePerKm",
                                        t(
                                            "partner.catalog.field.extra_mileage_fee",
                                        ),
                                        inp(
                                            "mileageExtraChargePerKm",
                                            "0.25",
                                            "number",
                                            { min: "0", step: "0.01" },
                                        ),
                                    )}

                                <div className="wdr-catalog-modal__row">
                                    {fld(
                                        "luggageSmallBags",
                                        t("partner.catalog.field.small_bags"),
                                        inp("luggageSmallBags", "2", "number", {
                                            min: "0",
                                        }),
                                    )}
                                    {fld(
                                        "luggageLargeSuitcases",
                                        t(
                                            "partner.catalog.field.large_suitcases",
                                        ),
                                        inp(
                                            "luggageLargeSuitcases",
                                            "1",
                                            "number",
                                            { min: "0" },
                                        ),
                                    )}
                                </div>

                                {chk(
                                    "airConditioning",
                                    t("partner.catalog.field.air_conditioning"),
                                )}
                                {chk(
                                    "carFuelIncluded",
                                    t("partner.catalog.field.fuel_included"),
                                )}
                                {chk(
                                    "carInsuranceIncluded",
                                    t("partner.catalog.field.full_insurance"),
                                )}
                                {chk(
                                    "deliveryAvailable",
                                    t(
                                        "partner.catalog.field.delivery_available",
                                    ),
                                )}
                                {form.deliveryAvailable &&
                                    fld(
                                        "deliveryLocations",
                                        t(
                                            "partner.catalog.field.delivery_locations",
                                        ),
                                        inp(
                                            "deliveryLocations",
                                            t(
                                                "partner.catalog.placeholder.delivery_locations",
                                            ),
                                        ),
                                    )}
                                {chk(
                                    "additionalDriverAllowed",
                                    t(
                                        "partner.catalog.field.additional_driver_allowed",
                                    ),
                                )}
                            </>
                        )}

                        {/* ---- Disponibilite ---- */}
                        <p className="wdr-catalog-modal__section-label">
                            {t("partner.catalog.section.availability")}
                        </p>
                        {chk(
                            "isAvailable",
                            t("partner.catalog.field.available"),
                        )}
                    </div>

                    <div className="wdr-catalog-modal__footer">
                        <Button variant="ghost" type="button" onClick={onClose}>
                            {t("partner.catalog.action.cancel")}
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEditing
                                ? t("partner.catalog.action.save")
                                : t("partner.catalog.action.create")}
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
    const { t } = useTranslation();

    const activityTypeLabels: Record<ActivityType, string> = {
        RANDONNEE: t("partner.catalog.activity_type.hiking"),
        PLONGEE: t("partner.catalog.activity_type.diving"),
        KAYAK: t("partner.catalog.activity_type.kayak"),
        SURF: t("partner.catalog.activity_type.surf"),
        SNORKELING: t("partner.catalog.activity_type.snorkeling"),
        PARACHUTISME: t("partner.catalog.activity_type.skydiving"),
        ESCALADE: t("partner.catalog.activity_type.climbing"),
        CROISIERE_CULTURELLE: t(
            "partner.catalog.activity_type.cultural_cruise",
        ),
        VELO: t("partner.catalog.activity_type.cycling"),
        YOGA_PLAGE: t("partner.catalog.activity_type.beach_yoga"),
        QUAD_BUGGY: t("partner.catalog.activity_type.quad_buggy"),
        OBSERVATION_CETACES: t("partner.catalog.activity_type.whale_watching"),
    };
    const durationUnitLabels = {
        MINUTES: t("partner.catalog.duration_unit.minutes_short"),
        HEURES: t("partner.catalog.duration_unit.hours_short"),
        JOURS: t("partner.catalog.duration_unit.days_short"),
    } as const;
    const difficultyLabels: Record<DifficultyLevel, string> = {
        TOUS_NIVEAUX: t("partner.catalog.difficulty.all_levels"),
        DEBUTANT: t("partner.catalog.difficulty.beginner"),
        INTERMEDIAIRE: t("partner.catalog.difficulty.intermediate"),
        AVANCE: t("partner.catalog.difficulty.advanced"),
        EXPERT: t("partner.catalog.difficulty.expert"),
    };
    const boatTypeLabels: Record<BoatType, string> = {
        VOILIER: t("partner.catalog.boat_type.sailboat"),
        CATAMARAN: t("partner.catalog.boat_type.catamaran"),
        YACHT_MOTEUR: t("partner.catalog.boat_type.motor_yacht"),
        SEMI_RIGIDE: t("partner.catalog.boat_type.rib"),
        GOELETTE: t("partner.catalog.boat_type.schooner"),
        PENICHE: t("partner.catalog.boat_type.barge"),
    };
    const rentalModeLabels: Record<RentalMode, string> = {
        AVEC_SKIPPER: t("partner.catalog.rental_mode.with_skipper"),
        SANS_SKIPPER: t("partner.catalog.rental_mode.without_skipper"),
        BARE_BOAT: t("partner.catalog.rental_mode.bareboat"),
        AVEC_EQUIPAGE_COMPLET: t("partner.catalog.rental_mode.full_crew"),
    };
    const stayTypeLabels: Record<AccommodationType, string> = {
        HOTEL: t("partner.catalog.stay_type.hotel"),
        VILLA: t("partner.catalog.stay_type.villa"),
        APPARTEMENT: t("partner.catalog.stay_type.apartment"),
        BUNGALOW: t("partner.catalog.stay_type.bungalow"),
        MAISON_HOTES: t("partner.catalog.stay_type.guest_house"),
        BASTIDE: t("partner.catalog.stay_type.bastide"),
        RIAD: t("partner.catalog.stay_type.riad"),
        LODGE: t("partner.catalog.stay_type.lodge"),
    };
    const vehicleTypeLabels: Record<VehicleType, string> = {
        CITADINE: t("partner.catalog.vehicle_type.city_car"),
        BERLINE: t("partner.catalog.vehicle_type.sedan"),
        SUV: t("partner.catalog.vehicle_type.suv"),
        CABRIOLET: t("partner.catalog.vehicle_type.convertible"),
        MONOSPACE: t("partner.catalog.vehicle_type.minivan"),
        UTILITAIRE: t("partner.catalog.vehicle_type.utility"),
        QUAD: t("partner.catalog.vehicle_type.quad"),
        SCOOTER_125: t("partner.catalog.vehicle_type.scooter_125"),
    };
    const transmissionLabels: Record<TransmissionType, string> = {
        MANUELLE: t("partner.catalog.transmission.manual"),
        AUTOMATIQUE: t("partner.catalog.transmission.automatic"),
    };

    if (service.category === "ACTIVITE") {
        return (
            <span className="wdr-catalog__meta">
                {activityTypeLabels[service.activityType]} · {service.duration}{" "}
                {durationUnitLabels[service.durationUnit]} ·{" "}
                {difficultyLabels[service.difficulty]} ·{" "}
                {t("partner.catalog.meta.participants")
                    .replace("{min}", String(service.minParticipants))
                    .replace("{max}", String(service.maxParticipants))}
            </span>
        );
    }

    if (service.category === "BATEAU") {
        return (
            <span className="wdr-catalog__meta">
                {boatTypeLabels[service.boatType]} « {service.boatName} » ·{" "}
                {t("partner.catalog.meta.passengers").replace(
                    "{count}",
                    String(service.passengerCapacity),
                )}{" "}
                · {rentalModeLabels[service.rentalMode]}
            </span>
        );
    }

    if (service.category === "HEBERGEMENT") {
        return (
            <span className="wdr-catalog__meta">
                {stayTypeLabels[service.accommodationType]} ·{" "}
                {t("partner.catalog.meta.travelers").replace(
                    "{count}",
                    String(service.maxGuests),
                )}{" "}
                ·{" "}
                {t("partner.catalog.meta.bedrooms").replace(
                    "{count}",
                    String(service.bedrooms),
                )}{" "}
                ·{" "}
                {t("partner.catalog.meta.minimum_nights")
                    .replace("{count}", String(service.minimumStayNights))
                    .replace(
                        "{suffix}",
                        service.minimumStayNights > 1 ? "s" : "",
                    )}
            </span>
        );
    }

    // VOITURE
    return (
        <span className="wdr-catalog__meta">
            {vehicleTypeLabels[service.vehicleType]} {service.brand}{" "}
            {service.model} ({service.year}) · {service.seats} places ·{" "}
            {transmissionLabels[service.transmission]}
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

    if (service.category === "ACTIVITE") {
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

    if (service.category === "BATEAU") {
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

    if (service.category === "HEBERGEMENT") {
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
    const { t } = useTranslation();
    const { isBlocked } = usePartnerApprovalGuard();
    const queryClient = useQueryClient();
    const partnerUser = currentUser?.role === "PARTNER" ? currentUser : null;
    const categoryLabels = useMemo(() => getCategoryLabels(t), [t]);
    const { services } = useServicesData({
        partnerId: partnerUser?.id,
        limit: 200,
    });

    const [modalMode, setModalMode] = useState<"new" | Service | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "PARTNER") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const activeCount = useMemo(
        () => services.filter((s) => s.isAvailable).length,
        [services],
    );

    const refreshServices = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ["services"] });
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
                        ? t("partner.catalog.toast.service_disabled")
                        : t("partner.catalog.toast.service_enabled"),
                );
            } catch {
                error(t("partner.catalog.toast.toggle_error"));
            } finally {
                setBusyId(null);
            }
        },
        [error, refreshServices, success, t],
    );

    const handleDeleteConfirm = useCallback(
        async (id: string) => {
            setBusyId(id);

            try {
                await servicesApi.delete(id);
                await refreshServices();
                success(t("partner.catalog.toast.service_deleted"));
            } catch {
                error(t("partner.catalog.toast.delete_error"));
            } finally {
                setBusyId(null);
            }

            setDeletingId(null);
        },
        [error, refreshServices, success, t],
    );

    /**
     * Reçoit le ServiceFormState depuis le modal, construit un Service typé via buildService(),
     * puis met a jour la liste locale (CRUD mock sans backend).
     */
    const handleFormSubmit = useCallback(
        async (formData: ServiceFormState) => {
            const built = buildService(
                formData,
                partnerUser?.id ?? "",
                partnerUser?.commissionRate ?? 0.2,
                modalMode !== "new" && modalMode !== null ? modalMode : null,
            );

            const payload = toServicePayload(built);

            try {
                if (modalMode === "new") {
                    await servicesApi.create(payload);
                    success(t("partner.catalog.toast.service_created"));
                } else if (modalMode !== null) {
                    await servicesApi.update(built.id, payload);
                    success(t("partner.catalog.toast.service_updated"));
                }

                await refreshServices();
                setModalMode(null);
            } catch {
                error(t("partner.catalog.toast.save_error"));
            }
        },
        [
            error,
            modalMode,
            partnerUser?.commissionRate,
            partnerUser?.id,
            refreshServices,
            success,
            t,
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
                                navigate({ name: "partner-dashboard" })
                            }
                            aria-label={t("partner.catalog.back_dashboard")}
                        >
                            <ArrowLeftIcon />
                        </button>
                        <div>
                            <h1 className="wdr-catalog__title">
                                {t("partner.catalog.page_title")}
                            </h1>
                            <p className="wdr-catalog__subtitle">
                                {t("partner.catalog.page_subtitle")
                                    .replace(
                                        "{services}",
                                        String(services.length),
                                    )
                                    .replace(
                                        "{services_suffix}",
                                        services.length !== 1 ? "s" : "",
                                    )
                                    .replace("{active}", String(activeCount))
                                    .replace(
                                        "{active_suffix}",
                                        activeCount !== 1 ? "s" : "",
                                    )}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={<PlusIcon />}
                        onClick={() => setModalMode("new")}
                    >
                        {t("partner.catalog.action.add_service")}
                    </Button>
                </div>
            </div>

            {/* Corps */}
            <div className="wdr-catalog__body">
                {services.length === 0 ? (
                    <div className="wdr-catalog__empty">
                        <p className="wdr-catalog__empty-title">
                            {t("partner.catalog.empty.title")}
                        </p>
                        <p className="wdr-catalog__empty-sub">
                            {t("partner.catalog.empty.subtitle")}
                        </p>
                        <Button
                            variant="primary"
                            leftIcon={<PlusIcon />}
                            onClick={() => setModalMode("new")}
                        >
                            {t("partner.catalog.action.add_service")}
                        </Button>
                    </div>
                ) : (
                    <ul className="wdr-catalog__list" role="list">
                        {services.map((service) => (
                            <li key={service.id} className="wdr-catalog__item">
                                <span
                                    className={`wdr-catalog__category wdr-catalog__category--${service.category.toLowerCase()}`}
                                >
                                    {categoryLabels[service.category]}
                                </span>

                                <div className="wdr-catalog__item-main">
                                    <h2 className="wdr-catalog__item-title">
                                        {service.title}
                                    </h2>
                                    <p className="wdr-catalog__item-location">
                                        {service.location.city},{" "}
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
                                            {t(
                                                "partner.catalog.card.partner_price",
                                            )}
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
                                            {t(
                                                "partner.catalog.card.commission",
                                            ).replace(
                                                "{rate}",
                                                (
                                                    service.commissionRate * 100
                                                ).toFixed(0),
                                            )}
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
                                            {t(
                                                "partner.catalog.card.client_price",
                                            )}
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
                                    {service.sourceType === "EXTERNAL" && (
                                        <span className="wdr-catalog__toggle-label">
                                            {t(
                                                "partner.catalog.card.read_only_offer",
                                            )}
                                        </span>
                                    )}
                                    <label
                                        className="wdr-catalog__toggle"
                                        title={
                                            service.isAvailable
                                                ? t(
                                                      "partner.catalog.action.disable",
                                                  )
                                                : t(
                                                      "partner.catalog.action.enable",
                                                  )
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
                                                    "EXTERNAL"
                                            }
                                            aria-label={`${service.isAvailable ? t("partner.catalog.action.disable") : t("partner.catalog.action.enable")} ${service.title}`}
                                        />
                                        <span
                                            className="wdr-catalog__toggle-track"
                                            aria-hidden="true"
                                        />
                                        <span className="wdr-catalog__toggle-label">
                                            {service.isAvailable
                                                ? t(
                                                      "partner.catalog.status.active",
                                                  )
                                                : t(
                                                      "partner.catalog.status.inactive",
                                                  )}
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
                                            aria-label={`${t("partner.catalog.action.edit")} ${service.title}`}
                                            disabled={
                                                busyId === service.id ||
                                                service.sourceType ===
                                                    "EXTERNAL"
                                            }
                                        >
                                            {t("partner.catalog.action.edit")}
                                        </Button>
                                        {deletingId === service.id ? (
                                            <div
                                                className="wdr-catalog__delete-confirm"
                                                role="alert"
                                            >
                                                <span>
                                                    {t(
                                                        "partner.catalog.delete.confirm_prompt",
                                                    )}
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
                                                    {t(
                                                        "partner.catalog.action.confirm_delete",
                                                    )}
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
                                                    {t(
                                                        "partner.catalog.action.cancel",
                                                    )}
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
                                                aria-label={`${t("partner.catalog.action.delete")} ${service.title}`}
                                                disabled={
                                                    busyId === service.id ||
                                                    service.sourceType ===
                                                        "EXTERNAL"
                                                }
                                            >
                                                {t(
                                                    "partner.catalog.action.delete",
                                                )}
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
                    editingService={modalMode === "new" ? null : modalMode}
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
