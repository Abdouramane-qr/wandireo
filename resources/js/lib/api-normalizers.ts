import type { Availability } from '@/types/availability';
import type { BlogPost, BlogStatus } from '@/types/blog';
import type { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import type { Favorite } from '@/types/favorite';
import type { Review } from '@/types/review';
import type { MandateContractStatus, PartnerStatus } from '@/types/wdr-user';
import type {
    AccommodationService,
    ActivityService,
    BookingMode,
    BoatService,
    CarService,
    PaymentMode,
    Service,
    ServiceAttributeDefinition,
    ServiceAttributeOptionDefinition,
    ServiceCategory,
    ServiceCategoryDefinition,
    ServiceExtraDefinition,
    ServicePricingUnit,
    ServiceSubcategoryDefinition,
} from '@/types/service';
import { PaymentModeNames } from '@/types/service';
import type { User } from '@/types/wdr-user';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
    return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    if (typeof value === 'string') {
        return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    }

    return fallback;
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.map((item) => asString(item)).filter(Boolean)
        : [];
}

function asLocalizedTextMap(value: unknown): Record<string, string> | undefined {
    const record = asRecord(value);
    const entries = Object.entries(record)
        .map(([locale, translation]) => [locale, asString(translation)] as const)
        .filter(([, translation]) => translation.trim() !== '');

    if (entries.length === 0) {
        return undefined;
    }

    return Object.fromEntries(entries);
}

function asDate(value: unknown): Date {
    if (value instanceof Date) {
        return value;
    }

    const date = new Date(asString(value));

    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function serviceExtra(raw: UnknownRecord): UnknownRecord {
    return asRecord(raw.extra_data);
}

function normalizePricingUnit(
    value: unknown,
    fallback: ServicePricingUnit,
): ServicePricingUnit {
    const candidate = asString(value, fallback);
    const allowed = [
        'PAR_PERSONNE',
        'PAR_GROUPE',
        'PAR_JOUR',
        'PAR_DEMI_JOURNEE',
        'PAR_SEMAINE',
        'PAR_NUIT',
    ];

    return allowed.includes(candidate)
        ? (candidate as ServicePricingUnit)
        : fallback;
}

function normalizePaymentMode(value: unknown): PaymentMode {
    const candidate = asString(
        value,
        PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
    );
    const allowed = Object.values(PaymentModeNames);

    return allowed.includes(candidate as PaymentMode)
        ? (candidate as PaymentMode)
        : PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE;
}

function normalizeBookingMode(value: unknown): BookingMode {
    const candidate = asString(value, 'REQUEST');

    if (candidate === 'INSTANT') {
        return 'INSTANT';
    }

    if (candidate === 'EXTERNAL_REDIRECT') {
        return 'EXTERNAL_REDIRECT';
    }

    return 'REQUEST';
}

function baseService(rawInput: unknown): {
    raw: UnknownRecord;
    extra: UnknownRecord;
    id: string;
    partnerId?: string;
    title: string;
    titleTranslations?: Record<string, string>;
    description: string;
    descriptionTranslations?: Record<string, string>;
    category: ServiceCategory;
    pricingUnit: ServicePricingUnit;
    partnerPrice: number;
    commissionRate: number;
    commissionAmount: number;
    clientPrice: number;
    currency: string;
    rating?: number;
    reviewCount: number;
    isAvailable: boolean;
    tags: string[];
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    paymentMode: PaymentMode;
    bookingMode: BookingMode;
    featured: boolean;
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
    extraData: Record<string, unknown>;
    location: Service['location'];
} {
    const raw = asRecord(rawInput);
    const extra = serviceExtra(raw);
    const category = asString(raw.category, 'ACTIVITE') as ServiceCategory;
    const partnerPrice = asNumber(raw.partner_price ?? raw.partnerPrice);
    const commissionRate = asNumber(
        raw.commission_rate ?? raw.commissionRate,
        0.20,
    );
    const commissionAmount = asNumber(
        raw.commission_amount ?? raw.commissionAmount,
        +(partnerPrice * commissionRate).toFixed(2),
    );
    const clientPrice = asNumber(
        raw.client_price ?? raw.clientPrice,
        +(partnerPrice + commissionAmount).toFixed(2),
    );
    const locationData = asRecord(raw.location);
    const coordinates = asRecord(locationData.coordinates);
    const sourceType =
        asString(raw.source_type ?? raw.sourceType, 'LOCAL') === 'EXTERNAL'
            ? 'EXTERNAL'
            : 'LOCAL';
    const sourceProvider =
        asString(raw.source_provider ?? raw.sourceProvider) || undefined;
    const fareHarbor = asRecord(extra.fareharbor);
    const bookingUrl = asString(
        fareHarbor.bookingUrl ?? fareHarbor.booking_url,
    );
    const isExternalRedirect =
        asBoolean(raw.is_external_redirect ?? raw.isExternalRedirect) ||
        normalizeBookingMode(raw.booking_mode ?? raw.bookingMode) ===
            'EXTERNAL_REDIRECT' ||
        normalizePaymentMode(raw.payment_mode ?? raw.paymentMode) ===
            PaymentModeNames.EXTERNAL_REDIRECT ||
        bookingUrl === '__force_external_redirect__';

    return {
        raw,
        extra,
        id: asString(raw.id),
        partnerId: asString(raw.partner_id ?? raw.partnerId) || undefined,
        title: asString(raw.title),
        titleTranslations:
            asLocalizedTextMap(
                raw.title_translations ?? raw.titleTranslations,
            ) || undefined,
        description: asString(raw.description),
        descriptionTranslations:
            asLocalizedTextMap(
                raw.description_translations ?? raw.descriptionTranslations,
            ) || undefined,
        category,
        pricingUnit: normalizePricingUnit(
            raw.pricing_unit ?? raw.pricingUnit,
            category === 'ACTIVITE' ? 'PAR_PERSONNE' : 'PAR_JOUR',
        ),
        partnerPrice,
        commissionRate,
        commissionAmount,
        clientPrice,
        currency: asString(raw.currency, 'EUR'),
        rating: raw.rating == null ? undefined : asNumber(raw.rating),
        reviewCount: asNumber(raw.review_count ?? raw.reviewCount),
        isAvailable: asBoolean(raw.is_available ?? raw.isAvailable, true),
        tags: asStringArray(raw.tags),
        images: asStringArray(raw.images),
        createdAt: asDate(raw.created_at ?? raw.createdAt),
        updatedAt: asDate(raw.updated_at ?? raw.updatedAt),
        paymentMode: normalizePaymentMode(raw.payment_mode ?? raw.paymentMode),
        bookingMode: normalizeBookingMode(raw.booking_mode ?? raw.bookingMode),
        featured: asBoolean(raw.featured, false),
        videoUrl: asString(raw.video_url ?? raw.videoUrl) || undefined,
        sourceType,
        sourceProvider,
        sourceExternalId:
            asString(raw.source_external_id ?? raw.sourceExternalId) ||
            undefined,
        isExternalRedirect,
        lastSyncedAt:
            raw.last_synced_at || raw.lastSyncedAt
                ? asDate(raw.last_synced_at ?? raw.lastSyncedAt)
                : undefined,
        serviceCategoryId:
            asString(
                raw.service_category_id ??
                    raw.serviceCategoryId ??
                    asRecord(raw.serviceCategory).id,
            ) || undefined,
        serviceSubcategoryId:
            asString(
                raw.service_subcategory_id ??
                    raw.serviceSubcategoryId ??
                    asRecord(raw.serviceSubcategory).id,
            ) || undefined,
        serviceCategoryName:
            asString(asRecord(raw.serviceCategory).name) || undefined,
        serviceSubcategoryName:
            asString(asRecord(raw.serviceSubcategory).name) || undefined,
        extraData: extra,
        location: {
            city: asString(locationData.city || raw.location_city),
            country: asString(locationData.country || raw.location_country),
            region:
                asString(locationData.region || raw.location_region) ||
                undefined,
            addressLine:
                asString(
                    locationData.addressLine || raw.location_address_line,
                ) || undefined,
            coordinates:
                coordinates.latitude != null && coordinates.longitude != null
                    ? {
                          latitude: asNumber(coordinates.latitude),
                          longitude: asNumber(coordinates.longitude),
                      }
                    : undefined,
        },
    };
}

export function normalizeServiceAttributeOption(
    rawInput: unknown,
): ServiceAttributeOptionDefinition {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        label: asString(raw.label),
        value: asString(raw.value),
        sortOrder: asNumber(raw.sort_order ?? raw.sortOrder),
    };
}

export function normalizeServiceAttribute(
    rawInput: unknown,
): ServiceAttributeDefinition {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        serviceCategoryId: asString(
            raw.service_category_id ?? raw.serviceCategoryId,
        ),
        label: asString(raw.label),
        key: asString(raw.key),
        type: asString(raw.type, 'text') as ServiceAttributeDefinition['type'],
        isRequired: asBoolean(raw.is_required ?? raw.isRequired),
        isFilterable: asBoolean(raw.is_filterable ?? raw.isFilterable, true),
        sortOrder: asNumber(raw.sort_order ?? raw.sortOrder),
        options: Array.isArray(raw.options)
            ? raw.options.map(normalizeServiceAttributeOption)
            : [],
    };
}

export function normalizeServiceExtra(
    rawInput: unknown,
): ServiceExtraDefinition {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        serviceCategoryId: asString(
            raw.service_category_id ?? raw.serviceCategoryId,
        ),
        name: asString(raw.name),
        description: asString(raw.description) || undefined,
        defaultPrice: asNumber(raw.default_price ?? raw.defaultPrice),
        inputType: asString(
            raw.input_type ?? raw.inputType,
            'CHECKBOX',
        ) as ServiceExtraDefinition['inputType'],
        isRequired: asBoolean(raw.is_required ?? raw.isRequired),
        isActive: asBoolean(raw.is_active ?? raw.isActive, true),
        sortOrder: asNumber(raw.sort_order ?? raw.sortOrder),
    };
}

export function normalizeServiceSubcategory(
    rawInput: unknown,
): ServiceSubcategoryDefinition {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        serviceCategoryId: asString(
            raw.service_category_id ?? raw.serviceCategoryId,
        ),
        name: asString(raw.name),
        slug: asString(raw.slug),
        description: asString(raw.description) || undefined,
        isActive: asBoolean(raw.is_active ?? raw.isActive, true),
        sortOrder: asNumber(raw.sort_order ?? raw.sortOrder),
    };
}

export function normalizeServiceCategory(
    rawInput: unknown,
): ServiceCategoryDefinition {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        serviceType: asString(
            raw.service_type ?? raw.serviceType,
            'ACTIVITE',
        ) as ServiceCategory,
        name: asString(raw.name),
        slug: asString(raw.slug),
        description: asString(raw.description) || undefined,
        isActive: asBoolean(raw.is_active ?? raw.isActive, true),
        sortOrder: asNumber(raw.sort_order ?? raw.sortOrder),
        subcategories: Array.isArray(raw.subcategories)
            ? raw.subcategories.map(normalizeServiceSubcategory)
            : [],
        attributes: Array.isArray(raw.attributes)
            ? raw.attributes.map(normalizeServiceAttribute)
            : [],
        extras: Array.isArray(raw.extras)
            ? raw.extras.map(normalizeServiceExtra)
            : [],
    };
}

export function normalizeUser(rawInput: unknown): User {
    const raw = asRecord(rawInput);
    const role = asString(raw.role, 'CLIENT') as User['role'];
    const firstName = asString(
        raw.first_name ?? raw.firstName ?? raw.name?.toString().split(' ')[0],
    );
    const lastName = asString(
        raw.last_name ??
            raw.lastName ??
            raw.name?.toString().split(' ').slice(1).join(' '),
    );
    const base = {
        id: asString(raw.id),
        firstName,
        lastName,
        email: asString(raw.email),
        profilePicture:
            asString(raw.profile_picture ?? raw.profilePicture) || undefined,
        role,
        createdAt: asDate(raw.created_at ?? raw.createdAt),
        updatedAt: asDate(raw.updated_at ?? raw.updatedAt),
        phoneNumber: asString(raw.phone_number ?? raw.phoneNumber) || undefined,
        language: asString(raw.language, 'fr') || undefined,
        bookingsCount: asNumber(raw.bookings_count ?? raw.bookingsCount),
        reviewsCount: asNumber(raw.reviews_count ?? raw.reviewsCount),
    };

    if (role === 'PARTNER') {
        return {
            ...base,
            role,
            companyName: asString(raw.company_name ?? raw.companyName),
            stripeConnectedAccountId:
                asString(
                    raw.stripe_connected_account_id ??
                        raw.stripeConnectedAccountId,
                ) || undefined,
            businessAddress:
                asString(raw.business_address ?? raw.businessAddress) ||
                undefined,
            partnerStatus: asString(
                raw.partner_status ?? raw.partnerStatus,
                'PENDING',
            ) as PartnerStatus,
            partnerValidatedAt:
                raw.partner_validated_at || raw.partnerValidatedAt
                    ? asDate(raw.partner_validated_at ?? raw.partnerValidatedAt)
                    : undefined,
            partnerRejectionReason:
                asString(
                    raw.partner_rejection_reason ?? raw.partnerRejectionReason,
                ) || undefined,
            mandateContractStatus: asString(
                raw.mandate_contract_status ?? raw.mandateContractStatus,
                'NOT_SENT',
            ) as MandateContractStatus,
            mandateContractFilePath:
                asString(
                    raw.mandate_contract_file_path ??
                        raw.mandateContractFilePath,
                ) || undefined,
            mandateSignedAt:
                raw.mandate_signed_at || raw.mandateSignedAt
                    ? asDate(raw.mandate_signed_at ?? raw.mandateSignedAt)
                    : undefined,
            onboardingCompletedAt:
                raw.onboarding_completed_at || raw.onboardingCompletedAt
                    ? asDate(
                          raw.onboarding_completed_at ??
                              raw.onboardingCompletedAt,
                      )
                    : undefined,
            activities: asStringArray(raw.activities),
            commissionRate: asNumber(
                raw.commission_rate ?? raw.commissionRate,
                0.20,
            ),
            totalSales: asNumber(raw.total_sales ?? raw.totalSales),
        };
    }

    if (role === 'ADMIN') {
        return {
            ...base,
            role,
            permissions: asStringArray(raw.permissions),
            managedLanguages: asStringArray(
                raw.managed_languages ?? raw.managedLanguages,
            ),
            managedLocations: asStringArray(
                raw.managed_locations ?? raw.managedLocations,
            ),
        };
    }

    return {
        ...base,
        role: 'CLIENT',
        bookings: asStringArray(raw.bookings),
        reviews: asStringArray(raw.reviews),
        preferredCurrency:
            asString(raw.preferred_currency ?? raw.preferredCurrency) ||
            undefined,
    };
}

export function normalizeService(rawInput: unknown): Service {
    const base = baseService(rawInput);
    const { extra, category, pricingUnit, ...shared } = base;

    if (category === 'BATEAU') {
        const service: BoatService = {
            ...shared,
            category,
            pricingUnit: normalizePricingUnit(
                pricingUnit,
                'PAR_JOUR',
            ) as BoatService['pricingUnit'],
            boatType: asString(
                extra.boatType,
                'VOILIER',
            ) as BoatService['boatType'],
            boatName: asString(extra.boatName, shared.title),
            passengerCapacity: asNumber(extra.passengerCapacity, 6),
            sleepingBerths: asNumber(extra.sleepingBerths, 0),
            lengthMeters: asNumber(extra.lengthMeters, 10),
            manufactureYear: asNumber(
                extra.manufactureYear,
                new Date().getFullYear(),
            ),
            engineType: asString(
                extra.engineType,
                'VOILE_ET_MOTEUR',
            ) as BoatService['engineType'],
            enginePowerKw:
                extra.enginePowerKw == null
                    ? undefined
                    : asNumber(extra.enginePowerKw),
            rentalMode: asString(
                extra.rentalMode,
                'AVEC_SKIPPER',
            ) as BoatService['rentalMode'],
            cabins: asNumber(extra.cabins, 1),
            bathrooms: asNumber(extra.bathrooms, 1),
            amenities: asStringArray(extra.amenities),
            navigationArea: asStringArray(extra.navigationArea),
            licenseRequired: asBoolean(extra.licenseRequired),
            licenseType: asString(extra.licenseType) || undefined,
            fuelIncluded: asBoolean(extra.fuelIncluded),
            depositAmountEur: asNumber(extra.depositAmountEur),
            insuranceIncluded: asBoolean(extra.insuranceIncluded, true),
            departurePorts: asStringArray(extra.departurePorts),
            availableForDayCharter: asBoolean(
                extra.availableForDayCharter,
                true,
            ),
            availableForWeekCharter: asBoolean(
                extra.availableForWeekCharter,
                false,
            ),
        };

        return service;
    }

    if (category === 'HEBERGEMENT') {
        const service: AccommodationService = {
            ...shared,
            category,
            pricingUnit: normalizePricingUnit(
                pricingUnit,
                'PAR_NUIT',
            ) as AccommodationService['pricingUnit'],
            accommodationType: asString(
                extra.accommodationType,
                'APPARTEMENT',
            ) as AccommodationService['accommodationType'],
            starRating:
                extra.starRating == null
                    ? undefined
                    : (asNumber(
                          extra.starRating,
                      ) as AccommodationService['starRating']),
            maxGuests: asNumber(extra.maxGuests, 2),
            bedrooms: asNumber(extra.bedrooms, 1),
            bathrooms: asNumber(extra.bathrooms, 1),
            totalSurfaceM2:
                extra.totalSurfaceM2 == null
                    ? undefined
                    : asNumber(extra.totalSurfaceM2),
            amenities: asStringArray(extra.amenities),
            checkInTime: asString(extra.checkInTime, '14:00'),
            checkOutTime: asString(extra.checkOutTime, '11:00'),
            breakfastIncluded: asBoolean(extra.breakfastIncluded),
            minimumStayNights: asNumber(extra.minimumStayNights, 1),
            petsAllowed: asBoolean(extra.petsAllowed),
            smokingAllowed: asBoolean(extra.smokingAllowed),
            accessibilityFeatures: asStringArray(extra.accessibilityFeatures),
            houseRules: asStringArray(extra.houseRules),
            cancellationPolicy: asString(
                extra.cancellationPolicy,
                'MODEREE',
            ) as AccommodationService['cancellationPolicy'],
            nearbyAttractions: asStringArray(extra.nearbyAttractions),
            distanceToBeachMeters:
                extra.distanceToBeachMeters == null
                    ? undefined
                    : asNumber(extra.distanceToBeachMeters),
            distanceToCityKm:
                extra.distanceToCityKm == null
                    ? undefined
                    : asNumber(extra.distanceToCityKm),
        };

        return service;
    }

    if (category === 'VOITURE') {
        const luggage = asRecord(extra.luggage);
        const service: CarService = {
            ...shared,
            category,
            pricingUnit: normalizePricingUnit(
                pricingUnit,
                'PAR_JOUR',
            ) as CarService['pricingUnit'],
            vehicleType: asString(
                extra.vehicleType,
                'SUV',
            ) as CarService['vehicleType'],
            brand: asString(extra.brand, 'Vehicule'),
            model: asString(extra.model, shared.title),
            year: asNumber(extra.year, new Date().getFullYear()),
            transmission: asString(
                extra.transmission,
                'AUTOMATIQUE',
            ) as CarService['transmission'],
            fuelType: asString(
                extra.fuelType,
                'ESSENCE',
            ) as CarService['fuelType'],
            seats: asNumber(extra.seats, 4),
            doors: asNumber(extra.doors, 4),
            luggage: {
                smallBags: asNumber(luggage.smallBags, 1),
                largeSuitcases: asNumber(luggage.largeSuitcases, 1),
            },
            airConditioning: asBoolean(extra.airConditioning, true),
            driverMinAge: asNumber(extra.driverMinAge, 21),
            driverLicenseYearsRequired: asNumber(
                extra.driverLicenseYearsRequired,
                2,
            ),
            fuelIncluded: asBoolean(extra.fuelIncluded),
            mileageLimit:
                extra.mileageLimit === 'ILLIMITE'
                    ? 'ILLIMITE'
                    : asNumber(extra.mileageLimit, 0),
            mileageExtraChargePerKm:
                extra.mileageExtraChargePerKm == null
                    ? undefined
                    : asNumber(extra.mileageExtraChargePerKm),
            insuranceIncluded: asBoolean(extra.insuranceIncluded, true),
            depositAmountEur: asNumber(extra.depositAmountEur, 0),
            deliveryAvailable: asBoolean(extra.deliveryAvailable),
            deliveryLocations: asStringArray(extra.deliveryLocations),
            additionalDriverAllowed: asBoolean(extra.additionalDriverAllowed),
            additionalDriverFeePerDay: asNumber(
                extra.additionalDriverFeePerDay,
                0,
            ),
            pickupLocations: asStringArray(extra.pickupLocations),
        };

        return service;
    }

    const schedule = asRecord(extra.schedule);
    const service: ActivityService = {
        ...shared,
        category: 'ACTIVITE',
        pricingUnit: normalizePricingUnit(
            pricingUnit,
            'PAR_PERSONNE',
        ) as ActivityService['pricingUnit'],
        activityType: asString(
            extra.activityType,
            'RANDONNEE',
        ) as ActivityService['activityType'],
        duration: asNumber(extra.duration, 60),
        durationUnit: asString(
            extra.durationUnit,
            'MINUTES',
        ) as ActivityService['durationUnit'],
        difficulty: asString(
            extra.difficulty,
            'TOUS_NIVEAUX',
        ) as ActivityService['difficulty'],
        physicalIntensity: asString(
            extra.physicalIntensity,
            'MODEREE',
        ) as ActivityService['physicalIntensity'],
        minParticipants: asNumber(extra.minParticipants, 1),
        maxParticipants: asNumber(extra.maxParticipants, 10),
        minAgeYears: asNumber(extra.minAgeYears, 0),
        requiresMedicalClearance: asBoolean(extra.requiresMedicalClearance),
        certificationRequired:
            asString(extra.certificationRequired) || undefined,
        equipmentProvided: asBoolean(extra.equipmentProvided),
        included: asStringArray(extra.included),
        notIncluded: asStringArray(extra.notIncluded),
        meetingPoint: asString(extra.meetingPoint, shared.location.city),
        schedule: {
            startTimes: asStringArray(schedule.startTimes),
            daysAvailable: asStringArray(
                schedule.daysAvailable,
            ) as ActivityService['schedule']['daysAvailable'],
            seasonAvailability: schedule.seasonAvailability
                ? {
                      from: asString(
                          asRecord(schedule.seasonAvailability).from,
                      ),
                      to: asString(asRecord(schedule.seasonAvailability).to),
                  }
                : undefined,
        },
        languages: asStringArray(extra.languages),
        groupType: asString(
            extra.groupType,
            'GROUPE_PARTAGE',
        ) as ActivityService['groupType'],
    };

    return service;
}

export function normalizeBooking(rawInput: unknown): Booking {
    const raw = asRecord(rawInput);
    const extraData = asRecord(raw.extra_data ?? raw.extraData);
    const rawSelectedExtras = extraData.selected_extras ?? extraData.selectedExtras;
    const bookingExtras = Array.isArray(rawSelectedExtras)
        ? rawSelectedExtras.map((extra) => {
              const extraRecord = asRecord(extra);

              return {
                  id: asString(extraRecord.id),
                  name: asString(extraRecord.name),
                  unitPrice: asNumber(
                      extraRecord.unit_price ?? extraRecord.unitPrice,
                  ),
                  quantity: asNumber(extraRecord.quantity, 1),
                  totalPrice: asNumber(
                      extraRecord.total_price ?? extraRecord.totalPrice,
                  ),
                  inputType: asString(
                      extraRecord.input_type ?? extraRecord.inputType,
                      'CHECKBOX',
                  ) as 'CHECKBOX' | 'REQUIRED',
              };
          })
        : [];

    return {
        id: asString(raw.id),
        clientId: asString(raw.client_id ?? raw.clientId),
        partnerId: asString(raw.partner_id ?? raw.partnerId),
        serviceId: asString(raw.service_id ?? raw.serviceId),
        status: asString(raw.status, 'PENDING') as BookingStatus,
        paymentStatus: asString(
            raw.payment_status ?? raw.paymentStatus,
            'PENDING',
        ) as PaymentStatus,
        startDate: asDate(raw.start_date ?? raw.startDate),
        endDate:
            raw.end_date || raw.endDate
                ? asDate(raw.end_date ?? raw.endDate)
                : undefined,
        participants: asNumber(raw.participants, 1),
        unitPrice: asNumber(raw.unit_price ?? raw.unitPrice),
        totalPrice: asNumber(raw.total_price ?? raw.totalPrice),
        currency: asString(raw.currency, 'EUR'),
        stripePaymentIntentId:
            asString(
                raw.stripe_payment_intent_id ?? raw.stripePaymentIntentId,
            ) || undefined,
        paymentMode: normalizePaymentMode(raw.payment_mode ?? raw.paymentMode),
        selectedExtras: bookingExtras,
        extrasTotal: asNumber(
            extraData.extras_total ?? extraData.extrasTotal,
            bookingExtras.reduce((sum, extra) => sum + extra.totalPrice, 0),
        ),
        amountPaidOnline: asNumber(
            raw.amount_paid_online ?? raw.amountPaidOnline,
        ),
        notes: asString(raw.notes) || undefined,
        cancellationReason:
            asString(raw.cancellation_reason ?? raw.cancellationReason) ||
            undefined,
        createdAt: asDate(raw.created_at ?? raw.createdAt),
        updatedAt: asDate(raw.updated_at ?? raw.updatedAt),
    };
}

export function normalizeFavorite(rawInput: unknown): Favorite {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        clientId: asString(raw.client_id ?? raw.clientId),
        serviceId: asString(raw.service_id ?? raw.serviceId),
        addedAt: asDate(raw.added_at ?? raw.addedAt),
    };
}

export function normalizeReview(rawInput: unknown): Review {
    const raw = asRecord(rawInput);
    const client = asRecord(raw.client);
    const service = asRecord(raw.service);
    const partner = asRecord(asRecord(service.partner));
    const moderator = asRecord(raw.moderator);

    return {
        id: asString(raw.id),
        clientId: asString(raw.client_id ?? raw.clientId),
        serviceId: asString(raw.service_id ?? raw.serviceId),
        rating: asNumber(raw.rating, 5) as Review['rating'],
        comment: asString(raw.comment),
        status:
            asString(raw.status, 'APPROVED') as Review['status'],
        moderatedAt:
            raw.moderated_at || raw.moderatedAt
                ? asDate(raw.moderated_at ?? raw.moderatedAt)
                : undefined,
        moderatedBy:
            asString(raw.moderated_by ?? raw.moderatedBy ?? moderator.id) ||
            undefined,
        createdAt: asDate(raw.created_at ?? raw.createdAt),
        authorName:
            `${asString(client.name) || `${asString(client.firstName)} ${asString(client.lastName)}`}`.trim() ||
            undefined,
        serviceTitle: asString(service.title) || undefined,
        partnerName:
            asString(partner.company_name ?? partner.companyName) || undefined,
    };
}

export function normalizeAvailability(rawInput: unknown): Availability {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        serviceId: asString(raw.service_id ?? raw.serviceId),
        date: asString(raw.date),
        slots: Array.isArray(raw.slots)
            ? raw.slots.map((slot) => {
                  const slotRecord = asRecord(slot);

                  return {
                      startTime: asString(slotRecord.startTime),
                      maxCapacity: asNumber(slotRecord.maxCapacity),
                  };
              })
            : [],
    };
}

export function normalizeBlogPost(rawInput: unknown): BlogPost {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        slug: asString(raw.slug),
        title: asString(raw.title),
        titleTranslations:
            asLocalizedTextMap(
                raw.title_translations ?? raw.titleTranslations,
            ) || undefined,
        excerpt: asString(raw.excerpt),
        excerptTranslations:
            asLocalizedTextMap(
                raw.excerpt_translations ?? raw.excerptTranslations,
            ) || undefined,
        content: asString(raw.content),
        contentTranslations:
            asLocalizedTextMap(
                raw.content_translations ?? raw.contentTranslations,
            ) || undefined,
        coverImage: asString(raw.cover_image ?? raw.coverImage),
        authorId: asString(raw.author_id ?? raw.authorId),
        status: asString(raw.status, 'DRAFT') as BlogStatus,
        tags: asStringArray(raw.tags),
        publishedAt:
            raw.published_at || raw.publishedAt
                ? asDate(raw.published_at ?? raw.publishedAt)
                : null,
        updatedAt: asDate(raw.updated_at ?? raw.updatedAt),
    };
}
