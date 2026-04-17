/**
 * @file pages/PartnerServiceFormPage/index.tsx
 * @description Formulaire de creation ou d'edition d'un service partenaire.
 * Gere les champs communs a toutes les categories de service.
 */

import React, { useEffect, useMemo, useState } from "react";
import { servicesApi } from "@/api/services";
import { uploadsApi } from "@/api/uploads";
import { Breadcrumb, Button, Input, Select } from "@/components/wdr";
import { useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import {
    useCalendarSyncData,
    useRunCalendarSyncData,
    useSaveCalendarSyncData,
} from "@/hooks/useCalendarSyncData";
import {
    useCreateServicePricingRuleData,
    useDeleteServicePricingRuleData,
    useServicePricingRulesData,
} from "@/hooks/useServicePricingData";
import { useServiceStructureData } from "@/hooks/useServiceStructureData";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdminUsersData } from "@/hooks/useUsersData";
import { usePartnerApprovalGuard } from "@/hooks/usePartnerApprovalGuard";
import { useServiceData } from "@/hooks/useServicesData";
import { useRouter } from "@/hooks/useWdrRouter";
import {
    LOCALE_LABELS,
    SUPPORTED_LOCALES,
    type Locale,
} from "@/lib/locale";
import { formatPrice } from "@/lib/formatters";
import type {
    PricingAdjustmentType,
    PricingRuleType,
} from "@/types/pricing-rule";
import type {
    BookingMode,
    PaymentMode,
    Service,
    ServiceCategory,
    ServicePricingUnit,
    LocalizedTextMap,
} from "@/types/service";
import {
    PaymentModeDescriptions,
    PaymentModeLabels,
    PaymentModeNames,
    ServiceCategoryLabels,
    ServiceCategoryNames,
} from "@/types/service";
import type { PartnerUser } from "@/types/wdr-user";
import "./PartnerServiceFormPage.css";

interface ServiceFormState {
    titleTranslations: LocalizedTextMap;
    descriptionTranslations: LocalizedTextMap;
    category: ServiceCategory;
    serviceCategoryId: string;
    serviceSubcategoryId: string;
    city: string;
    country: string;
    region: string;
    partnerPrice: string;
    pricingUnit: ServicePricingUnit;
    paymentMode: PaymentMode;
    bookingMode: BookingMode;
    featured: boolean;
    videoUrl: string;
    tags: string;
    imageUrls: string[];
    isAvailable: boolean;
    dynamicAttributes: Record<string, string | boolean>;
}

interface ServiceFormErrors {
    title?: string;
    description?: string;
    serviceCategoryId?: string;
    city?: string;
    country?: string;
    partnerPrice?: string;
    imageUrls?: string;
}

interface PricingRuleFormState {
    name: string;
    ruleType: PricingRuleType;
    adjustmentType: PricingAdjustmentType;
    adjustmentValue: string;
    startDate: string;
    endDate: string;
    minUnits: string;
    priority: string;
}

const CATEGORY_OPTIONS = [
    {
        value: ServiceCategoryNames.ACTIVITE,
        label: ServiceCategoryLabels.ACTIVITE,
    },
    { value: ServiceCategoryNames.BATEAU, label: ServiceCategoryLabels.BATEAU },
    {
        value: ServiceCategoryNames.HEBERGEMENT,
        label: ServiceCategoryLabels.HEBERGEMENT,
    },
    {
        value: ServiceCategoryNames.VOITURE,
        label: ServiceCategoryLabels.VOITURE,
    },
];

const PAYMENT_MODE_OPTIONS = [
    {
        value: PaymentModeNames.FULL_CASH_ON_SITE,
        label: PaymentModeLabels.FULL_CASH_ON_SITE,
    },
    {
        value: PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE,
        label: PaymentModeLabels.COMMISSION_ONLINE_REST_ON_SITE,
    },
    {
        value: PaymentModeNames.FULL_ONLINE,
        label: PaymentModeLabels.FULL_ONLINE,
    },
    {
        value: PaymentModeNames.CONNECTED_ACCOUNT,
        label: PaymentModeLabels.CONNECTED_ACCOUNT,
    },
];

const DEFAULT_SERVICE_REGION = "Algarve";
const DEFAULT_SERVICE_COUNTRY = "Portugal";

function buildLocalizedTextMap(
    value: LocalizedTextMap | undefined,
    fallback = "",
): LocalizedTextMap {
    if (value && Object.keys(value).length > 0) {
        return { ...value };
    }

    return fallback.trim() ? { fr: fallback.trim() } : {};
}

function readLocalizedValue(
    translations: LocalizedTextMap,
    locale: Locale,
): string {
    return translations[locale] ?? "";
}

function writeLocalizedValue(
    translations: LocalizedTextMap,
    locale: Locale,
    value: string,
): LocalizedTextMap {
    const normalized = value.trim();
    const next = { ...translations };

    if (normalized) {
        next[locale] = value;
    } else {
        delete next[locale];
    }

    return next;
}

function hasAnyTranslation(translations: LocalizedTextMap): boolean {
    return Object.values(translations).some(
        (value) => typeof value === "string" && value.trim() !== "",
    );
}

function hasLocaleTranslation(
    translations: LocalizedTextMap,
    locale: Locale,
): boolean {
    return typeof translations[locale] === "string"
        && translations[locale]!.trim() !== "";
}

function buildInitialState(existingService?: Service): ServiceFormState {
    if (existingService) {
        return {
            titleTranslations: buildLocalizedTextMap(
                existingService.titleTranslations,
                existingService.title,
            ),
            descriptionTranslations: buildLocalizedTextMap(
                existingService.descriptionTranslations,
                existingService.description,
            ),
            category: existingService.category,
            serviceCategoryId: existingService.serviceCategoryId ?? "",
            serviceSubcategoryId: existingService.serviceSubcategoryId ?? "",
            city: existingService.location.city,
            country: existingService.location.country,
            region: existingService.location.region ?? "",
            partnerPrice: String(existingService.partnerPrice),
            pricingUnit: existingService.pricingUnit,
            paymentMode: existingService.paymentMode,
            bookingMode: existingService.bookingMode ?? "REQUEST",
            featured: existingService.featured ?? false,
            videoUrl: existingService.videoUrl ?? "",
            tags: existingService.tags.join(", "),
            imageUrls: existingService.images,
            isAvailable: existingService.isAvailable,
            dynamicAttributes: ((existingService.extraData
                ?.attributes as Record<string, string | boolean>) ??
                {}) as Record<string, string | boolean>,
        };
    }

    return {
        titleTranslations: {},
        descriptionTranslations: {},
        category: ServiceCategoryNames.ACTIVITE,
        serviceCategoryId: "",
        serviceSubcategoryId: "",
        city: "",
        country: DEFAULT_SERVICE_COUNTRY,
        region: DEFAULT_SERVICE_REGION,
        partnerPrice: "",
        pricingUnit: "PAR_PERSONNE",
        paymentMode: PaymentModeNames.FULL_ONLINE,
        bookingMode: "REQUEST",
        featured: false,
        videoUrl: "",
        tags: "",
        imageUrls: [],
        isAvailable: true,
        dynamicAttributes: {},
    };
}

interface PartnerServiceFormPageProps {
    serviceId?: string;
    adminMode?: boolean;
}

interface PartnerServiceFormContentProps {
    serviceId?: string;
    existingService?: Service;
    adminMode?: boolean;
}

const PartnerServiceFormContent: React.FC<PartnerServiceFormContentProps> = ({
    serviceId,
    existingService,
    adminMode = false,
}) => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { success, error } = useToast();
    const { t } = useTranslation();
    const { isBlocked } = usePartnerApprovalGuard(!adminMode);
    const { categories: serviceCategories } = useServiceStructureData();
    const { users } = useAdminUsersData({ role: "PARTNER" }, adminMode);
    const pricingUnitOptions = useMemo(
        () => [
            {
                value: "PAR_PERSONNE",
                label: t("service.form.pricing_unit.person"),
            },
            {
                value: "PAR_GROUPE",
                label: t("service.form.pricing_unit.group"),
            },
            { value: "PAR_JOUR", label: t("service.form.pricing_unit.day") },
            { value: "PAR_NUIT", label: t("service.form.pricing_unit.night") },
            {
                value: "PAR_SEMAINE",
                label: t("service.form.pricing_unit.week"),
            },
            {
                value: "PAR_DEMI_JOURNEE",
                label: t("service.form.pricing_unit.half_day"),
            },
        ],
        [t],
    );
    const pricingRuleTypeOptions = useMemo(
        () => [
            { value: "WEEKEND", label: t("service.form.rule_type.weekend") },
            { value: "SEASONAL", label: t("service.form.rule_type.seasonal") },
            { value: "DURATION", label: t("service.form.rule_type.duration") },
        ],
        [t],
    );
    const pricingAdjustmentOptions = useMemo(
        () => [
            {
                value: "PERCENTAGE",
                label: t("service.form.adjustment.percentage"),
            },
            {
                value: "FIXED_AMOUNT",
                label: t("service.form.adjustment.fixed"),
            },
        ],
        [t],
    );
    const algarveCityOptions = useMemo(
        () => [
            { value: "", label: t("service.form.city.choose") },
            { value: "Lagos", label: t("service.form.city.lagos") },
            { value: "Alvor", label: t("service.form.city.alvor") },
            { value: "Portimão", label: t("service.form.city.portimao") },
            { value: "Silves", label: t("service.form.city.silves") },
            { value: "Benagil", label: t("service.form.city.benagil") },
            {
                value: "Armação de Pêra",
                label: t("service.form.city.armacao_de_pera"),
            },
            { value: "Vilamoura", label: t("service.form.city.vilamoura") },
            { value: "Albufeira", label: t("service.form.city.albufeira") },
        ],
        [t],
    );

    const isAdmin = currentUser?.role === "ADMIN";
    const partnerOptions = users.filter((user) => user.role === "PARTNER");
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
        existingService?.partnerId ??
            (adminMode ? "" : (currentUser?.id ?? "")),
    );

    if (
        !currentUser ||
        (!adminMode && (isBlocked || currentUser.role !== "PARTNER")) ||
        (adminMode && !isAdmin)
    ) {
        return null;
    }

    const partner = currentUser as PartnerUser;
    const selectedPartner = adminMode
        ? (partnerOptions.find((entry) => entry.id === selectedPartnerId) ??
          null)
        : partner;
    const isExternalService = existingService?.sourceType === "EXTERNAL";
    const isEditing = !!serviceId;
    const [form, setForm] = useState<ServiceFormState>(() =>
        buildInitialState(existingService),
    );
    const [activeLocale, setActiveLocale] = useState<Locale>("fr");
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [calendarImportUrl, setCalendarImportUrl] = useState("");
    const [errors, setErrors] = useState<ServiceFormErrors>({});
    const [pricingRuleForm, setPricingRuleForm] =
        useState<PricingRuleFormState>({
            name: "",
            ruleType: "WEEKEND",
            adjustmentType: "PERCENTAGE",
            adjustmentValue: "",
            startDate: "",
            endDate: "",
            minUnits: "",
            priority: "100",
        });
    const canUseIcalSync =
        isEditing &&
        (form.category === ServiceCategoryNames.HEBERGEMENT ||
            form.category === ServiceCategoryNames.BATEAU);
    const pricingRulesQuery = useServicePricingRulesData(
        serviceId ?? "",
        isEditing && Boolean(serviceId),
    );
    const createPricingRule = useCreateServicePricingRuleData(serviceId ?? "");
    const deletePricingRule = useDeleteServicePricingRuleData(serviceId ?? "");
    const calendarSyncQuery = useCalendarSyncData(
        serviceId ?? "",
        canUseIcalSync && Boolean(serviceId),
    );
    const saveCalendarSync = useSaveCalendarSyncData(serviceId ?? "");
    const runCalendarSync = useRunCalendarSyncData(serviceId ?? "");

    useEffect(() => {
        if (!existingService) {
            return;
        }

        setForm(buildInitialState(existingService));
        setSelectedPartnerId(
            existingService.partnerId ??
                (adminMode ? "" : (currentUser?.id ?? "")),
        );
        setErrors({});
    }, [adminMode, currentUser?.id, existingService]);

    useEffect(() => {
        setCalendarImportUrl(calendarSyncQuery.data?.importUrl ?? "");
    }, [calendarSyncQuery.data?.importUrl]);

    const availableStructureCategories = useMemo(
        () =>
            serviceCategories.filter(
                (entry) =>
                    entry.serviceType === form.category && entry.isActive,
            ),
        [form.category, serviceCategories],
    );

    const selectedStructureCategory = useMemo(
        () =>
            availableStructureCategories.find(
                (entry) => entry.id === form.serviceCategoryId,
            ) ?? null,
        [availableStructureCategories, form.serviceCategoryId],
    );

    const availableSubcategories =
        selectedStructureCategory?.subcategories ?? [];
    const activeExtras = useMemo(
        () =>
            (selectedStructureCategory?.extras ?? []).filter(
                (extra) => extra.isActive,
            ),
        [selectedStructureCategory],
    );
    const categoryGuidance = useMemo<
        Record<ServiceCategory, { title: string; points: string[] }>
    >(
        () => ({
            ACTIVITE: {
                title: t("service.form.guidance.activity.title"),
                points: [
                    t("service.form.guidance.activity.1"),
                    t("service.form.guidance.activity.2"),
                    t("service.form.guidance.activity.3"),
                ],
            },
            BATEAU: {
                title: t("service.form.guidance.boat.title"),
                points: [
                    t("service.form.guidance.boat.1"),
                    t("service.form.guidance.boat.2"),
                    t("service.form.guidance.boat.3"),
                ],
            },
            HEBERGEMENT: {
                title: t("service.form.guidance.stay.title"),
                points: [
                    t("service.form.guidance.stay.1"),
                    t("service.form.guidance.stay.2"),
                    t("service.form.guidance.stay.3"),
                ],
            },
            VOITURE: {
                title: t("service.form.guidance.car.title"),
                points: [
                    t("service.form.guidance.car.1"),
                    t("service.form.guidance.car.2"),
                    t("service.form.guidance.car.3"),
                ],
            },
        }),
        [t],
    )[form.category];
    const effectivePartnerId =
        adminMode && !isEditing
            ? selectedPartnerId || partnerOptions[0]?.id || ""
            : selectedPartnerId;
    const requiredAttributes = useMemo(
        () =>
            (selectedStructureCategory?.attributes ?? []).filter(
                (attribute) => attribute.isRequired,
            ),
        [selectedStructureCategory],
    );

    useEffect(() => {
        if (
            form.serviceCategoryId &&
            !availableStructureCategories.some(
                (entry) => entry.id === form.serviceCategoryId,
            )
        ) {
            setForm((previous) => ({
                ...previous,
                serviceCategoryId: "",
                serviceSubcategoryId: "",
                dynamicAttributes: {},
            }));
        }
    }, [availableStructureCategories, form.serviceCategoryId]);

    useEffect(() => {
        if (
            !form.serviceCategoryId &&
            availableStructureCategories.length === 1
        ) {
            setForm((previous) => ({
                ...previous,
                serviceCategoryId: availableStructureCategories[0].id,
            }));
        }
    }, [availableStructureCategories, form.serviceCategoryId]);

    useEffect(() => {
        if (
            form.serviceSubcategoryId &&
            !availableSubcategories.some(
                (entry) => entry.id === form.serviceSubcategoryId,
            )
        ) {
            setForm((previous) => ({
                ...previous,
                serviceSubcategoryId: "",
            }));
        }
    }, [availableSubcategories, form.serviceSubcategoryId]);

    const clientPrice = useMemo(() => {
        const price = parseFloat(form.partnerPrice);

        if (Number.isNaN(price) || price <= 0) {
            return null;
        }

        return price * (1 + (selectedPartner?.commissionRate ?? 0.2));
    }, [form.partnerPrice, selectedPartner?.commissionRate]);

    const resetPricingRuleForm = () => {
        setPricingRuleForm({
            name: "",
            ruleType: "WEEKEND",
            adjustmentType: "PERCENTAGE",
            adjustmentValue: "",
            startDate: "",
            endDate: "",
            minUnits: "",
            priority: "100",
        });
    };

    const setField = <K extends keyof ServiceFormState>(
        key: K,
        value: ServiceFormState[K],
    ) => {
        setForm((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({
            ...previous,
            [key === "titleTranslations"
                ? "title"
                : key === "descriptionTranslations"
                  ? "description"
                  : key]: undefined,
        }));
    };

    const setDynamicAttribute = (key: string, value: string | boolean) => {
        setForm((previous) => ({
            ...previous,
            dynamicAttributes: {
                ...previous.dynamicAttributes,
                [key]: value,
            },
        }));
    };

    const removeImage = (imageUrl: string) => {
        setForm((previous) => ({
            ...previous,
            imageUrls: previous.imageUrls.filter((entry) => entry !== imageUrl),
        }));
    };

    const setPrimaryImage = (imageUrl: string) => {
        setForm((previous) => ({
            ...previous,
            imageUrls: [
                imageUrl,
                ...previous.imageUrls.filter((entry) => entry !== imageUrl),
            ],
        }));
    };

    const moveImage = (imageUrl: string, direction: "left" | "right") => {
        setForm((previous) => {
            const currentIndex = previous.imageUrls.findIndex(
                (entry) => entry === imageUrl,
            );

            if (currentIndex === -1) {
                return previous;
            }

            const targetIndex =
                direction === "left" ? currentIndex - 1 : currentIndex + 1;

            if (targetIndex < 0 || targetIndex >= previous.imageUrls.length) {
                return previous;
            }

            const nextImages = [...previous.imageUrls];
            const [moved] = nextImages.splice(currentIndex, 1);
            nextImages.splice(targetIndex, 0, moved);

            return {
                ...previous,
                imageUrls: nextImages,
            };
        });
    };

    const handleImagesSelected = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setUploadingImages(true);

        try {
            const uploadedUrls: string[] = [];

            for (const file of files) {
                const presigned = await uploadsApi.presign({
                    fileName: file.name,
                    contentType: file.type || "application/octet-stream",
                    folder: "services",
                });

                const response = await uploadsApi.uploadFile(
                    presigned.uploadUrl,
                    file,
                );

                if (!response.ok) {
                    throw new Error("upload_failed");
                }

                uploadedUrls.push(presigned.publicUrl);
            }

            setForm((previous) => ({
                ...previous,
                imageUrls: [...previous.imageUrls, ...uploadedUrls],
            }));
            success(
                uploadedUrls.length > 1
                    ? t("service.form.toast.images_uploaded_other").replace(
                          "{count}",
                          String(uploadedUrls.length),
                      )
                    : t("service.form.toast.images_uploaded_one"),
            );
        } catch {
            error(t("service.form.toast.images_upload_error"));
        } finally {
            setUploadingImages(false);
            event.target.value = "";
        }
    };

    const validate = (): boolean => {
        const nextErrors: ServiceFormErrors = {};

        if (!hasAnyTranslation(form.titleTranslations)) {
            nextErrors.title = t("service.form.error.title_required");
        } else if (!hasLocaleTranslation(form.titleTranslations, "fr")) {
            nextErrors.title = "Le titre FR est obligatoire.";
        }

        if (!hasAnyTranslation(form.descriptionTranslations)) {
            nextErrors.description = t(
                "service.form.error.description_required",
            );
        } else if (!hasLocaleTranslation(form.descriptionTranslations, "fr")) {
            nextErrors.description = "La description FR est obligatoire.";
        }

        if (
            !form.serviceCategoryId &&
            availableStructureCategories.length > 0
        ) {
            nextErrors.serviceCategoryId = t(
                "service.form.error.category_required",
            );
        }

        if (!form.city.trim()) {
            nextErrors.city = t("service.form.error.city_required");
        }

        if (!form.country.trim()) {
            nextErrors.country = t("service.form.error.country_required");
        }

        const price = parseFloat(form.partnerPrice);

        if (
            Number.isNaN(price) ||
            (!isExternalService && price <= 0) ||
            (isExternalService && price < 0)
        ) {
            nextErrors.partnerPrice = t("service.form.error.price_positive");
        }

        if (form.imageUrls.length === 0) {
            nextErrors.imageUrls = t("service.form.error.image_required");
        }

        selectedStructureCategory?.attributes.forEach((attribute) => {
            if (
                attribute.isRequired &&
                (form.dynamicAttributes[attribute.key] === undefined ||
                    form.dynamicAttributes[attribute.key] === "" ||
                    form.dynamicAttributes[attribute.key] === false)
            ) {
                nextErrors.serviceCategoryId = t(
                    "service.form.error.required_attributes",
                );
            }
        });

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validate()) {
            error(t("service.form.error.fix_before_continue"));

            return;
        }

        setSaving(true);

        const price = parseFloat(form.partnerPrice);
        const tags = form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        const payload = {
            partner_id: adminMode ? effectivePartnerId || undefined : undefined,
            title: form.titleTranslations,
            description: form.descriptionTranslations,
            category: form.category,
            service_category_id: form.serviceCategoryId || undefined,
            service_subcategory_id: form.serviceSubcategoryId || undefined,
            location_city: form.city,
            location_country: form.country,
            location_region: form.region || undefined,
            partner_price: price,
            pricing_unit: form.pricingUnit,
            payment_mode: isExternalService
                ? PaymentModeNames.EXTERNAL_REDIRECT
                : form.paymentMode,
            booking_mode: isExternalService
                ? "EXTERNAL_REDIRECT"
                : form.bookingMode,
            featured: adminMode ? form.featured : undefined,
            video_url: form.videoUrl || undefined,
            tags,
            images: form.imageUrls,
            is_available: form.isAvailable,
            extra_data: {
                attributes: form.dynamicAttributes,
            },
        };

        try {
            if (isEditing && serviceId) {
                await servicesApi.update(serviceId, payload);
            } else {
                await servicesApi.create(payload);
            }

            success(
                isEditing
                    ? t("service.form.toast.save_update")
                    : t("service.form.toast.save_create"),
            );
        } catch {
            error(t("service.form.toast.save_error"));
            setSaving(false);

            return;
        }

        setSaving(false);
        navigate({ name: adminMode ? "admin-services" : "partner-catalog" });
    };

    const handleSaveCalendarSync = async () => {
        if (!serviceId) {
            return;
        }

        try {
            await saveCalendarSync.mutateAsync({
                importUrl: calendarImportUrl.trim() || undefined,
            });
            success(t("service.form.toast.ical_saved"));
        } catch {
            error(t("service.form.toast.ical_save_error"));
        }
    };

    const handleCreatePricingRule = async () => {
        if (!serviceId) {
            return;
        }

        const adjustmentValue = parseFloat(pricingRuleForm.adjustmentValue);

        if (!pricingRuleForm.name.trim() || Number.isNaN(adjustmentValue)) {
            error(t("service.form.error.rule_name_value"));

            return;
        }

        if (
            pricingRuleForm.ruleType === "SEASONAL" &&
            (!pricingRuleForm.startDate || !pricingRuleForm.endDate)
        ) {
            error(t("service.form.error.rule_dates"));

            return;
        }

        if (
            pricingRuleForm.ruleType === "DURATION" &&
            !pricingRuleForm.minUnits
        ) {
            error(t("service.form.error.rule_min_units"));

            return;
        }

        try {
            await createPricingRule.mutateAsync({
                name: pricingRuleForm.name.trim(),
                rule_type: pricingRuleForm.ruleType,
                adjustment_type: pricingRuleForm.adjustmentType,
                adjustment_value: adjustmentValue,
                start_date:
                    pricingRuleForm.ruleType === "SEASONAL"
                        ? pricingRuleForm.startDate
                        : null,
                end_date:
                    pricingRuleForm.ruleType === "SEASONAL"
                        ? pricingRuleForm.endDate
                        : null,
                min_units:
                    pricingRuleForm.ruleType === "DURATION"
                        ? Number(pricingRuleForm.minUnits)
                        : null,
                priority: Number(pricingRuleForm.priority || "100"),
                is_active: true,
            });
            resetPricingRuleForm();
            success(t("service.form.toast.rule_created"));
        } catch {
            error(t("service.form.toast.rule_create_error"));
        }
    };

    const handleDeletePricingRule = async (ruleId: string) => {
        try {
            await deletePricingRule.mutateAsync(ruleId);
            success(t("service.form.toast.rule_deleted"));
        } catch {
            error(t("service.form.toast.rule_delete_error"));
        }
    };

    const handleRunCalendarSync = async () => {
        if (!serviceId) {
            return;
        }

        try {
            const result = await runCalendarSync.mutateAsync();
            success(
                t("service.form.toast.ical_sync_result").replace(
                    "{count}",
                    String(result.importedEventsCount),
                ),
            );
        } catch {
            error(t("service.form.toast.ical_sync_error"));
        }
    };

    const handleCopyExportUrl = async () => {
        const exportUrl = calendarSyncQuery.data?.exportUrl;

        if (!exportUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(exportUrl);
            success(t("service.form.toast.ical_copy"));
        } catch {
            error(t("service.form.toast.ical_copy_error"));
        }
    };

    return (
        <div className="wdr-sform">
            <div className="wdr-sform__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("nav.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        {
                            label: adminMode
                                ? t("service.form.breadcrumb.catalog_admin")
                                : t("service.form.breadcrumb.catalog"),
                            onClick: () =>
                                navigate({
                                    name: adminMode
                                        ? "admin-services"
                                        : "partner-catalog",
                                }),
                        },
                        {
                            label: isEditing
                                ? t("service.form.breadcrumb.edit")
                                : t("service.form.breadcrumb.new"),
                        },
                    ]}
                />
            </div>

            <div className="wdr-sform__header">
                <div className="wdr-sform__header-inner">
                    <h1 className="wdr-sform__title">
                        {isEditing
                            ? t("service.form.title.edit")
                            : t("service.form.title.create")}
                    </h1>
                    <p className="wdr-sform__subtitle">
                        {isEditing
                            ? t("service.form.subtitle.edit")
                            : t("service.form.subtitle.create")}
                    </p>
                </div>
            </div>

            <form
                className="wdr-sform__body"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="wdr-sform__inner">
                    {isExternalService && (
                        <fieldset className="wdr-sform__fieldset">
                            <legend className="wdr-sform__legend">
                                {t("service.form.external.title")}
                            </legend>
                            <p className="wdr-sform__hint">
                                {t("service.form.external.subtitle")}
                            </p>
                        </fieldset>
                    )}
                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.general")}
                        </legend>

                        {adminMode && !isExternalService && (
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-partner"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.partner_optional")}
                                </label>
                                <Select
                                    id="sf-partner"
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                partnerOptions.length > 0
                                                    ? t(
                                                          "service.form.partner.none_assigned",
                                                      )
                                                    : t(
                                                          "service.form.partner.none_available",
                                                      ),
                                            disabled:
                                                partnerOptions.length === 0,
                                        },
                                        ...partnerOptions.map((entry) => ({
                                            value: entry.id,
                                            label:
                                                entry.role === "PARTNER"
                                                    ? entry.companyName
                                                    : entry.email,
                                        })),
                                    ]}
                                    value={effectivePartnerId}
                                    onChange={(e) => {
                                        setSelectedPartnerId(e.target.value);
                                    }}
                                />
                                {partnerOptions.length === 0 ? (
                                    <p className="wdr-sform__hint">
                                        {t("service.form.partner.hint_none")}
                                    </p>
                                ) : (
                                    <p className="wdr-sform__hint">
                                        {t(
                                            "service.form.partner.hint_optional",
                                        )}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="wdr-sform__field">
                            <div className="wdr-sform__locale-bar">
                                <span className="wdr-sform__locale-label">
                                    Locale d'edition
                                </span>
                                <div className="wdr-sform__locale-tabs">
                                    {SUPPORTED_LOCALES.map((locale) => (
                                        <button
                                            key={locale}
                                            type="button"
                                            className={`wdr-sform__locale-tab ${activeLocale === locale ? "wdr-sform__locale-tab--active" : ""}`}
                                            onClick={() =>
                                                setActiveLocale(locale)
                                            }
                                        >
                                            {LOCALE_LABELS[locale]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="wdr-sform__locale-hint">
                                La locale FR sert de base pour le catalogue et
                                reste obligatoire.
                            </p>
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-title"
                                className="wdr-sform__label"
                            >
                                {t("service.form.label.title")}{" "}
                                <span aria-hidden="true">*</span>
                            </label>
                            <Input
                                id="sf-title"
                                value={readLocalizedValue(
                                    form.titleTranslations,
                                    activeLocale,
                                )}
                                onChange={(e) =>
                                    setField(
                                        "titleTranslations",
                                        writeLocalizedValue(
                                            form.titleTranslations,
                                            activeLocale,
                                            e.target.value,
                                        ),
                                    )
                                }
                                placeholder={t(
                                    "service.form.placeholder.title",
                                )}
                                aria-describedby={
                                    errors.title ? "sf-title-err" : undefined
                                }
                            />
                            {errors.title && (
                                <p
                                    id="sf-title-err"
                                    className="wdr-sform__error"
                                >
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-desc"
                                className="wdr-sform__label"
                            >
                                {t("service.form.label.description")}{" "}
                                <span aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="sf-desc"
                                className="wdr-sform__textarea"
                                rows={4}
                                value={readLocalizedValue(
                                    form.descriptionTranslations,
                                    activeLocale,
                                )}
                                onChange={(e) =>
                                    setField(
                                        "descriptionTranslations",
                                        writeLocalizedValue(
                                            form.descriptionTranslations,
                                            activeLocale,
                                            e.target.value,
                                        ),
                                    )
                                }
                                placeholder={t(
                                    "service.form.placeholder.description",
                                )}
                                aria-describedby={
                                    errors.description
                                        ? "sf-desc-err"
                                        : undefined
                                }
                            />
                            {errors.description && (
                                <p
                                    id="sf-desc-err"
                                    className="wdr-sform__error"
                                >
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="wdr-sform__row">
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-category"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.category")}
                                </label>
                                <Select
                                    id="sf-category"
                                    options={CATEGORY_OPTIONS}
                                    value={form.category}
                                    onChange={(e) =>
                                        setField(
                                            "category",
                                            e.target.value as ServiceCategory,
                                        )
                                    }
                                />
                            </div>

                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-structure-category"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.detailed_category")}
                                </label>
                                <Select
                                    id="sf-structure-category"
                                    options={[
                                        {
                                            value: "",
                                            label: availableStructureCategories.length
                                                ? t(
                                                      "service.form.choose_category",
                                                  )
                                                : t(
                                                      "service.form.no_admin_category",
                                                  ),
                                        },
                                        ...availableStructureCategories.map(
                                            (entry) => ({
                                                value: entry.id,
                                                label: entry.name,
                                            }),
                                        ),
                                    ]}
                                    value={form.serviceCategoryId}
                                    onChange={(e) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            serviceCategoryId: e.target.value,
                                            serviceSubcategoryId: "",
                                            dynamicAttributes: {},
                                        }))
                                    }
                                />
                                {errors.serviceCategoryId && (
                                    <p className="wdr-sform__error">
                                        {errors.serviceCategoryId}
                                    </p>
                                )}
                            </div>

                            <div className="wdr-sform__field">
                                <div className="wdr-sform__field--inline">
                                    <input
                                        type="checkbox"
                                        id="sf-available"
                                        checked={form.isAvailable}
                                        onChange={(e) =>
                                            setField(
                                                "isAvailable",
                                                e.target.checked,
                                            )
                                        }
                                        className="wdr-sform__checkbox"
                                    />
                                    <label
                                        htmlFor="sf-available"
                                        className="wdr-sform__label wdr-sform__label--inline"
                                    >
                                        {t("service.form.available")}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {availableSubcategories.length > 0 && (
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-subcategory"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.subcategory")}
                                </label>
                                <Select
                                    id="sf-subcategory"
                                    options={[
                                        {
                                            value: "",
                                            label: t(
                                                "service.form.choose_subcategory",
                                            ),
                                        },
                                        ...availableSubcategories.map(
                                            (entry) => ({
                                                value: entry.id,
                                                label: entry.name,
                                            }),
                                        ),
                                    ]}
                                    value={form.serviceSubcategoryId}
                                    onChange={(e) =>
                                        setField(
                                            "serviceSubcategoryId",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        )}

                        <div className="wdr-sform__structure-summary">
                            <div className="wdr-sform__structure-summary-header">
                                <div>
                                    <h3 className="wdr-sform__structure-summary-title">
                                        {t("service.form.structure.title")}
                                    </h3>
                                    <p className="wdr-sform__structure-summary-subtitle">
                                        {t("service.form.structure.subtitle")}
                                    </p>
                                </div>
                                {adminMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            navigate({
                                                name: "admin-service-structure",
                                            })
                                        }
                                    >
                                        {t("service.form.structure.manage")}
                                    </Button>
                                )}
                            </div>

                            {!selectedStructureCategory ? (
                                <p className="wdr-sform__structure-summary-empty">
                                    {availableStructureCategories.length > 0
                                        ? t(
                                              "service.form.structure.choose_hint",
                                          )
                                        : t(
                                              "service.form.structure.none_active",
                                          )}
                                </p>
                            ) : (
                                <div className="wdr-sform__structure-grid">
                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            {t("service.form.structure.active")}
                                        </span>
                                        <strong className="wdr-sform__structure-name">
                                            {selectedStructureCategory.name}
                                        </strong>
                                        <p className="wdr-sform__structure-meta">
                                            {
                                                ServiceCategoryLabels[
                                                    selectedStructureCategory
                                                        .serviceType
                                                ]
                                            }{" "}
                                            · {selectedStructureCategory.slug}
                                        </p>
                                        {selectedStructureCategory.description && (
                                            <p className="wdr-sform__structure-copy">
                                                {
                                                    selectedStructureCategory.description
                                                }
                                            </p>
                                        )}
                                    </section>

                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            {t(
                                                "service.form.structure.subcategories",
                                            )}
                                        </span>
                                        {availableSubcategories.length > 0 ? (
                                            <ul className="wdr-sform__structure-list">
                                                {availableSubcategories.map(
                                                    (subcategory) => (
                                                        <li
                                                            key={subcategory.id}
                                                            className="wdr-sform__structure-item"
                                                        >
                                                            <span>
                                                                {
                                                                    subcategory.name
                                                                }
                                                            </span>
                                                            {form.serviceSubcategoryId ===
                                                                subcategory.id && (
                                                                <strong>
                                                                    {t(
                                                                        "service.form.structure.selected",
                                                                    )}
                                                                </strong>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                {t(
                                                    "service.form.structure.none_subcategories",
                                                )}
                                            </p>
                                        )}
                                    </section>

                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            {t(
                                                "service.form.structure.attributes",
                                            )}
                                        </span>
                                        {selectedStructureCategory.attributes
                                            .length > 0 ? (
                                            <>
                                                <p className="wdr-sform__structure-meta">
                                                    {t(
                                                        "service.form.structure.required_count",
                                                    )
                                                        .replace(
                                                            "{required}",
                                                            String(
                                                                requiredAttributes.length,
                                                            ),
                                                        )
                                                        .replace(
                                                            "{total}",
                                                            String(
                                                                selectedStructureCategory
                                                                    .attributes
                                                                    .length,
                                                            ),
                                                        )}
                                                </p>
                                                <ul className="wdr-sform__structure-list">
                                                    {selectedStructureCategory.attributes.map(
                                                        (attribute) => (
                                                            <li
                                                                key={
                                                                    attribute.id
                                                                }
                                                                className="wdr-sform__structure-item"
                                                            >
                                                                <span>
                                                                    {
                                                                        attribute.label
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        attribute.type
                                                                    }
                                                                    )
                                                                </span>
                                                                <strong>
                                                                    {attribute.isRequired
                                                                        ? t(
                                                                              "service.form.structure.required",
                                                                          )
                                                                        : t(
                                                                              "service.form.structure.optional",
                                                                          )}
                                                                    {attribute.isFilterable
                                                                        ? ` · ${t("service.form.structure.filter")}`
                                                                        : ""}
                                                                </strong>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                {t(
                                                    "service.form.structure.none_attributes",
                                                )}
                                            </p>
                                        )}
                                    </section>

                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            {t("service.form.structure.extras")}
                                        </span>
                                        {activeExtras.length > 0 ? (
                                            <ul className="wdr-sform__structure-list">
                                                {activeExtras.map((extra) => (
                                                    <li
                                                        key={extra.id}
                                                        className="wdr-sform__structure-item"
                                                    >
                                                        <span>
                                                            {extra.name}
                                                        </span>
                                                        <strong>
                                                            {formatPrice(
                                                                extra.defaultPrice,
                                                                "EUR",
                                                            )}{" "}
                                                            ·{" "}
                                                            {extra.isRequired
                                                                ? t(
                                                                      "service.form.structure.required",
                                                                  )
                                                                : t(
                                                                      "service.form.structure.optional",
                                                                  )}
                                                        </strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                {t(
                                                    "service.form.structure.none_extras",
                                                )}
                                            </p>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.guidance")}
                        </legend>

                        <div className="wdr-sform__guidance-card">
                            <div className="wdr-sform__guidance-header">
                                <div>
                                    <p className="wdr-sform__guidance-kicker">
                                        {ServiceCategoryLabels[form.category]}
                                    </p>
                                    <h3 className="wdr-sform__guidance-title">
                                        {categoryGuidance.title}
                                    </h3>
                                </div>
                                {selectedStructureCategory && (
                                    <span className="wdr-sform__guidance-chip">
                                        {t(
                                            "service.form.guidance.structure",
                                        ).replace(
                                            "{name}",
                                            selectedStructureCategory.name,
                                        )}
                                    </span>
                                )}
                            </div>
                            <ul className="wdr-sform__guidance-list">
                                {categoryGuidance.points.map((point) => (
                                    <li
                                        key={point}
                                        className="wdr-sform__guidance-item"
                                    >
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </fieldset>

                    {selectedStructureCategory &&
                        selectedStructureCategory.attributes.length > 0 && (
                            <fieldset className="wdr-sform__fieldset">
                                <legend className="wdr-sform__legend">
                                    {t(
                                        "service.form.section.dynamic_attributes",
                                    )}
                                </legend>

                                <div className="wdr-sform__row">
                                    {selectedStructureCategory.attributes.map(
                                        (attribute) => (
                                            <div
                                                key={attribute.id}
                                                className="wdr-sform__field"
                                            >
                                                <label className="wdr-sform__label">
                                                    {attribute.label}
                                                </label>
                                                {attribute.type ===
                                                "boolean" ? (
                                                    <div className="wdr-sform__field--inline">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                form
                                                                    .dynamicAttributes[
                                                                    attribute
                                                                        .key
                                                                ] === true
                                                            }
                                                            onChange={(e) =>
                                                                setDynamicAttribute(
                                                                    attribute.key,
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="wdr-sform__checkbox"
                                                        />
                                                        <span className="wdr-sform__hint">
                                                            {attribute.isRequired
                                                                ? "Obligatoire"
                                                                : "Optionnel"}
                                                        </span>
                                                    </div>
                                                ) : attribute.type ===
                                                  "select" ? (
                                                    <Select
                                                        options={[
                                                            {
                                                                value: "",
                                                                label: t(
                                                                    "service.form.choose",
                                                                ),
                                                            },
                                                            ...attribute.options.map(
                                                                (option) => ({
                                                                    value: option.value,
                                                                    label: option.label,
                                                                }),
                                                            ),
                                                        ]}
                                                        value={String(
                                                            form
                                                                .dynamicAttributes[
                                                                attribute.key
                                                            ] ?? "",
                                                        )}
                                                        onChange={(e) =>
                                                            setDynamicAttribute(
                                                                attribute.key,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <Input
                                                        type={
                                                            attribute.type ===
                                                            "number"
                                                                ? "number"
                                                                : "text"
                                                        }
                                                        value={String(
                                                            form
                                                                .dynamicAttributes[
                                                                attribute.key
                                                            ] ?? "",
                                                        )}
                                                        onChange={(e) =>
                                                            setDynamicAttribute(
                                                                attribute.key,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </fieldset>
                        )}

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.location")}
                        </legend>

                        <div className="wdr-sform__row">
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-city"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.city")}{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <Select
                                    id="sf-city"
                                    options={algarveCityOptions}
                                    value={form.city}
                                    onChange={(e) =>
                                        setField("city", e.target.value)
                                    }
                                    aria-describedby={
                                        errors.city ? "sf-city-err" : undefined
                                    }
                                />
                                {errors.city && (
                                    <p
                                        id="sf-city-err"
                                        className="wdr-sform__error"
                                    >
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-country"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.country")}{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <Input
                                    id="sf-country"
                                    value={form.country}
                                    onChange={(e) =>
                                        setField("country", e.target.value)
                                    }
                                    placeholder={t(
                                        "service.form.placeholder.country",
                                    )}
                                    aria-describedby={
                                        errors.country
                                            ? "sf-country-err"
                                            : undefined
                                    }
                                />
                                {errors.country && (
                                    <p
                                        id="sf-country-err"
                                        className="wdr-sform__error"
                                    >
                                        {errors.country}
                                    </p>
                                )}
                            </div>

                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-region"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.region")}
                                </label>
                                <Input
                                    id="sf-region"
                                    value={form.region}
                                    onChange={(e) =>
                                        setField("region", e.target.value)
                                    }
                                    placeholder={t(
                                        "service.form.placeholder.region",
                                    )}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.pricing")}
                        </legend>

                        <div className="wdr-sform__row">
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-price"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.price")}{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <Input
                                    id="sf-price"
                                    type="number"
                                    min={isExternalService ? 0 : 1}
                                    step="0.01"
                                    value={form.partnerPrice}
                                    onChange={(e) =>
                                        setField("partnerPrice", e.target.value)
                                    }
                                    placeholder={t(
                                        "service.form.placeholder.price",
                                    )}
                                    aria-describedby={
                                        errors.partnerPrice
                                            ? "sf-price-err"
                                            : undefined
                                    }
                                />
                                {errors.partnerPrice && (
                                    <p
                                        id="sf-price-err"
                                        className="wdr-sform__error"
                                    >
                                        {errors.partnerPrice}
                                    </p>
                                )}
                            </div>

                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-unit"
                                    className="wdr-sform__label"
                                >
                                    {t("service.form.label.pricing_unit")}
                                </label>
                                <Select
                                    id="sf-unit"
                                    options={pricingUnitOptions}
                                    value={form.pricingUnit}
                                    onChange={(e) =>
                                        setField(
                                            "pricingUnit",
                                            e.target
                                                .value as ServicePricingUnit,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {clientPrice !== null && (
                            <div
                                className="wdr-sform__price-preview"
                                role="status"
                                aria-live="polite"
                            >
                                <span className="wdr-sform__price-preview-label">
                                    {t("service.form.client_price")}
                                </span>
                                <strong className="wdr-sform__price-preview-value">
                                    {formatPrice(clientPrice, "EUR")}
                                </strong>
                                <span className="wdr-sform__price-preview-note">
                                    {t(
                                        "service.form.client_price_note",
                                    ).replace(
                                        "{rate}",
                                        (
                                            (selectedPartner?.commissionRate ??
                                                0.2) * 100
                                        ).toFixed(0),
                                    )}
                                </span>
                            </div>
                        )}

                        {!isExternalService && (
                            <div className="wdr-sform__field">
                                <label className="wdr-sform__label">
                                    {t("service.form.dynamic_rules")}
                                </label>

                                {!isEditing && (
                                    <p className="wdr-sform__hint">
                                        {t(
                                            "service.form.dynamic_rules_hint_create",
                                        )}
                                    </p>
                                )}

                                {isEditing && (
                                <>
                                    <div className="wdr-sform__row">
                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                {t("service.form.rule.name")}
                                            </label>
                                            <Input
                                                value={pricingRuleForm.name}
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            name: e.target
                                                                .value,
                                                        }),
                                                    )
                                                }
                                                placeholder={t(
                                                    "service.form.rule.name_placeholder",
                                                )}
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                {t("service.form.rule.type")}
                                            </label>
                                            <Select
                                                options={pricingRuleTypeOptions}
                                                value={pricingRuleForm.ruleType}
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            ruleType: e.target
                                                                .value as PricingRuleType,
                                                        }),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="wdr-sform__row">
                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                {t(
                                                    "service.form.rule.adjustment",
                                                )}
                                            </label>
                                            <Select
                                                options={
                                                    pricingAdjustmentOptions
                                                }
                                                value={
                                                    pricingRuleForm.adjustmentType
                                                }
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            adjustmentType: e
                                                                .target
                                                                .value as PricingAdjustmentType,
                                                        }),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                {t("service.form.rule.value")}
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={
                                                    pricingRuleForm.adjustmentValue
                                                }
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            adjustmentValue:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                placeholder={t(
                                                    "service.form.rule.value_placeholder",
                                                )}
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                {t(
                                                    "service.form.rule.priority",
                                                )}
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={pricingRuleForm.priority}
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            priority:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {pricingRuleForm.ruleType ===
                                        "SEASONAL" && (
                                        <div className="wdr-sform__row">
                                            <div className="wdr-sform__field">
                                                <label className="wdr-sform__label">
                                                    {t(
                                                        "service.form.rule.start",
                                                    )}
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={
                                                        pricingRuleForm.startDate
                                                    }
                                                    onChange={(e) =>
                                                        setPricingRuleForm(
                                                            (previous) => ({
                                                                ...previous,
                                                                startDate:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="wdr-sform__field">
                                                <label className="wdr-sform__label">
                                                    {t("service.form.rule.end")}
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={
                                                        pricingRuleForm.endDate
                                                    }
                                                    onChange={(e) =>
                                                        setPricingRuleForm(
                                                            (previous) => ({
                                                                ...previous,
                                                                endDate:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {pricingRuleForm.ruleType ===
                                        "DURATION" && (
                                        <div className="wdr-sform__row">
                                            <div className="wdr-sform__field">
                                                <label className="wdr-sform__label">
                                                    {t(
                                                        "service.form.rule.min_units",
                                                    )}
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={
                                                        pricingRuleForm.minUnits
                                                    }
                                                    onChange={(e) =>
                                                        setPricingRuleForm(
                                                            (previous) => ({
                                                                ...previous,
                                                                minUnits:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    placeholder={t(
                                                        "service.form.rule.min_units_placeholder",
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <p className="wdr-sform__hint">
                                        {t("service.form.rule.backend_hint")}
                                    </p>

                                    <div className="wdr-sform__calendar-sync-actions">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                void handleCreatePricingRule()
                                            }
                                            disabled={
                                                createPricingRule.isPending
                                            }
                                        >
                                            {createPricingRule.isPending
                                                ? t("service.form.rule.adding")
                                                : t("service.form.rule.add")}
                                        </Button>
                                    </div>

                                    {pricingRulesQuery.data &&
                                        pricingRulesQuery.data.length > 0 && (
                                            <div className="wdr-sform__image-grid">
                                                {pricingRulesQuery.data.map(
                                                    (rule) => (
                                                        <div
                                                            key={rule.id}
                                                            className="wdr-sform__image-card"
                                                        >
                                                            <div className="wdr-sform__image-card-meta">
                                                                <span>
                                                                    {rule.name}
                                                                </span>
                                                                <span>
                                                                    {
                                                                        rule.ruleType
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {rule.adjustmentType ===
                                                                    "PERCENTAGE"
                                                                        ? `${rule.adjustmentValue}%`
                                                                        : formatPrice(
                                                                              rule.adjustmentValue,
                                                                              "EUR",
                                                                          )}
                                                                </span>
                                                                {rule.startDate &&
                                                                    rule.endDate && (
                                                                        <span>
                                                                            {rule.startDate.toLocaleDateString()}{" "}
                                                                            →{" "}
                                                                            {rule.endDate.toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                {rule.minUnits && (
                                                                    <span>
                                                                        {t(
                                                                            "service.form.rule.min_units_display",
                                                                        ).replace(
                                                                            "{count}",
                                                                            String(
                                                                                rule.minUnits,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    {t(
                                                                        "service.form.rule.priority_display",
                                                                    ).replace(
                                                                        "{priority}",
                                                                        String(
                                                                            rule.priority,
                                                                        ),
                                                                    )}
                                                                </span>
                                                                <div className="wdr-sform__image-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="wdr-sform__image-remove"
                                                                        onClick={() =>
                                                                            void handleDeletePricingRule(
                                                                                rule.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletePricingRule.isPending
                                                                        }
                                                                    >
                                                                        {t(
                                                                            "service.form.delete",
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </>
                                )}
                            </div>
                        )}

                        {!isExternalService && (
                            <>
                                <div className="wdr-sform__field">
                                    <label
                                        htmlFor="sf-payment"
                                        className="wdr-sform__label"
                                    >
                                        {t("service.form.label.payment_mode")}
                                    </label>
                                    <Select
                                        id="sf-payment"
                                        options={PAYMENT_MODE_OPTIONS}
                                        value={form.paymentMode}
                                        onChange={(e) =>
                                            setField(
                                                "paymentMode",
                                                e.target.value as PaymentMode,
                                            )
                                        }
                                    />
                                    <p className="wdr-sform__hint">
                                        {PaymentModeDescriptions[
                                            form.paymentMode
                                        ]}
                                    </p>
                                </div>

                                <div className="wdr-sform__field">
                                    <label
                                        htmlFor="sf-booking-mode"
                                        className="wdr-sform__label"
                                    >
                                        {t("service.form.label.booking_mode")}
                                    </label>
                                    <Select
                                        id="sf-booking-mode"
                                        options={[
                                            {
                                                value: "REQUEST",
                                                label: t(
                                                    "service.form.booking_mode.request",
                                                ),
                                            },
                                            {
                                                value: "INSTANT",
                                                label: t(
                                                    "service.form.booking_mode.instant",
                                                ),
                                            },
                                        ]}
                                        value={form.bookingMode}
                                        onChange={(e) =>
                                            setField(
                                                "bookingMode",
                                                e.target.value as BookingMode,
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.media")}
                        </legend>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-image-upload"
                                className="wdr-sform__label"
                            >
                                {t("service.form.label.images")}{" "}
                                <span aria-hidden="true">*</span>
                            </label>
                            <input
                                id="sf-image-upload"
                                className="wdr-sform__file-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) =>
                                    void handleImagesSelected(event)
                                }
                                disabled={uploadingImages || saving}
                            />
                            <p className="wdr-sform__hint">
                                {t("service.form.images_hint")}
                            </p>
                            {uploadingImages && (
                                <p className="wdr-sform__hint">
                                    {t("service.form.images_uploading")}
                                </p>
                            )}
                            {errors.imageUrls && (
                                <p className="wdr-sform__error">
                                    {errors.imageUrls}
                                </p>
                            )}
                            {form.imageUrls.length > 0 && (
                                <div className="wdr-sform__image-grid">
                                    {form.imageUrls.map((imageUrl, index) => (
                                        <div
                                            key={imageUrl}
                                            className="wdr-sform__image-card"
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={t(
                                                    "service.form.image.alt",
                                                ).replace(
                                                    "{index}",
                                                    String(index + 1),
                                                )}
                                            />
                                            <div className="wdr-sform__image-card-meta">
                                                <span>
                                                    {index === 0
                                                        ? t(
                                                              "service.form.image.primary",
                                                          )
                                                        : t(
                                                              "service.form.image.label",
                                                          ).replace(
                                                              "{index}",
                                                              String(index + 1),
                                                          )}
                                                </span>
                                                <div className="wdr-sform__image-actions">
                                                    {index !== 0 && (
                                                        <button
                                                            type="button"
                                                            className="wdr-sform__image-action"
                                                            onClick={() =>
                                                                setPrimaryImage(
                                                                    imageUrl,
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            {t(
                                                                "service.form.image.cover",
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="wdr-sform__image-action"
                                                        onClick={() =>
                                                            moveImage(
                                                                imageUrl,
                                                                "left",
                                                            )
                                                        }
                                                        disabled={
                                                            saving ||
                                                            index === 0
                                                        }
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="wdr-sform__image-action"
                                                        onClick={() =>
                                                            moveImage(
                                                                imageUrl,
                                                                "right",
                                                            )
                                                        }
                                                        disabled={
                                                            saving ||
                                                            index ===
                                                                form.imageUrls
                                                                    .length -
                                                                    1
                                                        }
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="wdr-sform__image-remove"
                                                        onClick={() =>
                                                            removeImage(
                                                                imageUrl,
                                                            )
                                                        }
                                                        disabled={saving}
                                                    >
                                                        {t(
                                                            "service.form.delete",
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-video"
                                className="wdr-sform__label"
                            >
                                {t("service.form.label.video")}
                            </label>
                            <Input
                                id="sf-video"
                                type="url"
                                value={form.videoUrl}
                                onChange={(e) =>
                                    setField("videoUrl", e.target.value)
                                }
                                placeholder="https://..."
                            />
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-tags"
                                className="wdr-sform__label"
                            >
                                {t("service.form.label.tags")}
                            </label>
                            <Input
                                id="sf-tags"
                                value={form.tags}
                                onChange={(e) =>
                                    setField("tags", e.target.value)
                                }
                                placeholder={t("service.form.tags_placeholder")}
                            />
                            <p className="wdr-sform__hint">
                                {t("service.form.tags_hint")}
                            </p>
                        </div>

                        {adminMode && (
                            <div className="wdr-sform__field">
                                <div className="wdr-sform__field--inline">
                                    <input
                                        type="checkbox"
                                        id="sf-featured"
                                        checked={form.featured}
                                        onChange={(e) =>
                                            setField(
                                                "featured",
                                                e.target.checked,
                                            )
                                        }
                                        className="wdr-sform__checkbox"
                                    />
                                    <label
                                        htmlFor="sf-featured"
                                        className="wdr-sform__label wdr-sform__label--inline"
                                    >
                                        {t("service.form.featured")}
                                    </label>
                                </div>
                            </div>
                        )}
                    </fieldset>

                    {!isExternalService && (
                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            {t("service.form.section.ical")}
                        </legend>

                        {!isEditing && (
                            <p className="wdr-sform__hint">
                                {t("service.form.ical.create_hint")}
                            </p>
                        )}

                        {isEditing && !canUseIcalSync && (
                            <p className="wdr-sform__hint">
                                {t("service.form.ical.unavailable_hint")}
                            </p>
                        )}

                        {canUseIcalSync && (
                            <div className="wdr-sform__calendar-sync">
                                <div className="wdr-sform__field">
                                    <label
                                        htmlFor="sf-ical-import"
                                        className="wdr-sform__label"
                                    >
                                        {t("service.form.ical.import_url")}
                                    </label>
                                    <Input
                                        id="sf-ical-import"
                                        type="url"
                                        value={calendarImportUrl}
                                        onChange={(e) =>
                                            setCalendarImportUrl(e.target.value)
                                        }
                                        placeholder="https://..."
                                    />
                                    <p className="wdr-sform__hint">
                                        {t("service.form.ical.import_hint")}
                                    </p>
                                </div>

                                <div className="wdr-sform__field">
                                    <label
                                        htmlFor="sf-ical-export"
                                        className="wdr-sform__label"
                                    >
                                        {t("service.form.ical.export_url")}
                                    </label>
                                    <Input
                                        id="sf-ical-export"
                                        value={
                                            calendarSyncQuery.data?.exportUrl ??
                                            ""
                                        }
                                        readOnly
                                        placeholder={t(
                                            "service.form.ical.export_placeholder",
                                        )}
                                    />
                                    <p className="wdr-sform__hint">
                                        {t("service.form.ical.export_hint")}
                                    </p>
                                </div>

                                <div className="wdr-sform__calendar-sync-meta">
                                    <span>
                                        {t("service.form.ical.status")}{" "}
                                        <strong>
                                            {calendarSyncQuery.data
                                                ?.lastStatus ?? "IDLE"}
                                        </strong>
                                    </span>
                                    <span>
                                        {t("service.form.ical.last_sync")}{" "}
                                        <strong>
                                            {calendarSyncQuery.data
                                                ?.lastSyncedAt
                                                ? calendarSyncQuery.data.lastSyncedAt.toLocaleString()
                                                : t("service.form.ical.never")}
                                        </strong>
                                    </span>
                                    <span>
                                        {t("service.form.ical.imported_events")}{" "}
                                        <strong>
                                            {calendarSyncQuery.data
                                                ?.importedEventsCount ?? 0}
                                        </strong>
                                    </span>
                                </div>

                                {calendarSyncQuery.data?.lastError && (
                                    <p className="wdr-sform__error">
                                        {calendarSyncQuery.data.lastError}
                                    </p>
                                )}

                                <div className="wdr-sform__calendar-sync-actions">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            void handleSaveCalendarSync()
                                        }
                                        disabled={
                                            saveCalendarSync.isPending ||
                                            runCalendarSync.isPending ||
                                            saving
                                        }
                                    >
                                        {saveCalendarSync.isPending
                                            ? t("service.form.ical.saving")
                                            : t("service.form.ical.save_url")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            void handleRunCalendarSync()
                                        }
                                        disabled={
                                            runCalendarSync.isPending ||
                                            saveCalendarSync.isPending ||
                                            !calendarImportUrl.trim()
                                        }
                                    >
                                        {runCalendarSync.isPending
                                            ? t("service.form.ical.syncing")
                                            : t("service.form.ical.sync_now")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                            void handleCopyExportUrl()
                                        }
                                        disabled={
                                            !calendarSyncQuery.data?.exportUrl
                                        }
                                    >
                                        {t("service.form.ical.copy_export")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </fieldset>
                    )}

                    <div className="wdr-sform__actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                                navigate({
                                    name: adminMode
                                        ? "admin-services"
                                        : "partner-catalog",
                                })
                            }
                            disabled={saving}
                        >
                            {t("service.form.actions.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving || uploadingImages}
                        >
                            {saving
                                ? t("service.form.actions.saving")
                                : uploadingImages
                                  ? t("service.form.actions.uploading")
                                  : isEditing
                                    ? t("service.form.actions.save_changes")
                                    : t("service.form.actions.create")}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export const PartnerServiceFormPage: React.FC<PartnerServiceFormPageProps> = ({
    serviceId,
    adminMode = false,
}) => {
    const isEditing = !!serviceId;
    const { service: existingService, isLoading } = useServiceData(
        serviceId ?? "",
    );

    if (isEditing && isLoading) {
        return null;
    }

    return (
        <PartnerServiceFormContent
            key={existingService?.id ?? serviceId ?? "new-service"}
            serviceId={serviceId}
            existingService={existingService}
            adminMode={adminMode}
        />
    );
};

export default PartnerServiceFormPage;
