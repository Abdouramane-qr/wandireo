/**
 * @file pages/PartnerDashboardPage/index.tsx
 * @description Tableau de bord Partenaire — Espace Prestataire Wandireo.
 *
 * Affiche :
 *   1. Hero de bienvenue avec nom de l'entreprise, initiales et date d'adhesion.
 *   2. Bandeau de statistiques :
 *        - Revenus totaux cumules (partner.totalSales)
 *        - Revenus du mois en cours (filtres sur createdAt des reservations)
 *        - Nombre de reservations du mois
 *        - Demandes en attente
 *   3. Acces rapides vers le catalogue et la gestion des reservations.
 *
 * Guard : Redirige vers l'accueil si aucun utilisateur authentifie
 *         et vers l'espace client si l'utilisateur n'est pas un PARTNER.
 */

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { usePartnerBookingsData } from "@/hooks/useBookingsData";
import { usePartnerApprovalGuard } from "@/hooks/usePartnerApprovalGuard";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames } from "@/types/booking";
import "./PartnerDashboardPage.css";

// ============================================================
// Icones SVG internes
// ============================================================

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

const CalendarIcon: React.FC = () => (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ClockIcon: React.FC = () => (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const WalletIcon: React.FC = () => (
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
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M16 3v4M8 3v4" />
        <path d="M16 12h2" />
    </svg>
);

const ListIcon: React.FC = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const CheckCircleIcon: React.FC = () => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ArrowRightIcon: React.FC = () => (
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
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

// ============================================================
// Utilitaires
// ============================================================

function formatDate(date: Date, intlLocale: string): string {
    return new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatDateShort(date: Date, intlLocale: string): string {
    return new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

/**
 * Retourne le libelle lisible d'un statut de reservation.
 */
function statusLabel(status: string, t: (key: string) => string): string {
    switch (status) {
        case BookingStatusNames.CONFIRMED:
            return t("partner.dashboard.status.confirmed");
        case BookingStatusNames.PENDING:
            return t("partner.dashboard.status.pending");
        case BookingStatusNames.CANCELLED:
            return t("partner.dashboard.status.cancelled");
        default:
            return status;
    }
}

// ============================================================
// Composant principal
// ============================================================

export const PartnerDashboardPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const { isBlocked } = usePartnerApprovalGuard();
    const { t, intlLocale } = useTranslation();
    const partnerUser = currentUser?.role === "PARTNER" ? currentUser : null;

    // Hooks avant retours conditionnels
    const { bookings } = usePartnerBookingsData(currentUser?.id ?? "");
    const { services } = useServicesData();

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "PARTNER") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    /* Toutes les reservations appartenant a ce partenaire */
    const partnerBookings = useMemo(
        () => bookings.filter((b) => b.partnerId === (partnerUser?.id ?? "")),
        [bookings, partnerUser?.id],
    );

    /* Reservations du mois en cours */
    const monthlyBookings = useMemo(
        () =>
            partnerBookings.filter((b) => {
                const d = b.createdAt;

                return (
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear
                );
            }),
        [partnerBookings, currentMonth, currentYear],
    );

    /* Revenus du mois (somme des totalPrice des reservations CONFIRMED ce mois) */
    const monthlyRevenue = useMemo(
        () =>
            monthlyBookings
                .filter((b) => b.status === BookingStatusNames.CONFIRMED)
                .reduce((sum, b) => sum + b.totalPrice, 0),
        [monthlyBookings],
    );

    /* Demandes en attente de reponse */
    const pendingCount = useMemo(
        () =>
            partnerBookings.filter(
                (b) => b.status === BookingStatusNames.PENDING,
            ).length,
        [partnerBookings],
    );

    /* Nombre de services actifs dans le catalogue */
    const activeServicesCount = useMemo(
        () =>
            services.filter(
                (s) => s.partnerId === (partnerUser?.id ?? "") && s.isAvailable,
            ).length,
        [services, partnerUser?.id],
    );

    /* 5 dernieres reservations pour l'apercu d'activite recente */
    const recentBookings = useMemo(
        () =>
            [...partnerBookings]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5),
        [partnerBookings],
    );

    /* Index serviceId -> titre pour les resolutions affichees */
    const servicesById: Record<string, string> = useMemo(
        () => Object.fromEntries(services.map((s) => [s.id, s.title])),
        [services],
    );

    /* Guard : attend la redirection si non authentifie ou mauvais role */
    if (isBlocked || !currentUser || currentUser.role !== "PARTNER") {
        return null;
    }

    const partnerSince = new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(currentUser.createdAt);
    const initials =
        currentUser.firstName.charAt(0).toUpperCase() +
        currentUser.lastName.charAt(0).toUpperCase();

    return (
        <div className="wdr-partner-dash">
            {/* ---- Hero ---- */}
            <section
                className="wdr-partner-dash__hero"
                aria-label={t("partner.dashboard.title")}
            >
                <div className="wdr-partner-dash__hero-content">
                    <div className="wdr-partner-dash__hero-text">
                        <p className="wdr-partner-dash__hero-greeting">
                            {t("partner.dashboard.title")}
                        </p>
                        <h1 className="wdr-partner-dash__hero-title">
                            <span>{currentUser.companyName}</span>
                        </h1>
                        <p className="wdr-partner-dash__hero-since">
                            {t("partner.dashboard.member_since").replace(
                                "{date}",
                                partnerSince,
                            )}
                        </p>
                    </div>

                    <div className="wdr-partner-dash__hero-right">
                        <div
                            className="wdr-partner-dash__hero-avatar"
                            aria-label={t("partner.dashboard.avatar_label").replace(
                                "{company}",
                                currentUser.companyName,
                            )}
                        >
                            {initials}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="wdr-partner-dash__logout-btn"
                        >
                            {t("nav.logout")}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="wdr-partner-dash__body">
                {/* ---- Bandeau de statistiques ---- */}
                <section
                    className="wdr-partner-dash__stats"
                    aria-label={t("partner.dashboard.stats")}
                >
                    <div className="wdr-partner-dash__stat-card wdr-partner-dash__stat-card--revenue">
                        <div className="wdr-partner-dash__stat-icon">
                            <WalletIcon />
                        </div>
                        <div className="wdr-partner-dash__stat-data">
                            <span className="wdr-partner-dash__stat-value">
                                {formatPrice(currentUser.totalSales, "EUR")}
                            </span>
                            <span className="wdr-partner-dash__stat-label">
                                {t("partner.dashboard.revenue_total")}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-partner-dash__stat-card wdr-partner-dash__stat-card--monthly">
                        <div className="wdr-partner-dash__stat-icon">
                            <TrendingUpIcon />
                        </div>
                        <div className="wdr-partner-dash__stat-data">
                            <span className="wdr-partner-dash__stat-value">
                                {formatPrice(monthlyRevenue, "EUR")}
                            </span>
                            <span className="wdr-partner-dash__stat-label">
                                {t("partner.dashboard.revenue_month")}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-partner-dash__stat-card wdr-partner-dash__stat-card--bookings">
                        <div className="wdr-partner-dash__stat-icon">
                            <CalendarIcon />
                        </div>
                        <div className="wdr-partner-dash__stat-data">
                            <span className="wdr-partner-dash__stat-value">
                                {monthlyBookings.length}
                            </span>
                            <span className="wdr-partner-dash__stat-label">
                                {monthlyBookings.length === 1
                                    ? t("partner.dashboard.bookings_month_one")
                                    : t(
                                          "partner.dashboard.bookings_month_other",
                                      )}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-partner-dash__stat-card wdr-partner-dash__stat-card--pending">
                        <div className="wdr-partner-dash__stat-icon">
                            <ClockIcon />
                        </div>
                        <div className="wdr-partner-dash__stat-data">
                            <span className="wdr-partner-dash__stat-value">
                                {pendingCount}
                            </span>
                            <span className="wdr-partner-dash__stat-label">
                                {pendingCount === 1
                                    ? t("partner.dashboard.pending_one")
                                    : t("partner.dashboard.pending_other")}
                            </span>
                        </div>
                        {pendingCount > 0 && (
                            <span
                                className="wdr-partner-dash__stat-badge"
                                aria-label={t(
                                    "partner.dashboard.action_required",
                                )}
                            >
                                {pendingCount}
                            </span>
                        )}
                    </div>
                </section>

                {/* ---- Acces rapides ---- */}
                <section
                    className="wdr-partner-dash__shortcuts"
                    aria-label={t("partner.dashboard.shortcuts")}
                >
                    <h2 className="wdr-partner-dash__section-title">
                        {t("partner.dashboard.management")}
                    </h2>
                    <div className="wdr-partner-dash__shortcut-grid">
                        <button
                            type="button"
                            className="wdr-partner-dash__shortcut-card"
                            onClick={() =>
                                navigate({ name: "partner-catalog" })
                            }
                            aria-label={t("partner.dashboard.catalog_aria")}
                        >
                            <div className="wdr-partner-dash__shortcut-icon">
                                <ListIcon />
                            </div>
                            <div className="wdr-partner-dash__shortcut-text">
                                <span className="wdr-partner-dash__shortcut-title">
                                    {t("partner.dashboard.catalog")}
                                </span>
                                <span className="wdr-partner-dash__shortcut-sub">
                                    {activeServicesCount}{" "}
                                    {activeServicesCount === 1
                                        ? t(
                                              "partner.dashboard.active_service_one",
                                          )
                                        : t(
                                              "partner.dashboard.active_service_other",
                                          )}
                                </span>
                            </div>
                            <ArrowRightIcon />
                        </button>

                        <button
                            type="button"
                            className={[
                                "wdr-partner-dash__shortcut-card",
                                pendingCount > 0
                                    ? "wdr-partner-dash__shortcut-card--alert"
                                    : "",
                            ]
                                .join(" ")
                                .trim()}
                            onClick={() =>
                                navigate({ name: "partner-bookings" })
                            }
                            aria-label={t("partner.dashboard.bookings_aria")}
                        >
                            <div className="wdr-partner-dash__shortcut-icon">
                                <CheckCircleIcon />
                            </div>
                            <div className="wdr-partner-dash__shortcut-text">
                                <span className="wdr-partner-dash__shortcut-title">
                                    {t("partner.dashboard.reservations")}
                                </span>
                                <span className="wdr-partner-dash__shortcut-sub">
                                    {pendingCount > 0
                                        ? (pendingCount === 1
                                              ? t(
                                                    "partner.dashboard.process_one",
                                                )
                                              : t(
                                                    "partner.dashboard.process_other",
                                                )
                                          ).replace(
                                              "{count}",
                                              String(pendingCount),
                                          )
                                        : t("partner.dashboard.up_to_date")}
                                </span>
                            </div>
                            {pendingCount > 0 && (
                                <span
                                    className="wdr-partner-dash__shortcut-badge"
                                    aria-label={t("partner.dashboard.pending_badge").replace(
                                        "{count}",
                                        String(pendingCount),
                                    )}
                                >
                                    {pendingCount}
                                </span>
                            )}
                            {pendingCount === 0 && <ArrowRightIcon />}
                        </button>
                    </div>
                </section>

                {/* ---- Activite recente ---- */}
                <section
                    className="wdr-partner-dash__section"
                    aria-label={t("partner.dashboard.recent")}
                >
                    <div className="wdr-partner-dash__section-header">
                        <h2 className="wdr-partner-dash__section-title">
                            {t("partner.dashboard.recent")}
                        </h2>
                        <button
                            type="button"
                            className="wdr-partner-dash__section-link"
                            onClick={() =>
                                navigate({ name: "partner-bookings" })
                            }
                        >
                            {t("partner.dashboard.see_all")}
                            <ArrowRightIcon />
                        </button>
                    </div>

                    {recentBookings.length > 0 ? (
                        <ul className="wdr-partner-dash__activity-list">
                            {recentBookings.map((booking) => (
                                <li
                                    key={booking.id}
                                    className="wdr-partner-dash__activity-item"
                                >
                                    <div className="wdr-partner-dash__activity-meta">
                                        <span className="wdr-partner-dash__activity-service">
                                            {servicesById[booking.serviceId] ??
                                                booking.serviceId}
                                        </span>
                                        <span className="wdr-partner-dash__activity-date">
                                            {formatDateShort(booking.createdAt, intlLocale)}
                                        </span>
                                    </div>
                                    <div className="wdr-partner-dash__activity-footer">
                                        <span className="wdr-partner-dash__activity-price">
                                            {formatPrice(
                                                booking.totalPrice,
                                                booking.currency,
                                            )}
                                        </span>
                                        <span
                                            className={[
                                                "wdr-partner-dash__activity-status",
                                                `wdr-partner-dash__activity-status--${booking.status.toLowerCase()}`,
                                            ].join(" ")}
                                        >
                                            {statusLabel(booking.status, t)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="wdr-partner-dash__empty">
                            {t("partner.dashboard.empty")}
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
};
