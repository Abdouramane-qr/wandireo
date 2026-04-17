import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    EmptyState,
    GeoMap,
    Input,
    Pagination,
    Select,
    ServiceCard,
} from "@/components/wdr";
import { favoritesApi } from "@/api/favorites";
import { useUser } from "@/context/UserContext";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useGeoContext } from "@/hooks/useGeoContext";
import { useServiceStructureData } from "@/hooks/useServiceStructureData";
import { useServicesDataWithOptions } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import type { Route } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { toServiceCardData } from "@/lib/serviceAdapter";
import type {
    Service,
    ServiceAttributeDefinition,
    ServiceCategory,
} from "@/types/service";
import { ServiceCategoryNames } from "@/types/service";
import "./SearchPage.css";

type SortOption = "pertinence" | "prix_asc" | "prix_desc" | "note";
type ViewMode = "grid" | "list";
type SearchVertical = "ALL" | ServiceCategory;
type DynamicFilters = Record<string, string[]>;

interface FilterState {
    query: string;
    dateFrom: string;
    dateTo: string;
    categories: Record<ServiceCategory, boolean>;
    detailedCategories: string[];
    priceMin: string;
    priceMax: string;
    minRating: number;
    dynamicFilters: DynamicFilters;
}

interface SearchPageProps {
    route?: Extract<Route, { name: "search" }>;
    q?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
}

interface DynamicFilterGroup {
    attribute: ServiceAttributeDefinition;
    values: string[];
}

const ITEMS_PER_PAGE = 6;
const ALGARVE_CITIES = [
    "Lagos",
    "Alvor",
    "Portimão",
    "Silves",
    "Benagil",
    "Armação de Pêra",
    "Vilamoura",
    "Albufeira",
];

const ALL_CATEGORIES: ServiceCategory[] = [
    ServiceCategoryNames.ACTIVITE,
    ServiceCategoryNames.BATEAU,
    ServiceCategoryNames.HEBERGEMENT,
    ServiceCategoryNames.VOITURE,
];

function buildInitialCategories(
    urlCategory: string,
): Record<ServiceCategory, boolean> {
    const initial: Record<ServiceCategory, boolean> = {
        ACTIVITE: false,
        BATEAU: false,
        HEBERGEMENT: false,
        VOITURE: false,
    };

    if (urlCategory && urlCategory in initial) {
        initial[urlCategory as ServiceCategory] = true;
    }

    return initial;
}

function hasActiveCategory(
    categories: Record<ServiceCategory, boolean>,
): boolean {
    return Object.values(categories).some(Boolean);
}

function buildInitialVertical(urlCategory: string): SearchVertical {
    return ALL_CATEGORIES.includes(urlCategory as ServiceCategory)
        ? (urlCategory as ServiceCategory)
        : "ALL";
}

function buildCategoriesForVertical(
    vertical: SearchVertical,
): Record<ServiceCategory, boolean> {
    if (vertical === "ALL") {
        return buildInitialCategories("");
    }

    return buildInitialCategories(vertical);
}

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function getServiceAttributes(service: Service): Record<string, unknown> {
    return (service.extraData?.attributes as Record<string, unknown>) ?? {};
}

function formatFilterValue(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "Oui" : "Non";
    }

    return String(value).trim();
}

function matchesDynamicFilter(
    service: Service,
    attributeKey: string,
    selectedValues: string[],
): boolean {
    if (selectedValues.length === 0) {
        return true;
    }

    const value = getServiceAttributes(service)[attributeKey];

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === false
    ) {
        return false;
    }

    return selectedValues.includes(formatFilterValue(value));
}

function computeRelevanceScore(
    service: Service,
    filters: FilterState,
    activeVertical: SearchVertical,
    geoCountry?: string,
): number {
    let score = 0;
    const query = normalizeText(filters.query.trim());
    const city = normalizeText(service.location.city);
    const region = normalizeText(service.location.region ?? "");
    const country = normalizeText(service.location.country);
    const title = normalizeText(service.title);
    const description = normalizeText(service.description);

    if (activeVertical !== "ALL" && service.category === activeVertical) {
        score += 40;
    }

    if (service.featured) {
        score += 60;
    }

    score += (service.rating ?? 0) * 14;
    score += Math.min(service.reviewCount ?? 0, 30);

    if (query) {
        if (city === query) {
            score += 120;
        } else if (city.includes(query)) {
            score += 80;
        }

        if (title.includes(query)) {
            score += 90;
        }

        if (region.includes(query) || country.includes(query)) {
            score += 40;
        }

        if (description.includes(query)) {
            score += 20;
        }
    }

    if (geoCountry && service.location.country === geoCountry) {
        score += 12;
    }

    score += Math.max(0, 40 - Math.min(service.clientPrice / 25, 40));

    return score;
}

const GridIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
    </svg>
);
const ListIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
    </svg>
);
const FilterIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const SearchPage: React.FC<SearchPageProps> = ({
    route,
    q = "",
    category = "",
    dateFrom,
    dateTo,
}) => {
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const queryClient = useQueryClient();
    const geoContext = useGeoContext();
    const effectiveRoute: Extract<Route, { name: "search" }> = route ?? {
        name: "search",
        query: q,
        category,
        dateFrom,
        dateTo,
    };
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>("pertinence");
    const [activeVertical, setActiveVertical] = useState<SearchVertical>(() =>
        buildInitialVertical(effectiveRoute.category ?? ""),
    );
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>(() => ({
        query: effectiveRoute.query ?? "",
        dateFrom: effectiveRoute.dateFrom ?? "",
        dateTo: effectiveRoute.dateTo ?? "",
        categories: buildInitialCategories(effectiveRoute.category ?? ""),
        detailedCategories: [],
        priceMin: "",
        priceMax: "",
        minRating: 0,
        dynamicFilters: {},
    }));

    useEffect(() => {
        setActiveVertical(buildInitialVertical(effectiveRoute.category ?? ""));
        setCurrentPage(1);
        setMobileFiltersOpen(false);
        setFilters({
            query: effectiveRoute.query ?? "",
            dateFrom: effectiveRoute.dateFrom ?? "",
            dateTo: effectiveRoute.dateTo ?? "",
            categories: buildInitialCategories(effectiveRoute.category ?? ""),
            detailedCategories: [],
            priceMin: "",
            priceMax: "",
            minRating: 0,
            dynamicFilters: {},
        });
    }, [
        effectiveRoute.category,
        effectiveRoute.dateFrom,
        effectiveRoute.dateTo,
        effectiveRoute.query,
    ]);
    const { services: allServices } = useServicesDataWithOptions(
        { limit: 100 },
        { fetchAll: true },
    );
    const { favorites } = useFavoritesData(currentUser?.id ?? "");
    const { categories: serviceCategories } = useServiceStructureData();

    const favoriteServiceIds = useMemo(
        () => new Set(favorites.map((favorite) => favorite.serviceId)),
        [favorites],
    );

    const CATEGORY_LABELS: Record<ServiceCategory, string> = useMemo(
        () => ({
            ACTIVITE: t("search.activities"),
            BATEAU: t("search.boats"),
            HEBERGEMENT: t("search.accommodations"),
            VOITURE: t("search.cars"),
        }),
        [t],
    );

    const VERTICALS: Array<{
        value: SearchVertical;
        label: string;
        description: string;
    }> = useMemo(
        () => [
            {
                value: "ALL",
                label: t("search.all"),
                description: t("search.all_desc"),
            },
            {
                value: "ACTIVITE",
                label: t("search.activities"),
                description: t("search.activities_desc"),
            },
            {
                value: "BATEAU",
                label: t("search.boats"),
                description: t("search.boats_desc"),
            },
            {
                value: "VOITURE",
                label: t("search.cars"),
                description: t("search.cars_desc"),
            },
            {
                value: "HEBERGEMENT",
                label: t("search.accommodations"),
                description: t("search.accommodations_desc"),
            },
        ],
        [t],
    );

    const SORT_OPTIONS = useMemo(
        () => [
            { value: "pertinence", label: t("search.sort.relevance") },
            { value: "prix_asc", label: t("search.sort.price_asc") },
            { value: "prix_desc", label: t("search.sort.price_desc") },
            { value: "note", label: t("search.sort.rating") },
        ],
        [t],
    );

    const destinationOptions = useMemo(() => {
        const algarveSet = new Set(ALGARVE_CITIES);
        const extraCities = new Map<string, Set<string>>();

        for (const service of allServices) {
            if (algarveSet.has(service.location.city)) {
                continue;
            }

            if (!extraCities.has(service.location.country)) {
                extraCities.set(service.location.country, new Set());
            }

            extraCities
                .get(service.location.country)
                ?.add(service.location.city);
        }

        return [
            { country: "Algarve", cities: ALGARVE_CITIES },
            ...Array.from(extraCities.entries())
                .sort(([a], [b]) => a.localeCompare(b, "fr"))
                .map(([country, cities]) => ({
                    country,
                    cities: Array.from(cities).sort((a, b) =>
                        a.localeCompare(b, "fr"),
                    ),
                })),
        ].sort((a, b) => {
            if (a.country === "Algarve") {
                return -1;
            }

            if (b.country === "Algarve") {
                return 1;
            }

            if (
                geoContext.countryName &&
                a.country === geoContext.countryName
            ) {
                return -1;
            }

            if (
                geoContext.countryName &&
                b.country === geoContext.countryName
            ) {
                return 1;
            }

            return a.country.localeCompare(b.country, "fr");
        });
    }, [allServices, geoContext.countryName]);

    const maxObservablePrice = useMemo(
        () => Math.max(0, ...allServices.map((service) => service.clientPrice)),
        [allServices],
    );

    const updateFilters = (updater: (current: FilterState) => FilterState) => {
        setCurrentPage(1);
        setFilters(updater);
    };

    const setVertical = (vertical: SearchVertical) => {
        setCurrentPage(1);
        setActiveVertical(vertical);
        setFilters((current) => ({
            ...current,
            categories: buildCategoriesForVertical(vertical),
            detailedCategories: [],
            dynamicFilters: {},
        }));
    };

    const toggleCategory = (categoryKey: ServiceCategory) => {
        updateFilters((current) => ({
            ...current,
            categories: {
                ...current.categories,
                [categoryKey]: !current.categories[categoryKey],
            },
        }));
    };

    const toggleDetailedCategory = (categoryId: string) => {
        updateFilters((current) => ({
            ...current,
            detailedCategories: current.detailedCategories.includes(categoryId)
                ? current.detailedCategories.filter(
                      (item) => item !== categoryId,
                  )
                : [...current.detailedCategories, categoryId],
        }));
    };

    const toggleDynamicFilter = (attributeKey: string, value: string) => {
        updateFilters((current) => {
            const existing = current.dynamicFilters[attributeKey] ?? [];
            const nextValues = existing.includes(value)
                ? existing.filter((item) => item !== value)
                : [...existing, value];

            return {
                ...current,
                dynamicFilters: {
                    ...current.dynamicFilters,
                    [attributeKey]: nextValues,
                },
            };
        });
    };

    const resetFilters = () => {
        setCurrentPage(1);
        setFilters({
            query: "",
            dateFrom: "",
            dateTo: "",
            categories: buildInitialCategories(""),
            detailedCategories: [],
            priceMin: "",
            priceMax: "",
            minRating: 0,
            dynamicFilters: {},
        });
    };

    const visibleDetailedCategories = useMemo(
        () =>
            serviceCategories.filter(
                (entry) =>
                    entry.isActive &&
                    (activeVertical === "ALL" ||
                        entry.serviceType === activeVertical) &&
                    (!hasActiveCategory(filters.categories) ||
                        filters.categories[entry.serviceType]),
            ),
        [activeVertical, filters.categories, serviceCategories],
    );

    const dynamicFilterGroups = useMemo(() => {
        const hasCategory = hasActiveCategory(filters.categories);
        const selectedDetailedCategoryIds =
            filters.detailedCategories.length > 0
                ? new Set(filters.detailedCategories)
                : null;
        const groups = new Map<string, DynamicFilterGroup>();

        for (const categoryDef of serviceCategories) {
            if (!categoryDef.isActive) {
                continue;
            }

            if (
                activeVertical !== "ALL" &&
                categoryDef.serviceType !== activeVertical
            ) {
                continue;
            }

            if (hasCategory && !filters.categories[categoryDef.serviceType]) {
                continue;
            }

            if (
                selectedDetailedCategoryIds &&
                !selectedDetailedCategoryIds.has(categoryDef.id)
            ) {
                continue;
            }

            for (const attribute of categoryDef.attributes) {
                if (!attribute.isFilterable) {
                    continue;
                }

                const values = new Set<string>();

                for (const service of allServices) {
                    if (
                        !service.isAvailable ||
                        service.serviceCategoryId !== categoryDef.id
                    ) {
                        continue;
                    }

                    const rawValue =
                        getServiceAttributes(service)[attribute.key];

                    if (
                        rawValue === null ||
                        rawValue === undefined ||
                        rawValue === "" ||
                        rawValue === false
                    ) {
                        continue;
                    }

                    values.add(formatFilterValue(rawValue));
                }

                const sortedValues = Array.from(values).sort((a, b) =>
                    a.localeCompare(b, "fr", { numeric: true }),
                );

                if (sortedValues.length === 0) {
                    continue;
                }

                groups.set(attribute.key, { attribute, values: sortedValues });
            }
        }

        return Array.from(groups.values()).sort(
            (a, b) => a.attribute.sortOrder - b.attribute.sortOrder,
        );
    }, [
        activeVertical,
        allServices,
        filters.categories,
        filters.detailedCategories,
        serviceCategories,
    ]);

    const filteredServices = useMemo(() => {
        const searchQuery = normalizeText(filters.query.trim());
        const priceMin = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const priceMax = filters.priceMax
            ? parseFloat(filters.priceMax)
            : Infinity;
        const hasCategory = hasActiveCategory(filters.categories);
        const hasDetailedCategories = filters.detailedCategories.length > 0;

        let services = allServices.filter((service) => {
            if (!service.isAvailable) {
                return false;
            }

            if (
                activeVertical !== "ALL" &&
                service.category !== activeVertical
            ) {
                return false;
            }

            if (hasCategory && !filters.categories[service.category]) {
                return false;
            }

            if (
                hasDetailedCategories &&
                (!service.serviceCategoryId ||
                    !filters.detailedCategories.includes(
                        service.serviceCategoryId,
                    ))
            ) {
                return false;
            }

            if (
                service.clientPrice < priceMin ||
                service.clientPrice > priceMax
            ) {
                return false;
            }

            if (
                filters.minRating > 0 &&
                (service.rating ?? 0) < filters.minRating
            ) {
                return false;
            }

            const searchable = normalizeText(
                [
                    service.title,
                    service.description,
                    service.location.city,
                    service.location.country,
                    service.location.region ?? "",
                    service.category,
                    service.serviceCategoryName ?? "",
                    service.serviceSubcategoryName ?? "",
                    ...service.tags,
                    ...Object.entries(getServiceAttributes(service)).map(
                        ([key, value]) => `${key} ${formatFilterValue(value)}`,
                    ),
                ].join(" "),
            );

            if (searchQuery && !searchable.includes(searchQuery)) {
                return false;
            }

            for (const [attributeKey, selectedValues] of Object.entries(
                filters.dynamicFilters,
            )) {
                if (
                    !matchesDynamicFilter(service, attributeKey, selectedValues)
                ) {
                    return false;
                }
            }

            return true;
        });

        if (sortBy === "prix_asc") {
            services = [...services].sort(
                (a, b) => a.clientPrice - b.clientPrice,
            );
        } else if (sortBy === "prix_desc") {
            services = [...services].sort(
                (a, b) => b.clientPrice - a.clientPrice,
            );
        } else if (sortBy === "note") {
            services = [...services].sort(
                (a, b) =>
                    (b.rating ?? 0) - (a.rating ?? 0) ||
                    (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
            );
        } else {
            services = [...services].sort(
                (a, b) =>
                    computeRelevanceScore(
                        b,
                        filters,
                        activeVertical,
                        geoContext.countryName ?? undefined,
                    ) -
                        computeRelevanceScore(
                            a,
                            filters,
                            activeVertical,
                            geoContext.countryName ?? undefined,
                        ) ||
                    (b.rating ?? 0) - (a.rating ?? 0) ||
                    a.clientPrice - b.clientPrice,
            );
        }

        return services;
    }, [activeVertical, allServices, filters, geoContext.countryName, sortBy]);

    const results = useMemo(
        () => filteredServices.map(toServiceCardData),
        [filteredServices],
    );
    const mapMarkers = useMemo(
        () =>
            filteredServices
                .filter((service) => service.location.coordinates)
                .slice(0, 18)
                .map((service) => ({
                    id: service.id,
                    title: service.title,
                    latitude: service.location.coordinates!.latitude,
                    longitude: service.location.coordinates!.longitude,
                    subtitle: `${service.location.city}, ${service.location.country}`,
                    onSelect: () =>
                        navigate({ name: "service", id: service.id }),
                })),
        [filteredServices, navigate],
    );

    const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
    const paginatedResults = results.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );
    const searchSummary = useMemo(() => {
        const parts: string[] = [];

        if (filters.query) {
            parts.push(`"${filters.query}"`);
        }

        if (activeVertical !== "ALL") {
            parts.push(
                `${t("nav.search").toLowerCase()} ${CATEGORY_LABELS[activeVertical]}`,
            );
        }

        const activeCategories = ALL_CATEGORIES.filter(
            (categoryKey) => filters.categories[categoryKey],
        ).map((categoryKey) => CATEGORY_LABELS[categoryKey]);

        if (activeVertical === "ALL" && activeCategories.length > 0) {
            parts.push(
                `${t("search.types_prefix").toLowerCase()} ${activeCategories.join(", ")}`,
            );
        }

        if (filters.dateFrom) {
            parts.push(
                `${t("search.date_from").toLowerCase()} ${filters.dateFrom}`,
            );
        }

        if (filters.dateTo) {
            parts.push(
                `${t("search.date_to").toLowerCase()} ${filters.dateTo}`,
            );
        }

        return parts.join(" ");
    }, [activeVertical, filters, t, CATEGORY_LABELS]);

    const activeVerticalMeta =
        VERTICALS.find((vertical) => vertical.value === activeVertical) ??
        VERTICALS[0];

    const handleFavoriteToggle = async (serviceId: string) => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            navigate({ name: "login" });

            return;
        }

        if (favoriteServiceIds.has(serviceId)) {
            await favoritesApi.remove(serviceId);
        } else {
            await favoritesApi.add(serviceId);
        }

        await queryClient.invalidateQueries({
            queryKey: ["favorites", currentUser.id],
        });
    };

    return (
        <div className="wdr-search">
            <div className="wdr-search__page-header">
                <div className="wdr-search__page-header-inner">
                    <nav
                        aria-label={t("search.breadcrumb_aria")}
                        className="wdr-search__breadcrumb"
                    >
                        <button
                            type="button"
                            className="wdr-search__breadcrumb-link"
                            onClick={() => navigate({ name: "home" })}
                        >
                            {t("nav.home")}
                        </button>
                        <span
                            className="wdr-search__breadcrumb-sep"
                            aria-hidden="true"
                        >
                            /
                        </span>
                        <span aria-current="page">{t("nav.search")}</span>
                    </nav>

                    <div className="wdr-search__results-bar">
                        <h1 className="wdr-search__results-count">
                            <strong>{results.length}</strong>{" "}
                            {results.length === 1
                                ? t("search.results_count_singular")
                                : t("search.results_count_plural")}
                            {searchSummary && (
                                <span className="wdr-search__results-summary">
                                    {" "}
                                    {searchSummary}
                                </span>
                            )}
                        </h1>

                        <div className="wdr-search__controls">
                            <button
                                type="button"
                                className="wdr-search__mobile-filter-btn"
                                onClick={() =>
                                    setMobileFiltersOpen((open) => !open)
                                }
                                aria-expanded={mobileFiltersOpen}
                                aria-controls="search-filters"
                            >
                                <FilterIcon />
                                {t("search.filters")}
                            </button>
                            <Select
                                options={SORT_OPTIONS}
                                value={sortBy}
                                onChange={(event) => {
                                    setCurrentPage(1);
                                    setSortBy(event.target.value as SortOption);
                                }}
                                aria-label={t("search.sort_by")}
                            />
                            <div
                                className="wdr-search__view-toggle"
                                role="group"
                                aria-label={t("search.view_mode")}
                            >
                                <button
                                    type="button"
                                    className={`wdr-search__view-btn ${viewMode === "grid" ? "wdr-search__view-btn--active" : ""}`}
                                    onClick={() => setViewMode("grid")}
                                    aria-pressed={viewMode === "grid"}
                                >
                                    <GridIcon />
                                </button>
                                <button
                                    type="button"
                                    className={`wdr-search__view-btn ${viewMode === "list" ? "wdr-search__view-btn--active" : ""}`}
                                    onClick={() => setViewMode("list")}
                                    aria-pressed={viewMode === "list"}
                                >
                                    <ListIcon />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="wdr-search__vertical-tabs"
                        role="tablist"
                        aria-label={t("search.explore_by_type")}
                    >
                        {VERTICALS.map((vertical) => (
                            <button
                                key={vertical.value}
                                type="button"
                                role="tab"
                                aria-selected={
                                    activeVertical === vertical.value
                                }
                                className={`wdr-search__vertical-tab${activeVertical === vertical.value ? " wdr-search__vertical-tab--active" : ""}`}
                                onClick={() => setVertical(vertical.value)}
                            >
                                <span className="wdr-search__vertical-tab-label">
                                    {vertical.label}
                                </span>
                                <span className="wdr-search__vertical-tab-copy">
                                    {vertical.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="wdr-search__layout">
                <aside
                    id="search-filters"
                    className={`wdr-search__filters ${mobileFiltersOpen ? "wdr-search__filters--open" : ""}`}
                    aria-label={t("search.search_filters")}
                >
                    <div className="wdr-search__filters-header">
                        <h2 className="wdr-search__filters-title">
                            {t("search.filters")}
                        </h2>
                        <button
                            type="button"
                            className="wdr-search__filters-reset"
                            onClick={resetFilters}
                        >
                            {t("search.reset")}
                        </button>
                    </div>

                    <div className="wdr-search__filter-group">
                        <h3 className="wdr-search__filter-label">
                            {t("search.destination")}
                        </h3>
                        <select
                            className="wdr-search__destination-select"
                            value={filters.query}
                            onChange={(event) =>
                                updateFilters((current) => ({
                                    ...current,
                                    query: event.target.value,
                                }))
                            }
                            aria-label={t("search.filter_by_destination")}
                        >
                            <option value="">
                                {t("search.all_destinations")}
                            </option>
                            {destinationOptions.map(({ country, cities }) => (
                                <optgroup key={country} label={country}>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="wdr-search__filter-group">
                        <h3 className="wdr-search__filter-label">
                            {t("search.dates")}
                        </h3>
                        <div className="wdr-search__date-grid">
                            <input
                                type="date"
                                className="wdr-search__date-input"
                                value={filters.dateFrom}
                                onChange={(event) =>
                                    updateFilters((current) => ({
                                        ...current,
                                        dateFrom: event.target.value,
                                        dateTo:
                                            current.dateTo &&
                                            current.dateTo < event.target.value
                                                ? ""
                                                : current.dateTo,
                                    }))
                                }
                                aria-label={t("search.date_from")}
                            />
                            <input
                                type="date"
                                className="wdr-search__date-input"
                                value={filters.dateTo}
                                min={filters.dateFrom || undefined}
                                onChange={(event) =>
                                    updateFilters((current) => ({
                                        ...current,
                                        dateTo: event.target.value,
                                    }))
                                }
                                aria-label={t("search.date_to")}
                            />
                        </div>
                        <p className="wdr-search__filter-note">
                            {t("search.date_note")}
                        </p>
                    </div>

                    {activeVertical === "ALL" && (
                        <div className="wdr-search__filter-group">
                            <h3 className="wdr-search__filter-label">
                                {t("search.main_categories")}
                            </h3>
                            <ul
                                className="wdr-search__checkbox-list"
                                role="group"
                                aria-label={t("search.filter_by_category")}
                            >
                                {ALL_CATEGORIES.map((categoryKey) => (
                                    <li key={categoryKey}>
                                        <label className="wdr-search__checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="wdr-search__checkbox"
                                                checked={
                                                    filters.categories[
                                                        categoryKey
                                                    ]
                                                }
                                                onChange={() =>
                                                    toggleCategory(categoryKey)
                                                }
                                            />
                                            {CATEGORY_LABELS[categoryKey]}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {visibleDetailedCategories.length > 0 && (
                        <div className="wdr-search__filter-group">
                            <h3 className="wdr-search__filter-label">
                                {activeVertical === "ALL"
                                    ? t("search.detailed_categories")
                                    : `${t("search.types_prefix")} ${activeVerticalMeta.label.toLowerCase()}`}
                            </h3>
                            <ul
                                className="wdr-search__checkbox-list"
                                role="group"
                            >
                                {visibleDetailedCategories.map((entry) => (
                                    <li key={entry.id}>
                                        <label className="wdr-search__checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="wdr-search__checkbox"
                                                checked={filters.detailedCategories.includes(
                                                    entry.id,
                                                )}
                                                onChange={() =>
                                                    toggleDetailedCategory(
                                                        entry.id,
                                                    )
                                                }
                                            />
                                            {entry.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {dynamicFilterGroups.map((group) => (
                        <div
                            key={group.attribute.key}
                            className="wdr-search__filter-group wdr-search__filter-group--specific"
                        >
                            <h3 className="wdr-search__filter-label wdr-search__filter-label--specific">
                                {group.attribute.label}
                            </h3>
                            <ul
                                className="wdr-search__checkbox-list"
                                role="group"
                            >
                                {group.values.map((value) => (
                                    <li key={value}>
                                        <label className="wdr-search__checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="wdr-search__checkbox"
                                                checked={(
                                                    filters.dynamicFilters[
                                                        group.attribute.key
                                                    ] ?? []
                                                ).includes(value)}
                                                onChange={() =>
                                                    toggleDynamicFilter(
                                                        group.attribute.key,
                                                        value,
                                                    )
                                                }
                                            />
                                            {value}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div className="wdr-search__filter-group">
                        <h3 className="wdr-search__filter-label">
                            {t("search.budget")}
                        </h3>
                        <div className="wdr-search__price-range">
                            <Input
                                type="number"
                                placeholder={t("search.price_placeholder_min")}
                                value={filters.priceMin}
                                onChange={(event) =>
                                    updateFilters((current) => ({
                                        ...current,
                                        priceMin: event.target.value,
                                    }))
                                }
                                min={0}
                                max={filters.priceMax || maxObservablePrice}
                                aria-label={t("search.price_min")}
                            />
                            <span
                                className="wdr-search__price-sep"
                                aria-hidden="true"
                            >
                                -
                            </span>
                            <Input
                                type="number"
                                placeholder={t(
                                    "search.price_placeholder_max",
                                ).replace(
                                    "{amount}",
                                    formatPrice(maxObservablePrice, "EUR"),
                                )}
                                value={filters.priceMax}
                                onChange={(event) =>
                                    updateFilters((current) => ({
                                        ...current,
                                        priceMax: event.target.value,
                                    }))
                                }
                                min={filters.priceMin || 0}
                                aria-label={t("search.price_max")}
                            />
                        </div>
                    </div>

                    <div className="wdr-search__filter-group">
                        <h3 className="wdr-search__filter-label">
                            {t("search.min_rating")}
                        </h3>
                        <div
                            className="wdr-search__rating-filter"
                            role="radiogroup"
                            aria-label={t("search.select_min_rating")}
                        >
                            {[0, 3, 3.5, 4, 4.5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    className={`wdr-search__rating-btn ${filters.minRating === rating ? "wdr-search__rating-btn--active" : ""}`}
                                    onClick={() =>
                                        updateFilters((current) => ({
                                            ...current,
                                            minRating: rating,
                                        }))
                                    }
                                    aria-pressed={filters.minRating === rating}
                                >
                                    {rating === 0
                                        ? t("search.rating_all")
                                        : `${rating}+`}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <section
                    className="wdr-search__results"
                    aria-live="polite"
                    aria-label={t("search.results_aria")}
                >
                    <div
                        className={`wdr-search__vertical-hero wdr-search__vertical-hero--${activeVertical.toLowerCase()}`}
                    >
                        <div>
                            <p className="wdr-search__vertical-kicker">
                                {activeVertical === "ALL"
                                    ? t("search.full_catalog")
                                    : activeVerticalMeta.label}
                            </p>
                            <h2 className="wdr-search__vertical-title">
                                {activeVertical === "ALL"
                                    ? t("search.full_catalog_title")
                                    : t("search.available_offers").replace(
                                          "{category}",
                                          activeVerticalMeta.label.toLowerCase(),
                                      )}
                            </h2>
                        </div>
                        <p className="wdr-search__vertical-copy">
                            {activeVerticalMeta.description}
                        </p>
                    </div>

                    {geoContext.countryName && (
                        <div className="wdr-search__geo-banner">
                            <strong>{geoContext.countryName}</strong>
                            <span>{t("search.geo_suggestions")}</span>
                        </div>
                    )}

                    {mapMarkers.length > 0 && (
                        <div className="wdr-search__map-panel">
                            <GeoMap markers={mapMarkers} height={320} />
                        </div>
                    )}

                    {results.length === 0 ? (
                        <EmptyState
                            title={t("search.no_results")}
                            description={t("search.no_results_desc")}
                            actionLabel={t("search.clear_filters")}
                            onAction={resetFilters}
                        />
                    ) : (
                        <>
                            <div
                                className={
                                    viewMode === "grid"
                                        ? "wdr-search__grid"
                                        : "wdr-search__list"
                                }
                            >
                                {paginatedResults.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        variant={
                                            viewMode === "list"
                                                ? "compact"
                                                : "default"
                                        }
                                        className={`wdr-search__card wdr-search__card--${service.category.toLowerCase()}`}
                                        isFavorite={favoriteServiceIds.has(
                                            service.id,
                                        )}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onBookClick={(serviceId) =>
                                            navigate({
                                                name: "service",
                                                id: serviceId,
                                            })
                                        }
                                    />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SearchPage;
