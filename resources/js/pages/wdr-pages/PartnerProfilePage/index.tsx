/**
 * @file pages/PartnerProfilePage/index.tsx
 * @description Profil du partenaire connecte.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { usersApi } from "@/api/users";
import { Breadcrumb, Button } from "@/components/wdr";
import { useToast } from "@/components/wdr/Toast/ToastProvider";
import { useUser } from "@/context/UserContext";
import { usePartnerApprovalGuard } from "@/hooks/usePartnerApprovalGuard";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import type { Service } from "@/types/service";
import type { PartnerUser } from "@/types/wdr-user";
import "./PartnerProfilePage.css";

function getCategoryLabel(
    category: Service["category"],
    t: (key: string) => string,
): string {
    switch (category) {
        case "ACTIVITE":
            return t("partner.catalog.category.activity");
        case "BATEAU":
            return t("partner.catalog.category.boat");
        case "HEBERGEMENT":
            return t("partner.catalog.category.stay");
        case "VOITURE":
            return t("partner.catalog.category.car");
    }
}

interface PartnerProfileFormState {
    companyName: string;
    email: string;
    phoneNumber: string;
    businessAddress: string;
}

type PartnerProfileFormErrors = Partial<Record<keyof PartnerProfileFormState, string>>;

interface PartnerProfileFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: React.HTMLInputTypeAttribute;
    autoComplete?: string;
    error?: string;
}

const PartnerProfileField: React.FC<PartnerProfileFieldProps> = ({
    id,
    label,
    value,
    onChange,
    type = "text",
    autoComplete,
    error,
}) => (
    <div className="wdr-pprofile__form-field">
        <label htmlFor={id} className="wdr-pprofile__form-label">
            {label}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            autoComplete={autoComplete}
            onChange={(event) => onChange(event.target.value)}
            className={`wdr-pprofile__form-input${error ? " wdr-pprofile__form-input--error" : ""}`}
        />
        {error && <span className="wdr-pprofile__form-error">{error}</span>}
    </div>
);

export const PartnerProfilePage: React.FC = () => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { isBlocked } = usePartnerApprovalGuard();
    const toast = useToast();
    const { t } = useTranslation();
    const partner =
        currentUser?.role === "PARTNER" ? (currentUser as PartnerUser) : null;
    const { services } = useServicesData({
        partnerId: partner?.id ?? "__missing_partner__",
        limit: 200,
    });
    const partnerServices = services;

    const [form, setForm] = useState<PartnerProfileFormState>({
        companyName: partner?.companyName ?? "",
        email: partner?.email ?? "",
        phoneNumber: partner?.phoneNumber ?? "",
        businessAddress: partner?.businessAddress ?? "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<PartnerProfileFormErrors>({});
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        setForm({
            companyName: partner?.companyName ?? "",
            email: partner?.email ?? "",
            phoneNumber: partner?.phoneNumber ?? "",
            businessAddress: partner?.businessAddress ?? "",
        });
        setFormErrors({});
        setSubmitError("");
    }, [
        partner?.businessAddress,
        partner?.companyName,
        partner?.email,
        partner?.phoneNumber,
    ]);

    const handleChange = useCallback(
        (field: keyof PartnerProfileFormState) => (value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
            setSubmitError("");
        },
        [],
    );

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setFormErrors({});
        setSubmitError("");

        try {
            await usersApi.updateMe({
                email: form.email.trim(),
                phoneNumber: form.phoneNumber.trim() || undefined,
                companyName: form.companyName.trim() || undefined,
                businessAddress: form.businessAddress.trim() || undefined,
            });
            router.reload({ only: ["auth"] });
            toast.success(t("partner.profile.save_success_desc"), {
                title: t("partner.profile.save_success_title"),
            });
        } catch (error) {
            const payload =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof error.response === "object" &&
                error.response !== null &&
                "data" in error.response &&
                typeof error.response.data === "object" &&
                error.response.data !== null
                    ? (error.response.data as {
                          message?: string;
                          errors?: Record<string, string | string[]>;
                      })
                    : null;

            const validationErrors = payload?.errors ?? {};
            const nextErrors: PartnerProfileFormErrors = {};

            if (validationErrors.company_name) {
                nextErrors.companyName = Array.isArray(validationErrors.company_name)
                    ? validationErrors.company_name[0]
                    : validationErrors.company_name;
            }

            if (validationErrors.email) {
                nextErrors.email = Array.isArray(validationErrors.email)
                    ? validationErrors.email[0]
                    : validationErrors.email;
            }

            if (validationErrors.phone_number) {
                nextErrors.phoneNumber = Array.isArray(validationErrors.phone_number)
                    ? validationErrors.phone_number[0]
                    : validationErrors.phone_number;
            }

            if (validationErrors.business_address) {
                nextErrors.businessAddress = Array.isArray(
                    validationErrors.business_address,
                )
                    ? validationErrors.business_address[0]
                    : validationErrors.business_address;
            }

            setFormErrors(nextErrors);
            setSubmitError(payload?.message ?? t("partner.profile.save_error_desc"));
            toast.error(payload?.message ?? t("partner.profile.save_error_desc"), {
                title: t("partner.profile.save_error_title"),
            });
        } finally {
            setIsSaving(false);
        }
    }, [form, t, toast]);

    const activeCount = useMemo(
        () => partnerServices.filter((service) => service.isAvailable).length,
        [partnerServices],
    );
    const importedCount = useMemo(
        () =>
            partnerServices.filter((service) => service.sourceType === "EXTERNAL")
                .length,
        [partnerServices],
    );
    const hiddenCount = useMemo(
        () => partnerServices.filter((service) => !service.isAvailable).length,
        [partnerServices],
    );
    const avgRating = useMemo(() => {
        const rated = partnerServices.filter((service) => service.rating !== undefined);

        if (rated.length === 0) {
            return null;
        }

        return (
            rated.reduce((sum, service) => sum + (service.rating ?? 0), 0) /
            rated.length
        );
    }, [partnerServices]);

    if (isBlocked || !partner) {
        return null;
    }

    const joinYear = partner.createdAt.getFullYear();

    return (
        <div className="wdr-pprofile">
            <div className="wdr-pprofile__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("nav.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        {
                            label: t("partner.dashboard.title"),
                            onClick: () =>
                                navigate({ name: "partner-dashboard" }),
                        },
                        { label: t("partner.profile.title") },
                    ]}
                />
            </div>

            <div className="wdr-pprofile__hero">
                <div className="wdr-pprofile__hero-inner">
                    <div className="wdr-pprofile__avatar" aria-hidden="true">
                        {partner.profilePicture ? (
                            <img
                                src={partner.profilePicture}
                                alt={partner.companyName}
                            />
                        ) : (
                            <span>
                                {partner.companyName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="wdr-pprofile__hero-info">
                        <h1 className="wdr-pprofile__company-name">
                            {partner.companyName}
                        </h1>
                        <p className="wdr-pprofile__full-name">
                            {partner.firstName} {partner.lastName}
                        </p>
                        {partner.businessAddress && (
                            <p className="wdr-pprofile__address">
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
                                {partner.businessAddress}
                            </p>
                        )}
                        <p className="wdr-pprofile__since">
                            {t("partner.profile.since").replace(
                                "{year}",
                                String(joinYear),
                            )}
                        </p>
                    </div>

                    <div className="wdr-pprofile__hero-actions">
                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate({ name: "partner-service-form" })
                            }
                        >
                            + {t("partner.profile.add_service")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="wdr-pprofile__stats-bar">
                <div className="wdr-pprofile__stats-inner">
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {activeCount}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.active_services")}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {importedCount}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.imported_services")}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {hiddenCount}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.hidden_services")}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {avgRating !== null ? avgRating.toFixed(1) : "-"}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.rating")}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {formatPrice(partner.totalSales, "EUR")}
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.sales")}
                        </span>
                    </div>
                    <div
                        className="wdr-pprofile__stat-divider"
                        aria-hidden="true"
                    />
                    <div className="wdr-pprofile__stat">
                        <span className="wdr-pprofile__stat-value">
                            {(partner.commissionRate * 100).toFixed(0)} %
                        </span>
                        <span className="wdr-pprofile__stat-label">
                            {t("partner.profile.commission")}
                        </span>
                    </div>
                </div>
            </div>

            <section className="wdr-pprofile__account">
                <div className="wdr-pprofile__account-inner">
                    <div className="wdr-pprofile__account-header">
                        <div>
                            <h2 className="wdr-pprofile__account-title">
                                {t("partner.profile.account_title")}
                            </h2>
                            <p className="wdr-pprofile__account-subtitle">
                                {t("partner.profile.account_subtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="wdr-pprofile__form-grid">
                        <PartnerProfileField
                            id="partner-company-name"
                            label={t("partner.profile.field.company_name")}
                            value={form.companyName}
                            onChange={handleChange("companyName")}
                            autoComplete="organization"
                            error={formErrors.companyName}
                        />
                        <PartnerProfileField
                            id="partner-email"
                            label={t("partner.profile.field.email")}
                            value={form.email}
                            onChange={handleChange("email")}
                            type="email"
                            autoComplete="email"
                            error={formErrors.email}
                        />
                        <PartnerProfileField
                            id="partner-phone-number"
                            label={t("partner.profile.field.phone")}
                            value={form.phoneNumber}
                            onChange={handleChange("phoneNumber")}
                            type="tel"
                            autoComplete="tel"
                            error={formErrors.phoneNumber}
                        />
                        <PartnerProfileField
                            id="partner-business-address"
                            label={t("partner.profile.field.business_address")}
                            value={form.businessAddress}
                            onChange={handleChange("businessAddress")}
                            autoComplete="street-address"
                            error={formErrors.businessAddress}
                        />
                    </div>

                    {submitError && (
                        <p className="wdr-pprofile__submit-error">
                            {submitError}
                        </p>
                    )}

                    <div className="wdr-pprofile__account-actions">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving
                                ? t("partner.profile.save_loading")
                                : t("partner.profile.save")}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="wdr-pprofile__catalog">
                <div className="wdr-pprofile__catalog-inner">
                    <div className="wdr-pprofile__catalog-header">
                        <h2 className="wdr-pprofile__catalog-title">
                            {t("partner.profile.catalog_title")}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                navigate({ name: "partner-catalog" })
                            }
                        >
                            {t("partner.profile.catalog_manage")}
                        </Button>
                    </div>

                    {partnerServices.length === 0 ? (
                        <div className="wdr-pprofile__empty">
                            <p>{t("partner.profile.empty")}</p>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate({ name: "partner-service-form" })
                                }
                            >
                                {t("partner.profile.first_service")}
                            </Button>
                        </div>
                    ) : (
                        <div className="wdr-pprofile__service-grid">
                            {partnerServices.map((service) => (
                                <article
                                    key={service.id}
                                    className="wdr-pprofile__service-card"
                                >
                                    <div className="wdr-pprofile__service-topline">
                                        <span className="wdr-pprofile__service-category">
                                            {getCategoryLabel(service.category, t)}
                                        </span>
                                        <div className="wdr-pprofile__service-badges">
                                            <span
                                                className={`wdr-pprofile__service-badge ${service.isAvailable ? "wdr-pprofile__service-badge--active" : "wdr-pprofile__service-badge--inactive"}`}
                                            >
                                                {service.isAvailable
                                                    ? t("partner.catalog.status.active")
                                                    : t("partner.catalog.status.inactive")}
                                            </span>
                                            <span className="wdr-pprofile__service-badge wdr-pprofile__service-badge--source">
                                                {service.sourceType === "EXTERNAL"
                                                    ? t("partner.catalog.card.external")
                                                    : t("partner.catalog.card.local")}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="wdr-pprofile__service-title">
                                        {service.title}
                                    </h3>
                                    <p className="wdr-pprofile__service-location">
                                        {service.location.city}, {service.location.country}
                                    </p>
                                    <p className="wdr-pprofile__service-description">
                                        {service.description}
                                    </p>
                                    <div className="wdr-pprofile__service-pricing">
                                        <div>
                                            <span className="wdr-pprofile__service-price-label">
                                                {t("partner.catalog.card.partner_price")}
                                            </span>
                                            <strong className="wdr-pprofile__service-price-value">
                                                {formatPrice(
                                                    service.partnerPrice,
                                                    service.currency,
                                                )}
                                            </strong>
                                        </div>
                                        <div>
                                            <span className="wdr-pprofile__service-price-label">
                                                {t("partner.catalog.card.client_price")}
                                            </span>
                                            <strong className="wdr-pprofile__service-price-value">
                                                {formatPrice(
                                                    service.clientPrice,
                                                    service.currency,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="wdr-pprofile__service-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                navigate({
                                                    name: "service",
                                                    id: service.id,
                                                })
                                            }
                                        >
                                            {t("partner.catalog.card.open_public")}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() =>
                                                navigate({
                                                    name: "partner-service-form",
                                                    serviceId: service.id,
                                                })
                                            }
                                            disabled={
                                                service.sourceType === "EXTERNAL"
                                            }
                                        >
                                            {t("partner.profile.catalog_edit")}
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerProfilePage;
