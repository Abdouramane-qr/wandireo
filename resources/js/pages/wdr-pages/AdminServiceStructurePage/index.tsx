import React, { useEffect, useMemo, useState } from "react";
import {
    AdminSectionNav,
    Button,
    Input,
    Select,
    useToast,
} from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import {
    useCreateServiceAttributeData,
    useCreateServiceCategoryData,
    useCreateServiceExtraData,
    useCreateServiceSubcategoryData,
    useDeleteServiceAttributeData,
    useDeleteServiceCategoryData,
    useDeleteServiceExtraData,
    useDeleteServiceSubcategoryData,
    useServiceStructureData,
    useUpdateServiceAttributeData,
    useUpdateServiceCategoryData,
    useUpdateServiceExtraData,
    useUpdateServiceSubcategoryData,
} from "@/hooks/useServiceStructureData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import {
    ServiceCategoryLabels,
    ServiceCategoryNames,
    type ServiceAttributeDefinition,
    type ServiceCategoryDefinition,
    type ServiceExtraDefinition,
    type ServiceSubcategoryDefinition,
} from "@/types/service";
import "./AdminServiceStructurePage.css";

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

type AttributeType = "text" | "number" | "boolean" | "select";
type ExtraInputType = "CHECKBOX" | "REQUIRED";

type TranslateFn = (key: string, variables?: Record<string, string>) => string;

function getFuelOptions(t: TranslateFn) {
    return [
        {
            label: t("admin.structure.preset.fuel_option.gasoline"),
            value: "essence",
            sortOrder: 0,
        },
        {
            label: t("admin.structure.preset.fuel_option.diesel"),
            value: "diesel",
            sortOrder: 1,
        },
        {
            label: t("admin.structure.preset.fuel_option.electric"),
            value: "electrique",
            sortOrder: 2,
        },
        {
            label: t("admin.structure.preset.fuel_option.hybrid"),
            value: "hybride",
            sortOrder: 3,
        },
    ];
}

function getDefaultBoatStructure(t: TranslateFn) {
    return {
        category: {
            serviceType: ServiceCategoryNames.BATEAU,
            name: t("admin.structure.preset.boat_category.name"),
            slug: "location-de-bateaux",
            description: t("admin.structure.preset.boat_category.description"),
            isActive: true,
            sortOrder: 0,
        },
        subcategories: [
            {
                name: t("admin.structure.preset.boat_subcategory.jet_ski"),
                slug: "jet-ski",
                sortOrder: 0,
            },
            {
                name: t(
                    "admin.structure.preset.boat_subcategory.rental_with_or_without_license",
                ),
                slug: "location-bateau-avec-sans-permis",
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.boat_subcategory.yacht"),
                slug: "yacht",
                sortOrder: 2,
            },
            {
                name: t("admin.structure.preset.boat_subcategory.catamaran"),
                slug: "catamaran",
                sortOrder: 3,
            },
        ],
    };
}

function getDefaultCarStructure(t: TranslateFn) {
    return {
        category: {
            serviceType: ServiceCategoryNames.VOITURE,
            name: t("admin.structure.preset.car_category.name"),
            slug: "location-de-voitures",
            description: t("admin.structure.preset.car_category.description"),
            isActive: true,
            sortOrder: 0,
        },
        subcategories: [
            { name: "SUV", slug: "suv", sortOrder: 0 },
            {
                name: t("admin.structure.preset.car_subcategory.luxury"),
                slug: "luxe",
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.car_subcategory.electric"),
                slug: "electrique",
                sortOrder: 2,
            },
            {
                name: t("admin.structure.preset.car_subcategory.city_car"),
                slug: "citadine",
                sortOrder: 3,
            },
        ],
    };
}

function getDefaultAccommodationStructure(t: TranslateFn) {
    return {
        category: {
            serviceType: ServiceCategoryNames.HEBERGEMENT,
            name: t("admin.structure.preset.stay_category.name"),
            slug: "locations-et-hebergements",
            description: t("admin.structure.preset.stay_category.description"),
            isActive: true,
            sortOrder: 0,
        },
        subcategories: [
            {
                name: t("admin.structure.preset.stay_subcategory.villa"),
                slug: "villa",
                sortOrder: 0,
            },
            {
                name: t("admin.structure.preset.stay_subcategory.apartment"),
                slug: "appartement",
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.stay_subcategory.hotel"),
                slug: "hotel",
                sortOrder: 2,
            },
            {
                name: t("admin.structure.preset.stay_subcategory.house"),
                slug: "maison",
                sortOrder: 3,
            },
        ],
    };
}

function getDefaultAttributePresets(t: TranslateFn): Record<
    (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames],
    Array<{
        label: string;
        key: string;
        type: AttributeType;
        isRequired: boolean;
        isFilterable: boolean;
        sortOrder: number;
        options?: Array<{ label: string; value: string; sortOrder: number }>;
    }>
> {
    return {
        ACTIVITE: [],
        BATEAU: [
            {
                label: t("admin.structure.preset.attribute.boat.length"),
                key: "longueur_m",
                type: "number",
                isRequired: false,
                isFilterable: true,
                sortOrder: 0,
            },
            {
                label: t("admin.structure.preset.attribute.boat.cabins"),
                key: "cabines",
                type: "number",
                isRequired: false,
                isFilterable: true,
                sortOrder: 1,
            },
            {
                label: t("admin.structure.preset.attribute.boat.speed"),
                key: "vitesse",
                type: "text",
                isRequired: false,
                isFilterable: true,
                sortOrder: 2,
            },
            {
                label: t("admin.structure.preset.attribute.shared.fuel"),
                key: "carburant",
                type: "select",
                isRequired: false,
                isFilterable: true,
                sortOrder: 3,
                options: getFuelOptions(t),
            },
        ],
        VOITURE: [
            {
                label: t("admin.structure.preset.attribute.car.transmission"),
                key: "transmission",
                type: "select",
                isRequired: false,
                isFilterable: true,
                sortOrder: 0,
                options: [
                    {
                        label: t(
                            "admin.structure.preset.transmission_option.automatic",
                        ),
                        value: "automatique",
                        sortOrder: 0,
                    },
                    {
                        label: t(
                            "admin.structure.preset.transmission_option.manual",
                        ),
                        value: "manuelle",
                        sortOrder: 1,
                    },
                ],
            },
            {
                label: t("admin.structure.preset.attribute.shared.fuel"),
                key: "carburant",
                type: "select",
                isRequired: false,
                isFilterable: true,
                sortOrder: 1,
                options: getFuelOptions(t),
            },
            {
                label: t("admin.structure.preset.attribute.car.doors"),
                key: "portes",
                type: "number",
                isRequired: false,
                isFilterable: true,
                sortOrder: 2,
            },
            {
                label: t(
                    "admin.structure.preset.attribute.car.air_conditioning",
                ),
                key: "climatisation",
                type: "boolean",
                isRequired: false,
                isFilterable: true,
                sortOrder: 3,
            },
        ],
        HEBERGEMENT: [
            {
                label: t("admin.structure.preset.attribute.stay.bedrooms"),
                key: "chambres",
                type: "number",
                isRequired: false,
                isFilterable: true,
                sortOrder: 0,
            },
            {
                label: t("admin.structure.preset.attribute.stay.bathrooms"),
                key: "salles_de_bain",
                type: "number",
                isRequired: false,
                isFilterable: true,
                sortOrder: 1,
            },
            {
                label: t("admin.structure.preset.attribute.stay.wifi"),
                key: "wifi",
                type: "boolean",
                isRequired: false,
                isFilterable: true,
                sortOrder: 2,
            },
            {
                label: t("admin.structure.preset.attribute.stay.pool"),
                key: "piscine",
                type: "boolean",
                isRequired: false,
                isFilterable: true,
                sortOrder: 3,
            },
        ],
    };
}

function getDefaultExtraPresets(t: TranslateFn): Record<
    (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames],
    Array<{
        name: string;
        description: string;
        defaultPrice: number;
        inputType: ExtraInputType;
        isRequired: boolean;
        isActive: boolean;
        sortOrder: number;
    }>
> {
    return {
        ACTIVITE: [],
        BATEAU: [
            {
                name: t("admin.structure.preset.extra.boat.skipper.name"),
                description: t(
                    "admin.structure.preset.extra.boat.skipper.description",
                ),
                defaultPrice: 150,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 0,
            },
            {
                name: t("admin.structure.preset.extra.boat.fuel.name"),
                description: t(
                    "admin.structure.preset.extra.boat.fuel.description",
                ),
                defaultPrice: 80,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.extra.boat.towels.name"),
                description: t(
                    "admin.structure.preset.extra.boat.towels.description",
                ),
                defaultPrice: 20,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 2,
            },
        ],
        VOITURE: [
            {
                name: t("admin.structure.preset.extra.car.driver.name"),
                description: t(
                    "admin.structure.preset.extra.car.driver.description",
                ),
                defaultPrice: 120,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 0,
            },
            {
                name: t("admin.structure.preset.extra.car.delivery.name"),
                description: t(
                    "admin.structure.preset.extra.car.delivery.description",
                ),
                defaultPrice: 40,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.extra.car.child_seat.name"),
                description: t(
                    "admin.structure.preset.extra.car.child_seat.description",
                ),
                defaultPrice: 15,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 2,
            },
        ],
        HEBERGEMENT: [
            {
                name: t(
                    "admin.structure.preset.extra.stay.final_cleaning.name",
                ),
                description: t(
                    "admin.structure.preset.extra.stay.final_cleaning.description",
                ),
                defaultPrice: 60,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 0,
            },
            {
                name: t("admin.structure.preset.extra.stay.breakfast.name"),
                description: t(
                    "admin.structure.preset.extra.stay.breakfast.description",
                ),
                defaultPrice: 18,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 1,
            },
            {
                name: t("admin.structure.preset.extra.stay.late_checkout.name"),
                description: t(
                    "admin.structure.preset.extra.stay.late_checkout.description",
                ),
                defaultPrice: 35,
                inputType: "CHECKBOX",
                isRequired: false,
                isActive: true,
                sortOrder: 2,
            },
        ],
    };
}

interface CategoryFormState {
    serviceType: (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames];
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    sortOrder: string;
}

interface SubcategoryFormState {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    sortOrder: string;
}

interface AttributeFormState {
    label: string;
    key: string;
    type: AttributeType;
    isRequired: boolean;
    isFilterable: boolean;
    sortOrder: string;
    optionsText: string;
}

interface ExtraFormState {
    name: string;
    description: string;
    defaultPrice: string;
    inputType: ExtraInputType;
    isRequired: boolean;
    isActive: boolean;
    sortOrder: string;
}

const defaultCategoryForm = (): CategoryFormState => ({
    serviceType: ServiceCategoryNames.BATEAU,
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: "0",
});

const defaultSubcategoryForm = (): SubcategoryFormState => ({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: "0",
});

const defaultAttributeForm = (): AttributeFormState => ({
    label: "",
    key: "",
    type: "text",
    isRequired: false,
    isFilterable: true,
    sortOrder: "0",
    optionsText: "",
});

const defaultExtraForm = (): ExtraFormState => ({
    name: "",
    description: "",
    defaultPrice: "0",
    inputType: "CHECKBOX",
    isRequired: false,
    isActive: true,
    sortOrder: "0",
});

function parseOptions(optionsText: string) {
    return optionsText
        .split("\n")
        .map((line, index) => {
            const [label, value] = line.split(":").map((entry) => entry.trim());

            if (!label || !value) {
                return null;
            }

            return { label, value, sortOrder: index };
        })
        .filter(Boolean) as Array<{
        label: string;
        value: string;
        sortOrder: number;
    }>;
}

export const AdminServiceStructurePage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t } = useTranslation();
    const { categories, isLoading } = useServiceStructureData();
    const createCategory = useCreateServiceCategoryData();
    const updateCategory = useUpdateServiceCategoryData();
    const deleteCategory = useDeleteServiceCategoryData();
    const createSubcategory = useCreateServiceSubcategoryData();
    const updateSubcategory = useUpdateServiceSubcategoryData();
    const deleteSubcategory = useDeleteServiceSubcategoryData();
    const createAttribute = useCreateServiceAttributeData();
    const updateAttribute = useUpdateServiceAttributeData();
    const deleteAttribute = useDeleteServiceAttributeData();
    const createExtra = useCreateServiceExtraData();
    const updateExtra = useUpdateServiceExtraData();
    const deleteExtra = useDeleteServiceExtraData();

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null,
    );
    const [editingSubcategoryId, setEditingSubcategoryId] = useState<
        string | null
    >(null);
    const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
        null,
    );
    const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
    const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
    const [subcategoryForm, setSubcategoryForm] = useState(
        defaultSubcategoryForm,
    );
    const [attributeForm, setAttributeForm] = useState(defaultAttributeForm);
    const [extraForm, setExtraForm] = useState(defaultExtraForm);

    const defaultBoatStructure = useMemo(() => getDefaultBoatStructure(t), [t]);
    const defaultCarStructure = useMemo(() => getDefaultCarStructure(t), [t]);
    const defaultAccommodationStructure = useMemo(
        () => getDefaultAccommodationStructure(t),
        [t],
    );
    const defaultAttributePresets = useMemo(
        () => getDefaultAttributePresets(t),
        [t],
    );
    const defaultExtraPresets = useMemo(() => getDefaultExtraPresets(t), [t]);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (!selectedCategoryId && categories[0]) {
            setSelectedCategoryId(categories[0].id);
        }

        if (
            selectedCategoryId &&
            !categories.some((category) => category.id === selectedCategoryId)
        ) {
            setSelectedCategoryId(categories[0]?.id ?? "");
        }
    }, [categories, selectedCategoryId]);

    const selectedCategory = useMemo(
        () =>
            categories.find((category) => category.id === selectedCategoryId) ??
            null,
        [categories, selectedCategoryId],
    );

    const getAttributeTypeLabel = (type: AttributeType) => {
        switch (type) {
            case "text":
                return t("admin.structure.type.text");
            case "number":
                return t("admin.structure.type.number");
            case "boolean":
                return t("admin.structure.type.boolean");
            case "select":
                return t("admin.structure.type.select");
            default:
                return type;
        }
    };

    const getExtraInputTypeLabel = (type: ExtraInputType) => {
        switch (type) {
            case "CHECKBOX":
                return t("admin.structure.extra_type.optional");
            case "REQUIRED":
                return t("admin.structure.extra_type.required");
            default:
                return type;
        }
    };

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    function resetCategoryForm() {
        setEditingCategoryId(null);
        setCategoryForm(defaultCategoryForm());
    }

    function resetSubcategoryForm() {
        setEditingSubcategoryId(null);
        setSubcategoryForm(defaultSubcategoryForm());
    }

    function resetAttributeForm() {
        setEditingAttributeId(null);
        setAttributeForm(defaultAttributeForm());
    }

    function resetExtraForm() {
        setEditingExtraId(null);
        setExtraForm(defaultExtraForm());
    }

    function beginEditCategory(category: ServiceCategoryDefinition) {
        setEditingCategoryId(category.id);
        setCategoryForm({
            serviceType: category.serviceType,
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            isActive: category.isActive,
            sortOrder: String(category.sortOrder),
        });
    }

    function beginEditSubcategory(subcategory: ServiceSubcategoryDefinition) {
        setEditingSubcategoryId(subcategory.id);
        setSubcategoryForm({
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description ?? "",
            isActive: subcategory.isActive,
            sortOrder: String(subcategory.sortOrder),
        });
    }

    function beginEditAttribute(attribute: ServiceAttributeDefinition) {
        setEditingAttributeId(attribute.id);
        setAttributeForm({
            label: attribute.label,
            key: attribute.key,
            type: attribute.type,
            isRequired: attribute.isRequired,
            isFilterable: attribute.isFilterable,
            sortOrder: String(attribute.sortOrder),
            optionsText: attribute.options
                .map((option) => `${option.label}: ${option.value}`)
                .join("\n"),
        });
    }

    function beginEditExtra(extra: ServiceExtraDefinition) {
        setEditingExtraId(extra.id);
        setExtraForm({
            name: extra.name,
            description: extra.description ?? "",
            defaultPrice: String(extra.defaultPrice),
            inputType: extra.inputType,
            isRequired: extra.isRequired,
            isActive: extra.isActive,
            sortOrder: String(extra.sortOrder),
        });
    }

    async function handleCategorySubmit(event: React.FormEvent) {
        event.preventDefault();

        try {
            const payload = {
                serviceType: categoryForm.serviceType,
                name: categoryForm.name.trim(),
                slug: categoryForm.slug.trim() || undefined,
                description: categoryForm.description.trim() || undefined,
                isActive: categoryForm.isActive,
                sortOrder: Number(categoryForm.sortOrder || 0),
            };

            if (editingCategoryId) {
                await updateCategory.mutateAsync({
                    id: editingCategoryId,
                    payload,
                });
                success(t("admin.structure.toast.category_updated"));
            } else {
                const created = await createCategory.mutateAsync(payload);
                setSelectedCategoryId(created.id);
                success(t("admin.structure.toast.category_created"));
            }

            resetCategoryForm();
        } catch {
            error(t("admin.structure.toast.category_save_error"));
        }
    }

    async function handleSubcategorySubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error(t("admin.structure.error.select_category"));

            return;
        }

        try {
            const payload = {
                serviceCategoryId: selectedCategory.id,
                name: subcategoryForm.name.trim(),
                slug: subcategoryForm.slug.trim() || undefined,
                description: subcategoryForm.description.trim() || undefined,
                isActive: subcategoryForm.isActive,
                sortOrder: Number(subcategoryForm.sortOrder || 0),
            };

            if (editingSubcategoryId) {
                await updateSubcategory.mutateAsync({
                    id: editingSubcategoryId,
                    payload,
                });
                success(t("admin.structure.toast.subcategory_updated"));
            } else {
                await createSubcategory.mutateAsync(payload);
                success(t("admin.structure.toast.subcategory_created"));
            }

            resetSubcategoryForm();
        } catch {
            error(t("admin.structure.toast.subcategory_save_error"));
        }
    }

    async function handleAttributeSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error(t("admin.structure.error.select_category"));

            return;
        }

        try {
            const payload = {
                serviceCategoryId: selectedCategory.id,
                label: attributeForm.label.trim(),
                key: attributeForm.key.trim(),
                type: attributeForm.type,
                isRequired: attributeForm.isRequired,
                isFilterable: attributeForm.isFilterable,
                sortOrder: Number(attributeForm.sortOrder || 0),
                options:
                    attributeForm.type === "select"
                        ? parseOptions(attributeForm.optionsText)
                        : [],
            };

            if (editingAttributeId) {
                await updateAttribute.mutateAsync({
                    id: editingAttributeId,
                    payload,
                });
                success(t("admin.structure.toast.attribute_updated"));
            } else {
                await createAttribute.mutateAsync(payload);
                success(t("admin.structure.toast.attribute_created"));
            }

            resetAttributeForm();
        } catch {
            error(t("admin.structure.toast.attribute_save_error"));
        }
    }

    async function handleExtraSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error(t("admin.structure.error.select_category"));

            return;
        }

        try {
            const payload = {
                serviceCategoryId: selectedCategory.id,
                name: extraForm.name.trim(),
                description: extraForm.description.trim() || undefined,
                defaultPrice: Number(extraForm.defaultPrice || 0),
                inputType: extraForm.inputType,
                isRequired: extraForm.isRequired,
                isActive: extraForm.isActive,
                sortOrder: Number(extraForm.sortOrder || 0),
            };

            if (editingExtraId) {
                await updateExtra.mutateAsync({ id: editingExtraId, payload });
                success(t("admin.structure.toast.extra_updated"));
            } else {
                await createExtra.mutateAsync(payload);
                success(t("admin.structure.toast.extra_created"));
            }

            resetExtraForm();
        } catch {
            error(t("admin.structure.toast.extra_save_error"));
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!window.confirm(t("admin.structure.confirm.delete_category"))) {
            return;
        }

        try {
            await deleteCategory.mutateAsync(id);
            success(t("admin.structure.toast.category_deleted"));
        } catch {
            error(t("admin.structure.toast.delete_error"));
        }
    }

    async function handleDeleteSubcategory(id: string) {
        if (!window.confirm(t("admin.structure.confirm.delete_subcategory"))) {
            return;
        }

        try {
            await deleteSubcategory.mutateAsync(id);
            success(t("admin.structure.toast.subcategory_deleted"));
        } catch {
            error(t("admin.structure.toast.delete_error"));
        }
    }

    async function handleDeleteAttribute(id: string) {
        if (!window.confirm(t("admin.structure.confirm.delete_attribute"))) {
            return;
        }

        try {
            await deleteAttribute.mutateAsync(id);
            success(t("admin.structure.toast.attribute_deleted"));
        } catch {
            error(t("admin.structure.toast.delete_error"));
        }
    }

    async function handleDeleteExtra(id: string) {
        if (!window.confirm(t("admin.structure.confirm.delete_extra"))) {
            return;
        }

        try {
            await deleteExtra.mutateAsync(id);
            success(t("admin.structure.toast.extra_deleted"));
        } catch {
            error(t("admin.structure.toast.delete_error"));
        }
    }

    async function applyStructurePreset(
        preset: {
            category: {
                serviceType: (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames];
                name: string;
                slug: string;
                description: string;
                isActive: boolean;
                sortOrder: number;
            };
            subcategories: Array<{
                name: string;
                slug: string;
                sortOrder: number;
            }>;
        },
        successMessage: string,
    ) {
        const existingCategory = categories.find(
            (category) =>
                category.serviceType === preset.category.serviceType &&
                category.slug === preset.category.slug,
        );

        if (existingCategory) {
            setSelectedCategoryId(existingCategory.id);
            error(t("admin.structure.error.preset_exists"));
            return;
        }

        try {
            const createdCategory = await createCategory.mutateAsync(
                preset.category,
            );

            for (const subcategory of preset.subcategories) {
                await createSubcategory.mutateAsync({
                    serviceCategoryId: createdCategory.id,
                    name: subcategory.name,
                    slug: subcategory.slug,
                    sortOrder: subcategory.sortOrder,
                    isActive: true,
                });
            }

            setSelectedCategoryId(createdCategory.id);
            success(successMessage);
        } catch {
            error(t("admin.structure.error.preset_apply"));
        }
    }

    async function applyAttributePreset() {
        if (!selectedCategory) {
            error(t("admin.structure.error.select_category"));
            return;
        }

        const preset = defaultAttributePresets[selectedCategory.serviceType];

        if (!preset || preset.length === 0) {
            error(t("admin.structure.error.no_attribute_preset"));
            return;
        }

        const existingKeys = new Set(
            selectedCategory.attributes.map((attribute) => attribute.key),
        );
        const missingAttributes = preset.filter(
            (attribute) => !existingKeys.has(attribute.key),
        );

        if (missingAttributes.length === 0) {
            error(t("admin.structure.error.attributes_exist"));
            return;
        }

        try {
            for (const attribute of missingAttributes) {
                await createAttribute.mutateAsync({
                    serviceCategoryId: selectedCategory.id,
                    label: attribute.label,
                    key: attribute.key,
                    type: attribute.type,
                    isRequired: attribute.isRequired,
                    isFilterable: attribute.isFilterable,
                    sortOrder: attribute.sortOrder,
                    options: attribute.options ?? [],
                });
            }

            success(t("admin.structure.toast.attributes_added"));
        } catch {
            error(t("admin.structure.error.attributes_add"));
        }
    }

    async function applyExtraPreset() {
        if (!selectedCategory) {
            error(t("admin.structure.error.select_category"));
            return;
        }

        const preset = defaultExtraPresets[selectedCategory.serviceType];

        if (!preset || preset.length === 0) {
            error(t("admin.structure.error.no_extra_preset"));
            return;
        }

        const existingNames = new Set(
            selectedCategory.extras.map((extra) => extra.name.toLowerCase()),
        );
        const missingExtras = preset.filter(
            (extra) => !existingNames.has(extra.name.toLowerCase()),
        );

        if (missingExtras.length === 0) {
            error(t("admin.structure.error.extras_exist"));
            return;
        }

        try {
            for (const extra of missingExtras) {
                await createExtra.mutateAsync({
                    serviceCategoryId: selectedCategory.id,
                    name: extra.name,
                    description: extra.description,
                    defaultPrice: extra.defaultPrice,
                    inputType: extra.inputType,
                    isRequired: extra.isRequired,
                    isActive: extra.isActive,
                    sortOrder: extra.sortOrder,
                });
            }

            success(t("admin.structure.toast.extras_added"));
        } catch {
            error(t("admin.structure.error.extras_add"));
        }
    }

    return (
        <div className="wdr-admin-structure">
            <section className="wdr-admin-structure__hero">
                <div>
                    <p className="wdr-admin-structure__eyebrow">
                        {t("admin.structure.eyebrow")}
                    </p>
                    <h1>{t("admin.structure.title")}</h1>
                    <p>{t("admin.structure.subtitle")}</p>
                </div>
                <div className="wdr-admin-structure__hero-actions">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                defaultBoatStructure,
                                t("admin.structure.preset.boats_created"),
                            )
                        }
                    >
                        {t("admin.structure.preset.boats")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                defaultCarStructure,
                                t("admin.structure.preset.cars_created"),
                            )
                        }
                    >
                        {t("admin.structure.preset.cars")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                defaultAccommodationStructure,
                                t("admin.structure.preset.stays_created"),
                            )
                        }
                    >
                        {t("admin.structure.preset.stays")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ name: "admin-services" })}
                    >
                        {t("admin.structure.back_catalog")}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate({ name: "admin-service-form" })}
                    >
                        {t("admin.structure.create_service")}
                    </Button>
                </div>
            </section>

            <AdminSectionNav active="structure" />

            <div className="wdr-admin-structure__layout">
                <aside className="wdr-admin-structure__sidebar">
                    <div className="wdr-admin-structure__panel">
                        <div className="wdr-admin-structure__panel-header">
                            <h2>{t("admin.structure.categories")}</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetCategoryForm}
                            >
                                {t("admin.structure.new")}
                            </Button>
                        </div>
                        <div className="wdr-admin-structure__category-list">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`wdr-admin-structure__category-card${selectedCategoryId === category.id ? " wdr-admin-structure__category-card--active" : ""}`}
                                    onClick={() =>
                                        setSelectedCategoryId(category.id)
                                    }
                                >
                                    <strong>{category.name}</strong>
                                    <span>
                                        {
                                            ServiceCategoryLabels[
                                                category.serviceType
                                            ]
                                        }
                                    </span>
                                    <small>
                                        {t(
                                            "admin.structure.subcategories_count",
                                        )
                                            .replace(
                                                "{count}",
                                                String(
                                                    category.subcategories
                                                        .length,
                                                ),
                                            )
                                            .replace(
                                                "{attributes}",
                                                String(
                                                    category.attributes.length,
                                                ),
                                            )}
                                    </small>
                                </button>
                            ))}
                            {!isLoading && categories.length === 0 && (
                                <p className="wdr-admin-structure__empty">
                                    {t("admin.structure.empty_categories")}
                                </p>
                            )}
                        </div>
                    </div>

                    <form
                        className="wdr-admin-structure__panel"
                        onSubmit={handleCategorySubmit}
                    >
                        <div className="wdr-admin-structure__panel-header">
                            <h2>
                                {editingCategoryId
                                    ? t("admin.structure.edit_category")
                                    : t("admin.structure.new_category")}
                            </h2>
                            {editingCategoryId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={resetCategoryForm}
                                >
                                    {t("admin.structure.cancel")}
                                </Button>
                            )}
                        </div>
                        <label className="wdr-admin-structure__label">
                            {t("admin.structure.label.service_type")}
                            <Select
                                value={categoryForm.serviceType}
                                options={CATEGORY_OPTIONS}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        serviceType: event.target
                                            .value as CategoryFormState["serviceType"],
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__label">
                            {t("admin.structure.label.name")}
                            <Input
                                value={categoryForm.name}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__label">
                            {t("admin.structure.label.slug")}
                            <Input
                                value={categoryForm.slug}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        slug: event.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__label">
                            {t("admin.structure.label.description")}
                            <textarea
                                className="wdr-admin-structure__textarea"
                                rows={3}
                                value={categoryForm.description}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__label">
                            {t("admin.structure.label.order")}
                            <Input
                                type="number"
                                value={categoryForm.sortOrder}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        sortOrder: event.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__check">
                            <input
                                type="checkbox"
                                checked={categoryForm.isActive}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        isActive: event.target.checked,
                                    }))
                                }
                            />
                            {t("admin.structure.category_active")}
                        </label>
                        <div className="wdr-admin-structure__actions">
                            {editingCategoryId && selectedCategory && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() =>
                                        void handleDeleteCategory(
                                            selectedCategory.id,
                                        )
                                    }
                                >
                                    {t("admin.structure.delete")}
                                </Button>
                            )}
                            <Button type="submit" variant="primary">
                                {editingCategoryId
                                    ? t("admin.structure.update")
                                    : t("admin.structure.create")}
                            </Button>
                        </div>
                    </form>
                </aside>
                <section className="wdr-admin-structure__content">
                    {!selectedCategory ? (
                        <div className="wdr-admin-structure__panel">
                            <p className="wdr-admin-structure__empty">
                                {t("admin.structure.select_category_manage")}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="wdr-admin-structure__panel">
                                <div className="wdr-admin-structure__panel-header">
                                    <div>
                                        <h2>{selectedCategory.name}</h2>
                                        <p className="wdr-admin-structure__panel-subtitle">
                                            {
                                                ServiceCategoryLabels[
                                                    selectedCategory.serviceType
                                                ]
                                            }{" "}
                                            · {selectedCategory.slug}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            beginEditCategory(selectedCategory)
                                        }
                                    >
                                        {t(
                                            "admin.structure.edit_category_short",
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            void applyAttributePreset()
                                        }
                                    >
                                        {t("admin.structure.preset_attributes")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void applyExtraPreset()}
                                    >
                                        {t("admin.structure.preset_extras")}
                                    </Button>
                                </div>
                                {selectedCategory.description && (
                                    <p className="wdr-admin-structure__description">
                                        {selectedCategory.description}
                                    </p>
                                )}
                            </div>

                            <div className="wdr-admin-structure__grid">
                                <form
                                    className="wdr-admin-structure__panel"
                                    onSubmit={handleSubcategorySubmit}
                                >
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>
                                            {editingSubcategoryId
                                                ? t(
                                                      "admin.structure.edit_subcategory",
                                                  )
                                                : t(
                                                      "admin.structure.subcategories",
                                                  )}
                                        </h2>
                                        {editingSubcategoryId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={resetSubcategoryForm}
                                            >
                                                {t("admin.structure.cancel")}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.subcategories.map(
                                            (subcategory) => (
                                                <div
                                                    key={subcategory.id}
                                                    className="wdr-admin-structure__item"
                                                >
                                                    <div>
                                                        <strong>
                                                            {subcategory.name}
                                                        </strong>
                                                        <span>
                                                            {subcategory.slug}
                                                        </span>
                                                    </div>
                                                    <div className="wdr-admin-structure__item-actions">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                beginEditSubcategory(
                                                                    subcategory,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.edit",
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                void handleDeleteSubcategory(
                                                                    subcategory.id,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.delete",
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.name")}
                                        <Input
                                            value={subcategoryForm.name}
                                            onChange={(event) =>
                                                setSubcategoryForm((prev) => ({
                                                    ...prev,
                                                    name: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.slug")}
                                        <Input
                                            value={subcategoryForm.slug}
                                            onChange={(event) =>
                                                setSubcategoryForm((prev) => ({
                                                    ...prev,
                                                    slug: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.description")}
                                        <textarea
                                            className="wdr-admin-structure__textarea"
                                            rows={3}
                                            value={subcategoryForm.description}
                                            onChange={(event) =>
                                                setSubcategoryForm((prev) => ({
                                                    ...prev,
                                                    description:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.order")}
                                        <Input
                                            type="number"
                                            value={subcategoryForm.sortOrder}
                                            onChange={(event) =>
                                                setSubcategoryForm((prev) => ({
                                                    ...prev,
                                                    sortOrder:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__check">
                                        <input
                                            type="checkbox"
                                            checked={subcategoryForm.isActive}
                                            onChange={(event) =>
                                                setSubcategoryForm((prev) => ({
                                                    ...prev,
                                                    isActive:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        {t(
                                            "admin.structure.subcategory_active",
                                        )}
                                    </label>
                                    <div className="wdr-admin-structure__actions">
                                        <Button type="submit" variant="primary">
                                            {editingSubcategoryId
                                                ? t("admin.structure.update")
                                                : t("admin.structure.add")}
                                        </Button>
                                    </div>
                                </form>

                                <form
                                    className="wdr-admin-structure__panel"
                                    onSubmit={handleAttributeSubmit}
                                >
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>
                                            {editingAttributeId
                                                ? t(
                                                      "admin.structure.edit_attribute",
                                                  )
                                                : t(
                                                      "admin.structure.attributes",
                                                  )}
                                        </h2>
                                        {editingAttributeId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={resetAttributeForm}
                                            >
                                                {t("admin.structure.cancel")}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.attributes.map(
                                            (attribute) => (
                                                <div
                                                    key={attribute.id}
                                                    className="wdr-admin-structure__item"
                                                >
                                                    <div>
                                                        <strong>
                                                            {attribute.label}
                                                        </strong>
                                                        <span>
                                                            {attribute.key} ·{" "}
                                                            {getAttributeTypeLabel(
                                                                attribute.type,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="wdr-admin-structure__item-actions">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                beginEditAttribute(
                                                                    attribute,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.edit",
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                void handleDeleteAttribute(
                                                                    attribute.id,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.delete",
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.label")}
                                        <Input
                                            value={attributeForm.label}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    label: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t(
                                            "admin.structure.label.technical_key",
                                        )}
                                        <Input
                                            value={attributeForm.key}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    key: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.type")}
                                        <Select
                                            value={attributeForm.type}
                                            options={[
                                                {
                                                    value: "text",
                                                    label: t(
                                                        "admin.structure.type.text",
                                                    ),
                                                },
                                                {
                                                    value: "number",
                                                    label: t(
                                                        "admin.structure.type.number",
                                                    ),
                                                },
                                                {
                                                    value: "boolean",
                                                    label: t(
                                                        "admin.structure.type.boolean",
                                                    ),
                                                },
                                                {
                                                    value: "select",
                                                    label: t(
                                                        "admin.structure.type.select",
                                                    ),
                                                },
                                            ]}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    type: event.target
                                                        .value as AttributeType,
                                                }))
                                            }
                                        />
                                    </label>
                                    {attributeForm.type === "select" && (
                                        <label className="wdr-admin-structure__label">
                                            {t("admin.structure.label.options")}
                                            <textarea
                                                className="wdr-admin-structure__textarea"
                                                rows={4}
                                                value={
                                                    attributeForm.optionsText
                                                }
                                                onChange={(event) =>
                                                    setAttributeForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            optionsText:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                placeholder={t(
                                                    "admin.structure.placeholder.options",
                                                )}
                                            />
                                        </label>
                                    )}
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.order")}
                                        <Input
                                            type="number"
                                            value={attributeForm.sortOrder}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    sortOrder:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__check">
                                        <input
                                            type="checkbox"
                                            checked={attributeForm.isRequired}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    isRequired:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        {t("admin.structure.required_field")}
                                    </label>
                                    <label className="wdr-admin-structure__check">
                                        <input
                                            type="checkbox"
                                            checked={attributeForm.isFilterable}
                                            onChange={(event) =>
                                                setAttributeForm((prev) => ({
                                                    ...prev,
                                                    isFilterable:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        {t("admin.structure.public_filter")}
                                    </label>
                                    <div className="wdr-admin-structure__actions">
                                        <Button type="submit" variant="primary">
                                            {editingAttributeId
                                                ? t("admin.structure.update")
                                                : t("admin.structure.add")}
                                        </Button>
                                    </div>
                                </form>

                                <form
                                    className="wdr-admin-structure__panel"
                                    onSubmit={handleExtraSubmit}
                                >
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>
                                            {editingExtraId
                                                ? t(
                                                      "admin.structure.edit_extra",
                                                  )
                                                : t("admin.structure.extras")}
                                        </h2>
                                        {editingExtraId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={resetExtraForm}
                                            >
                                                {t("admin.structure.cancel")}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.extras.map(
                                            (extra) => (
                                                <div
                                                    key={extra.id}
                                                    className="wdr-admin-structure__item"
                                                >
                                                    <div>
                                                        <strong>
                                                            {extra.name}
                                                        </strong>
                                                        <span>
                                                            {extra.defaultPrice.toFixed(
                                                                2,
                                                            )}{" "}
                                                            EUR -{" "}
                                                            {getExtraInputTypeLabel(
                                                                extra.inputType,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="wdr-admin-structure__item-actions">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                beginEditExtra(
                                                                    extra,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.edit",
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                void handleDeleteExtra(
                                                                    extra.id,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                "admin.structure.delete",
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.name")}
                                        <Input
                                            value={extraForm.name}
                                            onChange={(event) =>
                                                setExtraForm((prev) => ({
                                                    ...prev,
                                                    name: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.description")}
                                        <textarea
                                            className="wdr-admin-structure__textarea"
                                            rows={3}
                                            value={extraForm.description}
                                            onChange={(event) =>
                                                setExtraForm((prev) => ({
                                                    ...prev,
                                                    description:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <div className="wdr-admin-structure__two-cols">
                                        <label className="wdr-admin-structure__label">
                                            {t(
                                                "admin.structure.label.default_price",
                                            )}
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={extraForm.defaultPrice}
                                                onChange={(event) =>
                                                    setExtraForm((prev) => ({
                                                        ...prev,
                                                        defaultPrice:
                                                            event.target.value,
                                                    }))
                                                }
                                            />
                                        </label>
                                        <label className="wdr-admin-structure__label">
                                            {t("admin.structure.label.type")}
                                            <Select
                                                value={extraForm.inputType}
                                                options={[
                                                    {
                                                        value: "CHECKBOX",
                                                        label: t(
                                                            "admin.structure.extra_type.optional",
                                                        ),
                                                    },
                                                    {
                                                        value: "REQUIRED",
                                                        label: t(
                                                            "admin.structure.extra_type.required",
                                                        ),
                                                    },
                                                ]}
                                                onChange={(event) =>
                                                    setExtraForm((prev) => ({
                                                        ...prev,
                                                        inputType: event.target
                                                            .value as ExtraInputType,
                                                    }))
                                                }
                                            />
                                        </label>
                                    </div>
                                    <label className="wdr-admin-structure__label">
                                        {t("admin.structure.label.order")}
                                        <Input
                                            type="number"
                                            value={extraForm.sortOrder}
                                            onChange={(event) =>
                                                setExtraForm((prev) => ({
                                                    ...prev,
                                                    sortOrder:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="wdr-admin-structure__check">
                                        <input
                                            type="checkbox"
                                            checked={extraForm.isRequired}
                                            onChange={(event) =>
                                                setExtraForm((prev) => ({
                                                    ...prev,
                                                    isRequired:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        {t("admin.structure.extra_required")}
                                    </label>
                                    <label className="wdr-admin-structure__check">
                                        <input
                                            type="checkbox"
                                            checked={extraForm.isActive}
                                            onChange={(event) =>
                                                setExtraForm((prev) => ({
                                                    ...prev,
                                                    isActive:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        {t("admin.structure.extra_active")}
                                    </label>
                                    <div className="wdr-admin-structure__actions">
                                        <Button type="submit" variant="primary">
                                            {editingExtraId
                                                ? t("admin.structure.update")
                                                : t("admin.structure.add")}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminServiceStructurePage;
