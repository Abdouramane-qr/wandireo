import React, { useEffect, useState } from "react";
import { Button } from "@/components/wdr";
import { useBooking } from "@/context/BookingContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import "./PaymentPage.css";

export const PaymentPage: React.FC = () => {
    const { draft, travelerInfo, confirmPayment, syncDraftPricing } =
        useBooking();
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        if (!draft) {
            navigate({ name: "home" });
            return;
        }

        if (!travelerInfo) {
            navigate({ name: "checkout" });
        }
    }, [draft, travelerInfo, navigate]);

    useEffect(() => {
        if (!draft || !travelerInfo) {
            return;
        }

        let cancelled = false;

        void (async () => {
            setIsSyncing(true);
            setSubmitError("");

            try {
                await syncDraftPricing();
            } catch {
                if (!cancelled) {
                    setSubmitError(t("payment.sync_error"));
                }
            } finally {
                if (!cancelled) {
                    setIsSyncing(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        draft?.dateFrom,
        draft?.dateTo,
        draft?.participants,
        draft?.paymentMode,
        draft?.selectedExtras,
        draft?.service.id,
        syncDraftPricing,
        t,
        travelerInfo,
    ]);

    if (!draft || !travelerInfo) {
        return null;
    }

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const bookingId = await confirmPayment();
            navigate({ name: "confirmation", bookingId });
        } catch {
            setSubmitError(t("payment.submit_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="wdr-payment">
            <div className="wdr-payment__inner">
                <nav
                    className="wdr-payment__steps"
                    aria-label={t("payment.steps_aria")}
                >
                    <ol className="wdr-payment__steps-list">
                        <li className="wdr-payment__step wdr-payment__step--done">
                            <button
                                type="button"
                                className="wdr-payment__step-btn"
                                onClick={() => navigate({ name: "cart" })}
                            >
                                {t("payment.steps.cart")}
                            </button>
                        </li>
                        <li
                            className="wdr-payment__step wdr-payment__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-payment__step wdr-payment__step--done">
                            <button
                                type="button"
                                className="wdr-payment__step-btn"
                                onClick={() => navigate({ name: "checkout" })}
                            >
                                {t("payment.steps.information")}
                            </button>
                        </li>
                        <li
                            className="wdr-payment__step wdr-payment__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li
                            className="wdr-payment__step wdr-payment__step--active"
                            aria-current="step"
                        >
                            {t("payment.steps.payment")}
                        </li>
                        <li
                            className="wdr-payment__step wdr-payment__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li
                            className="wdr-payment__step"
                        >
                            {t("payment.steps.confirmation")}
                        </li>
                    </ol>
                </nav>

                <header className="wdr-payment__header">
                    <h1 className="wdr-payment__title">{t("payment.title")}</h1>
                    <p className="wdr-payment__subtitle">
                        {t("payment.subtitle")}
                    </p>
                </header>

                <div className="wdr-payment__layout">
                    <section
                        className="wdr-payment__form-section"
                        aria-label={t("payment.title")}
                    >
                        <div className="wdr-payment__cash-panel">
                            <div
                                className="wdr-payment__cash-icon"
                                aria-hidden="true"
                            >
                                &#128221;
                            </div>
                            <h2 className="wdr-payment__cash-title">
                                {t("payment.summary_title")}
                            </h2>
                            <ul className="wdr-payment__cash-list">
                                <li>
                                    {t("payment.traveler")}:{" "}
                                    {travelerInfo.firstName}{" "}
                                    {travelerInfo.lastName}
                                </li>
                                <li>
                                    {t("payment.email")}: {travelerInfo.email}
                                </li>
                                <li>
                                    {t("payment.service")}:{" "}
                                    {draft.service.title}
                                </li>
                                {draft.selectedExtras.length > 0 && (
                                    <li>
                                        {t("payment.extras")}:{" "}
                                        {draft.selectedExtras
                                            .map((extra) => extra.name)
                                            .join(", ")}
                                    </li>
                                )}
                                <li>
                                    {t("payment.total")}:{" "}
                                    {formatPrice(
                                        draft.clientTotal,
                                        draft.currency,
                                    )}
                                </li>
                                <li>
                                    {t("payment.pay_later")}:{" "}
                                    {formatPrice(
                                        draft.amountDueOnSite,
                                        draft.currency,
                                    )}
                                </li>
                                {draft.amountDueOnline > 0 && (
                                    <li>
                                        {t("payment.pay_now")}:{" "}
                                        {formatPrice(
                                            draft.amountDueOnline,
                                            draft.currency,
                                        )}
                                    </li>
                                )}
                            </ul>

                            {isSyncing ? (
                                <p className="wdr-payment__sync-note">
                                    {t("payment.syncing")}
                                </p>
                            ) : null}

                            {submitError ? (
                                <p className="wdr-payment__error" role="alert">
                                    {submitError}
                                </p>
                            ) : null}

                            <div className="wdr-payment__cash-actions">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={() =>
                                        navigate({ name: "checkout" })
                                    }
                                    disabled={isSubmitting}
                                >
                                    {t("payment.back")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="lg"
                                    loading={isSubmitting || isSyncing}
                                    onClick={handleConfirm}
                                    disabled={isSyncing}
                                >
                                    {isSubmitting
                                        ? t("payment.confirming")
                                        : isSyncing
                                          ? t("payment.verifying")
                                          : t("payment.confirm")}
                                </Button>
                            </div>
                        </div>
                    </section>

                    <aside
                        className="wdr-payment__aside"
                        aria-label={t("payment.order")}
                    >
                        <h3 className="wdr-payment__aside-title">
                            {t("payment.order")}
                        </h3>
                        <div className="wdr-payment__aside-service">
                            <img
                                src={draft.service.images[0] ?? ""}
                                alt={draft.service.title}
                                className="wdr-payment__aside-img"
                                loading="lazy"
                            />
                            <p className="wdr-payment__aside-service-title">
                                {draft.service.title}
                            </p>
                        </div>
                        <div className="wdr-payment__aside-traveler">
                            <h4 className="wdr-payment__aside-traveler-title">
                                {t("payment.customer")}
                            </h4>
                            <p className="wdr-payment__aside-traveler-name">
                                {travelerInfo.firstName} {travelerInfo.lastName}
                            </p>
                            <p className="wdr-payment__aside-traveler-email">
                                {travelerInfo.email}
                            </p>
                        </div>
                        <dl className="wdr-payment__aside-prices">
                            <div className="wdr-payment__aside-price-row">
                                <dt>{t("payment.partner_price")}</dt>
                                <dd>
                                    {formatPrice(
                                        draft.partnerTotal,
                                        draft.currency,
                                    )}
                                </dd>
                            </div>
                            {draft.extrasTotal > 0 && (
                                <div className="wdr-payment__aside-price-row">
                                    <dt>{t("payment.extras")}</dt>
                                    <dd>
                                        {formatPrice(
                                            draft.extrasTotal,
                                            draft.currency,
                                        )}
                                    </dd>
                                </div>
                            )}
                            <div className="wdr-payment__aside-price-row">
                                <dt>{t("payment.service_fee")}</dt>
                                <dd>
                                    {formatPrice(
                                        draft.commissionTotal,
                                        draft.currency,
                                    )}
                                </dd>
                            </div>
                            <hr
                                className="wdr-payment__aside-divider"
                                aria-hidden="true"
                            />
                            <div className="wdr-payment__aside-price-row wdr-payment__aside-price-row--total">
                                <dt>{t("payment.total_vat")}</dt>
                                <dd>
                                    {formatPrice(
                                        draft.clientTotal,
                                        draft.currency,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
