import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { servicesApi } from '@/api/services';
import { AdminSectionNav, Button, useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useServicesData } from '@/hooks/useServicesData';
import { useAdminUsersData } from '@/hooks/useUsersData';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { ServiceCategoryNames } from '@/types/service';
import type { ServiceCategory } from '@/types/service';
import './AdminServicesPage.css';

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

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
    [ServiceCategoryNames.ACTIVITE]: 'Activite',
    [ServiceCategoryNames.BATEAU]: 'Bateau',
    [ServiceCategoryNames.HEBERGEMENT]: 'Hebergement',
    [ServiceCategoryNames.VOITURE]: 'Voiture',
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
    [ServiceCategoryNames.ACTIVITE]: '#e8f3ff',
    [ServiceCategoryNames.BATEAU]: '#e8f8ef',
    [ServiceCategoryNames.HEBERGEMENT]: '#fef9e7',
    [ServiceCategoryNames.VOITURE]: '#f3eeff',
};

const CATEGORY_TEXT_COLORS: Record<ServiceCategory, string> = {
    [ServiceCategoryNames.ACTIVITE]: 'var(--primary)',
    [ServiceCategoryNames.BATEAU]: 'var(--success-dark)',
    [ServiceCategoryNames.HEBERGEMENT]: 'var(--warning-dark)',
    [ServiceCategoryNames.VOITURE]: 'var(--brand-purple)',
};

type AvailabilityFilter = 'all' | 'active' | 'inactive';
type SourceFilter = 'all' | 'LOCAL' | 'EXTERNAL';

export const AdminServicesPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const queryClient = useQueryClient();
    const { services: allServices } = useServicesData({
        adminAll: true,
        limit: 200,
    });
    const { users } = useAdminUsersData({ role: 'PARTNER' });
    const partners = users.filter((user) => user.role === 'PARTNER');

    const [filterCategory, setFilterCategory] = useState<
        ServiceCategory | 'all'
    >('all');
    const [filterPartner, setFilterPartner] = useState<string>('all');
    const [filterAvailability, setFilterAvailability] =
        useState<AvailabilityFilter>('all');
    const [filterSource, setFilterSource] = useState<SourceFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'ADMIN') {
            navigate({ name: 'dashboard' });
        }
    }, [currentUser, navigate]);

    const filteredServices = useMemo(
        () =>
            allServices.filter((service) => {
                if (
                    filterCategory !== 'all' &&
                    service.category !== filterCategory
                ) {
return false;
}

                if (
                    filterPartner !== 'all' &&
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
                    filterSource !== 'all' &&
                    service.sourceType !== filterSource
                ) {
return false;
}

                if (filterAvailability === 'active' && !service.isAvailable) {
return false;
}

                if (filterAvailability === 'inactive' && service.isAvailable) {
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

    async function toggleAvailability(
        serviceId: string,
        currentValue: boolean,
    ): Promise<void> {
        setBusyId(serviceId);

        try {
            await servicesApi.toggleAvailability(serviceId, !currentValue);
            await queryClient.invalidateQueries({ queryKey: ['services'] });
            success(!currentValue ? 'Service active.' : 'Service desactive.');
        } catch {
            error('Impossible de changer la disponibilite du service.');
        } finally {
            setBusyId(null);
        }
    }

    function exportServicesCsv(): void {
        const rows = [
            [
                'id',
                'titre',
                'categorie',
                'source',
                'partenaire_id',
                'ville',
                'pays',
                'prix_client',
                'commission',
                'actif',
            ],
            ...filteredServices.map((service) => [
                service.id,
                service.title,
                service.category,
                service.sourceType ?? 'LOCAL',
                service.partnerId,
                service.location.city,
                service.location.country,
                String(service.clientPrice),
                String(service.commissionAmount),
                service.isAvailable ? '1' : '0',
            ]),
        ];
        const csv = rows
            .map((row) =>
                row
                    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                    .join(','),
            )
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wandireo-services.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="wdr-admin-svc">
            <section className="wdr-admin-svc__hero">
                <div className="wdr-admin-svc__hero-content">
                    <p className="wdr-admin-svc__hero-badge">Administration</p>
                    <h1 className="wdr-admin-svc__hero-title">
                        Moderation du catalogue
                    </h1>
                    <p className="wdr-admin-svc__hero-subtitle">
                        {activeCount} service(s) actif(s) sur{' '}
                        {allServices.length} au total.
                    </p>
                </div>
            </section>

            <AdminSectionNav active="services" />

            <div className="wdr-admin-svc__body">
                <div
                    className="wdr-admin-svc__filters"
                    role="group"
                    aria-label="Filtres du catalogue"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate({ name: 'admin-service-structure' })
                        }
                    >
                        Configurer la structure
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate({ name: 'admin-service-form' })}
                    >
                        Creer un service
                    </Button>

                    <input
                        className="wdr-admin-svc__filter-select wdr-admin-svc__filter-input"
                        type="search"
                        placeholder="Rechercher un service"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Rechercher un service"
                    />

                    <select
                        className="wdr-admin-svc__filter-select"
                        value={filterCategory}
                        onChange={(e) =>
                            setFilterCategory(
                                e.target.value as ServiceCategory | 'all',
                            )
                        }
                        aria-label="Filtrer par categorie"
                    >
                        <option value="all">Toutes les categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="wdr-admin-svc__filter-select"
                        value={filterPartner}
                        onChange={(e) => setFilterPartner(e.target.value)}
                        aria-label="Filtrer par partenaire"
                    >
                        <option value="all">Tous les partenaires</option>
                        {partners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                                {partner.role === 'PARTNER'
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
                        aria-label="Filtrer par source"
                    >
                        <option value="all">Toutes les sources</option>
                        <option value="LOCAL">Locales</option>
                        <option value="EXTERNAL">Externes</option>
                    </select>

                    <div
                        className="wdr-admin-svc__filter-tabs"
                        role="group"
                        aria-label="Disponibilite"
                    >
                        {(['all', 'active', 'inactive'] as const).map(
                            (value) => (
                                <button
                                    key={value}
                                    className={`wdr-admin-svc__filter-tab${filterAvailability === value ? 'wdr-admin-svc__filter-tab--active' : ''}`}
                                    onClick={() => setFilterAvailability(value)}
                                >
                                    {value === 'all'
                                        ? 'Tous'
                                        : value === 'active'
                                          ? 'Actifs'
                                          : 'Inactifs'}
                                </button>
                            ),
                        )}
                    </div>

                    <span className="wdr-admin-svc__filter-count">
                        {filteredServices.length} resultat(s)
                    </span>
                    <Button variant="ghost" size="sm" onClick={exportServicesCsv}>
                        Export CSV
                    </Button>
                </div>

                <div className="wdr-admin-svc__table-wrapper">
                    <table
                        className="wdr-admin-svc__table"
                        aria-label="Catalogue de services"
                    >
                        <thead>
                            <tr>
                                <th scope="col">Service</th>
                                <th scope="col">Categorie</th>
                                <th scope="col">Partenaire</th>
                                <th scope="col">Source</th>
                                <th scope="col">Prix client</th>
                                <th scope="col">Commission</th>
                                <th scope="col">Net partenaire</th>
                                <th scope="col">Note</th>
                                <th scope="col">Disponibilite</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="wdr-admin-svc__table-empty"
                                    >
                                        Aucun service ne correspond aux filtres
                                        selectionnes.
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
                                                    'EXTERNAL'
                                                    ? 'wdr-admin-svc__table-row--inactive'
                                                    : ''
                                            }
                                        >
                                            <td className="wdr-admin-svc__table-title">
                                                <span className="wdr-admin-svc__service-title">
                                                    {service.title}
                                                </span>
                                                <span className="wdr-admin-svc__service-location">
                                                    {service.location.city},{' '}
                                                    {service.location.country}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className="wdr-admin-svc__category-badge"
                                                    style={{
                                                        background:
                                                            CATEGORY_COLORS[
                                                                service.category
                                                            ],
                                                        color: CATEGORY_TEXT_COLORS[
                                                            service.category
                                                        ],
                                                    }}
                                                >
                                                    {
                                                        CATEGORY_LABELS[
                                                            service.category
                                                        ]
                                                    }
                                                </span>
                                                <span
                                                    className={`wdr-admin-svc__source-badge wdr-admin-svc__source-badge--${(service.sourceType ?? 'LOCAL').toLowerCase()}`}
                                                >
                                                    {service.sourceType ??
                                                        'LOCAL'}
                                                </span>
                                            </td>
                                            <td className="wdr-admin-svc__table-partner">
                                                {partner?.role === 'PARTNER'
                                                    ? partner.companyName
                                                    : service.partnerId || 'Non assigne'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-svc__availability${service.sourceType === 'EXTERNAL' ? ' wdr-admin-svc__availability--inactive' : ' wdr-admin-svc__availability--active'}`}
                                                >
                                                    {service.sourceType ??
                                                        'LOCAL'}
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
                                                        .replace('PAR_', '')
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
                                                    )}{' '}
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
                                                    className={`wdr-admin-svc__availability${service.isAvailable ? 'wdr-admin-svc__availability--active' : 'wdr-admin-svc__availability--inactive'}`}
                                                >
                                                    {service.isAvailable
                                                        ? 'Actif'
                                                        : 'Inactif'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="wdr-admin-svc__table-actions">
                                                    {service.sourceType !==
                                                        'EXTERNAL' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate({
                                                                    name: 'admin-service-form',
                                                                    serviceId:
                                                                        service.id,
                                                                })
                                                            }
                                                        >
                                                            Modifier
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant={
                                                            service.sourceType ===
                                                            'EXTERNAL'
                                                                ? 'ghost'
                                                                : service.isAvailable
                                                                  ? 'danger'
                                                                  : 'primary'
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
                                                                service.id ||
                                                            service.sourceType ===
                                                                'EXTERNAL'
                                                        }
                                                        aria-label={
                                                            service.sourceType ===
                                                            'EXTERNAL'
                                                                ? `Service externe ${service.title} en lecture seule`
                                                                : service.isAvailable
                                                                  ? `Desactiver le service ${service.title}`
                                                                  : `Activer le service ${service.title}`
                                                        }
                                                    >
                                                        {service.sourceType ===
                                                        'EXTERNAL' ? (
                                                            'Lecture seule'
                                                        ) : service.isAvailable ? (
                                                            <>
                                                                <EyeOffIcon />{' '}
                                                                Desactiver
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeIcon /> Activer
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
