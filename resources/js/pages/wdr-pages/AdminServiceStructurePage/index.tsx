import React, { useEffect, useMemo, useState } from 'react';
import { AdminSectionNav, Button, Input, Select, useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
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
} from '@/hooks/useServiceStructureData';
import { useRouter } from '@/hooks/useWdrRouter';
import {
    ServiceCategoryLabels,
    ServiceCategoryNames,
    type ServiceAttributeDefinition,
    type ServiceCategoryDefinition,
    type ServiceExtraDefinition,
    type ServiceSubcategoryDefinition,
} from '@/types/service';
import './AdminServiceStructurePage.css';

const CATEGORY_OPTIONS = [
    { value: ServiceCategoryNames.ACTIVITE, label: ServiceCategoryLabels.ACTIVITE },
    { value: ServiceCategoryNames.BATEAU, label: ServiceCategoryLabels.BATEAU },
    { value: ServiceCategoryNames.HEBERGEMENT, label: ServiceCategoryLabels.HEBERGEMENT },
    { value: ServiceCategoryNames.VOITURE, label: ServiceCategoryLabels.VOITURE },
];

const DEFAULT_BOAT_STRUCTURE = {
    category: {
        serviceType: ServiceCategoryNames.BATEAU,
        name: 'Location de bateaux',
        slug: 'location-de-bateaux',
        description:
            'Structure par defaut pour les offres nautiques et la location de bateaux.',
        isActive: true,
        sortOrder: 0,
    },
    subcategories: [
        { name: 'Jet ski', slug: 'jet-ski', sortOrder: 0 },
        {
            name: 'Location bateau (avec / sans permis)',
            slug: 'location-bateau-avec-sans-permis',
            sortOrder: 1,
        },
        { name: 'Yacht', slug: 'yacht', sortOrder: 2 },
        { name: 'Catamaran', slug: 'catamaran', sortOrder: 3 },
    ],
};

const DEFAULT_CAR_STRUCTURE = {
    category: {
        serviceType: ServiceCategoryNames.VOITURE,
        name: 'Location de voitures',
        slug: 'location-de-voitures',
        description:
            'Structure par defaut pour la location de voitures et vehicules.',
        isActive: true,
        sortOrder: 0,
    },
    subcategories: [
        { name: 'SUV', slug: 'suv', sortOrder: 0 },
        { name: 'Luxe', slug: 'luxe', sortOrder: 1 },
        { name: 'Electrique', slug: 'electrique', sortOrder: 2 },
        { name: 'Citadine', slug: 'citadine', sortOrder: 3 },
    ],
};

const DEFAULT_ACCOMMODATION_STRUCTURE = {
    category: {
        serviceType: ServiceCategoryNames.HEBERGEMENT,
        name: 'Locations et hebergements',
        slug: 'locations-et-hebergements',
        description:
            'Structure par defaut pour les villas, appartements et hotels.',
        isActive: true,
        sortOrder: 0,
    },
    subcategories: [
        { name: 'Villa', slug: 'villa', sortOrder: 0 },
        { name: 'Appartement', slug: 'appartement', sortOrder: 1 },
        { name: 'Hotel', slug: 'hotel', sortOrder: 2 },
        { name: 'Maison', slug: 'maison', sortOrder: 3 },
    ],
};

const DEFAULT_ATTRIBUTE_PRESETS: Record<
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
> = {
    ACTIVITE: [],
    BATEAU: [
        {
            label: 'Longueur (m)',
            key: 'longueur_m',
            type: 'number',
            isRequired: false,
            isFilterable: true,
            sortOrder: 0,
        },
        {
            label: 'Cabines',
            key: 'cabines',
            type: 'number',
            isRequired: false,
            isFilterable: true,
            sortOrder: 1,
        },
        {
            label: 'Vitesse',
            key: 'vitesse',
            type: 'text',
            isRequired: false,
            isFilterable: true,
            sortOrder: 2,
        },
        {
            label: 'Carburant',
            key: 'carburant',
            type: 'select',
            isRequired: false,
            isFilterable: true,
            sortOrder: 3,
            options: [
                { label: 'Essence', value: 'essence', sortOrder: 0 },
                { label: 'Diesel', value: 'diesel', sortOrder: 1 },
                { label: 'Electrique', value: 'electrique', sortOrder: 2 },
                { label: 'Hybride', value: 'hybride', sortOrder: 3 },
            ],
        },
    ],
    VOITURE: [
        {
            label: 'Transmission',
            key: 'transmission',
            type: 'select',
            isRequired: false,
            isFilterable: true,
            sortOrder: 0,
            options: [
                { label: 'Automatique', value: 'automatique', sortOrder: 0 },
                { label: 'Manuelle', value: 'manuelle', sortOrder: 1 },
            ],
        },
        {
            label: 'Carburant',
            key: 'carburant',
            type: 'select',
            isRequired: false,
            isFilterable: true,
            sortOrder: 1,
            options: [
                { label: 'Essence', value: 'essence', sortOrder: 0 },
                { label: 'Diesel', value: 'diesel', sortOrder: 1 },
                { label: 'Electrique', value: 'electrique', sortOrder: 2 },
                { label: 'Hybride', value: 'hybride', sortOrder: 3 },
            ],
        },
        {
            label: 'Nombre de portes',
            key: 'portes',
            type: 'number',
            isRequired: false,
            isFilterable: true,
            sortOrder: 2,
        },
        {
            label: 'Climatisation',
            key: 'climatisation',
            type: 'boolean',
            isRequired: false,
            isFilterable: true,
            sortOrder: 3,
        },
    ],
    HEBERGEMENT: [
        {
            label: 'Chambres',
            key: 'chambres',
            type: 'number',
            isRequired: false,
            isFilterable: true,
            sortOrder: 0,
        },
        {
            label: 'Salles de bain',
            key: 'salles_de_bain',
            type: 'number',
            isRequired: false,
            isFilterable: true,
            sortOrder: 1,
        },
        {
            label: 'WiFi',
            key: 'wifi',
            type: 'boolean',
            isRequired: false,
            isFilterable: true,
            sortOrder: 2,
        },
        {
            label: 'Piscine',
            key: 'piscine',
            type: 'boolean',
            isRequired: false,
            isFilterable: true,
            sortOrder: 3,
        },
    ],
};

const DEFAULT_EXTRA_PRESETS: Record<
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
> = {
    ACTIVITE: [],
    BATEAU: [
        {
            name: 'Skipper',
            description: 'Skipper professionnel pour accompagner la sortie.',
            defaultPrice: 150,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 0,
        },
        {
            name: 'Carburant',
            description: 'Forfait carburant pour la sortie.',
            defaultPrice: 80,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 1,
        },
        {
            name: 'Serviettes',
            description: 'Pack serviettes et accueil a bord.',
            defaultPrice: 20,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 2,
        },
    ],
    VOITURE: [
        {
            name: 'Chauffeur',
            description: 'Option chauffeur prive.',
            defaultPrice: 120,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 0,
        },
        {
            name: 'Livraison',
            description: 'Livraison du vehicule sur place.',
            defaultPrice: 40,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 1,
        },
        {
            name: 'Siege enfant',
            description: 'Siege enfant ou rehausseur.',
            defaultPrice: 15,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 2,
        },
    ],
    HEBERGEMENT: [
        {
            name: 'Menage final',
            description: 'Forfait menage de fin de sejour.',
            defaultPrice: 60,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 0,
        },
        {
            name: 'Petit-dejeuner',
            description: 'Petit-dejeuner pour le sejour.',
            defaultPrice: 18,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 1,
        },
        {
            name: 'Late check-out',
            description: 'Depart tardif selon disponibilite.',
            defaultPrice: 35,
            inputType: 'CHECKBOX',
            isRequired: false,
            isActive: true,
            sortOrder: 2,
        },
    ],
};

type AttributeType = 'text' | 'number' | 'boolean' | 'select';
type ExtraInputType = 'CHECKBOX' | 'REQUIRED';

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
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: '0',
});

const defaultSubcategoryForm = (): SubcategoryFormState => ({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: '0',
});

const defaultAttributeForm = (): AttributeFormState => ({
    label: '',
    key: '',
    type: 'text',
    isRequired: false,
    isFilterable: true,
    sortOrder: '0',
    optionsText: '',
});

const defaultExtraForm = (): ExtraFormState => ({
    name: '',
    description: '',
    defaultPrice: '0',
    inputType: 'CHECKBOX',
    isRequired: false,
    isActive: true,
    sortOrder: '0',
});

function parseOptions(optionsText: string) {
    return optionsText
        .split('\n')
        .map((line, index) => {
            const [label, value] = line.split(':').map((entry) => entry.trim());

            if (!label || !value) {
                return null;
            }

            return { label, value, sortOrder: index };
        })
        .filter(Boolean) as Array<{ label: string; value: string; sortOrder: number }>;
}

export const AdminServiceStructurePage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
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

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
    const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
    const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
    const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
    const [subcategoryForm, setSubcategoryForm] = useState(defaultSubcategoryForm);
    const [attributeForm, setAttributeForm] = useState(defaultAttributeForm);
    const [extraForm, setExtraForm] = useState(defaultExtraForm);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'ADMIN') {
            navigate({ name: 'dashboard' });
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
            setSelectedCategoryId(categories[0]?.id ?? '');
        }
    }, [categories, selectedCategoryId]);

    const selectedCategory = useMemo(
        () =>
            categories.find((category) => category.id === selectedCategoryId) ??
            null,
        [categories, selectedCategoryId],
    );

    if (!currentUser || currentUser.role !== 'ADMIN') {
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
            description: category.description ?? '',
            isActive: category.isActive,
            sortOrder: String(category.sortOrder),
        });
    }

    function beginEditSubcategory(subcategory: ServiceSubcategoryDefinition) {
        setEditingSubcategoryId(subcategory.id);
        setSubcategoryForm({
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description ?? '',
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
                .join('\n'),
        });
    }

    function beginEditExtra(extra: ServiceExtraDefinition) {
        setEditingExtraId(extra.id);
        setExtraForm({
            name: extra.name,
            description: extra.description ?? '',
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
                await updateCategory.mutateAsync({ id: editingCategoryId, payload });
                success('Categorie mise a jour.');
            } else {
                const created = await createCategory.mutateAsync(payload);
                setSelectedCategoryId(created.id);
                success('Categorie creee.');
            }

            resetCategoryForm();
        } catch {
            error('Impossible d enregistrer la categorie.');
        }
    }

    async function handleSubcategorySubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error('Selectionnez d abord une categorie.');

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
                success('Sous-categorie mise a jour.');
            } else {
                await createSubcategory.mutateAsync(payload);
                success('Sous-categorie creee.');
            }

            resetSubcategoryForm();
        } catch {
            error('Impossible d enregistrer la sous-categorie.');
        }
    }

    async function handleAttributeSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error('Selectionnez d abord une categorie.');

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
                    attributeForm.type === 'select'
                        ? parseOptions(attributeForm.optionsText)
                        : [],
            };

            if (editingAttributeId) {
                await updateAttribute.mutateAsync({ id: editingAttributeId, payload });
                success('Attribut mis a jour.');
            } else {
                await createAttribute.mutateAsync(payload);
                success('Attribut cree.');
            }

            resetAttributeForm();
        } catch {
            error('Impossible d enregistrer l attribut.');
        }
    }

    async function handleExtraSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!selectedCategory) {
            error('Selectionnez d abord une categorie.');

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
                success('Extra mis a jour.');
            } else {
                await createExtra.mutateAsync(payload);
                success('Extra cree.');
            }

            resetExtraForm();
        } catch {
            error('Impossible d enregistrer l extra.');
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!window.confirm('Supprimer cette categorie et toute sa structure ?')) {
            return;
        }

        try {
            await deleteCategory.mutateAsync(id);
            success('Categorie supprimee.');
        } catch {
            error('Suppression impossible.');
        }
    }

    async function handleDeleteSubcategory(id: string) {
        if (!window.confirm('Supprimer cette sous-categorie ?')) {
            return;
        }

        try {
            await deleteSubcategory.mutateAsync(id);
            success('Sous-categorie supprimee.');
        } catch {
            error('Suppression impossible.');
        }
    }

    async function handleDeleteAttribute(id: string) {
        if (!window.confirm('Supprimer cet attribut ?')) {
            return;
        }

        try {
            await deleteAttribute.mutateAsync(id);
            success('Attribut supprime.');
        } catch {
            error('Suppression impossible.');
        }
    }

    async function handleDeleteExtra(id: string) {
        if (!window.confirm('Supprimer cet extra ?')) {
            return;
        }

        try {
            await deleteExtra.mutateAsync(id);
            success('Extra supprime.');
        } catch {
            error('Suppression impossible.');
        }
    }

    async function applyStructurePreset(preset: {
        category: {
            serviceType: (typeof ServiceCategoryNames)[keyof typeof ServiceCategoryNames];
            name: string;
            slug: string;
            description: string;
            isActive: boolean;
            sortOrder: number;
        };
        subcategories: Array<{ name: string; slug: string; sortOrder: number }>;
    }, successMessage: string) {
        const existingCategory = categories.find(
            (category) =>
                category.serviceType === preset.category.serviceType &&
                category.slug === preset.category.slug,
        );

        if (existingCategory) {
            setSelectedCategoryId(existingCategory.id);
            error('Cette structure par defaut existe deja.');
            return;
        }

        try {
            const createdCategory = await createCategory.mutateAsync(preset.category);

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
            error('Impossible d appliquer cette structure par defaut.');
        }
    }

    async function applyAttributePreset() {
        if (!selectedCategory) {
            error('Selectionnez d abord une categorie.');
            return;
        }

        const preset = DEFAULT_ATTRIBUTE_PRESETS[selectedCategory.serviceType];

        if (!preset || preset.length === 0) {
            error('Aucun preset d attributs n est defini pour ce type.');
            return;
        }

        const existingKeys = new Set(
            selectedCategory.attributes.map((attribute) => attribute.key),
        );
        const missingAttributes = preset.filter(
            (attribute) => !existingKeys.has(attribute.key),
        );

        if (missingAttributes.length === 0) {
            error('Les attributs par defaut existent deja pour cette categorie.');
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

            success('Attributs par defaut ajoutes.');
        } catch {
            error('Impossible d ajouter les attributs par defaut.');
        }
    }

    async function applyExtraPreset() {
        if (!selectedCategory) {
            error('Selectionnez d abord une categorie.');
            return;
        }

        const preset = DEFAULT_EXTRA_PRESETS[selectedCategory.serviceType];

        if (!preset || preset.length === 0) {
            error('Aucun preset d extras n est defini pour ce type.');
            return;
        }

        const existingNames = new Set(
            selectedCategory.extras.map((extra) => extra.name.toLowerCase()),
        );
        const missingExtras = preset.filter(
            (extra) => !existingNames.has(extra.name.toLowerCase()),
        );

        if (missingExtras.length === 0) {
            error('Les extras par defaut existent deja pour cette categorie.');
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

            success('Extras par defaut ajoutes.');
        } catch {
            error('Impossible d ajouter les extras par defaut.');
        }
    }

    return (
        <div className="wdr-admin-structure">
            <section className="wdr-admin-structure__hero">
                <div>
                    <p className="wdr-admin-structure__eyebrow">Catalogue admin-driven</p>
                    <h1>Structure des services</h1>
                    <p>
                        Gere les categories, sous-categories, attributs et extras
                        utilises ensuite dans les formulaires de service.
                    </p>
                </div>
                <div className="wdr-admin-structure__hero-actions">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                DEFAULT_BOAT_STRUCTURE,
                                'Categorie bateaux par defaut creee.',
                            )
                        }
                    >
                        Preset bateaux
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                DEFAULT_CAR_STRUCTURE,
                                'Categorie voitures par defaut creee.',
                            )
                        }
                    >
                        Preset voitures
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() =>
                            void applyStructurePreset(
                                DEFAULT_ACCOMMODATION_STRUCTURE,
                                'Categorie hebergements par defaut creee.',
                            )
                        }
                    >
                        Preset hebergements
                    </Button>
                    <Button variant="ghost" onClick={() => navigate({ name: 'admin-services' })}>
                        Retour au catalogue
                    </Button>
                    <Button variant="primary" onClick={() => navigate({ name: 'admin-service-form' })}>
                        Creer un service
                    </Button>
                </div>
            </section>

            <AdminSectionNav active="structure" />

            <div className="wdr-admin-structure__layout">
                <aside className="wdr-admin-structure__sidebar">
                    <div className="wdr-admin-structure__panel">
                        <div className="wdr-admin-structure__panel-header">
                            <h2>Categories</h2>
                            <Button variant="ghost" size="sm" onClick={resetCategoryForm}>
                                Nouvelle
                            </Button>
                        </div>
                        <div className="wdr-admin-structure__category-list">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={`wdr-admin-structure__category-card${selectedCategoryId === category.id ? ' wdr-admin-structure__category-card--active' : ''}`}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                >
                                    <strong>{category.name}</strong>
                                    <span>{ServiceCategoryLabels[category.serviceType]}</span>
                                    <small>
                                        {category.subcategories.length} sous-categories · {category.attributes.length} attributs
                                    </small>
                                </button>
                            ))}
                            {!isLoading && categories.length === 0 && (
                                <p className="wdr-admin-structure__empty">Aucune categorie configuree.</p>
                            )}
                        </div>
                    </div>

                    <form className="wdr-admin-structure__panel" onSubmit={handleCategorySubmit}>
                        <div className="wdr-admin-structure__panel-header">
                            <h2>{editingCategoryId ? 'Modifier la categorie' : 'Nouvelle categorie'}</h2>
                            {editingCategoryId && (
                                <Button variant="ghost" size="sm" type="button" onClick={resetCategoryForm}>
                                    Annuler
                                </Button>
                            )}
                        </div>
                        <label className="wdr-admin-structure__label">
                            Type de service
                            <Select
                                value={categoryForm.serviceType}
                                options={CATEGORY_OPTIONS}
                                onChange={(event) =>
                                    setCategoryForm((prev) => ({
                                        ...prev,
                                        serviceType: event.target.value as CategoryFormState['serviceType'],
                                    }))
                                }
                            />
                        </label>
                        <label className="wdr-admin-structure__label">
                            Nom
                            <Input value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} />
                        </label>
                        <label className="wdr-admin-structure__label">
                            Slug
                            <Input value={categoryForm.slug} onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))} />
                        </label>
                        <label className="wdr-admin-structure__label">
                            Description
                            <textarea className="wdr-admin-structure__textarea" rows={3} value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} />
                        </label>
                        <label className="wdr-admin-structure__label">
                            Ordre
                            <Input type="number" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm((prev) => ({ ...prev, sortOrder: event.target.value }))} />
                        </label>
                        <label className="wdr-admin-structure__check">
                            <input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                            Categorie active
                        </label>
                        <div className="wdr-admin-structure__actions">
                            {editingCategoryId && selectedCategory && (
                                <Button type="button" variant="danger" size="sm" onClick={() => void handleDeleteCategory(selectedCategory.id)}>
                                    Supprimer
                                </Button>
                            )}
                            <Button type="submit" variant="primary">
                                {editingCategoryId ? 'Mettre a jour' : 'Creer'}
                            </Button>
                        </div>
                    </form>
                </aside>
                <section className="wdr-admin-structure__content">
                    {!selectedCategory ? (
                        <div className="wdr-admin-structure__panel">
                            <p className="wdr-admin-structure__empty">
                                Selectionne une categorie pour administrer sa structure.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="wdr-admin-structure__panel">
                                <div className="wdr-admin-structure__panel-header">
                                    <div>
                                        <h2>{selectedCategory.name}</h2>
                                        <p className="wdr-admin-structure__panel-subtitle">
                                            {ServiceCategoryLabels[selectedCategory.serviceType]} · {selectedCategory.slug}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => beginEditCategory(selectedCategory)}>
                                        Modifier la categorie
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void applyAttributePreset()}
                                    >
                                        Preset attributs
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void applyExtraPreset()}
                                    >
                                        Preset extras
                                    </Button>
                                </div>
                                {selectedCategory.description && (
                                    <p className="wdr-admin-structure__description">{selectedCategory.description}</p>
                                )}
                            </div>

                            <div className="wdr-admin-structure__grid">
                                <form className="wdr-admin-structure__panel" onSubmit={handleSubcategorySubmit}>
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>{editingSubcategoryId ? 'Modifier une sous-categorie' : 'Sous-categories'}</h2>
                                        {editingSubcategoryId && <Button variant="ghost" size="sm" type="button" onClick={resetSubcategoryForm}>Annuler</Button>}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.subcategories.map((subcategory) => (
                                            <div key={subcategory.id} className="wdr-admin-structure__item">
                                                <div>
                                                    <strong>{subcategory.name}</strong>
                                                    <span>{subcategory.slug}</span>
                                                </div>
                                                <div className="wdr-admin-structure__item-actions">
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => beginEditSubcategory(subcategory)}>Modifier</Button>
                                                    <Button variant="danger" size="sm" type="button" onClick={() => void handleDeleteSubcategory(subcategory.id)}>Supprimer</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="wdr-admin-structure__label">Nom<Input value={subcategoryForm.name} onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, name: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Slug<Input value={subcategoryForm.slug} onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, slug: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Description<textarea className="wdr-admin-structure__textarea" rows={3} value={subcategoryForm.description} onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, description: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Ordre<Input type="number" value={subcategoryForm.sortOrder} onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, sortOrder: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__check"><input type="checkbox" checked={subcategoryForm.isActive} onChange={(event) => setSubcategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))} />Sous-categorie active</label>
                                    <div className="wdr-admin-structure__actions"><Button type="submit" variant="primary">{editingSubcategoryId ? 'Mettre a jour' : 'Ajouter'}</Button></div>
                                </form>

                                <form className="wdr-admin-structure__panel" onSubmit={handleAttributeSubmit}>
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>{editingAttributeId ? 'Modifier un attribut' : 'Attributs dynamiques'}</h2>
                                        {editingAttributeId && <Button variant="ghost" size="sm" type="button" onClick={resetAttributeForm}>Annuler</Button>}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.attributes.map((attribute) => (
                                            <div key={attribute.id} className="wdr-admin-structure__item">
                                                <div>
                                                    <strong>{attribute.label}</strong>
                                                    <span>{attribute.key} · {attribute.type}</span>
                                                </div>
                                                <div className="wdr-admin-structure__item-actions">
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => beginEditAttribute(attribute)}>Modifier</Button>
                                                    <Button variant="danger" size="sm" type="button" onClick={() => void handleDeleteAttribute(attribute.id)}>Supprimer</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="wdr-admin-structure__label">Libelle<Input value={attributeForm.label} onChange={(event) => setAttributeForm((prev) => ({ ...prev, label: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Cle technique<Input value={attributeForm.key} onChange={(event) => setAttributeForm((prev) => ({ ...prev, key: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Type<Select value={attributeForm.type} options={[{ value: 'text', label: 'Texte' }, { value: 'number', label: 'Nombre' }, { value: 'boolean', label: 'Booleen' }, { value: 'select', label: 'Liste' }]} onChange={(event) => setAttributeForm((prev) => ({ ...prev, type: event.target.value as AttributeType }))} /></label>
                                    {attributeForm.type === 'select' && (
                                        <label className="wdr-admin-structure__label">
                                            Options
                                            <textarea className="wdr-admin-structure__textarea" rows={4} value={attributeForm.optionsText} onChange={(event) => setAttributeForm((prev) => ({ ...prev, optionsText: event.target.value }))} placeholder="Yacht: yacht&#10;Catamaran: catamaran" />
                                        </label>
                                    )}
                                    <label className="wdr-admin-structure__label">Ordre<Input type="number" value={attributeForm.sortOrder} onChange={(event) => setAttributeForm((prev) => ({ ...prev, sortOrder: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__check"><input type="checkbox" checked={attributeForm.isRequired} onChange={(event) => setAttributeForm((prev) => ({ ...prev, isRequired: event.target.checked }))} />Champ obligatoire</label>
                                    <label className="wdr-admin-structure__check"><input type="checkbox" checked={attributeForm.isFilterable} onChange={(event) => setAttributeForm((prev) => ({ ...prev, isFilterable: event.target.checked }))} />Utilisable comme filtre public</label>
                                    <div className="wdr-admin-structure__actions"><Button type="submit" variant="primary">{editingAttributeId ? 'Mettre a jour' : 'Ajouter'}</Button></div>
                                </form>

                                <form className="wdr-admin-structure__panel" onSubmit={handleExtraSubmit}>
                                    <div className="wdr-admin-structure__panel-header">
                                        <h2>{editingExtraId ? 'Modifier un extra' : 'Extras'}</h2>
                                        {editingExtraId && <Button variant="ghost" size="sm" type="button" onClick={resetExtraForm}>Annuler</Button>}
                                    </div>
                                    <div className="wdr-admin-structure__item-list">
                                        {selectedCategory.extras.map((extra) => (
                                            <div key={extra.id} className="wdr-admin-structure__item">
                                                <div>
                                                    <strong>{extra.name}</strong>
                                                    <span>{extra.defaultPrice.toFixed(2)} EUR - {extra.inputType}</span>
                                                </div>
                                                <div className="wdr-admin-structure__item-actions">
                                                    <Button variant="ghost" size="sm" type="button" onClick={() => beginEditExtra(extra)}>Modifier</Button>
                                                    <Button variant="danger" size="sm" type="button" onClick={() => void handleDeleteExtra(extra.id)}>Supprimer</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <label className="wdr-admin-structure__label">Nom<Input value={extraForm.name} onChange={(event) => setExtraForm((prev) => ({ ...prev, name: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__label">Description<textarea className="wdr-admin-structure__textarea" rows={3} value={extraForm.description} onChange={(event) => setExtraForm((prev) => ({ ...prev, description: event.target.value }))} /></label>
                                    <div className="wdr-admin-structure__two-cols">
                                        <label className="wdr-admin-structure__label">Prix par defaut<Input type="number" min="0" step="0.01" value={extraForm.defaultPrice} onChange={(event) => setExtraForm((prev) => ({ ...prev, defaultPrice: event.target.value }))} /></label>
                                        <label className="wdr-admin-structure__label">Type<Select value={extraForm.inputType} options={[{ value: 'CHECKBOX', label: 'Optionnel' }, { value: 'REQUIRED', label: 'Obligatoire' }]} onChange={(event) => setExtraForm((prev) => ({ ...prev, inputType: event.target.value as ExtraInputType }))} /></label>
                                    </div>
                                    <label className="wdr-admin-structure__label">Ordre<Input type="number" value={extraForm.sortOrder} onChange={(event) => setExtraForm((prev) => ({ ...prev, sortOrder: event.target.value }))} /></label>
                                    <label className="wdr-admin-structure__check"><input type="checkbox" checked={extraForm.isRequired} onChange={(event) => setExtraForm((prev) => ({ ...prev, isRequired: event.target.checked }))} />Extra obligatoire</label>
                                    <label className="wdr-admin-structure__check"><input type="checkbox" checked={extraForm.isActive} onChange={(event) => setExtraForm((prev) => ({ ...prev, isActive: event.target.checked }))} />Extra actif</label>
                                    <div className="wdr-admin-structure__actions"><Button type="submit" variant="primary">{editingExtraId ? 'Mettre a jour' : 'Ajouter'}</Button></div>
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
