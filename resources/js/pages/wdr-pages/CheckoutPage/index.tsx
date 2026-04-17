import React, { useEffect, useState } from "react";
import { Button, Input } from "@/components/wdr";
import { useBooking } from "@/context/BookingContext";
import type { TravelerInfo } from "@/context/BookingContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import "./CheckoutPage.css";

type FormErrors = Partial<Record<keyof TravelerInfo, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: TravelerInfo, t: (key: string) => string) {
    const errors: FormErrors = {};

    if (!values.firstName.trim()) {
        errors.firstName = t("checkout.errors.first_name");
    }

    if (!values.lastName.trim()) {
        errors.lastName = t("checkout.errors.last_name");
    }

    if (!values.email.trim()) {
        errors.email = t("checkout.errors.email_required");
    } else if (!EMAIL_RE.test(values.email)) {
        errors.email = t("checkout.errors.email_invalid");
    }

    if (!values.phone.trim()) {
        errors.phone = t("checkout.errors.phone");
    }

    if (!values.nationality.trim()) {
        errors.nationality = t("checkout.errors.nationality");
    }

    return errors;
}

export const CheckoutPage: React.FC = () => {
    const { draft, travelerInfo, saveTravelerInfo } = useBooking();
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const [values, setValues] = useState<TravelerInfo>(
        travelerInfo ?? {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            nationality: "",
            specialRequests: "",
        },
    );
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (!draft) {
            navigate({ name: "home" });
        }
    }, [draft, navigate]);

    if (!draft) {
        return null;
    }

    const handleChange = (field: keyof TravelerInfo, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate(values, t);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstErrorKey = Object.keys(validationErrors)[0];
            document.getElementById(`checkout-${firstErrorKey}`)?.focus();
            return;
        }

        saveTravelerInfo(values);
        navigate({ name: "payment" });
    };

    const { service } = draft;

    return (
        <div className="wdr-checkout">
            <div className="wdr-checkout__inner">
                <nav
                    className="wdr-checkout__steps"
                    aria-label={t("checkout.steps_aria")}
                >
                    <ol className="wdr-checkout__steps-list">
                        <li className="wdr-checkout__step wdr-checkout__step--done">
                            <button
                                type="button"
                                className="wdr-checkout__step-btn"
                                onClick={() => navigate({ name: "cart" })}
                            >
                                {t("checkout.steps.cart")}
                            </button>
                        </li>
                        <li
                            className="wdr-checkout__step wdr-checkout__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li
                            className="wdr-checkout__step wdr-checkout__step--active"
                            aria-current="step"
                        >
                            {t("checkout.steps.information")}
                        </li>
                        <li
                            className="wdr-checkout__step wdr-checkout__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-checkout__step">
                            {t("checkout.steps.payment")}
                        </li>
                        <li
                            className="wdr-checkout__step wdr-checkout__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-checkout__step">
                            {t("checkout.steps.confirmation")}
                        </li>
                    </ol>
                </nav>

                <header className="wdr-checkout__header">
                    <h1 className="wdr-checkout__title">
                        {t("checkout.title")}
                    </h1>
                    <p className="wdr-checkout__subtitle">
                        {t("checkout.subtitle")}
                    </p>
                </header>

                <div className="wdr-checkout__layout">
                    <section
                        className="wdr-checkout__form-section"
                        aria-label={t("checkout.title")}
                    >
                        <form
                            id="checkout-form"
                            className="wdr-checkout__form"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">
                                    {t("checkout.identity")}
                                </legend>
                                <div className="wdr-checkout__row">
                                    <Input
                                        id="checkout-firstName"
                                        label={t("checkout.first_name")}
                                        required
                                        autoComplete="given-name"
                                        value={values.firstName}
                                        error={errors.firstName}
                                        onChange={(e) =>
                                            handleChange(
                                                "firstName",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        id="checkout-lastName"
                                        label={t("checkout.last_name")}
                                        required
                                        autoComplete="family-name"
                                        value={values.lastName}
                                        error={errors.lastName}
                                        onChange={(e) =>
                                            handleChange(
                                                "lastName",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <Input
                                    id="checkout-nationality"
                                    label={t("checkout.nationality")}
                                    required
                                    autoComplete="country-name"
                                    placeholder={t(
                                        "checkout.nationality_placeholder",
                                    )}
                                    value={values.nationality}
                                    error={errors.nationality}
                                    onChange={(e) =>
                                        handleChange(
                                            "nationality",
                                            e.target.value,
                                        )
                                    }
                                />
                            </fieldset>

                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">
                                    {t("checkout.contact")}
                                </legend>
                                <Input
                                    id="checkout-email"
                                    label={t("checkout.email")}
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder={t(
                                        "checkout.email_placeholder",
                                    )}
                                    value={values.email}
                                    error={errors.email}
                                    hint={t("checkout.email_hint")}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                />
                                <Input
                                    id="checkout-phone"
                                    label={t("checkout.phone")}
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    placeholder={t(
                                        "checkout.phone_placeholder",
                                    )}
                                    value={values.phone}
                                    error={errors.phone}
                                    hint={t("checkout.phone_hint")}
                                    onChange={(e) =>
                                        handleChange("phone", e.target.value)
                                    }
                                />
                            </fieldset>

                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">
                                    {t("checkout.special_requests")} (
                                    {t("checkout.optional")})
                                </legend>
                                <div className="wdr-checkout__field">
                                    <label
                                        htmlFor="checkout-specialRequests"
                                        className="wdr-checkout__label"
                                    >
                                        {t("checkout.message_label")}
                                    </label>
                                    <textarea
                                        id="checkout-specialRequests"
                                        className="wdr-checkout__textarea"
                                        rows={4}
                                        placeholder={t(
                                            "checkout.message_placeholder",
                                        )}
                                        value={values.specialRequests}
                                        onChange={(e) =>
                                            handleChange(
                                                "specialRequests",
                                                e.target.value,
                                            )
                                        }
                                        maxLength={500}
                                    />
                                    <p
                                        className="wdr-checkout__counter"
                                        aria-live="polite"
                                    >
                                        {values.specialRequests.length} / 500
                                    </p>
                                </div>
                            </fieldset>

                            <div className="wdr-checkout__actions">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={() => navigate({ name: "cart" })}
                                >
                                    {t("checkout.back")}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                >
                                    {t("checkout.continue")}
                                </Button>
                            </div>
                        </form>
                    </section>

                    <aside
                        className="wdr-checkout__aside"
                        aria-label={t("checkout.order")}
                    >
                        <h3 className="wdr-checkout__aside-title">
                            {t("checkout.order")}
                        </h3>
                        <div className="wdr-checkout__aside-service">
                            <img
                                src={service.images[0] ?? ""}
                                alt={service.title}
                                className="wdr-checkout__aside-img"
                                loading="lazy"
                            />
                            <p className="wdr-checkout__aside-service-title">
                                {service.title}
                            </p>
                        </div>

                        <dl className="wdr-checkout__aside-prices">
                            <div className="wdr-checkout__aside-price-row">
                                <dt>{t("checkout.partner_price")}</dt>
                                <dd>
                                    {formatPrice(
                                        draft.partnerTotal,
                                        draft.currency,
                                    )}
                                </dd>
                            </div>
                            {draft.extrasTotal > 0 && (
                                <div className="wdr-checkout__aside-price-row">
                                    <dt>{t("checkout.extras")}</dt>
                                    <dd>
                                        {formatPrice(
                                            draft.extrasTotal,
                                            draft.currency,
                                        )}
                                    </dd>
                                </div>
                            )}
                            <div className="wdr-checkout__aside-price-row">
                                <dt>{t("checkout.service_fee")}</dt>
                                <dd>
                                    {formatPrice(
                                        draft.commissionTotal,
                                        draft.currency,
                                    )}
                                </dd>
                            </div>
                            <hr
                                className="wdr-checkout__aside-divider"
                                aria-hidden="true"
                            />
                            <div className="wdr-checkout__aside-price-row wdr-checkout__aside-price-row--total">
                                <dt>{t("checkout.total_vat")}</dt>
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
