/**
 * @file pages/PartnerServiceFormPage/index.tsx
 * @description Formulaire de creation ou d'edition d'un service partenaire.
 * Gere les champs communs a toutes les categories de service.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { servicesApi } from '@/api/services';
import { uploadsApi } from '@/api/uploads';
import { Breadcrumb, Button, Input, Select } from '@/components/wdr';
import { useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import {
    useCalendarSyncData,
    useRunCalendarSyncData,
    useSaveCalendarSyncData,
} from '@/hooks/useCalendarSyncData';
import {
    useCreateServicePricingRuleData,
    useDeleteServicePricingRuleData,
    useServicePricingRulesData,
} from '@/hooks/useServicePricingData';
import { useServiceStructureData } from '@/hooks/useServiceStructureData';
import { useAdminUsersData } from '@/hooks/useUsersData';
import { usePartnerApprovalGuard } from '@/hooks/usePartnerApprovalGuard';
import { useServiceData } from '@/hooks/useServicesData';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import type {
    PricingAdjustmentType,
    PricingRuleType,
} from '@/types/pricing-rule';
import type {
    BookingMode,
    PaymentMode,
    Service,
    ServiceCategory,
    ServicePricingUnit,
} from '@/types/service';
import {
    PaymentModeDescriptions,
    PaymentModeLabels,
    PaymentModeNames,
    ServiceCategoryLabels,
    ServiceCategoryNames,
} from '@/types/service';
import type { PartnerUser } from '@/types/wdr-user';
import './PartnerServiceFormPage.css';

interface ServiceFormState {
    title: string;
    description: string;
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

const PRICING_UNIT_OPTIONS = [
    { value: 'PAR_PERSONNE', label: 'Par personne' },
    { value: 'PAR_GROUPE', label: 'Par groupe' },
    { value: 'PAR_JOUR', label: 'Par jour' },
    { value: 'PAR_NUIT', label: 'Par nuit' },
    { value: 'PAR_SEMAINE', label: 'Par semaine' },
    { value: 'PAR_DEMI_JOURNEE', label: 'Par demi-journee' },
];

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

const PRICING_RULE_TYPE_OPTIONS = [
    { value: 'WEEKEND', label: 'Week-end' },
    { value: 'SEASONAL', label: 'Saisonnier' },
    { value: 'DURATION', label: 'Long sejour' },
];

const PRICING_ADJUSTMENT_OPTIONS = [
    { value: 'PERCENTAGE', label: 'Pourcentage' },
    { value: 'FIXED_AMOUNT', label: 'Montant fixe (EUR)' },
];

const DEFAULT_SERVICE_REGION = 'Algarve';
const DEFAULT_SERVICE_COUNTRY = 'Portugal';
const ALGARVE_CITY_OPTIONS = [
    { value: '', label: 'Choisir une ville' },
    { value: 'Lagos', label: 'Lagos' },
    { value: 'Alvor', label: 'Alvor' },
    { value: 'Portimão', label: 'Portimão' },
    { value: 'Silves', label: 'Silves' },
    { value: 'Benagil', label: 'Benagil' },
    { value: 'Armação de Pêra', label: 'Armação de Pêra' },
    { value: 'Vilamoura', label: 'Vilamoura' },
    { value: 'Albufeira', label: 'Albufeira' },
];
const CATEGORY_GUIDANCE: Record<
    ServiceCategory,
    {
        title: string;
        points: string[];
    }
> = {
    ACTIVITE: {
        title: 'Points attendus pour une activite',
        points: [
            'Decrivez clairement l experience, le niveau requis et ce qui est inclus.',
            'Renseignez une ville precise et un prix lisible par personne ou par groupe.',
            'Ajoutez des images qui montrent l activite en situation reelle.',
        ],
    },
    BATEAU: {
        title: 'Points attendus pour un bateau',
        points: [
            'Choisissez la sous-categorie adaptee : yacht, catamaran, jet ski ou location simple.',
            'Completez les attributs techniques comme longueur, cabines, vitesse ou carburant.',
            'Verifiez que les extras utiles comme skipper ou carburant sont bien visibles.',
        ],
    },
    HEBERGEMENT: {
        title: 'Points attendus pour un hebergement',
        points: [
            'Precisez la capacite reelle et les attributs de confort comme chambres, salles de bain, WiFi ou piscine.',
            'Soignez les images de couverture et la localisation exacte.',
            'Utilisez des extras clairs comme menage final ou petit-dejeuner si necessaire.',
        ],
    },
    VOITURE: {
        title: 'Points attendus pour une voiture',
        points: [
            'Choisissez la bonne sous-categorie : SUV, luxe, electrique ou citadine.',
            'Renseignez les attributs utiles comme transmission, carburant, portes et climatisation.',
            'Ajoutez des extras simples a comprendre, par exemple chauffeur ou livraison.',
        ],
    },
};

function buildInitialState(existingService?: Service): ServiceFormState {
    if (existingService) {
        return {
            title: existingService.title,
            description: existingService.description,
            category: existingService.category,
            serviceCategoryId: existingService.serviceCategoryId ?? '',
            serviceSubcategoryId: existingService.serviceSubcategoryId ?? '',
            city: existingService.location.city,
            country: existingService.location.country,
            region: existingService.location.region ?? '',
            partnerPrice: String(existingService.partnerPrice),
            pricingUnit: existingService.pricingUnit,
            paymentMode: existingService.paymentMode,
            bookingMode: existingService.bookingMode ?? 'REQUEST',
            featured: existingService.featured ?? false,
            videoUrl: existingService.videoUrl ?? '',
            tags: existingService.tags.join(', '),
            imageUrls: existingService.images,
            isAvailable: existingService.isAvailable,
            dynamicAttributes: ((existingService.extraData?.attributes as Record<
                string,
                string | boolean
            >) ?? {}) as Record<string, string | boolean>,
        };
    }

    return {
        title: '',
        description: '',
        category: ServiceCategoryNames.ACTIVITE,
        serviceCategoryId: '',
        serviceSubcategoryId: '',
        city: '',
        country: DEFAULT_SERVICE_COUNTRY,
        region: DEFAULT_SERVICE_REGION,
        partnerPrice: '',
        pricingUnit: 'PAR_PERSONNE',
        paymentMode: PaymentModeNames.FULL_ONLINE,
        bookingMode: 'REQUEST',
        featured: false,
        videoUrl: '',
        tags: '',
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
    const { isBlocked } = usePartnerApprovalGuard(!adminMode);
    const { categories: serviceCategories } = useServiceStructureData();
    const { users } = useAdminUsersData({ role: 'PARTNER' }, adminMode);

    const isAdmin = currentUser?.role === 'ADMIN';
    const partnerOptions = users.filter((user) => user.role === 'PARTNER');
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
        existingService?.partnerId ?? (adminMode ? '' : currentUser?.id ?? ''),
    );

    if (
        !currentUser ||
        (!adminMode && (isBlocked || currentUser.role !== 'PARTNER')) ||
        (adminMode && !isAdmin)
    ) {
        return null;
    }

    const partner = currentUser as PartnerUser;
    const selectedPartner =
        adminMode
            ? (partnerOptions.find((entry) => entry.id === selectedPartnerId) ??
              null)
            : partner;
    const isEditing = !!serviceId;
    const [form, setForm] = useState<ServiceFormState>(() =>
        buildInitialState(existingService),
    );
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [calendarImportUrl, setCalendarImportUrl] = useState('');
    const [errors, setErrors] = useState<
        Partial<Record<keyof ServiceFormState, string>>
    >({});
    const [pricingRuleForm, setPricingRuleForm] = useState<PricingRuleFormState>(
        {
            name: '',
            ruleType: 'WEEKEND',
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: '',
            startDate: '',
            endDate: '',
            minUnits: '',
            priority: '100',
        },
    );
    const canUseIcalSync =
        isEditing &&
        (form.category === ServiceCategoryNames.HEBERGEMENT ||
            form.category === ServiceCategoryNames.BATEAU);
    const pricingRulesQuery = useServicePricingRulesData(
        serviceId ?? '',
        isEditing && Boolean(serviceId),
    );
    const createPricingRule = useCreateServicePricingRuleData(serviceId ?? '');
    const deletePricingRule = useDeleteServicePricingRuleData(serviceId ?? '');
    const calendarSyncQuery = useCalendarSyncData(
        serviceId ?? '',
        canUseIcalSync && Boolean(serviceId),
    );
    const saveCalendarSync = useSaveCalendarSyncData(serviceId ?? '');
    const runCalendarSync = useRunCalendarSyncData(serviceId ?? '');

    useEffect(() => {
        if (!existingService) {
            return;
        }

        setForm(buildInitialState(existingService));
        setSelectedPartnerId(
            existingService.partnerId ??
                (adminMode ? '' : currentUser?.id ?? ''),
        );
        setErrors({});
    }, [adminMode, currentUser?.id, existingService]);

    useEffect(() => {
        setCalendarImportUrl(calendarSyncQuery.data?.importUrl ?? '');
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

    const availableSubcategories = selectedStructureCategory?.subcategories ?? [];
    const activeExtras = useMemo(
        () =>
            (selectedStructureCategory?.extras ?? []).filter(
                (extra) => extra.isActive,
            ),
        [selectedStructureCategory],
    );
    const categoryGuidance = CATEGORY_GUIDANCE[form.category];
    const effectivePartnerId =
        adminMode && !isEditing
            ? selectedPartnerId || partnerOptions[0]?.id || ''
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
                serviceCategoryId: '',
                serviceSubcategoryId: '',
                dynamicAttributes: {},
            }));
        }
    }, [availableStructureCategories, form.serviceCategoryId]);

    useEffect(() => {
        if (!form.serviceCategoryId && availableStructureCategories.length === 1) {
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
                serviceSubcategoryId: '',
            }));
        }
    }, [availableSubcategories, form.serviceSubcategoryId]);

    if (existingService?.sourceType === 'EXTERNAL') {
        return (
            <div className="wdr-sform">
                <div className="wdr-sform__header">
                    <div className="wdr-sform__header-inner">
                        <h1 className="wdr-sform__title">
                            Offre externe en lecture seule
                        </h1>
                        <p className="wdr-sform__subtitle">
                            Cette offre est synchronisee depuis une source
                            externe et ne peut pas etre modifiee ici.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate({ name: 'partner-catalog' })}
                        >
                            Retour au catalogue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const clientPrice = useMemo(() => {
        const price = parseFloat(form.partnerPrice);

        if (Number.isNaN(price) || price <= 0) {
            return null;
        }

        return price * (1 + (selectedPartner?.commissionRate ?? 0.20));
    }, [form.partnerPrice, selectedPartner?.commissionRate]);

    const resetPricingRuleForm = () => {
        setPricingRuleForm({
            name: '',
            ruleType: 'WEEKEND',
            adjustmentType: 'PERCENTAGE',
            adjustmentValue: '',
            startDate: '',
            endDate: '',
            minUnits: '',
            priority: '100',
        });
    };

    const setField = <K extends keyof ServiceFormState>(
        key: K,
        value: ServiceFormState[K],
    ) => {
        setForm((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
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

    const moveImage = (imageUrl: string, direction: 'left' | 'right') => {
        setForm((previous) => {
            const currentIndex = previous.imageUrls.findIndex(
                (entry) => entry === imageUrl,
            );

            if (currentIndex === -1) {
                return previous;
            }

            const targetIndex =
                direction === 'left' ? currentIndex - 1 : currentIndex + 1;

            if (
                targetIndex < 0 ||
                targetIndex >= previous.imageUrls.length
            ) {
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
                    contentType: file.type || 'application/octet-stream',
                    folder: 'services',
                });

                const response = await uploadsApi.uploadFile(
                    presigned.uploadUrl,
                    file,
                );

                if (!response.ok) {
                    throw new Error('upload_failed');
                }

                uploadedUrls.push(presigned.publicUrl);
            }

            setForm((previous) => ({
                ...previous,
                imageUrls: [...previous.imageUrls, ...uploadedUrls],
            }));
            success(
                `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's televersees.' : ' televersee.'}`,
            );
        } catch {
            error('Le televersement des images a echoue.');
        } finally {
            setUploadingImages(false);
            event.target.value = '';
        }
    };

    const validate = (): boolean => {
        const nextErrors: Partial<Record<keyof ServiceFormState, string>> = {};

        if (!form.title.trim()) {
            nextErrors.title = 'Le titre est obligatoire.';
        }

        if (!form.description.trim()) {
            nextErrors.description = 'La description est obligatoire.';
        }

        if (!form.serviceCategoryId && availableStructureCategories.length > 0) {
            nextErrors.serviceCategoryId = 'Choisissez une categorie detaillee.';
        }

        if (!form.city.trim()) {
            nextErrors.city = 'La ville est obligatoire.';
        }

        if (!form.country.trim()) {
            nextErrors.country = 'Le pays est obligatoire.';
        }

        const price = parseFloat(form.partnerPrice);

        if (Number.isNaN(price) || price <= 0) {
            nextErrors.partnerPrice = 'Saisissez un prix positif.';
        }

        if (form.imageUrls.length === 0) {
            nextErrors.imageUrls =
                'Ajoutez au moins une image pour ce service.';
        }

        selectedStructureCategory?.attributes.forEach((attribute) => {
            if (
                attribute.isRequired &&
                (form.dynamicAttributes[attribute.key] === undefined ||
                    form.dynamicAttributes[attribute.key] === '' ||
                    form.dynamicAttributes[attribute.key] === false)
            ) {
                nextErrors.serviceCategoryId =
                    'Les attributs obligatoires doivent etre renseignes.';
            }
        });

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validate()) {
            error('Veuillez corriger les erreurs avant de continuer.');

            return;
        }

        setSaving(true);

        const price = parseFloat(form.partnerPrice);
        const tags = form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        const payload = {
            partner_id: adminMode ? effectivePartnerId || undefined : undefined,
            title: form.title,
            description: form.description,
            category: form.category,
            service_category_id: form.serviceCategoryId || undefined,
            service_subcategory_id: form.serviceSubcategoryId || undefined,
            location_city: form.city,
            location_country: form.country,
            location_region: form.region || undefined,
            partner_price: price,
            pricing_unit: form.pricingUnit,
            payment_mode: form.paymentMode,
            booking_mode: form.bookingMode,
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
                    ? 'Service mis a jour avec succes.'
                    : 'Service cree avec succes.',
            );
        } catch {
            error(
                'La sauvegarde du service a echoue. Verifiez les donnees puis reessayez.',
            );
            setSaving(false);

            return;
        }

        setSaving(false);
        navigate({ name: adminMode ? 'admin-services' : 'partner-catalog' });
    };

    const handleSaveCalendarSync = async () => {
        if (!serviceId) {
            return;
        }

        try {
            await saveCalendarSync.mutateAsync({
                importUrl: calendarImportUrl.trim() || undefined,
            });
            success('Configuration iCal enregistree.');
        } catch {
            error('Impossible d enregistrer la configuration iCal.');
        }
    };

    const handleCreatePricingRule = async () => {
        if (!serviceId) {
            return;
        }

        const adjustmentValue = parseFloat(pricingRuleForm.adjustmentValue);

        if (!pricingRuleForm.name.trim() || Number.isNaN(adjustmentValue)) {
            error('Renseignez un nom de regle et une valeur de tarification.');

            return;
        }

        if (
            pricingRuleForm.ruleType === 'SEASONAL' &&
            (!pricingRuleForm.startDate || !pricingRuleForm.endDate)
        ) {
            error('Les dates sont obligatoires pour une regle saisonniere.');

            return;
        }

        if (
            pricingRuleForm.ruleType === 'DURATION' &&
            !pricingRuleForm.minUnits
        ) {
            error('Le nombre minimal d unites est obligatoire.');

            return;
        }

        try {
            await createPricingRule.mutateAsync({
                name: pricingRuleForm.name.trim(),
                rule_type: pricingRuleForm.ruleType,
                adjustment_type: pricingRuleForm.adjustmentType,
                adjustment_value: adjustmentValue,
                start_date:
                    pricingRuleForm.ruleType === 'SEASONAL'
                        ? pricingRuleForm.startDate
                        : null,
                end_date:
                    pricingRuleForm.ruleType === 'SEASONAL'
                        ? pricingRuleForm.endDate
                        : null,
                min_units:
                    pricingRuleForm.ruleType === 'DURATION'
                        ? Number(pricingRuleForm.minUnits)
                        : null,
                priority: Number(pricingRuleForm.priority || '100'),
                is_active: true,
            });
            resetPricingRuleForm();
            success('Regle tarifaire ajoutee.');
        } catch {
            error('Impossible d enregistrer la regle tarifaire.');
        }
    };

    const handleDeletePricingRule = async (ruleId: string) => {
        try {
            await deletePricingRule.mutateAsync(ruleId);
            success('Regle tarifaire supprimee.');
        } catch {
            error('Impossible de supprimer la regle tarifaire.');
        }
    };

    const handleRunCalendarSync = async () => {
        if (!serviceId) {
            return;
        }

        try {
            const result = await runCalendarSync.mutateAsync();
            success(
                `${result.importedEventsCount} evenement(s) importes depuis le calendrier externe.`,
            );
        } catch {
            error('La synchronisation iCal a echoue.');
        }
    };

    const handleCopyExportUrl = async () => {
        const exportUrl = calendarSyncQuery.data?.exportUrl;

        if (!exportUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(exportUrl);
            success('Lien iCal copie.');
        } catch {
            error('Impossible de copier le lien iCal.');
        }
    };

    return (
        <div className="wdr-sform">
            <div className="wdr-sform__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: 'Accueil',
                            onClick: () => navigate({ name: 'home' }),
                        },
                        {
                            label: adminMode ? 'Catalogue admin' : 'Catalogue',
                            onClick: () =>
                                navigate({
                                    name: adminMode
                                        ? 'admin-services'
                                        : 'partner-catalog',
                                }),
                        },
                        {
                            label: isEditing
                                ? 'Modifier le service'
                                : 'Nouveau service',
                        },
                    ]}
                />
            </div>

            <div className="wdr-sform__header">
                <div className="wdr-sform__header-inner">
                    <h1 className="wdr-sform__title">
                        {isEditing ? 'Modifier le service' : 'Creer un service'}
                    </h1>
                    <p className="wdr-sform__subtitle">
                        {isEditing
                            ? 'Modifiez les informations de votre service.'
                            : 'Renseignez les informations principales de votre nouvelle offre.'}
                    </p>
                </div>
            </div>

            <form
                className="wdr-sform__body"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="wdr-sform__inner">
                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            Informations generales
                        </legend>

                        {adminMode && (
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-partner"
                                    className="wdr-sform__label"
                                >
                                    Partenaire proprietaire optionnel
                                </label>
                                <Select
                                    id="sf-partner"
                                    options={[
                                        {
                                            value: '',
                                            label:
                                                partnerOptions.length > 0
                                                    ? 'Aucun partenaire assigne'
                                                    : 'Aucun partenaire disponible',
                                            disabled:
                                                partnerOptions.length === 0,
                                        },
                                        ...partnerOptions.map((entry) => ({
                                            value: entry.id,
                                            label:
                                                entry.role === 'PARTNER'
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
                                        Creez ou validez d abord un partenaire
                                        avant de publier un service depuis
                                        l admin.
                                    </p>
                                ) : (
                                    <p className="wdr-sform__hint">
                                        Vous pouvez laisser ce champ vide pour
                                        creer un service non rattache a un
                                        partenaire.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-title"
                                className="wdr-sform__label"
                            >
                                Titre du service{' '}
                                <span aria-hidden="true">*</span>
                            </label>
                            <Input
                                id="sf-title"
                                value={form.title}
                                onChange={(e) =>
                                    setField('title', e.target.value)
                                }
                                placeholder="Ex : Plongee sous-marine cote d'Azur"
                                aria-describedby={
                                    errors.title ? 'sf-title-err' : undefined
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
                                Description <span aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="sf-desc"
                                className="wdr-sform__textarea"
                                rows={4}
                                value={form.description}
                                onChange={(e) =>
                                    setField('description', e.target.value)
                                }
                                placeholder="Decrivez votre service de maniere detaillee..."
                                aria-describedby={
                                    errors.description
                                        ? 'sf-desc-err'
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
                                    Categorie
                                </label>
                                <Select
                                    id="sf-category"
                                    options={CATEGORY_OPTIONS}
                                    value={form.category}
                                    onChange={(e) =>
                                        setField(
                                            'category',
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
                                    Categorie detaillee
                                </label>
                                <Select
                                    id="sf-structure-category"
                                    options={[
                                        {
                                            value: '',
                                            label:
                                                availableStructureCategories.length
                                                    ? 'Choisir une categorie'
                                                    : 'Aucune categorie admin disponible',
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
                                            serviceSubcategoryId: '',
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
                                                'isAvailable',
                                                e.target.checked,
                                            )
                                        }
                                        className="wdr-sform__checkbox"
                                    />
                                    <label
                                        htmlFor="sf-available"
                                        className="wdr-sform__label wdr-sform__label--inline"
                                    >
                                        Service disponible a la reservation
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
                                    Sous-categorie
                                </label>
                                <Select
                                    id="sf-subcategory"
                                    options={[
                                        { value: '', label: 'Choisir une sous-categorie' },
                                        ...availableSubcategories.map((entry) => ({
                                            value: entry.id,
                                            label: entry.name,
                                        })),
                                    ]}
                                    value={form.serviceSubcategoryId}
                                    onChange={(e) =>
                                        setField('serviceSubcategoryId', e.target.value)
                                    }
                                />
                            </div>
                        )}

                        <div className="wdr-sform__structure-summary">
                            <div className="wdr-sform__structure-summary-header">
                                <div>
                                    <h3 className="wdr-sform__structure-summary-title">
                                        Structure appliquee
                                    </h3>
                                    <p className="wdr-sform__structure-summary-subtitle">
                                        La categorie detaillee choisie pilote
                                        les sous-categories, attributs et extras
                                        de cette offre.
                                    </p>
                                </div>
                                {adminMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            navigate({
                                                name: 'admin-service-structure',
                                            })
                                        }
                                    >
                                        Gerer la structure
                                    </Button>
                                )}
                            </div>

                            {!selectedStructureCategory ? (
                                <p className="wdr-sform__structure-summary-empty">
                                    {availableStructureCategories.length > 0
                                        ? 'Choisissez une categorie detaillee pour afficher la structure attendue.'
                                        : 'Aucune structure admin active n est disponible pour ce type de service.'}
                                </p>
                            ) : (
                                <div className="wdr-sform__structure-grid">
                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            Categorie active
                                        </span>
                                        <strong className="wdr-sform__structure-name">
                                            {selectedStructureCategory.name}
                                        </strong>
                                        <p className="wdr-sform__structure-meta">
                                            {ServiceCategoryLabels[
                                                selectedStructureCategory
                                                    .serviceType
                                            ]}{' '}
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
                                            Sous-categories
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
                                                                    Selectionnee
                                                                </strong>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                Aucune sous-categorie admin
                                                configuree.
                                            </p>
                                        )}
                                    </section>

                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            Attributs attendus
                                        </span>
                                        {selectedStructureCategory.attributes
                                            .length > 0 ? (
                                            <>
                                                <p className="wdr-sform__structure-meta">
                                                    {
                                                        requiredAttributes.length
                                                    }{' '}
                                                    obligatoire(s) sur{' '}
                                                    {
                                                        selectedStructureCategory
                                                            .attributes.length
                                                    }
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
                                                                    }{' '}
                                                                    ({attribute.type}
                                                                    )
                                                                </span>
                                                                <strong>
                                                                    {attribute.isRequired
                                                                        ? 'Obligatoire'
                                                                        : 'Optionnel'}
                                                                    {attribute.isFilterable
                                                                        ? ' · Filtre'
                                                                        : ''}
                                                                </strong>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                Aucun attribut dynamique pour
                                                cette categorie detaillee.
                                            </p>
                                        )}
                                    </section>

                                    <section className="wdr-sform__structure-card">
                                        <span className="wdr-sform__structure-kicker">
                                            Extras herites
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
                                                                'EUR',
                                                            )}{' '}
                                                            ·{' '}
                                                            {extra.isRequired
                                                                ? 'Obligatoire'
                                                                : 'Optionnel'}
                                                        </strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="wdr-sform__structure-copy">
                                                Aucun extra actif defini sur
                                                cette categorie.
                                            </p>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            Aide de saisie
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
                                        Structure :{' '}
                                        {selectedStructureCategory.name}
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
                                    Attributs dynamiques
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
                                                {attribute.type === 'boolean' ? (
                                                    <div className="wdr-sform__field--inline">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                form.dynamicAttributes[
                                                                    attribute.key
                                                                ] === true
                                                            }
                                                            onChange={(e) =>
                                                                setDynamicAttribute(
                                                                    attribute.key,
                                                                    e.target.checked,
                                                                )
                                                            }
                                                            className="wdr-sform__checkbox"
                                                        />
                                                        <span className="wdr-sform__hint">
                                                            {attribute.isRequired
                                                                ? 'Obligatoire'
                                                                : 'Optionnel'}
                                                        </span>
                                                    </div>
                                                ) : attribute.type === 'select' ? (
                                                    <Select
                                                        options={[
                                                            {
                                                                value: '',
                                                                label: 'Choisir',
                                                            },
                                                            ...attribute.options.map(
                                                                (option) => ({
                                                                    value: option.value,
                                                                    label: option.label,
                                                                }),
                                                            ),
                                                        ]}
                                                        value={
                                                            String(
                                                                form.dynamicAttributes[
                                                                    attribute.key
                                                                ] ?? '',
                                                            )
                                                        }
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
                                                            'number'
                                                                ? 'number'
                                                                : 'text'
                                                        }
                                                        value={String(
                                                            form.dynamicAttributes[
                                                                attribute.key
                                                            ] ?? '',
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
                            Localisation
                        </legend>

                        <div className="wdr-sform__row">
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-city"
                                    className="wdr-sform__label"
                                >
                                    Ville <span aria-hidden="true">*</span>
                                </label>
                                <Select
                                    id="sf-city"
                                    options={ALGARVE_CITY_OPTIONS}
                                    value={form.city}
                                    onChange={(e) =>
                                        setField('city', e.target.value)
                                    }
                                    aria-describedby={
                                        errors.city ? 'sf-city-err' : undefined
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
                                    Pays <span aria-hidden="true">*</span>
                                </label>
                                <Input
                                    id="sf-country"
                                    value={form.country}
                                    onChange={(e) =>
                                        setField('country', e.target.value)
                                    }
                                    placeholder="Ex : Portugal"
                                    aria-describedby={
                                        errors.country
                                            ? 'sf-country-err'
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
                                    Region
                                </label>
                                <Input
                                    id="sf-region"
                                    value={form.region}
                                    onChange={(e) =>
                                        setField('region', e.target.value)
                                    }
                                    placeholder="Ex : Algarve"
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            Tarification
                        </legend>

                        <div className="wdr-sform__row">
                            <div className="wdr-sform__field">
                                <label
                                    htmlFor="sf-price"
                                    className="wdr-sform__label"
                                >
                                    Votre prix (EUR){' '}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <Input
                                    id="sf-price"
                                    type="number"
                                    min={1}
                                    step="0.01"
                                    value={form.partnerPrice}
                                    onChange={(e) =>
                                        setField('partnerPrice', e.target.value)
                                    }
                                    placeholder="Ex : 85.00"
                                    aria-describedby={
                                        errors.partnerPrice
                                            ? 'sf-price-err'
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
                                    Unite de facturation
                                </label>
                                <Select
                                    id="sf-unit"
                                    options={PRICING_UNIT_OPTIONS}
                                    value={form.pricingUnit}
                                    onChange={(e) =>
                                        setField(
                                            'pricingUnit',
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
                                    Prix affiche au client :
                                </span>
                                <strong className="wdr-sform__price-preview-value">
                                    {formatPrice(clientPrice, 'EUR')}
                                </strong>
                                <span className="wdr-sform__price-preview-note">
                                    (inclut{' '}
                                    {(
                                        (selectedPartner?.commissionRate ??
                                            0.20) * 100
                                    ).toFixed(0)}{' '}
                                    % de commission Wandireo)
                                </span>
                            </div>
                        )}

                        <div className="wdr-sform__field">
                            <label className="wdr-sform__label">
                                Regles tarifaires dynamiques
                            </label>

                            {!isEditing && (
                                <p className="wdr-sform__hint">
                                    Enregistrez d abord le service pour ajouter
                                    des regles de week-end, saison ou long
                                    sejour.
                                </p>
                            )}

                            {isEditing && (
                                <>
                                    <div className="wdr-sform__row">
                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                Nom de la regle
                                            </label>
                                            <Input
                                                value={pricingRuleForm.name}
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            name: e.target.value,
                                                        }),
                                                    )
                                                }
                                                placeholder="Ex : Majoration week-end"
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                Type de regle
                                            </label>
                                            <Select
                                                options={
                                                    PRICING_RULE_TYPE_OPTIONS
                                                }
                                                value={
                                                    pricingRuleForm.ruleType
                                                }
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            ruleType:
                                                                e.target
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
                                                Ajustement
                                            </label>
                                            <Select
                                                options={
                                                    PRICING_ADJUSTMENT_OPTIONS
                                                }
                                                value={
                                                    pricingRuleForm.adjustmentType
                                                }
                                                onChange={(e) =>
                                                    setPricingRuleForm(
                                                        (previous) => ({
                                                            ...previous,
                                                            adjustmentType:
                                                                e.target
                                                                    .value as PricingAdjustmentType,
                                                        }),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                Valeur
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
                                                placeholder="Ex : 15"
                                            />
                                        </div>

                                        <div className="wdr-sform__field">
                                            <label className="wdr-sform__label">
                                                Priorite
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={
                                                    pricingRuleForm.priority
                                                }
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
                                        'SEASONAL' && (
                                        <div className="wdr-sform__row">
                                            <div className="wdr-sform__field">
                                                <label className="wdr-sform__label">
                                                    Debut
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
                                                    Fin
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
                                        'DURATION' && (
                                        <div className="wdr-sform__row">
                                            <div className="wdr-sform__field">
                                                <label className="wdr-sform__label">
                                                    Unites minimales
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
                                                    placeholder="Ex : 7"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <p className="wdr-sform__hint">
                                        Les regles sont appliquees cote backend
                                        au moment de la reservation. Le prix de
                                        base reste le prix d appel.
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
                                                ? 'Ajout...'
                                                : 'Ajouter la regle'}
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
                                                                    {rule.ruleType}{' '}
                                                                    ·{' '}
                                                                    {rule.adjustmentType ===
                                                                    'PERCENTAGE'
                                                                        ? `${rule.adjustmentValue}%`
                                                                        : formatPrice(
                                                                              rule.adjustmentValue,
                                                                              'EUR',
                                                                          )}
                                                                </span>
                                                                {rule.startDate &&
                                                                    rule.endDate && (
                                                                        <span>
                                                                            {rule.startDate.toLocaleDateString()}{' '}
                                                                            →{' '}
                                                                            {rule.endDate.toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                {rule.minUnits && (
                                                                    <span>
                                                                        {rule.minUnits}{' '}
                                                                        unites minimum
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    Priorite{' '}
                                                                    {rule.priority}
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
                                                                        Supprimer
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

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-payment"
                                className="wdr-sform__label"
                            >
                                Mode de paiement
                            </label>
                            <Select
                                id="sf-payment"
                                options={PAYMENT_MODE_OPTIONS}
                                value={form.paymentMode}
                                onChange={(e) =>
                                    setField(
                                        'paymentMode',
                                        e.target.value as PaymentMode,
                                    )
                                }
                            />
                            <p className="wdr-sform__hint">
                                {PaymentModeDescriptions[form.paymentMode]}
                            </p>
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-booking-mode"
                                className="wdr-sform__label"
                            >
                                Mode de reservation
                            </label>
                            <Select
                                id="sf-booking-mode"
                                options={[
                                    { value: 'REQUEST', label: 'Demande de reservation' },
                                    { value: 'INSTANT', label: 'Instant booking' },
                                ]}
                                value={form.bookingMode}
                                onChange={(e) =>
                                    setField(
                                        'bookingMode',
                                        e.target.value as BookingMode,
                                    )
                                }
                            />
                        </div>
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                        <legend className="wdr-sform__legend">
                            Medias & Tags
                        </legend>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-image-upload"
                                className="wdr-sform__label"
                            >
                                Images du service{' '}
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
                                Téléverse une ou plusieurs images. La première
                                image sera utilisée comme image principale.
                            </p>
                            {uploadingImages && (
                                <p className="wdr-sform__hint">
                                    Téléversement en cours...
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
                                                alt={`Aperçu ${index + 1}`}
                                            />
                                            <div className="wdr-sform__image-card-meta">
                                                <span>
                                                    {index === 0
                                                        ? 'Image principale'
                                                        : `Image ${index + 1}`}
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
                                                            Couverture
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="wdr-sform__image-action"
                                                        onClick={() =>
                                                            moveImage(
                                                                imageUrl,
                                                                'left',
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
                                                                'right',
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
                                                            removeImage(imageUrl)
                                                        }
                                                        disabled={saving}
                                                    >
                                                        Supprimer
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
                                URL video
                            </label>
                            <Input
                                id="sf-video"
                                type="url"
                                value={form.videoUrl}
                                onChange={(e) =>
                                    setField('videoUrl', e.target.value)
                                }
                                placeholder="https://..."
                            />
                        </div>

                        <div className="wdr-sform__field">
                            <label
                                htmlFor="sf-tags"
                                className="wdr-sform__label"
                            >
                                Tags
                            </label>
                            <Input
                                id="sf-tags"
                                value={form.tags}
                                onChange={(e) =>
                                    setField('tags', e.target.value)
                                }
                                placeholder="plongee, mer, debutant (separes par des virgules)"
                            />
                            <p className="wdr-sform__hint">
                                Separez les tags par des virgules.
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
                                            setField('featured', e.target.checked)
                                        }
                                        className="wdr-sform__checkbox"
                                    />
                                    <label
                                        htmlFor="sf-featured"
                                        className="wdr-sform__label wdr-sform__label--inline"
                                    >
                                        Mettre en avant ce service
                                    </label>
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <fieldset className="wdr-sform__fieldset">
                            <legend className="wdr-sform__legend">
                                Synchronisation iCal
                            </legend>

                            {!isEditing && (
                                <p className="wdr-sform__hint">
                                    Enregistrez d abord le service pour activer
                                    l import/export iCal.
                                </p>
                            )}

                            {isEditing && !canUseIcalSync && (
                                <p className="wdr-sform__hint">
                                    iCal est reserve aux hebergements et aux
                                    bateaux.
                                </p>
                            )}

                            {canUseIcalSync && (
                                <div className="wdr-sform__calendar-sync">
                                    <div className="wdr-sform__field">
                                        <label
                                            htmlFor="sf-ical-import"
                                            className="wdr-sform__label"
                                        >
                                            URL du calendrier externe
                                        </label>
                                        <Input
                                            id="sf-ical-import"
                                            type="url"
                                            value={calendarImportUrl}
                                            onChange={(e) =>
                                                setCalendarImportUrl(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://..."
                                        />
                                        <p className="wdr-sform__hint">
                                            Wandireo importe ce flux comme une
                                            source de blocage pour eviter les
                                            doubles reservations.
                                        </p>
                                    </div>

                                    <div className="wdr-sform__field">
                                        <label
                                            htmlFor="sf-ical-export"
                                            className="wdr-sform__label"
                                        >
                                            Lien export Wandireo
                                        </label>
                                        <Input
                                            id="sf-ical-export"
                                            value={
                                                calendarSyncQuery.data
                                                    ?.exportUrl ?? ''
                                            }
                                            readOnly
                                            placeholder="Lien disponible apres chargement"
                                        />
                                        <p className="wdr-sform__hint">
                                            Utilisez ce lien dans Airbnb,
                                            Booking ou tout autre canal externe
                                            pour bloquer les dates Wandireo.
                                        </p>
                                    </div>

                                    <div className="wdr-sform__calendar-sync-meta">
                                        <span>
                                            Statut :{' '}
                                            <strong>
                                                {calendarSyncQuery.data
                                                    ?.lastStatus ?? 'IDLE'}
                                            </strong>
                                        </span>
                                        <span>
                                            Derniere sync :{' '}
                                            <strong>
                                                {calendarSyncQuery.data
                                                    ?.lastSyncedAt
                                                    ? calendarSyncQuery.data.lastSyncedAt.toLocaleString()
                                                    : 'Jamais'}
                                            </strong>
                                        </span>
                                        <span>
                                            Evenements importes :{' '}
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
                                                ? 'Enregistrement...'
                                                : 'Enregistrer l URL'}
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
                                                ? 'Synchronisation...'
                                                : 'Synchroniser maintenant'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                void handleCopyExportUrl()
                                            }
                                            disabled={
                                                !calendarSyncQuery.data
                                                    ?.exportUrl
                                            }
                                        >
                                            Copier le lien export
                                        </Button>
                                    </div>
                                </div>
                            )}
                    </fieldset>

                    <div className="wdr-sform__actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                                navigate({
                                    name: adminMode
                                        ? 'admin-services'
                                        : 'partner-catalog',
                                })
                            }
                            disabled={saving}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={saving || uploadingImages}
                        >
                            {saving
                                ? 'Enregistrement...'
                                : uploadingImages
                                  ? 'Televersement...'
                                : isEditing
                                  ? 'Enregistrer les modifications'
                                  : 'Creer le service'}
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
        serviceId ?? '',
    );

    if (isEditing && isLoading) {
        return null;
    }

    return (
        <PartnerServiceFormContent
            key={existingService?.id ?? serviceId ?? 'new-service'}
            serviceId={serviceId}
            existingService={existingService}
            adminMode={adminMode}
        />
    );
};

export default PartnerServiceFormPage;
