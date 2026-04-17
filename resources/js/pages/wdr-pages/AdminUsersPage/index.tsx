import React, { useEffect, useMemo, useState } from "react";
import {
    AdminSectionNav,
    Button,
    Input,
    Modal,
    useToast,
} from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useAdminBookingsData } from "@/hooks/useBookingsData";
import {
    useAdminCreateUserData,
    useAdminUploadPartnerContractData,
    useAdminUpdateUserData,
    useAdminUsersData,
} from "@/hooks/useUsersData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames } from "@/types/booking";
import type {
    AdminUser,
    ClientUser,
    UserRole,
    MandateContractStatus,
    PartnerStatus,
    PartnerUser,
} from "@/types/wdr-user";
import "./AdminUsersPage.css";

type PartnerEditForm = {
    commissionRate: string;
    stripeConnectedAccountId: string;
    businessAddress: string;
    partnerStatus: PartnerStatus;
    partnerRejectionReason: string;
    mandateContractStatus: MandateContractStatus;
    mandateContractFilePath: string;
};

type GeneralEditForm = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    language: string;
    preferredCurrency: string;
};

type PartnerCreateForm = {
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    phoneNumber: string;
    businessAddress: string;
    language: string;
    preferredCurrency: string;
    commissionRate: string;
    partnerStatus: PartnerStatus;
    mandateContractStatus: MandateContractStatus;
};

const DEFAULT_CREATE_FORM: PartnerCreateForm = {
    role: "PARTNER",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    phoneNumber: "",
    businessAddress: "",
    language: "fr",
    preferredCurrency: "EUR",
    commissionRate: "20",
    partnerStatus: "PENDING",
    mandateContractStatus: "NOT_SENT",
};

const statusLabel = (
    status: PartnerStatus,
    t: (key: string) => string,
): string =>
    ({
        APPROVED: t("admin.users.partner_status.approved"),
        REJECTED: t("admin.users.partner_status.rejected"),
        SUSPENDED: t("admin.users.partner_status.suspended"),
        PENDING: t("admin.users.partner_status.pending"),
    })[status];

const statusClass = (status: PartnerStatus): string =>
    ({
        APPROVED: "wdr-admin-users__partner-status--active",
        REJECTED: "wdr-admin-users__partner-status--inactive",
        SUSPENDED: "wdr-admin-users__partner-status--inactive",
        PENDING: "wdr-admin-users__partner-status--pending",
    })[status];

const contractStatusLabel = (
    status: MandateContractStatus,
    t: (key: string) => string,
): string =>
    ({
        NOT_SENT: t("admin.users.contract_status.not_sent"),
        PENDING_SIGNATURE: t("admin.users.contract_status.pending_signature"),
        SIGNED: t("admin.users.contract_status.signed"),
        REJECTED: t("admin.users.contract_status.rejected"),
    })[status];

const formatDate = (
    date: Date | undefined,
    locale: string,
    fallback: string,
): string =>
    date
        ? new Intl.DateTimeFormat(locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          }).format(date)
        : fallback;

export const AdminUsersPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t, intlLocale } = useTranslation();
    const [partnerStatusFilter, setPartnerStatusFilter] = useState<
        PartnerStatus | "all"
    >("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { users: allUsers } = useAdminUsersData({
        ...(partnerStatusFilter === "all"
            ? {}
            : { role: "PARTNER", partnerStatus: partnerStatusFilter }),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
    });
    const { bookings } = useAdminBookingsData();
    const updateUserMutation = useAdminUpdateUserData();
    const createUserMutation = useAdminCreateUserData();
    const uploadContractMutation = useAdminUploadPartnerContractData();

    const partners = useMemo(
        () =>
            allUsers.filter((user) => user.role === "PARTNER") as PartnerUser[],
        [allUsers],
    );
    const clients = useMemo(
        () =>
            partnerStatusFilter === "all"
                ? (allUsers.filter(
                      (user) => user.role === "CLIENT",
                  ) as ClientUser[])
                : [],
        [allUsers, partnerStatusFilter],
    );
    const admins = useMemo(
        () =>
            partnerStatusFilter === "all"
                ? (allUsers.filter(
                      (user) => user.role === "ADMIN",
                  ) as AdminUser[])
                : [],
        [allUsers, partnerStatusFilter],
    );

    const [editingPartnerId, setEditingPartnerId] = useState<string | null>(
        null,
    );
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<PartnerEditForm>({
        commissionRate: "",
        stripeConnectedAccountId: "",
        businessAddress: "",
        partnerStatus: "PENDING",
        partnerRejectionReason: "",
        mandateContractStatus: "NOT_SENT",
        mandateContractFilePath: "",
    });
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [generalEditForm, setGeneralEditForm] = useState<GeneralEditForm>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        language: "fr",
        preferredCurrency: "EUR",
    });
    const [createForm, setCreateForm] =
        useState<PartnerCreateForm>(DEFAULT_CREATE_FORM);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });
            return;
        }
        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const editingPartner = editingPartnerId
        ? (partners.find((partner) => partner.id === editingPartnerId) ?? null)
        : null;
    const editingUser = editingUserId
        ? (allUsers.find((user) => user.id === editingUserId) ?? null)
        : null;

    const partnerRevenue = useMemo(
        () =>
            Object.fromEntries(
                partners.map((partner) => {
                    const confirmed = bookings.filter(
                        (booking) =>
                            booking.partnerId === partner.id &&
                            booking.status === BookingStatusNames.CONFIRMED,
                    );
                    const total = confirmed.reduce(
                        (sum, booking) => sum + booking.totalPrice,
                        0,
                    );
                    const commission =
                        (total * partner.commissionRate) /
                        (1 + partner.commissionRate);

                    return [
                        partner.id,
                        {
                            total,
                            commission,
                            partnerNet: total - commission,
                            bookingsCount: confirmed.length,
                        },
                    ];
                }),
            ),
        [bookings, partners],
    );

    const openEditModal = (partner: PartnerUser): void => {
        setEditingPartnerId(partner.id);
        setEditForm({
            commissionRate: String(Math.round(partner.commissionRate * 100)),
            stripeConnectedAccountId: partner.stripeConnectedAccountId ?? "",
            businessAddress: partner.businessAddress ?? "",
            partnerStatus: partner.partnerStatus,
            partnerRejectionReason: partner.partnerRejectionReason ?? "",
            mandateContractStatus: partner.mandateContractStatus,
            mandateContractFilePath: partner.mandateContractFilePath ?? "",
        });
        setContractFile(null);
    };

    const openGeneralEditModal = (user: ClientUser | AdminUser): void => {
        setEditingUserId(user.id);
        setGeneralEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber ?? "",
            language: user.language ?? "fr",
            preferredCurrency:
                user.role === "CLIENT" ? (user.preferredCurrency ?? "EUR") : "",
        });
    };

    const savePartner = async (): Promise<void> => {
        if (!editingPartnerId) {
            return;
        }

        const ratePercent = Number.parseFloat(editForm.commissionRate);

        if (Number.isNaN(ratePercent) || ratePercent < 20 || ratePercent > 30) {
            error(t("admin.users.error.commission_range"));
            return;
        }

        const stripeId = editForm.stripeConnectedAccountId.trim();
        if (stripeId && !stripeId.startsWith("acct_")) {
            error(t("admin.users.error.stripe_prefix"));
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                id: editingPartnerId,
                data: {
                    commissionRate: ratePercent / 100,
                    stripeConnectedAccountId: stripeId || undefined,
                    businessAddress:
                        editForm.businessAddress.trim() || undefined,
                    partnerStatus: editForm.partnerStatus,
                    partnerRejectionReason:
                        editForm.partnerRejectionReason.trim() || undefined,
                    mandateContractStatus: editForm.mandateContractStatus,
                    mandateContractFilePath:
                        editForm.mandateContractFilePath.trim() || undefined,
                },
            });
            success(t("admin.users.toast.partner_updated"));
            setEditingPartnerId(null);
        } catch {
            error(t("admin.users.toast.partner_update_error"));
        }
    };

    const saveGeneralUser = async (): Promise<void> => {
        if (!editingUser) {
            return;
        }

        if (
            !generalEditForm.firstName.trim() ||
            !generalEditForm.lastName.trim() ||
            !generalEditForm.email.trim()
        ) {
            error(t("admin.users.error.general_required"));
            return;
        }

        try {
            await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: {
                    firstName: generalEditForm.firstName.trim(),
                    lastName: generalEditForm.lastName.trim(),
                    email: generalEditForm.email.trim(),
                    phoneNumber:
                        generalEditForm.phoneNumber.trim() || undefined,
                    language: generalEditForm.language.trim() || undefined,
                    preferredCurrency:
                        editingUser.role === "CLIENT"
                            ? generalEditForm.preferredCurrency.trim() ||
                              undefined
                            : undefined,
                },
            });
            success(t("admin.users.toast.account_updated"));
            setEditingUserId(null);
        } catch {
            error(t("admin.users.toast.account_update_error"));
        }
    };

    const uploadContract = async (): Promise<void> => {
        if (!editingPartnerId || !contractFile) {
            error(t("admin.users.error.pdf_required"));
            return;
        }

        try {
            const updatedPartner = await uploadContractMutation.mutateAsync({
                id: editingPartnerId,
                file: contractFile,
            });

            setEditForm((form) => ({
                ...form,
                mandateContractFilePath:
                    updatedPartner.role === "PARTNER"
                        ? (updatedPartner.mandateContractFilePath ?? "")
                        : form.mandateContractFilePath,
                mandateContractStatus:
                    updatedPartner.role === "PARTNER"
                        ? updatedPartner.mandateContractStatus
                        : form.mandateContractStatus,
            }));
            setContractFile(null);
            success(t("admin.users.toast.contract_uploaded"));
        } catch {
            error(t("admin.users.toast.contract_upload_error"));
        }
    };

    const createUser = async (): Promise<void> => {
        const ratePercent = Number.parseFloat(createForm.commissionRate);

        if (
            !createForm.firstName.trim() ||
            !createForm.lastName.trim() ||
            !createForm.email.trim() ||
            !createForm.password.trim()
        ) {
            error(t("admin.users.error.create_required"));
            return;
        }

        if (createForm.role === "PARTNER" && !createForm.companyName.trim()) {
            error(t("admin.users.error.company_required"));
            return;
        }

        if (
            createForm.role === "PARTNER" &&
            (Number.isNaN(ratePercent) || ratePercent < 20 || ratePercent > 30)
        ) {
            error(t("admin.users.error.commission_range"));
            return;
        }

        try {
            await createUserMutation.mutateAsync({
                firstName: createForm.firstName.trim(),
                lastName: createForm.lastName.trim(),
                email: createForm.email.trim(),
                password: createForm.password,
                role: createForm.role,
                companyName: createForm.companyName.trim() || undefined,
                phoneNumber: createForm.phoneNumber.trim() || undefined,
                businessAddress: createForm.businessAddress.trim() || undefined,
                language: createForm.language.trim() || undefined,
                preferredCurrency:
                    createForm.role === "CLIENT"
                        ? createForm.preferredCurrency.trim() || undefined
                        : undefined,
                commissionRate:
                    createForm.role === "PARTNER"
                        ? ratePercent / 100
                        : undefined,
                partnerStatus:
                    createForm.role === "PARTNER"
                        ? createForm.partnerStatus
                        : undefined,
                mandateContractStatus:
                    createForm.role === "PARTNER"
                        ? createForm.mandateContractStatus
                        : undefined,
            });
            success(t("admin.users.toast.account_created"));
            setCreateForm(DEFAULT_CREATE_FORM);
            setIsCreateModalOpen(false);
        } catch {
            error(t("admin.users.toast.account_create_error"));
        }
    };

    const exportPartnersCsv = (): void => {
        const rows = [
            [
                "id",
                t("admin.users.csv.company"),
                t("admin.users.csv.first_name"),
                "nom",
                "email",
                "statut_partenaire",
                "statut_contrat",
                "commission",
                "stripe_connect_id",
                "adresse",
            ],
            ...partners.map((partner) => [
                partner.id,
                partner.companyName,
                partner.firstName,
                partner.lastName,
                partner.email,
                partner.partnerStatus,
                partner.mandateContractStatus,
                String(partner.commissionRate),
                partner.stripeConnectedAccountId ?? "",
                partner.businessAddress ?? "",
            ]),
        ];
        const csv = rows
            .map((row) =>
                row
                    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                    .join(","),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "wandireo-partenaires.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const applyQuickUpdate = async (
        partner: PartnerUser,
        data: {
            partnerStatus?: PartnerStatus;
            mandateContractStatus?: MandateContractStatus;
            partnerRejectionReason?: string;
        },
        successMessage: string,
    ): Promise<void> => {
        try {
            await updateUserMutation.mutateAsync({
                id: partner.id,
                data: {
                    commissionRate: partner.commissionRate,
                    stripeConnectedAccountId:
                        partner.stripeConnectedAccountId ?? undefined,
                    businessAddress: partner.businessAddress ?? undefined,
                    partnerStatus: data.partnerStatus ?? partner.partnerStatus,
                    mandateContractStatus:
                        data.mandateContractStatus ??
                        partner.mandateContractStatus,
                    partnerRejectionReason:
                        data.partnerRejectionReason ??
                        partner.partnerRejectionReason ??
                        undefined,
                    mandateContractFilePath:
                        partner.mandateContractFilePath ?? undefined,
                },
            });
            success(successMessage);
        } catch {
            error(t("admin.users.toast.quick_action_error"));
        }
    };

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    const isPartnerCreation = createForm.role === "PARTNER";
    const isClientCreation = createForm.role === "CLIENT";

    return (
        <div className="wdr-admin-users">
            <section className="wdr-admin-users__hero">
                <div className="wdr-admin-users__hero-content">
                    <p className="wdr-admin-users__hero-badge">
                        {t("admin.users.badge")}
                    </p>
                    <h1 className="wdr-admin-users__hero-title">
                        {t("admin.users.title")}
                    </h1>
                    <p className="wdr-admin-users__hero-subtitle">
                        {t("admin.users.subtitle")}
                    </p>
                </div>
            </section>

            <AdminSectionNav active="users" />

            <div className="wdr-admin-users__body">
                <section>
                    <div className="wdr-admin-users__partner-actions">
                        <h2 className="wdr-admin-users__section-title">
                            {t("admin.users.hero.partners_count").replace(
                                "{count}",
                                String(partners.length),
                            )}
                        </h2>
                        <div className="wdr-admin-users__toolbar">
                            <Input
                                placeholder={t("admin.users.search_partner")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="wdr-admin-users__input"
                                value={partnerStatusFilter}
                                onChange={(e) =>
                                    setPartnerStatusFilter(
                                        e.target.value as PartnerStatus | "all",
                                    )
                                }
                            >
                                <option value="all">
                                    {t("admin.users.filter.all_statuses")}
                                </option>
                                <option value="PENDING">
                                    {t("admin.users.filter.pending")}
                                </option>
                                <option value="APPROVED">
                                    {t("admin.users.filter.approved")}
                                </option>
                                <option value="REJECTED">
                                    {t("admin.users.filter.rejected")}
                                </option>
                                <option value="SUSPENDED">
                                    {t("admin.users.filter.suspended")}
                                </option>
                            </select>
                            <Button
                                variant="primary"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                {t("admin.users.create_user")}
                            </Button>
                            <Button variant="ghost" onClick={exportPartnersCsv}>
                                {t("admin.users.export_csv")}
                            </Button>
                        </div>
                    </div>

                    <div className="wdr-admin-users__partners-grid">
                        {partners.map((partner) => {
                            const revenue = partnerRevenue[partner.id] ?? {
                                total: 0,
                                commission: 0,
                                partnerNet: 0,
                                bookingsCount: 0,
                            };

                            return (
                                <article
                                    key={partner.id}
                                    className="wdr-admin-users__partner-card"
                                >
                                    <div className="wdr-admin-users__partner-header">
                                        <div
                                            className="wdr-admin-users__partner-avatar"
                                            aria-hidden="true"
                                        >
                                            {partner.companyName[0]?.toUpperCase() ??
                                                "P"}
                                        </div>
                                        <div className="wdr-admin-users__partner-info">
                                            <span className="wdr-admin-users__partner-company">
                                                {partner.companyName}
                                            </span>
                                            <span className="wdr-admin-users__partner-name">
                                                {partner.firstName}{" "}
                                                {partner.lastName}
                                            </span>
                                            <span className="wdr-admin-users__partner-email">
                                                {partner.email}
                                            </span>
                                        </div>
                                        <span
                                            className={[
                                                "wdr-admin-users__partner-status",
                                                statusClass(
                                                    partner.partnerStatus,
                                                ),
                                            ].join(" ")}
                                        >
                                            {statusLabel(
                                                partner.partnerStatus,
                                                t,
                                            )}
                                        </span>
                                    </div>

                                    <div className="wdr-admin-users__partner-metrics">
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                {t("admin.users.metric.volume")}
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {formatPrice(
                                                    revenue.total,
                                                    "EUR",
                                                )}
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                {t(
                                                    "admin.users.metric.commission",
                                                )}
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {(
                                                    partner.commissionRate * 100
                                                ).toFixed(0)}{" "}
                                                %
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                {t(
                                                    "admin.users.metric.partner_net",
                                                )}
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {formatPrice(
                                                    revenue.partnerNet,
                                                    "EUR",
                                                )}
                                            </span>
                                        </div>
                                        <div className="wdr-admin-users__partner-metric">
                                            <span className="wdr-admin-users__partner-metric-label">
                                                {t(
                                                    "admin.users.metric.bookings",
                                                )}
                                            </span>
                                            <span className="wdr-admin-users__partner-metric-value">
                                                {revenue.bookingsCount}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="wdr-admin-users__stripe-row">
                                        <span className="wdr-admin-users__stripe-label">
                                            {t("admin.users.folder")}
                                        </span>
                                        <code className="wdr-admin-users__stripe-id">
                                            {statusLabel(
                                                partner.partnerStatus,
                                                t,
                                            )}
                                            {t("admin.users.contract_prefix")}
                                            {contractStatusLabel(
                                                partner.mandateContractStatus,
                                                t,
                                            )}
                                        </code>
                                    </div>

                                    <div className="wdr-admin-users__stripe-row">
                                        <span className="wdr-admin-users__stripe-label">
                                            {t("admin.users.stripe_id")}
                                        </span>
                                        <code className="wdr-admin-users__stripe-id">
                                            {partner.stripeConnectedAccountId ||
                                                t("admin.users.stripe_missing")}
                                        </code>
                                    </div>

                                    {partner.businessAddress && (
                                        <p className="wdr-admin-users__partner-address">
                                            {partner.businessAddress}
                                        </p>
                                    )}

                                    {partner.mandateContractFilePath && (
                                        <p className="wdr-admin-users__partner-address">
                                            {t(
                                                "admin.users.contract_file",
                                            ).replace(
                                                "{path}",
                                                partner.mandateContractFilePath,
                                            )}
                                        </p>
                                    )}

                                    <p className="wdr-admin-users__partner-address">
                                        {t(
                                            "admin.users.admin_validation",
                                        ).replace(
                                            "{date}",
                                            formatDate(
                                                partner.partnerValidatedAt,
                                                intlLocale,
                                                t("admin.users.not_provided"),
                                            ),
                                        )}
                                    </p>

                                    <p className="wdr-admin-users__partner-address">
                                        {t(
                                            "admin.users.contract_signature",
                                        ).replace(
                                            "{date}",
                                            formatDate(
                                                partner.mandateSignedAt,
                                                intlLocale,
                                                t("admin.users.not_provided"),
                                            ),
                                        )}
                                    </p>

                                    {partner.partnerRejectionReason && (
                                        <p className="wdr-admin-users__partner-address">
                                            {t("admin.users.reason").replace(
                                                "{reason}",
                                                partner.partnerRejectionReason,
                                            )}
                                        </p>
                                    )}

                                    <div className="wdr-admin-users__partner-actions">
                                        {partner.partnerStatus !==
                                            "APPROVED" && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            partnerStatus:
                                                                "APPROVED",
                                                        },
                                                        t(
                                                            "admin.users.quick.approve_success",
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                {t("admin.users.quick.approve")}
                                            </Button>
                                        )}
                                        {partner.mandateContractStatus !==
                                            "SIGNED" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            mandateContractStatus:
                                                                "SIGNED",
                                                        },
                                                        t(
                                                            "admin.users.quick.contract_signed_success",
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                {t(
                                                    "admin.users.quick.contract_signed",
                                                )}
                                            </Button>
                                        )}
                                        {partner.partnerStatus !==
                                            "SUSPENDED" && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                    void applyQuickUpdate(
                                                        partner,
                                                        {
                                                            partnerStatus:
                                                                "SUSPENDED",
                                                        },
                                                        t(
                                                            "admin.users.quick.suspend_success",
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    updateUserMutation.isPending
                                                }
                                            >
                                                {t("admin.users.quick.suspend")}
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openEditModal(partner)
                                            }
                                        >
                                            {t("admin.users.edit")}
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {partnerStatusFilter === "all" && (
                    <section>
                        <h2 className="wdr-admin-users__section-title">
                            {t("admin.users.hero.clients_count").replace(
                                "{count}",
                                String(clients.length),
                            )}
                        </h2>
                        <div className="wdr-admin-users__table-wrapper">
                            <table className="wdr-admin-users__table">
                                <thead>
                                    <tr>
                                        <th>{t("admin.users.table.name")}</th>
                                        <th>{t("admin.users.table.email")}</th>
                                        <th>
                                            {t("admin.users.table.language")}
                                        </th>
                                        <th>
                                            {t("admin.users.table.currency")}
                                        </th>
                                        <th>
                                            {t("admin.users.table.bookings")}
                                        </th>
                                        <th>
                                            {t("admin.users.table.reviews")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.id}>
                                            <td>
                                                {client.firstName}{" "}
                                                {client.lastName}
                                            </td>
                                            <td>{client.email}</td>
                                            <td>
                                                {client.language?.toUpperCase() ??
                                                    "—"}
                                            </td>
                                            <td>
                                                {client.preferredCurrency ??
                                                    "—"}
                                            </td>
                                            <td>{client.bookingsCount ?? 0}</td>
                                            <td>{client.reviewsCount ?? 0}</td>
                                            <td>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openGeneralEditModal(
                                                            client,
                                                        )
                                                    }
                                                >
                                                    {t("admin.users.edit")}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {partnerStatusFilter === "all" && (
                    <section>
                        <h2 className="wdr-admin-users__section-title">
                            {t("admin.users.hero.admins_count").replace(
                                "{count}",
                                String(admins.length),
                            )}
                        </h2>
                        <div className="wdr-admin-users__table-wrapper">
                            <table className="wdr-admin-users__table">
                                <thead>
                                    <tr>
                                        <th>{t("admin.users.table.name")}</th>
                                        <th>{t("admin.users.table.email")}</th>
                                        <th>
                                            {t("admin.users.table.language")}
                                        </th>
                                        <th>
                                            {t("admin.users.table.permissions")}
                                        </th>
                                        <th>{t("admin.users.table.action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.map((admin) => (
                                        <tr key={admin.id}>
                                            <td>
                                                {admin.firstName}{" "}
                                                {admin.lastName}
                                            </td>
                                            <td>{admin.email}</td>
                                            <td>
                                                {admin.language?.toUpperCase() ??
                                                    "—"}
                                            </td>
                                            <td>
                                                {admin.permissions.length > 0
                                                    ? admin.permissions.join(
                                                          ", ",
                                                      )
                                                    : "—"}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openGeneralEditModal(
                                                            admin,
                                                        )
                                                    }
                                                >
                                                    {t("admin.users.edit")}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {editingPartner && (
                <Modal
                    isOpen={!!editingPartnerId}
                    onClose={() => setEditingPartnerId(null)}
                    title={t("admin.users.modal.partner_title").replace(
                        "{name}",
                        editingPartner.companyName,
                    )}
                    size="md"
                >
                    <div className="wdr-admin-users__edit-form">
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.commission")}
                            </label>
                            <Input
                                type="number"
                                min={20}
                                max={30}
                                step={1}
                                value={editForm.commissionRate}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        commissionRate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.partner_status")}
                            </label>
                            <select
                                className="wdr-admin-users__input"
                                value={editForm.partnerStatus}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        partnerStatus: e.target
                                            .value as PartnerStatus,
                                    }))
                                }
                            >
                                <option value="PENDING">
                                    {t("admin.users.partner_status.pending")}
                                </option>
                                <option value="APPROVED">
                                    {t("admin.users.partner_status.approved")}
                                </option>
                                <option value="REJECTED">
                                    {t("admin.users.partner_status.rejected")}
                                </option>
                                <option value="SUSPENDED">
                                    {t("admin.users.partner_status.suspended")}
                                </option>
                            </select>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.contract_status")}
                            </label>
                            <select
                                className="wdr-admin-users__input"
                                value={editForm.mandateContractStatus}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        mandateContractStatus: e.target
                                            .value as MandateContractStatus,
                                    }))
                                }
                            >
                                <option value="NOT_SENT">
                                    {t("admin.users.contract_status.not_sent")}
                                </option>
                                <option value="PENDING_SIGNATURE">
                                    {t(
                                        "admin.users.contract_status.pending_signature",
                                    )}
                                </option>
                                <option value="SIGNED">
                                    {t("admin.users.contract_status.signed")}
                                </option>
                                <option value="REJECTED">
                                    {t("admin.users.contract_status.rejected")}
                                </option>
                            </select>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.stripe_account")}
                            </label>
                            <Input
                                value={editForm.stripeConnectedAccountId}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        stripeConnectedAccountId:
                                            e.target.value,
                                    }))
                                }
                                placeholder="acct_..."
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.business_address")}
                            </label>
                            <Input
                                value={editForm.businessAddress}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        businessAddress: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.contract")}
                            </label>
                            <Input
                                value={editForm.mandateContractFilePath}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        mandateContractFilePath: e.target.value,
                                    }))
                                }
                                placeholder="storage/contracts/mandat.pdf"
                            />
                            {editForm.mandateContractFilePath && (
                                <a
                                    className="wdr-admin-users__contract-link"
                                    href={editForm.mandateContractFilePath}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t(
                                        "admin.users.field.open_current_contract",
                                    )}
                                </a>
                            )}
                            {editingPartner && (
                                <p className="wdr-admin-users__edit-hint">
                                    {t("admin.users.field.contract_hint")
                                        .replace(
                                            "{validated}",
                                            formatDate(
                                                editingPartner.partnerValidatedAt,
                                                intlLocale,
                                                t("admin.users.not_provided"),
                                            ),
                                        )
                                        .replace(
                                            "{signed}",
                                            formatDate(
                                                editingPartner.mandateSignedAt,
                                                intlLocale,
                                                t("admin.users.not_provided"),
                                            ),
                                        )}
                                </p>
                            )}
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.upload_contract_pdf")}
                            </label>
                            <input
                                className="wdr-admin-users__input"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                    setContractFile(e.target.files?.[0] ?? null)
                                }
                            />
                            <div className="wdr-admin-users__edit-actions">
                                <Button
                                    variant="ghost"
                                    onClick={() => setContractFile(null)}
                                    disabled={uploadContractMutation.isPending}
                                >
                                    {t("admin.users.field.reset")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => void uploadContract()}
                                    disabled={
                                        uploadContractMutation.isPending ||
                                        !contractFile
                                    }
                                >
                                    {uploadContractMutation.isPending
                                        ? t("admin.users.field.uploading")
                                        : t("admin.users.field.upload_pdf")}
                                </Button>
                            </div>
                        </div>
                        <div className="wdr-admin-users__edit-field">
                            <label className="wdr-admin-users__edit-label">
                                {t("admin.users.field.reason")}
                            </label>
                            <textarea
                                className="wdr-admin-users__input"
                                value={editForm.partnerRejectionReason}
                                onChange={(e) =>
                                    setEditForm((form) => ({
                                        ...form,
                                        partnerRejectionReason: e.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>
                        <div className="wdr-admin-users__edit-actions">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingPartnerId(null)}
                            >
                                {t("admin.users.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void savePartner()}
                            >
                                {updateUserMutation.isPending
                                    ? t("admin.users.saving")
                                    : t("admin.users.save")}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {editingUser && (
                <Modal
                    isOpen={!!editingUserId}
                    onClose={() => setEditingUserId(null)}
                    title={t("admin.users.modal.user_title").replace(
                        "{name}",
                        `${editingUser.firstName} ${editingUser.lastName}`,
                    )}
                    size="md"
                >
                    <div className="wdr-admin-users__edit-form">
                        <Input
                            placeholder={t(
                                "admin.users.placeholder.first_name",
                            )}
                            value={generalEditForm.firstName}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    firstName: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder={t("admin.users.placeholder.last_name")}
                            value={generalEditForm.lastName}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    lastName: e.target.value,
                                }))
                            }
                        />
                        <Input
                            type="email"
                            placeholder={t("admin.users.placeholder.email")}
                            value={generalEditForm.email}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    email: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder={t("admin.users.placeholder.phone")}
                            value={generalEditForm.phoneNumber}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    phoneNumber: e.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder={t("admin.users.placeholder.language")}
                            value={generalEditForm.language}
                            onChange={(e) =>
                                setGeneralEditForm((form) => ({
                                    ...form,
                                    language: e.target.value,
                                }))
                            }
                        />
                        {editingUser.role === "CLIENT" && (
                            <Input
                                placeholder={t(
                                    "admin.users.placeholder.preferred_currency",
                                )}
                                value={generalEditForm.preferredCurrency}
                                onChange={(e) =>
                                    setGeneralEditForm((form) => ({
                                        ...form,
                                        preferredCurrency: e.target.value,
                                    }))
                                }
                            />
                        )}
                        <div className="wdr-admin-users__edit-actions">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingUserId(null)}
                            >
                                {t("admin.users.cancel")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void saveGeneralUser()}
                            >
                                {updateUserMutation.isPending
                                    ? t("admin.users.saving")
                                    : t("admin.users.save")}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t("admin.users.modal.create_title")}
                size="lg"
            >
                <div className="wdr-admin-users__edit-form">
                    <p className="wdr-admin-users__edit-intro">
                        {t("admin.users.create_intro")}
                    </p>

                    <div className="wdr-admin-users__form-section">
                        <div className="wdr-admin-users__form-section-head">
                            <h3 className="wdr-admin-users__form-section-title">
                                {t("admin.users.section.account_type")}
                            </h3>
                            <span className="wdr-admin-users__role-pill">
                                {createForm.role}
                            </span>
                        </div>
                        <select
                            className="wdr-admin-users__input"
                            value={createForm.role}
                            onChange={(e) =>
                                setCreateForm((form) => ({
                                    ...form,
                                    role: e.target.value as UserRole,
                                }))
                            }
                        >
                            <option value="PARTNER">
                                {t("admin.users.role.partner")}
                            </option>
                            <option value="CLIENT">
                                {t("admin.users.role.client")}
                            </option>
                            <option value="ADMIN">
                                {t("admin.users.role.admin")}
                            </option>
                        </select>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            {t("admin.users.section.identity")}
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                placeholder={t(
                                    "admin.users.placeholder.first_name",
                                )}
                                value={createForm.firstName}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        firstName: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder={t(
                                    "admin.users.placeholder.last_name",
                                )}
                                value={createForm.lastName}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        lastName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            {t("admin.users.section.account")}
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                type="email"
                                placeholder={t("admin.users.placeholder.email")}
                                value={createForm.email}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        email: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="password"
                                placeholder={t(
                                    "admin.users.placeholder.initial_password",
                                )}
                                value={createForm.password}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        password: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="wdr-admin-users__form-section">
                        <h3 className="wdr-admin-users__form-section-title">
                            {t("admin.users.section.profile")}
                        </h3>
                        <div className="wdr-admin-users__form-grid">
                            <Input
                                placeholder={t(
                                    "admin.users.placeholder.language",
                                )}
                                value={createForm.language}
                                onChange={(e) =>
                                    setCreateForm((form) => ({
                                        ...form,
                                        language: e.target.value,
                                    }))
                                }
                            />
                            {isClientCreation && (
                                <Input
                                    placeholder={t(
                                        "admin.users.placeholder.preferred_currency",
                                    )}
                                    value={createForm.preferredCurrency}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            preferredCurrency: e.target.value,
                                        }))
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {isPartnerCreation && (
                        <div className="wdr-admin-users__form-section wdr-admin-users__form-section--partner">
                            <div className="wdr-admin-users__form-section-head">
                                <h3 className="wdr-admin-users__form-section-title">
                                    {t("admin.users.section.partner_settings")}
                                </h3>
                                <span className="wdr-admin-users__form-section-copy">
                                    {t("admin.users.section.partner_copy")}
                                </span>
                            </div>
                            <div className="wdr-admin-users__form-grid">
                                <Input
                                    placeholder={t(
                                        "admin.users.placeholder.company",
                                    )}
                                    value={createForm.companyName}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            companyName: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    placeholder={t(
                                        "admin.users.placeholder.phone",
                                    )}
                                    value={createForm.phoneNumber}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            phoneNumber: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    placeholder={t(
                                        "admin.users.field.business_address",
                                    )}
                                    value={createForm.businessAddress}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            businessAddress: e.target.value,
                                        }))
                                    }
                                />
                                <Input
                                    type="number"
                                    min={20}
                                    max={30}
                                    step={1}
                                    placeholder={t(
                                        "admin.users.placeholder.commission",
                                    )}
                                    value={createForm.commissionRate}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            commissionRate: e.target.value,
                                        }))
                                    }
                                />
                                <select
                                    className="wdr-admin-users__input"
                                    value={createForm.partnerStatus}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            partnerStatus: e.target
                                                .value as PartnerStatus,
                                        }))
                                    }
                                >
                                    <option value="PENDING">
                                        {t(
                                            "admin.users.partner_status.pending",
                                        )}
                                    </option>
                                    <option value="APPROVED">
                                        {t(
                                            "admin.users.partner_status.approved",
                                        )}
                                    </option>
                                    <option value="REJECTED">
                                        {t(
                                            "admin.users.partner_status.rejected",
                                        )}
                                    </option>
                                    <option value="SUSPENDED">
                                        {t(
                                            "admin.users.partner_status.suspended",
                                        )}
                                    </option>
                                </select>
                                <select
                                    className="wdr-admin-users__input"
                                    value={createForm.mandateContractStatus}
                                    onChange={(e) =>
                                        setCreateForm((form) => ({
                                            ...form,
                                            mandateContractStatus: e.target
                                                .value as MandateContractStatus,
                                        }))
                                    }
                                >
                                    <option value="NOT_SENT">
                                        {t("admin.users.contract.not_sent")}
                                    </option>
                                    <option value="PENDING_SIGNATURE">
                                        {t(
                                            "admin.users.contract.pending_signature",
                                        )}
                                    </option>
                                    <option value="SIGNED">
                                        {t("admin.users.contract.signed")}
                                    </option>
                                    <option value="REJECTED">
                                        {t("admin.users.contract.rejected")}
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="wdr-admin-users__edit-actions">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            {t("admin.users.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => void createUser()}
                        >
                            {createUserMutation.isPending
                                ? t("admin.users.creating")
                                : t("admin.users.create_account")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
