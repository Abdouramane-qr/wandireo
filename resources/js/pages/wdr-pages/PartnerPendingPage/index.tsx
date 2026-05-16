import { router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { Button, useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { usePartnerSignContractData } from "@/hooks/useUsersData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import type { MandateContractStatus, PartnerStatus } from "@/types/wdr-user";
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
            return partner.mandateContractStatus === "SIGNED"
                ? t("partner.pending.message.approved")
                : t("partner.pending.message.approved_unsigned");
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

function accountStatusLabel(
    status: PartnerStatus,
    t: (key: string) => string,
): string {
    switch (status) {
        case "APPROVED":
            return t("partner.pending.status.account.approved");
        case "REJECTED":
            return t("partner.pending.status.account.rejected");
        case "SUSPENDED":
            return t("partner.pending.status.account.suspended");
        case "PENDING":
        default:
            return t("partner.pending.status.account.pending");
    }
}

function contractStatusLabel(
    status: MandateContractStatus,
    t: (key: string) => string,
): string {
    switch (status) {
        case "SIGNED":
            return t("partner.pending.status.contract.signed");
        case "REJECTED":
            return t("partner.pending.status.contract.rejected");
        case "PENDING_SIGNATURE":
            return t("partner.pending.status.contract.pending_signature");
        case "NOT_SENT":
        default:
            return t("partner.pending.status.contract.not_sent");
    }
}

export const PartnerPendingPage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();
    const { success, error } = useToast();
    const signContractMutation = usePartnerSignContractData();
    const [acceptedContract, setAcceptedContract] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.role !== "PARTNER") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== "PARTNER") {
        return null;
    }

    const canSelfSign =
        currentUser.partnerStatus !== "REJECTED" &&
        currentUser.partnerStatus !== "SUSPENDED" &&
        currentUser.mandateContractStatus !== "SIGNED" &&
        Boolean(currentUser.mandateContractFilePath);

    const handleSignContract = async (): Promise<void> => {
        if (!acceptedContract) {
            error(t("partner.pending.contract_accept_required"));
            return;
        }

        try {
            await signContractMutation.mutateAsync({ accepted: true });
            success(t("partner.pending.contract_sign_success"));

            if (currentUser.partnerStatus === "APPROVED") {
                navigate({ name: "partner-dashboard" });
                return;
            }

            router.reload();
        } catch {
            error(t("partner.pending.contract_sign_error"));
        }
    };

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
                        <strong>
                            {accountStatusLabel(currentUser.partnerStatus, t)}
                        </strong>
                    </div>
                    <div className="wdr-partner-pending__item">
                        <span className="wdr-partner-pending__label">
                            {t("partner.pending.contract_status")}
                        </span>
                        <strong>
                            {contractStatusLabel(
                                currentUser.mandateContractStatus,
                                t,
                            )}
                        </strong>
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

                {canSelfSign && (
                    <div className="wdr-partner-pending__sign-box">
                        <h2 className="wdr-partner-pending__sign-title">
                            {t("partner.pending.contract_sign_title")}
                        </h2>
                        <p className="wdr-partner-pending__sign-message">
                            {t("partner.pending.contract_sign_message")}
                        </p>
                        <label className="wdr-partner-pending__checkbox">
                            <input
                                type="checkbox"
                                checked={acceptedContract}
                                onChange={(event) =>
                                    setAcceptedContract(
                                        event.target.checked,
                                    )
                                }
                            />
                            <span>
                                {t(
                                    "partner.pending.contract_sign_acknowledge",
                                )}
                            </span>
                        </label>
                    </div>
                )}

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
                    {canSelfSign && (
                        <Button
                            variant="primary"
                            onClick={() => void handleSignContract()}
                            disabled={
                                signContractMutation.isPending ||
                                !acceptedContract
                            }
                        >
                            {signContractMutation.isPending
                                ? t("partner.pending.contract_sign_loading")
                                : t("partner.pending.contract_sign_cta")}
                        </Button>
                    )}
                    {currentUser.partnerStatus === "APPROVED" &&
                        currentUser.mandateContractStatus === "SIGNED" && (
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
