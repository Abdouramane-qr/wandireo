import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { fareHarborApi, type FareHarborCompanyPayload } from "@/api/fareharbor";
import { servicesApi } from "@/api/services";
import { AdminSectionNav, Button, useToast } from "@/components/wdr";
import { useFareHarborCompaniesData } from "@/hooks/useFareHarborData";
import { useUser } from "@/context/UserContext";
import { useServicesDataWithOptions } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdminUsersData } from "@/hooks/useUsersData";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import type { FareHarborCompany } from "@/types/fareharbor";
import { ServiceCategoryNames } from "@/types/service";
import type { ServiceCategory } from "@/types/service";
import "./AdminServicesPage.css";

const EyeOffIcon: React.FC = () => (
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
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const EyeIcon: React.FC = () => (
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
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

type AvailabilityFilter = "all" | "active" | "inactive";
type SourceFilter = "all" | "LOCAL" | "EXTERNAL";

export const AdminServicesPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { services: allServices } = useServicesDataWithOptions(
        {
            adminAll: true,
            limit: 100,
        },
        { fetchAll: true },
    );
    const { companies: fareHarborCompanies, isLoading: isFareHarborLoading } =
        useFareHarborCompaniesData();
    const { users } = useAdminUsersData({ role: "PARTNER" });
    const partners = users.filter((user) => user.role === "PARTNER");
    const categoryLabels: Record<ServiceCategory, string> = {
        [ServiceCategoryNames.ACTIVITE]: t("admin.services.category.activity"),
        [ServiceCategoryNames.BATEAU]: t("admin.services.category.boat"),
        [ServiceCategoryNames.HEBERGEMENT]: t("admin.services.category.stay"),
        [ServiceCategoryNames.VOITURE]: t("admin.services.category.car"),
    };

    const [filterCategory, setFilterCategory] = useState<
        ServiceCategory | "all"
    >("all");
    const [filterPartner, setFilterPartner] = useState<string>("all");
    const [filterAvailability, setFilterAvailability] =
        useState<AvailabilityFilter>("all");
    const [filterSource, setFilterSource] = useState<SourceFilter>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);
    const [fareHarborBusyId, setFareHarborBusyId] = useState<string | null>(
        null,
    );
    const [isFareHarborSyncAllBusy, setIsFareHarborSyncAllBusy] =
        useState(false);
    const [newFareHarborCompany, setNewFareHarborCompany] =
        useState<FareHarborCompanyPayload>({
            display_name: "",
            company_slug: "",
            partner_id: "",
            is_enabled: true,
            sync_items_enabled: true,
            sync_details_enabled: true,
            create_partner_account: false,
        });

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const filteredServices = useMemo(
        () =>
            allServices.filter((service) => {
                if (
                    filterCategory !== "all" &&
                    service.category !== filterCategory
                ) {
                    return false;
                }

                if (
                    filterPartner !== "all" &&
                    service.partnerId !== filterPartner
                ) {
                    return false;
                }

                if (
                    searchTerm.trim() &&
                    !`${service.title} ${service.description} ${service.location.city} ${service.location.country}`
                        .toLowerCase()
                        .includes(searchTerm.trim().toLowerCase())
                ) {
                    return false;
                }

                if (
                    filterSource !== "all" &&
                    service.sourceType !== filterSource
                ) {
                    return false;
                }

                if (filterAvailability === "active" && !service.isAvailable) {
                    return false;
                }

                if (filterAvailability === "inactive" && service.isAvailable) {
                    return false;
                }

                return true;
            }),
        [
            allServices,
            filterAvailability,
            filterCategory,
            filterPartner,
            filterSource,
            searchTerm,
        ],
    );

    const activeCount = allServices.filter(
        (service) => service.isAvailable,
    ).length;
    const externalServices = useMemo(
        () =>
            allServices.filter(
                (service) => service.sourceProvider === "FAREHARBOR",
            ),
        [allServices],
    );
    const externalServicesCount = externalServices.length;
    const externalVisibleServicesCount = externalServices.filter(
        (service) => service.isAvailable,
    ).length;
    const enabledCompaniesCount = fareHarborCompanies.filter(
        (company) => company.isEnabled,
    ).length;
    const healthyCompaniesCount = fareHarborCompanies.filter(
        (company) => company.lastStatus.toLowerCase() === "success",
    ).length;
    const failingCompaniesCount = fareHarborCompanies.filter(
        (company) =>
            Boolean(company.lastError) ||
            company.lastStatus.toLowerCase() === "failed",
    ).length;
    const servicesByCompanySlug = useMemo(() => {
        const counters = new Map<
            string,
            {
                total: number;
                visible: number;
            }
        >();

        externalServices.forEach((service) => {
            const slug = service.sourceExternalId?.split(":")[0];

            if (!slug) {
                return;
            }

            const current = counters.get(slug) ?? { total: 0, visible: 0 };
            current.total += 1;

            if (service.isAvailable) {
                current.visible += 1;
            }

            counters.set(slug, current);
        });

        return counters;
    }, [externalServices]);

    async function toggleAvailability(
        serviceId: string,
        currentValue: boolean,
    ): Promise<void> {
        setBusyId(serviceId);

        try {
            await servicesApi.toggleAvailability(serviceId, !currentValue);
            await queryClient.invalidateQueries({ queryKey: ["services"] });
            success(
                !currentValue
                    ? t("admin.services.toast.activated")
                    : t("admin.services.toast.deactivated"),
            );
        } catch {
            error(t("admin.services.toast.error"));
        } finally {
            setBusyId(null);
        }
    }

    async function refreshFareHarborData(): Promise<void> {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["fareharbor"] }),
            queryClient.invalidateQueries({ queryKey: ["services"] }),
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] }),
        ]);
    }

    async function createFareHarborCompany(): Promise<void> {
        const displayName = newFareHarborCompany.display_name.trim();
        const companySlug = newFareHarborCompany.company_slug.trim();

        if (!displayName || !companySlug) {
            error(t("admin.services.fareharbor.toast.required"));

            return;
        }

        setFareHarborBusyId("create");

        try {
            const result = await fareHarborApi.create({
                ...newFareHarborCompany,
                display_name: displayName,
                company_slug: companySlug,
            });
            await refreshFareHarborData();
            setNewFareHarborCompany({
                display_name: "",
                company_slug: "",
                partner_id: "",
                is_enabled: true,
                sync_items_enabled: true,
                sync_details_enabled: true,
                create_partner_account: false,
            });
            if (result.partnerCredentials?.temporaryPassword) {
                success(
                    `${t("admin.services.fareharbor.toast.created")} ${result.partnerCredentials.email} / ${result.partnerCredentials.temporaryPassword}`,
                );
            } else {
                success(t("admin.services.fareharbor.toast.created"));
            }
        } catch {
            error(t("admin.services.fareharbor.toast.create_error"));
        } finally {
            setFareHarborBusyId(null);
        }
    }

    async function patchFareHarborCompany(
        company: FareHarborCompany,
        payload: Partial<FareHarborCompanyPayload>,
    ): Promise<void> {
        setFareHarborBusyId(company.id);

        try {
            await fareHarborApi.update(company.id, payload);
            await refreshFareHarborData();
            success(t("admin.services.fareharbor.toast.updated"));
        } catch {
            error(t("admin.services.fareharbor.toast.update_error"));
        } finally {
            setFareHarborBusyId(null);
        }
    }

    async function syncFareHarborCompany(
        company: FareHarborCompany,
    ): Promise<void> {
        setFareHarborBusyId(`sync:${company.id}`);

        try {
            await fareHarborApi.syncCompany(company.id);
            await refreshFareHarborData();
            success(
                t("admin.services.fareharbor.toast.sync_success").replace(
                    "{name}",
                    company.displayName,
                ),
            );
        } catch {
            error(
                t("admin.services.fareharbor.toast.sync_error").replace(
                    "{name}",
                    company.displayName,
                ),
            );
        } finally {
            setFareHarborBusyId(null);
        }
    }

    async function syncAllFareHarborCompanies(): Promise<void> {
        setIsFareHarborSyncAllBusy(true);

        try {
            await fareHarborApi.syncAll();
            await refreshFareHarborData();
            success(t("admin.services.fareharbor.toast.sync_all_success"));
        } catch {
            error(t("admin.services.fareharbor.toast.sync_all_error"));
        } finally {
            setIsFareHarborSyncAllBusy(false);
        }
    }

    async function createFareHarborPartnerAccount(
        company: FareHarborCompany,
    ): Promise<void> {
        setFareHarborBusyId(`partner:${company.id}`);

        try {
            const result = await fareHarborApi.createPartnerAccount(company.id);
            await refreshFareHarborData();
            success(
                `${t("admin.services.fareharbor.toast.partner_created").replace("{name}", result.company.displayName)} ${result.partnerCredentials.email} / ${result.partnerCredentials.temporaryPassword}`,
            );
        } catch {
            error(t("admin.services.fareharbor.toast.partner_error"));
        } finally {
            setFareHarborBusyId(null);
        }
    }

    function fareHarborStatusLabel(status: string): string {
        const normalizedStatus = status.toLowerCase();

        if (
            ["idle", "syncing", "success", "failed"].includes(normalizedStatus)
        ) {
            return t(`admin.services.fareharbor.status.${normalizedStatus}`);
        }

        return status;
    }

    function fareHarborStatusTone(status: string): string {
        const normalizedStatus = status.toLowerCase();

        if (normalizedStatus === "success") {
            return "success";
        }

        if (normalizedStatus === "failed") {
            return "failed";
        }

        if (normalizedStatus === "syncing") {
            return "syncing";
        }

        return "idle";
    }

    function exportServicesCsv(): void {
        const rows = [
            [
                "id",
                "titre",
                t("admin.services.csv.category"),
                "source",
                "partenaire_id",
                "ville",
                "pays",
                "prix_client",
                "commission",
                "actif",
            ],
            ...filteredServices.map((service) => [
                service.id,
                service.title,
                service.category,
                service.sourceType ?? "LOCAL",
                service.partnerId,
                service.location.city,
                service.location.country,
                String(service.clientPrice),
                String(service.commissionAmount),
                service.isAvailable ? "1" : "0",
            ]),
        ];
        const csv = rows
            .map((row) =>
                row
                    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                    .join(","),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "wandireo-services.csv";
        link.click();
        URL.revokeObjectURL(url);
    }

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="wdr-admin-svc">
            <section className="wdr-admin-svc__hero">
                <div className="wdr-admin-svc__hero-content">
                    <p className="wdr-admin-svc__hero-badge">
                        {t("admin.services.badge")}
                    </p>
                    <h1 className="wdr-admin-svc__hero-title">
                        {t("admin.services.title")}
                    </h1>
                    <p className="wdr-admin-svc__hero-subtitle">
                        {t("admin.services.subtitle")
                            .replace("{active}", String(activeCount))
                            .replace("{total}", String(allServices.length))}
                    </p>
                </div>
            </section>

            <AdminSectionNav active="services" />

            <div className="wdr-admin-svc__body">
                <div
                    className="wdr-admin-svc__filters"
                    role="group"
                    aria-label={t("admin.services.filters_aria")}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate({ name: "admin-service-structure" })
                        }
                    >
                        {t("admin.services.configure_structure")}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate({ name: "admin-service-form" })}
                    >
                        {t("admin.services.create")}
                    </Button>

                    <input
                        className="wdr-admin-svc__filter-select wdr-admin-svc__filter-input"
                        type="search"
                        placeholder={t("admin.services.search_placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label={t("admin.services.search_aria")}
                    />

                    <select
                        className="wdr-admin-svc__filter-select"
                        value={filterCategory}
                        onChange={(e) =>
                            setFilterCategory(
                                e.target.value as ServiceCategory | "all",
                            )
                        }
                        aria-label={t("admin.services.filter.category")}
                    >
                        <option value="all">
                            {t("admin.services.filter.all_categories")}
                        </option>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="wdr-admin-svc__filter-select"
                        value={filterPartner}
                        onChange={(e) => setFilterPartner(e.target.value)}
                        aria-label={t("admin.services.filter.partner")}
                    >
                        <option value="all">
                            {t("admin.services.filter.all_partners")}
                        </option>
                        {partners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                                {partner.role === "PARTNER"
                                    ? partner.companyName
                                    : partner.email}
                            </option>
                        ))}
                    </select>

                    <select
                        className="wdr-admin-svc__filter-select"
                        value={filterSource}
                        onChange={(e) =>
                            setFilterSource(e.target.value as SourceFilter)
                        }
                        aria-label={t("admin.services.filter.source")}
                    >
                        <option value="all">
                            {t("admin.services.filter.all_sources")}
                        </option>
                        <option value="LOCAL">
                            {t("admin.services.filter.local")}
                        </option>
                        <option value="EXTERNAL">
                            {t("admin.services.filter.external")}
                        </option>
                    </select>

                    <div
                        className="wdr-admin-svc__filter-tabs"
                        role="group"
                        aria-label={t("admin.services.filter.availability")}
                    >
                        {(["all", "active", "inactive"] as const).map(
                            (value) => (
                                <button
                                    key={value}
                                    className={`wdr-admin-svc__filter-tab${filterAvailability === value ? "wdr-admin-svc__filter-tab--active" : ""}`}
                                    onClick={() => setFilterAvailability(value)}
                                >
                                    {value === "all"
                                        ? t("admin.services.filter.all")
                                        : value === "active"
                                          ? t("admin.services.filter.active")
                                          : t("admin.services.filter.inactive")}
                                </button>
                            ),
                        )}
                    </div>

                    <span className="wdr-admin-svc__filter-count">
                        {t("admin.services.results").replace(
                            "{count}",
                            String(filteredServices.length),
                        )}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={exportServicesCsv}
                    >
                        {t("admin.services.export_csv")}
                    </Button>
                </div>

                <section className="wdr-admin-svc__fareharbor">
                    <div className="wdr-admin-svc__fareharbor-header">
                        <div>
                            <p className="wdr-admin-svc__fareharbor-eyebrow">
                                {t("admin.services.fareharbor.eyebrow")}
                            </p>
                            <h2 className="wdr-admin-svc__fareharbor-title">
                                FareHarbor
                            </h2>
                            <p className="wdr-admin-svc__fareharbor-subtitle">
                                {`${fareHarborCompanies.length} société(s) suivie(s), ${externalServicesCount} service(s) importé(s), ${externalVisibleServicesCount} publié(s).`}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            loading={isFareHarborSyncAllBusy}
                            onClick={syncAllFareHarborCompanies}
                        >
                            {t("admin.services.fareharbor.sync_all")}
                        </Button>
                    </div>

                    <div className="wdr-admin-svc__fareharbor-summary">
                        <article className="wdr-admin-svc__fareharbor-stat">
                            <span className="wdr-admin-svc__fareharbor-stat-label">
                                Sociétés suivies
                            </span>
                            <strong className="wdr-admin-svc__fareharbor-stat-value">
                                {fareHarborCompanies.length}
                            </strong>
                            <span className="wdr-admin-svc__fareharbor-stat-note">
                                {enabledCompaniesCount} actives
                            </span>
                        </article>
                        <article className="wdr-admin-svc__fareharbor-stat">
                            <span className="wdr-admin-svc__fareharbor-stat-label">
                                Services importés
                            </span>
                            <strong className="wdr-admin-svc__fareharbor-stat-value">
                                {externalServicesCount}
                            </strong>
                            <span className="wdr-admin-svc__fareharbor-stat-note">
                                catalogue synchronisé
                            </span>
                        </article>
                        <article className="wdr-admin-svc__fareharbor-stat">
                            <span className="wdr-admin-svc__fareharbor-stat-label">
                                Services publiés
                            </span>
                            <strong className="wdr-admin-svc__fareharbor-stat-value">
                                {externalVisibleServicesCount}
                            </strong>
                            <span className="wdr-admin-svc__fareharbor-stat-note">
                                visibles sur le site
                            </span>
                        </article>
                        <article
                            className={`wdr-admin-svc__fareharbor-stat ${failingCompaniesCount > 0 ? "wdr-admin-svc__fareharbor-stat--danger" : healthyCompaniesCount > 0 ? "wdr-admin-svc__fareharbor-stat--success" : ""}`}
                        >
                            <span className="wdr-admin-svc__fareharbor-stat-label">
                                Santé de la sync
                            </span>
                            <strong className="wdr-admin-svc__fareharbor-stat-value">
                                {healthyCompaniesCount}
                            </strong>
                            <span className="wdr-admin-svc__fareharbor-stat-note">
                                {failingCompaniesCount} en erreur
                            </span>
                        </article>
                    </div>

                    <p className="wdr-admin-svc__fareharbor-note">
                        Tous les services importés FareHarbor sont désormais
                        publiés par défaut. Les exceptions restent possibles via
                        les overrides service par service.
                    </p>

                    <div className="wdr-admin-svc__fareharbor-create">
                        <input
                            className="wdr-admin-svc__filter-select wdr-admin-svc__filter-input"
                            type="text"
                            placeholder={t(
                                "admin.services.fareharbor.display_name_placeholder",
                            )}
                            value={newFareHarborCompany.display_name}
                            onChange={(e) =>
                                setNewFareHarborCompany((current) => ({
                                    ...current,
                                    display_name: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="wdr-admin-svc__filter-select wdr-admin-svc__filter-input"
                            type="text"
                            placeholder={t(
                                "admin.services.fareharbor.slug_placeholder",
                            )}
                            value={newFareHarborCompany.company_slug}
                            onChange={(e) =>
                                setNewFareHarborCompany((current) => ({
                                    ...current,
                                    company_slug: e.target.value
                                        .trim()
                                        .toLowerCase(),
                                }))
                            }
                        />
                        <label className="wdr-admin-svc__checkbox">
                            <input
                                type="checkbox"
                                checked={
                                    newFareHarborCompany.sync_items_enabled
                                }
                                onChange={(e) =>
                                    setNewFareHarborCompany((current) => ({
                                        ...current,
                                        sync_items_enabled: e.target.checked,
                                    }))
                                }
                            />
                            <span>{t("admin.services.fareharbor.items")}</span>
                        </label>
                        <label className="wdr-admin-svc__checkbox">
                            <input
                                type="checkbox"
                                checked={
                                    newFareHarborCompany.sync_details_enabled
                                }
                                onChange={(e) =>
                                    setNewFareHarborCompany((current) => ({
                                        ...current,
                                        sync_details_enabled: e.target.checked,
                                    }))
                                }
                            />
                            <span>
                                {t("admin.services.fareharbor.details")}
                            </span>
                        </label>
                        <select
                            className="wdr-admin-svc__filter-select"
                            value={newFareHarborCompany.partner_id ?? ""}
                            onChange={(e) =>
                                setNewFareHarborCompany((current) => ({
                                    ...current,
                                    partner_id: e.target.value || undefined,
                                    create_partner_account: e.target.value
                                        ? false
                                        : current.create_partner_account,
                                }))
                            }
                        >
                            <option value="">
                                {t(
                                    "admin.services.fareharbor.partner_none_assigned",
                                )}
                            </option>
                            {partners.map((partner) => (
                                <option key={partner.id} value={partner.id}>
                                    {partner.companyName}
                                </option>
                            ))}
                        </select>
                        <label className="wdr-admin-svc__checkbox">
                            <input
                                type="checkbox"
                                checked={
                                    newFareHarborCompany.create_partner_account ??
                                    false
                                }
                                onChange={(e) =>
                                    setNewFareHarborCompany((current) => ({
                                        ...current,
                                        create_partner_account:
                                            e.target.checked,
                                        partner_id: e.target.checked
                                            ? undefined
                                            : current.partner_id,
                                    }))
                                }
                            />
                            <span>
                                {t(
                                    "admin.services.fareharbor.partner_create_with_company",
                                )}
                            </span>
                        </label>
                        <Button
                            size="sm"
                            loading={fareHarborBusyId === "create"}
                            onClick={createFareHarborCompany}
                        >
                            {t("admin.services.fareharbor.add")}
                        </Button>
                    </div>

                    {isFareHarborLoading ? (
                        <p className="wdr-admin-svc__fareharbor-empty">
                            {t("admin.services.fareharbor.loading")}
                        </p>
                    ) : fareHarborCompanies.length === 0 ? (
                        <p className="wdr-admin-svc__fareharbor-empty">
                            {t("admin.services.fareharbor.empty")}
                        </p>
                    ) : (
                        <div className="wdr-admin-svc__fareharbor-grid">
                            {fareHarborCompanies.map((company) => {
                                const isUpdating =
                                    fareHarborBusyId === company.id;
                                const isSyncing =
                                    fareHarborBusyId === `sync:${company.id}`;
                                const isCreatingPartner =
                                    fareHarborBusyId ===
                                    `partner:${company.id}`;
                                const companyServiceStats =
                                    servicesByCompanySlug.get(
                                        company.companySlug,
                                    ) ?? {
                                        total: company.lastImportedItemsCount,
                                        visible: 0,
                                    };
                                const statusTone = fareHarborStatusTone(
                                    company.lastStatus,
                                );

                                return (
                                    <article
                                        key={company.id}
                                        className="wdr-admin-svc__fareharbor-card"
                                    >
                                        <div className="wdr-admin-svc__fareharbor-card-top">
                                            <div>
                                                <h3 className="wdr-admin-svc__fareharbor-card-title">
                                                    {company.displayName}
                                                </h3>
                                                <p className="wdr-admin-svc__fareharbor-card-slug">
                                                    {company.companySlug}
                                                </p>
                                            </div>
                                            <span
                                                className={`wdr-admin-svc__fareharbor-status wdr-admin-svc__fareharbor-status--${statusTone}`}
                                            >
                                                {fareHarborStatusLabel(
                                                    company.lastStatus,
                                                )}
                                            </span>
                                        </div>

                                        <div className="wdr-admin-svc__fareharbor-meta">
                                            <span>
                                                {`${companyServiceStats.total} importé(s)`}
                                            </span>
                                            <span>
                                                {`${companyServiceStats.visible} publié(s)`}
                                            </span>
                                            <span>
                                                {company.isEnabled
                                                    ? "sync active"
                                                    : "sync coupée"}
                                            </span>
                                        </div>

                                        <div className="wdr-admin-svc__fareharbor-meta">
                                            <span>
                                                {company.lastSyncedAt
                                                    ? `${t("admin.services.fareharbor.last_sync")} ${company.lastSyncedAt.toLocaleString()}`
                                                    : t(
                                                          "admin.services.fareharbor.never_synced",
                                                      )}
                                            </span>
                                            <span>
                                                {t(
                                                    "admin.services.fareharbor.partner_summary",
                                                ).replace(
                                                    "{name}",
                                                    company.partnerName ??
                                                        t(
                                                            "admin.services.fareharbor.partner_no_account",
                                                        ),
                                                )}
                                            </span>
                                        </div>

                                        {company.lastError ? (
                                            <p className="wdr-admin-svc__fareharbor-error">
                                                {company.lastError}
                                            </p>
                                        ) : null}
                                        {company.partnerEmail ? (
                                            <p className="wdr-admin-svc__fareharbor-email">
                                                {company.partnerEmail}
                                            </p>
                                        ) : null}

                                        <div className="wdr-admin-svc__fareharbor-toggles">
                                            <label className="wdr-admin-svc__checkbox">
                                                <span>
                                                    {t(
                                                        "admin.services.fareharbor.partner_label",
                                                    )}
                                                </span>
                                                <select
                                                    className="wdr-admin-svc__filter-select"
                                                    value={
                                                        company.partnerId ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        patchFareHarborCompany(
                                                            company,
                                                            {
                                                                partner_id:
                                                                    e.target
                                                                        .value ||
                                                                    undefined,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating ||
                                                        isSyncing ||
                                                        isCreatingPartner
                                                    }
                                                >
                                                    <option value="">
                                                        {t(
                                                            "admin.services.fareharbor.partner_none_assigned",
                                                        )}
                                                    </option>
                                                    {partners.map((partner) => (
                                                        <option
                                                            key={partner.id}
                                                            value={partner.id}
                                                        >
                                                            {
                                                                partner.companyName
                                                            }
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="wdr-admin-svc__checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={company.isEnabled}
                                                    onChange={(e) =>
                                                        patchFareHarborCompany(
                                                            company,
                                                            {
                                                                is_enabled:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating || isSyncing
                                                    }
                                                />
                                                <span>
                                                    {t(
                                                        "admin.services.fareharbor.enabled",
                                                    )}
                                                </span>
                                            </label>
                                            <label className="wdr-admin-svc__checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        company.syncItemsEnabled
                                                    }
                                                    onChange={(e) =>
                                                        patchFareHarborCompany(
                                                            company,
                                                            {
                                                                sync_items_enabled:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating || isSyncing
                                                    }
                                                />
                                                <span>
                                                    {t(
                                                        "admin.services.fareharbor.sync_items",
                                                    )}
                                                </span>
                                            </label>
                                            <label className="wdr-admin-svc__checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        company.syncDetailsEnabled
                                                    }
                                                    onChange={(e) =>
                                                        patchFareHarborCompany(
                                                            company,
                                                            {
                                                                sync_details_enabled:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating || isSyncing
                                                    }
                                                />
                                                <span>
                                                    {t(
                                                        "admin.services.fareharbor.sync_details",
                                                    )}
                                                </span>
                                            </label>
                                        </div>

                                        <div className="wdr-admin-svc__fareharbor-actions">
                                            {!company.partnerId && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    loading={isCreatingPartner}
                                                    onClick={() =>
                                                        createFareHarborPartnerAccount(
                                                            company,
                                                        )
                                                    }
                                                >
                                                    {t(
                                                        "admin.services.fareharbor.partner_create",
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                loading={isSyncing}
                                                onClick={() =>
                                                    syncFareHarborCompany(
                                                        company,
                                                    )
                                                }
                                            >
                                                {t(
                                                    "admin.services.fareharbor.sync",
                                                )}
                                            </Button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="wdr-admin-svc__table-wrapper">
                    <table
                        className="wdr-admin-svc__table"
                        aria-label={t("admin.services.table_aria")}
                    >
                        <thead>
                            <tr>
                                <th scope="col">
                                    {t("admin.services.col.service")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.category")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.partner")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.source")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.client_price")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.commission")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.partner_net")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.rating")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.availability")}
                                </th>
                                <th scope="col">
                                    {t("admin.services.col.action")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="wdr-admin-svc__table-empty"
                                    >
                                        {t("admin.services.empty")}
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => {
                                    const partner = partners.find(
                                        (entry) =>
                                            entry.id === service.partnerId,
                                    );

                                    return (
                                        <tr
                                            key={service.id}
                                            className={
                                                !service.isAvailable ||
                                                service.sourceType ===
                                                    "EXTERNAL"
                                                    ? "wdr-admin-svc__table-row--inactive"
                                                    : ""
                                            }
                                        >
                                            <td className="wdr-admin-svc__table-title">
                                                <span className="wdr-admin-svc__service-title">
                                                    {service.title}
                                                </span>
                                                <span className="wdr-admin-svc__service-location">
                                                    {service.location.city},{" "}
                                                    {service.location.country}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-svc__category-badge wdr-admin-svc__category-badge--${service.category.toLowerCase()}`}
                                                >
                                                    {
                                                        categoryLabels[
                                                            service.category
                                                        ]
                                                    }
                                                </span>
                                                <span
                                                    className={`wdr-admin-svc__source-badge wdr-admin-svc__source-badge--${(service.sourceType ?? "LOCAL").toLowerCase()}`}
                                                >
                                                    {service.sourceType ??
                                                        "LOCAL"}
                                                </span>
                                            </td>
                                            <td className="wdr-admin-svc__table-partner">
                                                {partner?.role === "PARTNER"
                                                    ? partner.companyName
                                                    : service.partnerId ||
                                                      t(
                                                          "admin.services.unassigned",
                                                      )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-svc__availability${service.sourceType === "EXTERNAL" ? " wdr-admin-svc__availability--inactive" : " wdr-admin-svc__availability--active"}`}
                                                >
                                                    {service.sourceType ??
                                                        "LOCAL"}
                                                </span>
                                            </td>
                                            <td className="wdr-admin-svc__table-price">
                                                {formatPrice(
                                                    service.clientPrice,
                                                    service.currency,
                                                )}
                                                <span className="wdr-admin-svc__table-unit">
                                                    /
                                                    {service.pricingUnit
                                                        .replace("PAR_", "")
                                                        .toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="wdr-admin-svc__table-commission">
                                                {formatPrice(
                                                    service.commissionAmount,
                                                    service.currency,
                                                )}
                                                <span className="wdr-admin-svc__table-rate">
                                                    (
                                                    {Math.round(
                                                        service.commissionRate *
                                                            100,
                                                    )}{" "}
                                                    %)
                                                </span>
                                            </td>
                                            <td className="wdr-admin-svc__table-net">
                                                {formatPrice(
                                                    service.partnerPrice,
                                                    service.currency,
                                                )}
                                            </td>
                                            <td>
                                                {service.rating != null ? (
                                                    <span className="wdr-admin-svc__rating">
                                                        {service.rating.toFixed(
                                                            1,
                                                        )}
                                                        <span className="wdr-admin-svc__rating-count">
                                                            (
                                                            {
                                                                service.reviewCount
                                                            }
                                                            )
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="wdr-admin-svc__rating-none">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-svc__availability${service.isAvailable ? "wdr-admin-svc__availability--active" : "wdr-admin-svc__availability--inactive"}`}
                                                >
                                                    {service.isAvailable
                                                        ? t(
                                                              "admin.services.status.active",
                                                          )
                                                        : t(
                                                              "admin.services.status.inactive",
                                                          )}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="wdr-admin-svc__table-actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate({
                                                                name: "admin-service-form",
                                                                serviceId:
                                                                    service.id,
                                                            })
                                                        }
                                                    >
                                                        {t(
                                                            "admin.services.edit",
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant={
                                                            service.isAvailable
                                                                ? "danger"
                                                                : "primary"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            void toggleAvailability(
                                                                service.id,
                                                                service.isAvailable,
                                                            )
                                                        }
                                                        disabled={
                                                            busyId ===
                                                            service.id
                                                        }
                                                        aria-label={
                                                            service.isAvailable
                                                                ? t(
                                                                      "admin.services.deactivate_aria",
                                                                  ).replace(
                                                                      "{title}",
                                                                      service.title,
                                                                  )
                                                                : t(
                                                                      "admin.services.activate_aria",
                                                                  ).replace(
                                                                      "{title}",
                                                                      service.title,
                                                                  )
                                                        }
                                                    >
                                                        {service.isAvailable ? (
                                                            <>
                                                                <EyeOffIcon />{" "}
                                                                {t(
                                                                    "admin.services.deactivate",
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeIcon />{" "}
                                                                {t(
                                                                    "admin.services.activate",
                                                                )}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
