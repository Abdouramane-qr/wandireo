/**
 * @file pages/AdminDashboardPage/index.tsx
 * @description Tableau de bord principal de l'espace Administration Wandireo.
 *
 * Affiche :
 *   1. Hero avec badge Admin et identité de l'administrateur connecté.
 *   2. Navigation rapide entre les sections de l'espace admin.
 *   3. Métriques globales :
 *        - Volume d'affaires total (réservations CONFIRMED)
 *        - Commissions totales perçues par Wandireo
 *        - Nombre de partenaires actifs
 *        - Nombre de clients inscrits
 *   4. Tableau des réservations récentes avec statuts.
 *
 * Guard : Redirige vers l'accueil si l'utilisateur n'est pas un ADMIN.
 *
 * Calcul des commissions :
 *   commissionEarned = totalPrice * commissionRate / (1 + commissionRate)
 *   Derivé de : clientPrice = partnerPrice * (1 + commissionRate)
 *               totalPrice  = participants * clientPrice
 *               => partnerNet = totalPrice / (1 + commissionRate)
 *               => wandireoFee = totalPrice - partnerNet
 */

import React, { useEffect, useMemo } from "react";
import { AdminSectionNav, Button } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useAnalyticsFunnelData } from "@/hooks/useAnalyticsData";
import { useAdminBookingsData } from "@/hooks/useBookingsData";
import { useAdminReviewsData } from "@/hooks/useReviewsData";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdminUsersData } from "@/hooks/useUsersData";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames } from "@/types/booking";
import "./AdminDashboardPage.css";

// ============================================================
// Icones SVG
// ============================================================

const ShieldIcon: React.FC = () => (
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const UsersIcon: React.FC = () => (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const GridIcon: React.FC = () => (
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const CreditCardIcon: React.FC = () => (
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
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const TrendingUpIcon: React.FC = () => (
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
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const LayersIcon: React.FC = () => (
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
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

// ============================================================
// Helpers
// ============================================================

/**
 * Calcule la commission Wandireo perçue sur une réservation.
 * commissionEarned = totalPrice * rate / (1 + rate)
 * Valide uniquement pour les réservations avec paiement en ligne effectif.
 */
function calcCommission(totalPrice: number, commissionRate: number): number {
    return (totalPrice * commissionRate) / (1 + commissionRate);
}

function getStatusLabel(status: string, t: (key: string) => string): string {
    if (status === BookingStatusNames.CONFIRMED) {
        return t("admin.dashboard.status.confirmed");
    }

    if (status === BookingStatusNames.PENDING) {
        return t("admin.dashboard.status.pending");
    }

    return t("admin.dashboard.status.cancelled");
}

function getStatusClass(status: string): string {
    if (status === BookingStatusNames.CONFIRMED) {
        return "confirmed";
    }

    if (status === BookingStatusNames.PENDING) {
        return "pending";
    }

    return "cancelled";
}

// ============================================================
// Composant principal
// ============================================================

export const AdminDashboardPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();

    // Hooks appelés avant tout retour conditionnel
    const { bookings } = useAdminBookingsData();
    const { users } = useAdminUsersData();
    const { services } = useServicesData({ adminAll: true, limit: 300 });
    const { reviews } = useAdminReviewsData({ status: "PENDING" });
    const { data: funnel } = useAnalyticsFunnelData(30);

    // Sources de données effectives (API prioritaire, fallback mock)
    const allPartners = users.filter((u) => u.role === "PARTNER");
    const allClients = users.filter((u) => u.role === "CLIENT");

    // --- Guard : accès réservé aux ADMIN ---
    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    // ============================================================
    // Calcul des métriques globales
    // ============================================================

    const metrics = useMemo(() => {
        const confirmedBookings = bookings.filter(
            (b) => b.status === BookingStatusNames.CONFIRMED,
        );

        const totalVolume = confirmedBookings.reduce(
            (sum, b) => sum + b.totalPrice,
            0,
        );

        const totalCommissions = confirmedBookings.reduce((sum, b) => {
            const partner = allPartners.find((p) => p.id === b.partnerId);

            if (!partner) {
                return sum;
            }

            return (
                sum +
                calcCommission(
                    b.totalPrice,
                    (partner as { commissionRate?: number }).commissionRate ??
                        0.1,
                )
            );
        }, 0);

        const pendingCount = bookings.filter(
            (b) => b.status === BookingStatusNames.PENDING,
        ).length;

        return {
            totalVolume,
            totalCommissions,
            confirmedBookingsCount: confirmedBookings.length,
            pendingCount,
            partnersCount: allPartners.length,
            clientsCount: allClients.length,
            approvedPartnersCount: allPartners.filter(
                (partner) => partner.partnerStatus === "APPROVED",
            ).length,
            activeServicesCount: services.filter(
                (service) => service.isAvailable,
            ).length,
            pendingReviewsCount: reviews.length,
        };
    }, [bookings, allPartners, allClients, reviews.length, services]);

    const recentBookings = useMemo(
        () =>
            [...bookings]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5),
        [bookings],
    );

    const adminInitials =
        `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

    return (
        <div className="wdr-admin-dash">
            {/* ---- Hero ---- */}
            <section className="wdr-admin-dash__hero">
                <div className="wdr-admin-dash__hero-content">
                    <div className="wdr-admin-dash__hero-text">
                        <p className="wdr-admin-dash__hero-badge">
                            {t("admin.dashboard.badge")}
                        </p>
                        <h1 className="wdr-admin-dash__hero-title">
                            {t("admin.dashboard.title")} <span>Wandireo</span>
                        </h1>
                        <p className="wdr-admin-dash__hero-subtitle">
                            {t("admin.dashboard.subtitle")}{" "}
                            {new Date().toLocaleDateString(intlLocale, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="wdr-admin-dash__hero-right">
                        <div
                            className="wdr-admin-dash__hero-avatar"
                            aria-label={t("admin.dashboard.avatar_label")}
                        >
                            {adminInitials}
                        </div>
                        <span className="wdr-admin-dash__hero-name">
                            {currentUser.firstName} {currentUser.lastName}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="wdr-admin-dash__logout-btn"
                            onClick={() => {
                                logout();
                                navigate({ name: "home" });
                            }}
                        >
                            {t("admin.dashboard.logout")}
                        </Button>
                    </div>
                </div>
            </section>

            {/* ---- Navigation admin ---- */}
            <AdminSectionNav active="dashboard" />

            {/* ---- Corps ---- */}
            <div className="wdr-admin-dash__body">
                {/* ---- Métriques globales ---- */}
                <section
                    className="wdr-admin-dash__metrics"
                    aria-label={t("admin.dashboard.metrics_aria")}
                >
                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--primary">
                        <div className="wdr-admin-dash__metric-icon">
                            <TrendingUpIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                {t("admin.dashboard.metric.volume")}
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {formatPrice(metrics.totalVolume, "EUR")}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {t("admin.dashboard.metric.volume_sub")}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--success">
                        <div className="wdr-admin-dash__metric-icon">
                            <CreditCardIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                {t("admin.dashboard.metric.commissions")}
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {formatPrice(metrics.totalCommissions, "EUR")}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {t(
                                    "admin.dashboard.metric.commissions_sub",
                                ).replace(
                                    "{count}",
                                    String(metrics.confirmedBookingsCount),
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--warning">
                        <div className="wdr-admin-dash__metric-icon">
                            <LayersIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                {t("admin.dashboard.metric.pending")}
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.pendingCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {t("admin.dashboard.metric.pending_sub")}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                        <div className="wdr-admin-dash__metric-icon">
                            <UsersIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                {t("admin.dashboard.metric.accounts")}
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.clientsCount + metrics.partnersCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {t("admin.dashboard.metric.accounts_sub")
                                    .replace(
                                        "{clients}",
                                        String(metrics.clientsCount),
                                    )
                                    .replace(
                                        "{partners}",
                                        String(metrics.partnersCount),
                                    )}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                        <div className="wdr-admin-dash__metric-icon">
                            <GridIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                {t("admin.dashboard.metric.catalog")}
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.activeServicesCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {t("admin.dashboard.metric.catalog_sub")
                                    .replace(
                                        "{partners}",
                                        String(metrics.approvedPartnersCount),
                                    )
                                    .replace(
                                        "{reviews}",
                                        String(metrics.pendingReviewsCount),
                                    )}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="wdr-admin-dash__recent">
                    <div className="wdr-admin-dash__section-header">
                        <h2 className="wdr-admin-dash__section-title">
                            {t("admin.dashboard.funnel.title")}
                        </h2>
                    </div>
                    <div className="wdr-admin-dash__metrics">
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    {t("admin.dashboard.funnel.searches")}
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.searchCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {t("admin.dashboard.funnel.last_30_days")}
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    {t("admin.dashboard.funnel.views")}
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.serviceViewCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {t(
                                        "admin.dashboard.funnel.views_sub",
                                    ).replace(
                                        "{rate}",
                                        String(funnel?.searchToViewRate ?? 0),
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    {t("admin.dashboard.funnel.starts")}
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.bookingStartedCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {t(
                                        "admin.dashboard.funnel.starts_sub",
                                    ).replace(
                                        "{rate}",
                                        String(funnel?.viewToStartRate ?? 0),
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--success">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    {t("admin.dashboard.funnel.confirmed")}
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.bookingConfirmedCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {t(
                                        "admin.dashboard.funnel.confirmed_sub",
                                    ).replace(
                                        "{rate}",
                                        String(funnel?.startToConfirmRate ?? 0),
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---- Accès rapides ---- */}
                <section className="wdr-admin-dash__shortcuts">
                    <h2 className="wdr-admin-dash__section-title">
                        {t("admin.dashboard.shortcuts.title")}
                    </h2>
                    <div className="wdr-admin-dash__shortcuts-grid">
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: "admin-users" })}
                        >
                            <UsersIcon />
                            <span>
                                {t("admin.dashboard.shortcuts.partners")}
                            </span>
                            <small>
                                {t("admin.dashboard.shortcuts.partners_sub")}
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: "admin-services" })}
                        >
                            <GridIcon />
                            <span>
                                {t("admin.dashboard.shortcuts.catalog")}
                            </span>
                            <small>
                                {t("admin.dashboard.shortcuts.catalog_sub")}
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() =>
                                navigate({ name: "admin-transactions" })
                            }
                        >
                            <CreditCardIcon />
                            <span>
                                {t("admin.dashboard.shortcuts.transactions")}
                            </span>
                            <small>
                                {t(
                                    "admin.dashboard.shortcuts.transactions_sub",
                                )}
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: "admin-reviews" })}
                        >
                            <ShieldIcon />
                            <span>
                                {t("admin.dashboard.shortcuts.reviews")}
                            </span>
                            <small>
                                {t(
                                    "admin.dashboard.shortcuts.reviews_sub",
                                ).replace(
                                    "{count}",
                                    String(metrics.pendingReviewsCount),
                                )}
                            </small>
                        </button>
                    </div>
                </section>

                {/* ---- Réservations récentes ---- */}
                <section className="wdr-admin-dash__recent">
                    <div className="wdr-admin-dash__section-header">
                        <h2 className="wdr-admin-dash__section-title">
                            {t("admin.dashboard.recent.title")}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({ name: "admin-transactions" })
                            }
                        >
                            {t("admin.dashboard.recent.view_all")}
                        </Button>
                    </div>
                    <div className="wdr-admin-dash__table-wrapper">
                        <table
                            className="wdr-admin-dash__table"
                            aria-label={t("admin.dashboard.recent.aria")}
                        >
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">
                                        {t("admin.dashboard.table.client")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.dashboard.table.partner")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.dashboard.table.amount")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.dashboard.table.commission")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.dashboard.table.status")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => {
                                    const partner = allPartners.find(
                                        (p) => p.id === booking.partnerId,
                                    );
                                    const client = allClients.find(
                                        (c) => c.id === booking.clientId,
                                    );
                                    const commission = partner
                                        ? calcCommission(
                                              booking.totalPrice,
                                              (
                                                  partner as {
                                                      commissionRate?: number;
                                                  }
                                              ).commissionRate ?? 0.1,
                                          )
                                        : 0;

                                    return (
                                        <tr key={booking.id}>
                                            <td className="wdr-admin-dash__table-id">
                                                {booking.id}
                                            </td>
                                            <td>
                                                {client
                                                    ? `${client.firstName} ${client.lastName}`
                                                    : booking.clientId}
                                            </td>
                                            <td>
                                                {partner
                                                    ? partner.companyName
                                                    : booking.partnerId}
                                            </td>
                                            <td className="wdr-admin-dash__table-amount">
                                                {formatPrice(
                                                    booking.totalPrice,
                                                    booking.currency,
                                                )}
                                            </td>
                                            <td className="wdr-admin-dash__table-commission">
                                                {booking.status ===
                                                BookingStatusNames.CONFIRMED
                                                    ? formatPrice(
                                                          commission,
                                                          booking.currency,
                                                      )
                                                    : "—"}
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-dash__status wdr-admin-dash__status--${getStatusClass(booking.status)}`}
                                                >
                                                    {getStatusLabel(
                                                        booking.status,
                                                        t,
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};
