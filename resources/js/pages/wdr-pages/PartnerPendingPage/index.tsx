import React, { useEffect } from "react";
import { Button } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import type { PartnerUser } from "@/types/wdr-user";
import "./PartnerPendingPage.css";

function statusTitle(
    status: PartnerUser["partnerStatus"],
    t: (key: string) => string,
): string {
    switch (status) {
        case "APPROVED":
            return t("partner.pending.title.approved");
        case "REJECTED":
            return t("partner.pending.title.rejected");
        case "SUSPENDED":
            return t("partner.pending.title.suspended");
        default:
            return t("partner.pending.title.pending");
    }
}

function formatDate(
    date: Date | undefined,
    intlLocale: string,
    t: (key: string) => string,
): string {
    if (!date) {
        return t("partner.pending.date_missing");
    }

    return new Intl.DateTimeFormat(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function statusMessage(
    partner: PartnerUser,
    t: (key: string) => string,
): string {
    switch (partner.partnerStatus) {
        case "APPROVED":
            return t("partner.pending.message.approved");
        case "REJECTED":
            return partner.partnerRejectionReason
                ? t("partner.pending.message.rejected_with_reason").replace(
                      "{reason}",
                      partner.partnerRejectionReason,
                  )
                : t("partner.pending.message.rejected");
        case "SUSPENDED":
            return t("partner.pending.message.suspended");
        default:
            return t("partner.pending.message.pending");
    }
}

export const PartnerPendingPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();

    useEffect(() => {
        if (currentUser && currentUser.role !== "PARTNER") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== "PARTNER") {
        return null;
    }

    return (
        <section className="wdr-partner-pending">
            <div className="wdr-partner-pending__card">
                <p className="wdr-partner-pending__eyebrow">
                    {t("partner.dashboard.title")}
                </p>
                <h1 className="wdr-partner-pending__title">
                    {statusTitle(currentUser.partnerStatus, t)}
                </h1>
                <p className="wdr-partner-pending__message">
                    {statusMessage(currentUser, t)}
                </p>

                <div className="wdr-partner-pending__grid">
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.account_status")}
                        </span>
                        <strong>{currentUser.partnerStatus}</strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.contract_status")}
                        </span>
                        <strong>{currentUser.mandateContractStatus}</strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.admin_validation")}
                        </span>
                        <strong>
                            {formatDate(
                                currentUser.partnerValidatedAt,
                                intlLocale,
                                t,
                            )}
                        </strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.contract_signature")}
                        </span>
                        <strong>
                            {formatDate(
                                currentUser.mandateSignedAt,
                                intlLocale,
                                t,
                            )}
                        </strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.company")}
                        </span>
                        <strong>{currentUser.companyName}</strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.contact")}
                        </span>
                        <strong>{currentUser.email}</strong>
                    </div>
                </div>

                <div className="wdr-partner-pending__actions">
                    {currentUser.mandateContractFilePath && (
                        <Button
                            variant="primary"
                            onClick={() =>
                                window.open(
                                    currentUser.mandateContractFilePath,
                                    "_blank",
                                    "noopener,noreferrer",
                                )
                            }
                        >
                            {t("partner.pending.download_contract")}
                        </Button>
                    )}
                    {currentUser.partnerStatus === "APPROVED" && (
                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate({ name: "partner-dashboard" })
                            }
                        >
                            {t("partner.pending.open_dashboard")}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => navigate({ name: "home" })}
                    >
                        {t("partner.pending.back_home")}
                    </Button>
                    <Button variant="ghost" onClick={logout}>
                        {t("nav.logout")}
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default PartnerPendingPage;
