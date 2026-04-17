/**
 * @file pages/BookingsHistoryPage/index.tsx
 * @description Historique des reservations — Espace Client Wandireo.
 *
 * Affiche :
 *   - Filtres par onglets : Toutes | A venir | Passees | Annulees
 *   - Une carte par reservation avec : service, date, participants,
 *     statut de reservation, statut de paiement, montants.
 *   - Etat vide par filtre avec CTA contextuel.
 *
 * Source de donnees : reservations client depuis l'API Laravel.
 * Guard : Redirige vers l'accueil si aucun utilisateur connecte.
 */

import { useQueries } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { reviewsApi } from "@/api/reviews";
import { Button, RatingStars } from "@/components/wdr";
import { useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useMyBookingsData } from "@/hooks/useBookingsData";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames, PaymentStatusNames } from "@/types/booking";
import type { Booking } from "@/types/booking";
import "./BookingsHistoryPage.css";

// ============================================================
// Resolution : serviceId -> donnees du service
// ============================================================

interface ServiceSummary {
    title: string;
    location: string;
}

// ============================================================
// Configuration des onglets de filtre
// ============================================================

type FilterTab = "all" | "upcoming" | "past" | "cancelled";

interface TabConfig {
    key: FilterTab;
    labelKey: string;
}

const TABS: TabConfig[] = [
    { key: "all", labelKey: "history.tab.all" },
    { key: "upcoming", labelKey: "history.tab.upcoming" },
    { key: "past", labelKey: "history.tab.past" },
    { key: "cancelled", labelKey: "history.tab.cancelled" },
];

// ============================================================
// Badges de statut
// ============================================================

/**
 * Retourne les proprietes d'affichage du badge de statut de reservation.
 */
function getBookingStatusBadge(
    booking: Booking,
    t: (key: string) => string,
): {
    label: string;
    modifier: string;
} {
    const now = new Date();

    if (booking.status === BookingStatusNames.CANCELLED) {
        return { label: t("history.status.cancelled"), modifier: "cancelled" };
    }

    if (booking.status === BookingStatusNames.PENDING) {
        return { label: t("history.status.pending"), modifier: "pending" };
    }

    if (booking.status === BookingStatusNames.CONFIRMED) {
        if (booking.startDate > now) {
            return {
                label: t("history.status.confirmed"),
                modifier: "confirmed",
            };
        }

        return { label: t("history.status.completed"), modifier: "past" };
    }

    return { label: booking.status, modifier: "pending" };
}

/**
 * Retourne les proprietes d'affichage du badge de statut de paiement.
 */
function getPaymentStatusBadge(
    status: string,
    t: (key: string) => string,
): {
    label: string;
    modifier: string;
} {
    switch (status) {
        case PaymentStatusNames.PAID:
            return { label: t("history.payment.paid"), modifier: "paid" };
        case PaymentStatusNames.REFUNDED:
            return {
                label: t("history.payment.refunded"),
                modifier: "refunded",
            };
        case PaymentStatusNames.PENDING:
        default:
            return { label: t("history.payment.pending"), modifier: "pending" };
    }
}

// ============================================================
// Icones SVG internes
// ============================================================

const CalendarIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
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

const UsersIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
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

const MapPinIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const InboxIcon: React.FC = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);

// ============================================================
// Utilitaires
// ============================================================

function formatExtrasSummary(booking: Booking): string | null {
    if (!booking.selectedExtras || booking.selectedExtras.length === 0) {
        return null;
    }

    const label = booking.selectedExtras
        .map((extra) =>
            extra.quantity > 1
                ? `${extra.name} x${extra.quantity}`
                : extra.name,
        )
        .join(", ");

    return `${label} · ${formatPrice(booking.extrasTotal ?? 0, booking.currency)}`;
}

// ============================================================
// Composant carte de reservation
// ============================================================

interface BookingCardProps {
    booking: Booking;
    servicesById: Record<string, ServiceSummary>;
    onReviewClick: (bookingId: string) => void;
    reviewingId: string | null;
    onReviewSubmit: (
        bookingId: string,
        serviceId: string,
        rating: number,
        comment: string,
    ) => void;
    reviewedIds: Set<string>;
    existingReviewedServiceIds: Set<string>;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    servicesById,
    onReviewClick,
    reviewingId,
    onReviewSubmit,
    reviewedIds,
    existingReviewedServiceIds,
}) => {
    const { t, intlLocale } = useTranslation();
    const service = servicesById[booking.serviceId];
    const bookingBadge = getBookingStatusBadge(booking, t);
    const paymentBadge = getPaymentStatusBadge(booking.paymentStatus, t);

    const now = new Date();
    const isPastConfirmed =
        booking.status === BookingStatusNames.CONFIRMED &&
        booking.startDate <= now;
    const alreadyReviewed =
        reviewedIds.has(booking.id) ||
        existingReviewedServiceIds.has(booking.serviceId);
    const isReviewing = reviewingId === booking.id;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const extrasSummary = formatExtrasSummary(booking);
    const formattedStartDate = new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(booking.startDate);

    return (
        <article
            className="wdr-history__card"
            aria-label={t("history.rating.aria").replace("{id}", booking.id)}
        >
            {/* En-tete de la carte */}
            <div className="wdr-history__card-header">
                <div className="wdr-history__card-service">
                    <h3 className="wdr-history__card-title">
                        {service?.title ?? booking.serviceId}
                    </h3>
                    {service?.location && (
                        <p className="wdr-history__card-location">
                            <MapPinIcon />
                            {service.location}
                        </p>
                    )}
                </div>
                <div className="wdr-history__card-badges">
                    <span
                        className={`wdr-history__badge wdr-history__badge--${bookingBadge.modifier}`}
                    >
                        {bookingBadge.label}
                    </span>
                    <span
                        className={`wdr-history__badge wdr-history__badge--payment-${paymentBadge.modifier}`}
                    >
                        {paymentBadge.label}
                    </span>
                </div>
            </div>

            {/* Meta-donnees */}
            <div className="wdr-history__card-meta">
                <span className="wdr-history__meta-item">
                    <CalendarIcon />
                    {formattedStartDate}
                </span>
                <span className="wdr-history__meta-item">
                    <UsersIcon />
                    {booking.participants}{" "}
                    {booking.participants !== 1
                        ? t("history.participants_other")
                        : t("history.participants_one")}
                </span>
            </div>

            {extrasSummary && (
                <p className="wdr-history__extras">
                    {t("history.extras")}: {extrasSummary}
                </p>
            )}

            {/* Pied : reference + prix */}
            <div className="wdr-history__card-footer">
                <span className="wdr-history__card-ref">
                    {t("history.reference")} {booking.id}
                </span>
                <div className="wdr-history__card-prices">
                    {booking.amountPaidOnline > 0 && (
                        <span className="wdr-history__price-online">
                            {formatPrice(
                                booking.amountPaidOnline,
                                booking.currency,
                            )}{" "}
                            {t("history.online")}
                        </span>
                    )}
                    {booking.totalPrice - booking.amountPaidOnline > 0 && (
                        <span className="wdr-history__price-onsite">
                            {formatPrice(
                                booking.totalPrice - booking.amountPaidOnline,
                                booking.currency,
                            )}{" "}
                            {t("history.onsite")}
                        </span>
                    )}
                    <span className="wdr-history__price-total">
                        {t("history.total")}{" "}
                        {formatPrice(booking.totalPrice, booking.currency)}
                    </span>
                </div>
            </div>

            {/* Bouton / formulaire d'avis (reservations passees et confirmees) */}
            {isPastConfirmed && (
                <div className="wdr-history__review-zone">
                    {alreadyReviewed ? (
                        <p className="wdr-history__review-done">
                            {t("history.review_done")}
                        </p>
                    ) : isReviewing ? (
                        <div className="wdr-history__review-form">
                            <p className="wdr-history__review-form-title">
                                {t("history.review_title")}
                            </p>
                            <RatingStars
                                value={rating}
                                onChange={setRating}
                                mode="input"
                                size="lg"
                            />
                            <textarea
                                className="wdr-history__review-textarea"
                                rows={3}
                                placeholder={t("history.review_placeholder")}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                            />
                            <div className="wdr-history__review-actions">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={rating === 0}
                                    onClick={() => {
                                        onReviewSubmit(
                                            booking.id,
                                            booking.serviceId,
                                            rating,
                                            comment,
                                        );
                                        setRating(0);
                                        setComment("");
                                    }}
                                >
                                    {t("history.review_send")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onReviewClick("")}
                                >
                                    {t("history.review_cancel")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReviewClick(booking.id)}
                        >
                            &#9733; {t("history.review_cta")}
                        </Button>
                    )}
                </div>
            )}

            {/* Note d'annulation */}
            {booking.status === BookingStatusNames.CANCELLED &&
                booking.cancellationReason && (
                    <div className="wdr-history__cancellation-note">
                        <strong>{t("history.cancellation_reason")}</strong>{" "}
                        {booking.cancellationReason}
                    </div>
                )}
        </article>
    );
};

// ============================================================
// Composant principal
// ============================================================

export const BookingsHistoryPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success } = useToast();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

    const { bookings: userBookings } = useMyBookingsData(currentUser?.id ?? "");
    const { services } = useServicesData();
    const serviceIds = useMemo(
        () => [...new Set(userBookings.map((booking) => booking.serviceId))],
        [userBookings],
    );
    const reviewQueries = useQueries({
        queries: serviceIds.map((serviceId) => ({
            queryKey: ["reviews", serviceId, "history"],
            queryFn: () => reviewsApi.list(serviceId),
            staleTime: 60_000,
            enabled: Boolean(serviceId),
        })),
    });
    const existingReviewedServiceIds = useMemo(() => {
        const ids = new Set<string>();

        for (const query of reviewQueries) {
            for (const review of query.data ?? []) {
                if (review.clientId === currentUser?.id) {
                    ids.add(review.serviceId);
                }
            }
        }

        return ids;
    }, [currentUser?.id, reviewQueries]);

    const servicesById = useMemo<Record<string, ServiceSummary>>(
        () =>
            Object.fromEntries(
                services.map((s) => [
                    s.id,
                    {
                        title: s.title,
                        location: `${s.location.city}, ${s.location.country}`,
                    },
                ]),
            ),
        [services],
    );

    const handleReviewSubmit = async (
        bookingId: string,
        serviceId: string,
        rating: number,
        comment: string,
    ) => {
        try {
            await reviewsApi.create({
                serviceId,
                rating: rating as 1 | 2 | 3 | 4 | 5,
                comment,
            });
        } catch {
            return;
        }

        setReviewedIds((prev) => new Set([...prev, bookingId]));
        setReviewingId(null);
        success(t("history.review_success"));
    };

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });
        }
    }, [currentUser, navigate]);

    const now = useMemo(() => new Date(), []);

    /* Filtrage selon l'onglet actif */
    const filteredBookings = useMemo<Booking[]>(() => {
        switch (activeTab) {
            case "upcoming":
                return userBookings.filter(
                    (b) =>
                        b.status === BookingStatusNames.CONFIRMED &&
                        b.startDate.getTime() > now.getTime(),
                );
            case "past":
                return userBookings.filter(
                    (b) =>
                        b.status === BookingStatusNames.CONFIRMED &&
                        b.startDate.getTime() <= now.getTime(),
                );
            case "cancelled":
                return userBookings.filter(
                    (b) => b.status === BookingStatusNames.CANCELLED,
                );
            case "all":
            default:
                return userBookings;
        }
    }, [activeTab, now, userBookings]);

    /* Compteurs pour les badges d'onglets */
    const counts = useMemo(() => {
        return {
            all: userBookings.length,
            upcoming: userBookings.filter(
                (b) =>
                    b.status === BookingStatusNames.CONFIRMED &&
                    b.startDate.getTime() > now.getTime(),
            ).length,
            past: userBookings.filter(
                (b) =>
                    b.status === BookingStatusNames.CONFIRMED &&
                    b.startDate.getTime() <= now.getTime(),
            ).length,
            cancelled: userBookings.filter(
                (b) => b.status === BookingStatusNames.CANCELLED,
            ).length,
        };
    }, [now, userBookings]);

    const emptyMessages: Record<FilterTab, string> = {
        all: t("history.empty.all"),
        upcoming: t("history.empty.upcoming"),
        past: t("history.empty.past"),
        cancelled: t("history.empty.cancelled"),
    };

    /* Guard : attend la redirection si non connecte */
    if (!currentUser) {
        return null;
    }

    return (
        <div className="wdr-history">
            <div className="wdr-history__inner">
                {/* En-tete */}
                <header className="wdr-history__header">
                    <div className="wdr-history__header-text">
                        <h1 className="wdr-history__title">
                            {t("history.title")}
                        </h1>
                        <p className="wdr-history__subtitle">
                            {t("history.subtitle")}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ name: "dashboard" })}
                    >
                        {t("history.dashboard")}
                    </Button>
                </header>

                {/* Onglets de filtre */}
                <nav
                    className="wdr-history__tabs"
                    aria-label={t("history.filters")}
                    role="tablist"
                >
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            role="tab"
                            type="button"
                            aria-selected={activeTab === tab.key}
                            className={[
                                "wdr-history__tab",
                                activeTab === tab.key
                                    ? "wdr-history__tab--active"
                                    : "",
                            ].join(" ")}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {t(tab.labelKey)}
                            {counts[tab.key] > 0 && (
                                <span className="wdr-history__tab-count">
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Liste des reservations */}
                {filteredBookings.length > 0 ? (
                    <ul className="wdr-history__list" role="list">
                        {filteredBookings.map((booking) => (
                            <li key={booking.id}>
                                <BookingCard
                                    booking={booking}
                                    servicesById={servicesById}
                                    onReviewClick={(id) =>
                                        setReviewingId(id || null)
                                    }
                                    reviewingId={reviewingId}
                                    onReviewSubmit={handleReviewSubmit}
                                    reviewedIds={reviewedIds}
                                    existingReviewedServiceIds={
                                        existingReviewedServiceIds
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="wdr-history__empty">
                        <div className="wdr-history__empty-icon">
                            <InboxIcon />
                        </div>
                        <p className="wdr-history__empty-title">
                            {emptyMessages[activeTab]}
                        </p>
                        {(activeTab === "all" || activeTab === "upcoming") && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() =>
                                    navigate({
                                        name: "search",
                                        query: "",
                                        category: "",
                                        dateFrom: "",
                                        dateTo: "",
                                    })
                                }
                            >
                                {t("history.discover")}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingsHistoryPage;
