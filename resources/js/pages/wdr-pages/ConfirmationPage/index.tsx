import React, { useEffect } from "react";
import { Button } from "@/components/wdr";
import { useBooking } from "@/context/BookingContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { PaymentModeNames, ServiceCategoryLabels } from "@/types/service";
import "./ConfirmationPage.css";

const CheckCircleIcon: React.FC = () => (
    <svg
        className="wdr-confirm__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CalendarIcon: React.FC = () => (
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
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UserIcon: React.FC = () => (
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

function formatDateLong(isoDate: string, locale: string): string {
    return new Date(isoDate).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

interface ConfirmationPageProps {
    bookingId: string;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
    bookingId,
}) => {
    const { confirmedBooking, draft, travelerInfo, clearBooking } =
        useBooking();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();

    useEffect(() => {
        return () => {};
    }, []);

    if (!confirmedBooking || !draft || !travelerInfo) {
        return (
            <div className="wdr-confirm wdr-confirm--empty">
                <div className="wdr-confirm__empty-box">
                    <h1>{t("confirmation.empty_title")}</h1>
                    <p>{t("confirmation.empty_desc")}</p>
                    <p>
                        {t("confirmation.empty")} <strong>{bookingId}</strong>.
                    </p>
                    <Button onClick={() => navigate({ name: "home" })}>
                        {t("confirmation.back_home")}
                    </Button>
                </div>
            </div>
        );
    }

    const { service } = draft;

    const handleGoHome = () => {
        clearBooking();
        navigate({ name: "home" });
    };

    const handleSearchMore = () => {
        clearBooking();
        navigate({
            name: "search",
            query: "",
            category: "",
            dateFrom: "",
            dateTo: "",
        });
    };

    return (
        <div className="wdr-confirm">
            <div className="wdr-confirm__inner">
                <nav
                    className="wdr-cart__steps"
                    aria-label={t("confirmation.steps_aria")}
                >
                    <ol className="wdr-cart__steps-list">
                        <li className="wdr-cart__step wdr-cart__step--done">
                            {t("cart.step.cart")}
                        </li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-cart__step wdr-cart__step--done">
                            {t("cart.step.info")}
                        </li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-cart__step wdr-cart__step--done">
                            {t("cart.step.payment")}
                        </li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li
                            className="wdr-cart__step wdr-cart__step--active"
                            aria-current="step"
                        >
                            {t("cart.step.confirmation")}
                        </li>
                    </ol>
                </nav>

                <section
                    className="wdr-confirm__hero"
                    aria-label={t("confirmation.title")}
                >
                    <CheckCircleIcon />
                    <h1 className="wdr-confirm__hero-title">
                        {t("confirmation.title")}
                    </h1>
                    <p className="wdr-confirm__hero-subtitle">
                        {t("confirmation.subtitle")}{" "}
                        <strong className="wdr-confirm__hero-email">
                            {travelerInfo.email}
                        </strong>
                        .
                    </p>
                    <div
                        className="wdr-confirm__reference"
                        aria-label={t("confirmation.reference")}
                    >
                        <span className="wdr-confirm__reference-label">
                            {t("confirmation.reference")}
                        </span>
                        <code className="wdr-confirm__reference-code">
                            {confirmedBooking.id}
                        </code>
                    </div>
                </section>

                <div className="wdr-confirm__layout">
                    <section
                        className="wdr-confirm__details"
                        aria-label={t("confirmation.stay")}
                    >
                        <div className="wdr-confirm__service-card">
                            <img
                                src={service.images[0] ?? ""}
                                alt={service.title}
                                className="wdr-confirm__service-img"
                                loading="lazy"
                            />
                            <div className="wdr-confirm__service-info">
                                <span className="wdr-confirm__service-category">
                                    {ServiceCategoryLabels[service.category]}
                                </span>
                                <h2 className="wdr-confirm__service-title">
                                    {service.title}
                                </h2>
                                <p className="wdr-confirm__service-location">
                                    {service.location.city},{" "}
                                    {service.location.country}
                                </p>
                            </div>
                        </div>

                        <div className="wdr-confirm__info-block">
                            <h3 className="wdr-confirm__block-title">
                                <CalendarIcon />
                                {t("confirmation.stay")}
                            </h3>
                            <dl className="wdr-confirm__info-grid">
                                <div className="wdr-confirm__info-row">
                                    <dt>{t("confirmation.start_date")}</dt>
                                    <dd>
                                        {formatDateLong(
                                            draft.dateFrom,
                                            intlLocale,
                                        )}
                                    </dd>
                                </div>
                                {draft.dateTo && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{t("confirmation.end_date")}</dt>
                                        <dd>
                                            {formatDateLong(
                                                draft.dateTo,
                                                intlLocale,
                                            )}
                                        </dd>
                                    </div>
                                )}
                                {draft.timeSlot && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{t("confirmation.slot")}</dt>
                                        <dd>{draft.timeSlot}</dd>
                                    </div>
                                )}
                                {service.category === "ACTIVITE" ? (
                                    <div className="wdr-confirm__info-row">
                                        <dt>
                                            {t("confirmation.participants")}
                                        </dt>
                                        <dd>
                                            {draft.participants}{" "}
                                            {draft.participants > 1
                                                ? t(
                                                      "confirmation.participants_plural",
                                                  )
                                                : t("confirmation.participant")}
                                        </dd>
                                    </div>
                                ) : (
                                    <div className="wdr-confirm__info-row">
                                        <dt>
                                            {service.category === "HEBERGEMENT"
                                                ? t("confirmation.nights")
                                                : t("confirmation.days")}
                                        </dt>
                                        <dd>{draft.units}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="wdr-confirm__info-block">
                            <h3 className="wdr-confirm__block-title">
                                <UserIcon />
                                {t("confirmation.traveler")}
                            </h3>
                            <dl className="wdr-confirm__info-grid">
                                <div className="wdr-confirm__info-row">
                                    <dt>{t("confirmation.full_name")}</dt>
                                    <dd>
                                        {travelerInfo.firstName}{" "}
                                        {travelerInfo.lastName}
                                    </dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{t("confirmation.email")}</dt>
                                    <dd>{travelerInfo.email}</dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{t("confirmation.phone")}</dt>
                                    <dd>{travelerInfo.phone}</dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{t("confirmation.nationality")}</dt>
                                    <dd>{travelerInfo.nationality}</dd>
                                </div>
                                {travelerInfo.specialRequests && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{t("confirmation.requests")}</dt>
                                        <dd>{travelerInfo.specialRequests}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </section>

                    <aside
                        className="wdr-confirm__aside"
                        aria-label={t("confirmation.payment_summary")}
                    >
                        <div className="wdr-confirm__price-card">
                            <h3 className="wdr-confirm__price-title">
                                {t("confirmation.payment_summary")}
                            </h3>
                            <dl className="wdr-confirm__price-breakdown">
                                <div className="wdr-confirm__price-row">
                                    <dt>{t("confirmation.partner_price")}</dt>
                                    <dd>
                                        {formatPrice(
                                            draft.partnerTotal,
                                            draft.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="wdr-confirm__price-row">
                                    <dt>
                                        {t("confirmation.service_fee")}
                                        <span className="wdr-confirm__price-meta">
                                            (
                                            {Math.round(
                                                service.commissionRate * 100,
                                            )}
                                            %)
                                        </span>
                                    </dt>
                                    <dd>
                                        {formatPrice(
                                            draft.commissionTotal,
                                            draft.currency,
                                        )}
                                    </dd>
                                </div>
                                <hr
                                    className="wdr-confirm__price-divider"
                                    aria-hidden="true"
                                />
                                <div className="wdr-confirm__price-row wdr-confirm__price-row--total">
                                    <dt>{t("confirmation.total")}</dt>
                                    <dd>
                                        {formatPrice(
                                            draft.clientTotal,
                                            draft.currency,
                                        )}
                                    </dd>
                                </div>
                                {draft.paymentMode !==
                                    PaymentModeNames.FULL_CASH_ON_SITE && (
                                    <>
                                        <hr
                                            className="wdr-confirm__price-divider wdr-confirm__price-divider--light"
                                            aria-hidden="true"
                                        />
                                        <div className="wdr-confirm__price-row wdr-confirm__price-row--online">
                                            <dt>
                                                {t("confirmation.paid_online")}
                                            </dt>
                                            <dd>
                                                {formatPrice(
                                                    draft.amountDueOnline,
                                                    draft.currency,
                                                )}
                                            </dd>
                                        </div>
                                    </>
                                )}
                                {draft.amountDueOnSite > 0 && (
                                    <div className="wdr-confirm__price-row wdr-confirm__price-row--onsite">
                                        <dt>{t("confirmation.pay_onsite")}</dt>
                                        <dd>
                                            {formatPrice(
                                                draft.amountDueOnSite,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {draft.paymentMode ===
                            PaymentModeNames.FULL_CASH_ON_SITE ? (
                                <div className="wdr-confirm__paid-badge wdr-confirm__paid-badge--cash">
                                    {t("confirmation.cash_guaranteed")}
                                </div>
                            ) : (
                                <div className="wdr-confirm__paid-badge">
                                    {draft.paymentMode ===
                                    PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE
                                        ? t("confirmation.commission_paid")
                                        : t("confirmation.payment_received")}
                                </div>
                            )}
                        </div>

                        <div className="wdr-confirm__next-steps">
                            <h3 className="wdr-confirm__next-title">
                                {t("confirmation.next_steps")}
                            </h3>
                            <ol className="wdr-confirm__next-list">
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">
                                        1
                                    </span>
                                    <div>
                                        <strong>
                                            {t("confirmation.next1_title")}
                                        </strong>
                                        <p>{t("confirmation.next1_desc")}</p>
                                    </div>
                                </li>
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">
                                        2
                                    </span>
                                    <div>
                                        <strong>
                                            {t("confirmation.next2_title")}
                                        </strong>
                                        <p>{t("confirmation.next2_desc")}</p>
                                    </div>
                                </li>
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">
                                        3
                                    </span>
                                    <div>
                                        <strong>
                                            {t("confirmation.next3_title")}
                                        </strong>
                                        <p>{t("confirmation.next3_desc")}</p>
                                    </div>
                                </li>
                            </ol>
                        </div>

                        <div className="wdr-confirm__actions">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleGoHome}
                            >
                                {t("confirmation.back_home")}
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                fullWidth
                                onClick={handleSearchMore}
                                className="wdr-confirm__search-btn"
                            >
                                {t("confirmation.discover_more")}
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};
