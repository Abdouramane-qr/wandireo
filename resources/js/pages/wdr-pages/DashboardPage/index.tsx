/**
 * @file pages/DashboardPage/index.tsx
 * @description Tableau de bord voyageur.
 */

import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useMyBookingsData } from '@/hooks/useBookingsData';
import { useServicesData } from '@/hooks/useServicesData';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { BookingStatusNames, PaymentStatusNames } from '@/types/booking';
import './DashboardPage.css';

const CalendarIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const WalletIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M16 3v4M8 3v4" />
        <path d="M16 12h2" />
    </svg>
);

const ListIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const UserIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SearchIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ArrowRightIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export const DashboardPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();
    const clientUser = currentUser?.role === 'CLIENT' ? currentUser : null;
    const { bookings } = useMyBookingsData(currentUser?.id ?? '');
    const { services } = useServicesData();

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });

            return;
        }

        if (currentUser.role !== 'CLIENT') {
            navigate({ name: 'partner-dashboard' });
        }
    }, [currentUser, navigate]);

    const now = useMemo(() => new Date(), []);
    const servicesById: Record<string, string> = Object.fromEntries(
        services.map((s) => [s.id, s.title]),
    );
    const userBookings = useMemo(
        () => bookings.filter((b) => b.clientId === (clientUser?.id ?? '')),
        [bookings, clientUser?.id],
    );
    const upcomingBookings = useMemo(
        () =>
            userBookings.filter(
                (b) =>
                    b.status === BookingStatusNames.CONFIRMED &&
                    b.startDate > now,
            ),
        [now, userBookings],
    );
    const completedCount = useMemo(
        () =>
            userBookings.filter(
                (b) =>
                    b.status === BookingStatusNames.CONFIRMED &&
                    b.startDate <= now,
            ).length,
        [now, userBookings],
    );
    const totalSpentOnline = useMemo(
        () =>
            userBookings
                .filter((b) => b.paymentStatus === PaymentStatusNames.PAID)
                .reduce((sum, b) => sum + b.amountPaidOnline, 0),
        [userBookings],
    );

    if (!currentUser || currentUser.role !== 'CLIENT') {
        return null;
    }

    const formatDate = (date: Date, month: 'long' | 'short') =>
        new Intl.DateTimeFormat(intlLocale, {
            day: 'numeric',
            month,
            year: 'numeric',
        }).format(date);

    const memberSince = t('dashboard.member_since').replace(
        '{date}',
        formatDate(currentUser.createdAt, 'long'),
    );

    return (
        <div className="wdr-dashboard">
            <section
                className="wdr-dashboard__hero"
                aria-label={t('dashboard.hero_label')}
            >
                <div className="wdr-dashboard__hero-content">
                    <div className="wdr-dashboard__hero-text">
                        <p className="wdr-dashboard__hero-greeting">
                            {t('dashboard.greeting')}
                        </p>
                        <h1 className="wdr-dashboard__hero-title">
                            Bonjour, <span>{currentUser.firstName}</span>
                        </h1>
                        <p className="wdr-dashboard__hero-since">
                            {memberSince}
                        </p>
                    </div>
                    <div
                        className="wdr-dashboard__hero-avatar"
                        aria-label={`Avatar de ${currentUser.firstName} ${currentUser.lastName}`}
                    >
                        {currentUser.firstName.charAt(0).toUpperCase()}
                        {currentUser.lastName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </section>

            <div className="wdr-dashboard__body">
                <section
                    className="wdr-dashboard__stats"
                    aria-label={t('dashboard.stats_label')}
                >
                    <div className="wdr-dashboard__stat-card wdr-dashboard__stat-card--upcoming">
                        <div className="wdr-dashboard__stat-icon">
                            <CalendarIcon />
                        </div>
                        <div className="wdr-dashboard__stat-data">
                            <span className="wdr-dashboard__stat-value">
                                {upcomingBookings.length}
                            </span>
                            <span className="wdr-dashboard__stat-label">
                                {upcomingBookings.length === 1
                                    ? t('dashboard.upcoming_one')
                                    : t('dashboard.upcoming_other')}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-dashboard__stat-card wdr-dashboard__stat-card--completed">
                        <div className="wdr-dashboard__stat-icon">
                            <CheckIcon />
                        </div>
                        <div className="wdr-dashboard__stat-data">
                            <span className="wdr-dashboard__stat-value">
                                {completedCount}
                            </span>
                            <span className="wdr-dashboard__stat-label">
                                {completedCount === 1
                                    ? t('dashboard.completed_one')
                                    : t('dashboard.completed_other')}
                            </span>
                        </div>
                    </div>

                    <div className="wdr-dashboard__stat-card wdr-dashboard__stat-card--spent">
                        <div className="wdr-dashboard__stat-icon">
                            <WalletIcon />
                        </div>
                        <div className="wdr-dashboard__stat-data">
                            <span className="wdr-dashboard__stat-value">
                                {formatPrice(
                                    totalSpentOnline,
                                    currentUser.preferredCurrency ?? 'EUR',
                                )}
                            </span>
                            <span className="wdr-dashboard__stat-label">
                                {t('dashboard.spent_online')}
                            </span>
                        </div>
                    </div>
                </section>

                <section
                    className="wdr-dashboard__section"
                    aria-label={t('dashboard.upcoming_title')}
                >
                    <div className="wdr-dashboard__section-header">
                        <h2 className="wdr-dashboard__section-title">
                            {t('dashboard.upcoming_title')}
                        </h2>
                        <button
                            type="button"
                            className="wdr-dashboard__section-link"
                            onClick={() =>
                                navigate({ name: 'bookings-history' })
                            }
                        >
                            {t('dashboard.see_all')}
                            <ArrowRightIcon />
                        </button>
                    </div>

                    {upcomingBookings.length > 0 ? (
                        <ul className="wdr-dashboard__trip-list">
                            {upcomingBookings.map((booking) => (
                                <li
                                    key={booking.id}
                                    className="wdr-dashboard__trip-card"
                                >
                                    <div className="wdr-dashboard__trip-date">
                                        <CalendarIcon />
                                        <span>
                                            {formatDate(
                                                booking.startDate,
                                                'short',
                                            )}
                                        </span>
                                    </div>
                                    <h3 className="wdr-dashboard__trip-title">
                                        {servicesById[booking.serviceId] ??
                                            booking.serviceId}
                                    </h3>
                                    <div className="wdr-dashboard__trip-meta">
                                        <span>
                                            {booking.participants}{' '}
                                            {booking.participants === 1
                                                ? t(
                                                      'dashboard.participants_one',
                                                  )
                                                : t(
                                                      'dashboard.participants_other',
                                                  )}
                                        </span>
                                        <span
                                            className="wdr-dashboard__trip-separator"
                                            aria-hidden="true"
                                        >
                                            &middot;
                                        </span>
                                        <span>
                                            {formatPrice(
                                                booking.totalPrice,
                                                booking.currency,
                                            )}
                                        </span>
                                    </div>
                                    <span className="wdr-dashboard__trip-status wdr-dashboard__trip-status--confirmed">
                                        {t('dashboard.trip_confirmed')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="wdr-dashboard__empty">
                            <div className="wdr-dashboard__empty-icon">
                                <SearchIcon />
                            </div>
                            <p className="wdr-dashboard__empty-title">
                                {t('dashboard.empty_title')}
                            </p>
                            <p className="wdr-dashboard__empty-desc">
                                {t('dashboard.empty_desc')}
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() =>
                                    navigate({
                                        name: 'search',
                                        query: '',
                                        category: '',
                                        dateFrom: '',
                                        dateTo: '',
                                    })
                                }
                            >
                                {t('dashboard.discover')}
                            </Button>
                        </div>
                    )}
                </section>

                <section
                    className="wdr-dashboard__quick-links"
                    aria-label={t('dashboard.quick_links')}
                >
                    <h2 className="wdr-dashboard__section-title">
                        {t('dashboard.quick_links')}
                    </h2>
                    <div className="wdr-dashboard__quick-grid">
                        <button
                            type="button"
                            className="wdr-dashboard__quick-card"
                            onClick={() =>
                                navigate({ name: 'bookings-history' })
                            }
                        >
                            <div className="wdr-dashboard__quick-icon wdr-dashboard__quick-icon--history">
                                <ListIcon />
                            </div>
                            <div className="wdr-dashboard__quick-text">
                                <span className="wdr-dashboard__quick-label">
                                    {t('dashboard.quick.reservations_title')}
                                </span>
                                <span className="wdr-dashboard__quick-desc">
                                    {t('dashboard.quick.reservations_desc')}
                                </span>
                            </div>
                            <ArrowRightIcon />
                        </button>

                        <button
                            type="button"
                            className="wdr-dashboard__quick-card"
                            onClick={() => navigate({ name: 'profile' })}
                        >
                            <div className="wdr-dashboard__quick-icon wdr-dashboard__quick-icon--profile">
                                <UserIcon />
                            </div>
                            <div className="wdr-dashboard__quick-text">
                                <span className="wdr-dashboard__quick-label">
                                    {t('dashboard.quick.profile_title')}
                                </span>
                                <span className="wdr-dashboard__quick-desc">
                                    {t('dashboard.quick.profile_desc')}
                                </span>
                            </div>
                            <ArrowRightIcon />
                        </button>
                    </div>
                </section>

                <div className="wdr-dashboard__logout-row">
                    <Button variant="ghost" size="sm" onClick={logout}>
                        {t('nav.logout')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
