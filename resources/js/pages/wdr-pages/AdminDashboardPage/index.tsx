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

import React, { useEffect, useMemo } from 'react';
import { AdminSectionNav, Button } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useAnalyticsFunnelData } from '@/hooks/useAnalyticsData';
import { useAdminBookingsData } from '@/hooks/useBookingsData';
import { useAdminReviewsData } from '@/hooks/useReviewsData';
import { useServicesData } from '@/hooks/useServicesData';
import { useAdminUsersData } from '@/hooks/useUsersData';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { BookingStatusNames } from '@/types/booking';
import './AdminDashboardPage.css';

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

function getStatusLabel(status: string): string {
    if (status === BookingStatusNames.CONFIRMED) {
return 'Confirmée';
}

    if (status === BookingStatusNames.PENDING) {
return 'En attente';
}

    return 'Annulée';
}

function getStatusClass(status: string): string {
    if (status === BookingStatusNames.CONFIRMED) {
return 'confirmed';
}

    if (status === BookingStatusNames.PENDING) {
return 'pending';
}

    return 'cancelled';
}

// ============================================================
// Composant principal
// ============================================================

export const AdminDashboardPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();

    // Hooks appelés avant tout retour conditionnel
    const { bookings } = useAdminBookingsData();
    const { users } = useAdminUsersData();
    const { services } = useServicesData({ adminAll: true, limit: 300 });
    const { reviews } = useAdminReviewsData({ status: 'PENDING' });
    const { data: funnel } = useAnalyticsFunnelData(30);

    // Sources de données effectives (API prioritaire, fallback mock)
    const allPartners = users.filter((u) => u.role === 'PARTNER');
    const allClients = users.filter((u) => u.role === 'CLIENT');

    // --- Guard : accès réservé aux ADMIN ---
    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'ADMIN') {
            navigate({ name: 'dashboard' });
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null;
    }

    // ============================================================
    // Calcul des métriques globales
    // ============================================================

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                (partner) => partner.partnerStatus === 'APPROVED',
            ).length,
            activeServicesCount: services.filter((service) => service.isAvailable)
                .length,
            pendingReviewsCount: reviews.length,
        };
    }, [bookings, allPartners, allClients, reviews.length, services]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                            Espace Administration
                        </p>
                        <h1 className="wdr-admin-dash__hero-title">
                            Tableau de bord <span>Wandireo</span>
                        </h1>
                        <p className="wdr-admin-dash__hero-subtitle">
                            Vue globale de la plateforme —{' '}
                            {new Date().toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="wdr-admin-dash__hero-right">
                        <div
                            className="wdr-admin-dash__hero-avatar"
                            aria-label="Initiales de l'administrateur"
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
                                navigate({ name: 'home' });
                            }}
                        >
                            Déconnexion
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
                    aria-label="Métriques globales"
                >
                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--primary">
                        <div className="wdr-admin-dash__metric-icon">
                            <TrendingUpIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                Volume d'affaires
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {formatPrice(metrics.totalVolume, 'EUR')}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                Réservations confirmées
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--success">
                        <div className="wdr-admin-dash__metric-icon">
                            <CreditCardIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                Commissions perçues
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {formatPrice(metrics.totalCommissions, 'EUR')}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                Sur {metrics.confirmedBookingsCount}{' '}
                                réservation(s) confirmée(s)
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--warning">
                        <div className="wdr-admin-dash__metric-icon">
                            <LayersIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                En attente
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.pendingCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                Réservation(s) en cours de traitement
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                        <div className="wdr-admin-dash__metric-icon">
                            <UsersIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                Comptes actifs
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.clientsCount + metrics.partnersCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {metrics.clientsCount} client(s) ·{' '}
                                {metrics.partnersCount} partenaire(s)
                            </span>
                        </div>
                    </div>

                    <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                        <div className="wdr-admin-dash__metric-icon">
                            <GridIcon />
                        </div>
                        <div className="wdr-admin-dash__metric-info">
                            <span className="wdr-admin-dash__metric-label">
                                Catalogue actif
                            </span>
                            <span className="wdr-admin-dash__metric-value">
                                {metrics.activeServicesCount}
                            </span>
                            <span className="wdr-admin-dash__metric-sub">
                                {metrics.approvedPartnersCount} partenaire(s) valides · {metrics.pendingReviewsCount} avis en attente
                            </span>
                        </div>
                    </div>
                </section>

                <section className="wdr-admin-dash__recent">
                    <div className="wdr-admin-dash__section-header">
                        <h2 className="wdr-admin-dash__section-title">
                            Funnel produit
                        </h2>
                    </div>
                    <div className="wdr-admin-dash__metrics">
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    Recherches
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.searchCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    30 derniers jours
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    Vues fiche
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.serviceViewCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {funnel?.searchToViewRate ?? 0}% depuis la
                                    recherche
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--neutral">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    Debuts de reservation
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.bookingStartedCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {funnel?.viewToStartRate ?? 0}% depuis la
                                    fiche
                                </span>
                            </div>
                        </div>
                        <div className="wdr-admin-dash__metric-card wdr-admin-dash__metric-card--success">
                            <div className="wdr-admin-dash__metric-info">
                                <span className="wdr-admin-dash__metric-label">
                                    Reservations confirmees
                                </span>
                                <span className="wdr-admin-dash__metric-value">
                                    {funnel?.bookingConfirmedCount ?? 0}
                                </span>
                                <span className="wdr-admin-dash__metric-sub">
                                    {funnel?.startToConfirmRate ?? 0}% depuis le
                                    checkout
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---- Accès rapides ---- */}
                <section className="wdr-admin-dash__shortcuts">
                    <h2 className="wdr-admin-dash__section-title">
                        Accès rapides
                    </h2>
                    <div className="wdr-admin-dash__shortcuts-grid">
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: 'admin-users' })}
                        >
                            <UsersIcon />
                            <span>Gérer les partenaires</span>
                            <small>
                                Validation · Suspension · Stripe Connect
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: 'admin-services' })}
                        >
                            <GridIcon />
                            <span>Modérer le catalogue</span>
                            <small>
                                Activer · Désactiver · Filtrer par catégorie
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() =>
                                navigate({ name: 'admin-transactions' })
                            }
                        >
                            <CreditCardIcon />
                            <span>Superviser les transactions</span>
                            <small>
                                Commissions · Flux financiers · Stripe
                            </small>
                        </button>
                        <button
                            className="wdr-admin-dash__shortcut"
                            onClick={() => navigate({ name: 'admin-reviews' })}
                        >
                            <ShieldIcon />
                            <span>Modérer les avis</span>
                            <small>
                                {metrics.pendingReviewsCount} avis en attente
                            </small>
                        </button>
                    </div>
                </section>

                {/* ---- Réservations récentes ---- */}
                <section className="wdr-admin-dash__recent">
                    <div className="wdr-admin-dash__section-header">
                        <h2 className="wdr-admin-dash__section-title">
                            Réservations récentes
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({ name: 'admin-transactions' })
                            }
                        >
                            Voir tout
                        </Button>
                    </div>
                    <div className="wdr-admin-dash__table-wrapper">
                        <table
                            className="wdr-admin-dash__table"
                            aria-label="Réservations récentes"
                        >
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Client</th>
                                    <th scope="col">Partenaire</th>
                                    <th scope="col">Montant</th>
                                    <th scope="col">Commission</th>
                                    <th scope="col">Statut</th>
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
                                                    : '—'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`wdr-admin-dash__status wdr-admin-dash__status--${getStatusClass(booking.status)}`}
                                                >
                                                    {getStatusLabel(
                                                        booking.status,
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
