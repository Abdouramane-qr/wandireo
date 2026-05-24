import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { bookingsApi } from "@/api/bookings";
import { AdminSectionNav, Button, useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useAdminBookingsData } from "@/hooks/useBookingsData";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdminUsersData } from "@/hooks/useUsersData";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import {
    BookingStatusNames,
    PaymentStatusNames,
    PayoutStatusNames,
} from "@/types/booking";
import type {
    BookingStatus,
    PaymentStatus,
    PayoutStatus,
} from "@/types/booking";
import { PaymentModeLabels } from "@/types/service";
import "./AdminTransactionsPage.css";

function calcCommission(totalPrice: number, rate: number): number {
    return (totalPrice * rate) / (1 + rate);
}

function getPaymentStatusLabel(
    status: PaymentStatus,
    t: (key: string) => string,
): string {
    if (status === PaymentStatusNames.PAID) {
        return t("admin.transactions.payment.paid");
    }

    if (status === PaymentStatusNames.REFUNDED) {
        return t("admin.transactions.payment.refunded");
    }

    return t("admin.transactions.payment.pending");
}

function getPaymentStatusClass(status: PaymentStatus): string {
    if (status === PaymentStatusNames.PAID) {
        return "paid";
    }

    if (status === PaymentStatusNames.REFUNDED) {
        return "refunded";
    }

    return "pending";
}

function getPayoutStatusLabel(
    status: PayoutStatus,
    t: (key: string) => string,
): string {
    if (status === PayoutStatusNames.PAID) {
        return t("admin.transactions.payout.paid");
    }

    if (status === PayoutStatusNames.ON_HOLD) {
        return t("admin.transactions.payout.on_hold");
    }

    if (status === PayoutStatusNames.SCHEDULED) {
        return t("admin.transactions.payout.scheduled");
    }

    if (status === PayoutStatusNames.FAILED) {
        return t("admin.transactions.payout.failed");
    }

    return t("admin.transactions.payout.pending");
}

function getPayoutStatusClass(status: PayoutStatus): string {
    if (status === PayoutStatusNames.PAID) {
        return "paid";
    }

    if (status === PayoutStatusNames.ON_HOLD) {
        return "on-hold";
    }

    if (status === PayoutStatusNames.SCHEDULED) {
        return "scheduled";
    }

    if (status === PayoutStatusNames.FAILED) {
        return "failed";
    }

    return "pending";
}

function isPayoutAttentionStatus(status: PayoutStatus): boolean {
    return (
        status === PayoutStatusNames.ON_HOLD ||
        status === PayoutStatusNames.FAILED
    );
}

function getBookingStatusLabel(
    status: string,
    t: (key: string) => string,
): string {
    if (status === BookingStatusNames.CONFIRMED) {
        return t("admin.transactions.booking.confirmed");
    }

    if (status === BookingStatusNames.AWAITING_PAYMENT) {
        return t("history.status.awaiting_payment");
    }

    if (status === BookingStatusNames.PENDING) {
        return t("admin.transactions.booking.pending");
    }

    return t("admin.transactions.booking.cancelled");
}

function getBookingStatusClass(status: string): string {
    if (status === BookingStatusNames.CONFIRMED) {
        return "confirmed";
    }

    if (status === BookingStatusNames.AWAITING_PAYMENT) {
        return "pending";
    }

    if (status === BookingStatusNames.PENDING) {
        return "pending";
    }

    return "cancelled";
}

function getExternalStatusLabel(
    status: string,
    t: (key: string) => string,
): string {
    if (status === "CONFIRMED") {
        return t("admin.transactions.external.confirmed");
    }

    if (status === "FAILED") {
        return t("admin.transactions.external.failed");
    }

    if (status === "PENDING") {
        return t("admin.transactions.external.pending");
    }

    return status;
}

function formatExtrasSummary(entry: {
    selectedExtras?: Array<{ name: string; quantity: number }>;
    extrasTotal?: number;
    currency: string;
}): string | null {
    if (!entry.selectedExtras || entry.selectedExtras.length === 0) {
        return null;
    }

    const names = entry.selectedExtras
        .map((extra) =>
            extra.quantity > 1
                ? `${extra.name} x${extra.quantity}`
                : extra.name,
        )
        .join(", ");

    return `${names} · ${formatPrice(entry.extrasTotal ?? 0, entry.currency)}`;
}

type RiskFilter = "all" | "attention" | "external" | "payout";

export const AdminTransactionsPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const queryClient = useQueryClient();
    const { t, intlLocale, locale } = useTranslation();
    const { error, success } = useToast();
    const { services } = useServicesData({ adminAll: true, limit: 200 });
    const { users } = useAdminUsersData();

    const allPartners = users.filter((user) => user.role === "PARTNER");
    const allClients = users.filter((user) => user.role === "CLIENT");

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterPartner, setFilterPartner] = useState<string>("all");
    const [filterBookingStatus, setFilterBookingStatus] = useState<
        BookingStatus | "all"
    >("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<
        PaymentStatus | "all"
    >("all");
    const [filterPayoutStatus, setFilterPayoutStatus] = useState<
        PayoutStatus | "all"
    >("all");
    const [filterExternalStatus, setFilterExternalStatus] = useState<
        "all" | "CONFIRMED" | "FAILED" | "PENDING" | "NONE"
    >("all");
    const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

    const { bookings } = useAdminBookingsData({
        q: searchTerm.trim() || undefined,
        partnerId: filterPartner !== "all" ? filterPartner : undefined,
        status: filterBookingStatus !== "all" ? filterBookingStatus : undefined,
        paymentStatus:
            filterPaymentStatus !== "all" ? filterPaymentStatus : undefined,
        payoutStatus:
            filterPayoutStatus !== "all" ? filterPayoutStatus : undefined,
        externalBookingStatus:
            filterExternalStatus !== "all" ? filterExternalStatus : undefined,
    });
    const financeParams = useMemo(
        () => ({
            partnerId: filterPartner !== "all" ? filterPartner : undefined,
            payoutStatus:
                filterPayoutStatus !== "all" ? filterPayoutStatus : undefined,
        }),
        [filterPartner, filterPayoutStatus],
    );
    const financeSummaryQuery = useQuery({
        queryKey: ["finance", "admin-summary", financeParams],
        queryFn: () => bookingsApi.adminFinanceSummary(financeParams),
        staleTime: 30_000,
        retry: 1,
        enabled: currentUser?.role === "ADMIN",
    });
    const payoutMutation = useMutation({
        mutationFn: ({
            bookingId,
            payoutStatus,
            payoutNotes,
        }: {
            bookingId: string;
            payoutStatus: PayoutStatus;
            payoutNotes?: string;
        }) =>
            bookingsApi.adminUpdatePayoutStatus(
                bookingId,
                payoutStatus,
                payoutNotes,
            ),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["bookings"] }),
                queryClient.invalidateQueries({ queryKey: ["finance"] }),
            ]);
            success(t("admin.transactions.payout.update_success"));
        },
        onError: () => {
            error(t("admin.transactions.payout.update_error"));
        },
    });

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const enrichedBookings = useMemo(
        () =>
            bookings.map((booking) => {
                const partner = allPartners.find(
                    (user) => user.id === booking.partnerId,
                );
                const client = allClients.find(
                    (user) => user.id === booking.clientId,
                );
                const service = services.find(
                    (entry) => entry.id === booking.serviceId,
                );
                const rate =
                    partner?.role === "PARTNER" ? partner.commissionRate : 0;
                const commission = calcCommission(booking.totalPrice, rate);

                return {
                    booking,
                    partner,
                    client,
                    service,
                    commission,
                    partnerNet: booking.totalPrice - commission,
                    rate,
                };
            }),
        [allClients, allPartners, bookings, services],
    );

    const riskSummary = useMemo(() => {
        const externalErrors = enrichedBookings.filter(
            (entry) =>
                entry.booking.externalBookingStatus === "FAILED" ||
                Boolean(entry.booking.externalErrorMessage),
        ).length;
        const payoutAttention = enrichedBookings.filter(
            (entry) =>
                entry.booking.status === BookingStatusNames.CONFIRMED &&
                isPayoutAttentionStatus(entry.booking.payoutStatus),
        ).length;
        const payoutPending = enrichedBookings.filter(
            (entry) =>
                entry.booking.status === BookingStatusNames.CONFIRMED &&
                entry.booking.payoutStatus === PayoutStatusNames.PENDING,
        ).length;
        const supportAttention = enrichedBookings.filter(
            (entry) =>
                entry.booking.externalBookingStatus === "FAILED" ||
                Boolean(entry.booking.externalErrorMessage) ||
                (entry.booking.status === BookingStatusNames.CONFIRMED &&
                    isPayoutAttentionStatus(entry.booking.payoutStatus)),
        ).length;

        return {
            externalErrors,
            payoutAttention,
            payoutPending,
            supportAttention,
        };
    }, [enrichedBookings]);

    const filteredBookings = useMemo(() => {
        if (riskFilter === "external") {
            return enrichedBookings.filter(
                (entry) =>
                    entry.booking.externalBookingStatus === "FAILED" ||
                    Boolean(entry.booking.externalErrorMessage),
            );
        }

        if (riskFilter === "payout") {
            return enrichedBookings.filter(
                (entry) =>
                    entry.booking.status === BookingStatusNames.CONFIRMED &&
                    isPayoutAttentionStatus(entry.booking.payoutStatus),
            );
        }

        if (riskFilter === "attention") {
            return enrichedBookings.filter(
                (entry) =>
                    entry.booking.externalBookingStatus === "FAILED" ||
                    Boolean(entry.booking.externalErrorMessage) ||
                    (entry.booking.status === BookingStatusNames.CONFIRMED &&
                        isPayoutAttentionStatus(entry.booking.payoutStatus)),
            );
        }

        return enrichedBookings;
    }, [enrichedBookings, riskFilter]);

    const calculatedTotals = useMemo(() => {
        const confirmed = filteredBookings.filter(
            (entry) => entry.booking.status === BookingStatusNames.CONFIRMED,
        );

        return {
            volume: confirmed.reduce(
                (sum, entry) => sum + entry.booking.totalPrice,
                0,
            ),
            commissions: confirmed.reduce(
                (sum, entry) => sum + entry.commission,
                0,
            ),
            partnerNet: confirmed.reduce(
                (sum, entry) => sum + entry.partnerNet,
                0,
            ),
            onlineCollected: confirmed.reduce(
                (sum, entry) => sum + entry.booking.amountPaidOnline,
                0,
            ),
        };
    }, [filteredBookings]);

    const calculatedPartnerSummaries = useMemo(() => {
        const summaryMap = new Map<
            string,
            {
                partnerId: string;
                companyName: string;
                rate: number;
                stripeId: string;
                billingLabel: string;
                taxLabel: string;
                volume: number;
                commission: number;
                partnerNet: number;
                bookingsCount: number;
            }
        >();

        enrichedBookings
            .filter(
                (entry) =>
                    entry.booking.status === BookingStatusNames.CONFIRMED,
            )
            .forEach((entry) => {
                const existing = summaryMap.get(entry.booking.partnerId);

                if (existing) {
                    existing.volume += entry.booking.totalPrice;
                    existing.commission += entry.commission;
                    existing.partnerNet += entry.partnerNet;
                    existing.bookingsCount += 1;

                    return;
                }

                summaryMap.set(entry.booking.partnerId, {
                    partnerId: entry.booking.partnerId,
                    companyName:
                        entry.partner?.role === "PARTNER"
                            ? entry.partner.companyName
                            : entry.booking.partnerId,
                    rate: entry.rate,
                    stripeId:
                        entry.partner?.role === "PARTNER"
                            ? (entry.partner.stripeConnectedAccountId ?? "—")
                            : "—",
                    billingLabel:
                        entry.partner?.role === "PARTNER"
                            ? (entry.partner.legalCompanyName ??
                              entry.partner.companyName)
                            : entry.booking.partnerId,
                    taxLabel:
                        entry.partner?.role === "PARTNER"
                            ? [
                                  entry.partner.taxCountry,
                                  entry.partner.vatNumber,
                              ]
                                  .filter(Boolean)
                                  .join(" · ") || "—"
                            : "—",
                    volume: entry.booking.totalPrice,
                    commission: entry.commission,
                    partnerNet: entry.partnerNet,
                    bookingsCount: 1,
                });
            });

        return Array.from(summaryMap.values());
    }, [enrichedBookings]);

    const globalTotals = financeSummaryQuery.data
        ? {
              volume: financeSummaryQuery.data.totals.gross_volume,
              commissions: financeSummaryQuery.data.totals.commission_total,
              partnerNet: financeSummaryQuery.data.totals.partner_net_total,
              onlineCollected:
                  financeSummaryQuery.data.totals.online_collected_total,
          }
        : calculatedTotals;

    const partnerSummaries = financeSummaryQuery.data
        ? financeSummaryQuery.data.partners.map((summary) => {
              const partner = allPartners.find(
                  (entry) => entry.id === summary.partner_id,
              );

              return {
                  partnerId: summary.partner_id,
                  companyName: summary.partner_name,
                  rate:
                      partner?.role === "PARTNER" ? partner.commissionRate : 0,
                  stripeId: summary.stripe_connected_account_id ?? "—",
                  billingLabel:
                      summary.legal_company_name ?? summary.partner_name,
                  taxLabel:
                      [summary.tax_country, summary.vat_number]
                          .filter(Boolean)
                          .join(" · ") || "—",
                  volume: summary.gross_volume,
                  commission: summary.commission_total,
                  partnerNet: summary.partner_net_total,
                  bookingsCount: summary.bookings_count,
              };
          })
        : calculatedPartnerSummaries;

    const exportFinanceCsv = async (): Promise<void> => {
        try {
            const blob = await bookingsApi.adminFinanceExport(financeParams);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "wandireo-finance-export.csv";
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            error(t("admin.transactions.export_error"));
        }
    };

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="wdr-admin-tx">
            <section className="wdr-admin-tx__hero">
                <div className="wdr-admin-tx__hero-content">
                    <p className="wdr-admin-tx__hero-badge">
                        {t("admin.transactions.badge")}
                    </p>
                    <h1 className="wdr-admin-tx__hero-title">
                        {t("admin.transactions.title")}
                    </h1>
                    <p className="wdr-admin-tx__hero-subtitle">
                        {t("admin.transactions.subtitle")}
                    </p>
                </div>
            </section>

            <AdminSectionNav active="transactions" />

            <div className="wdr-admin-tx__body">
                <div className="wdr-admin-tx__formula-banner" role="note">
                    <strong>{t("admin.transactions.formula_label")}</strong>{" "}
                    {t("admin.transactions.formula")}
                </div>

                <div className="wdr-admin-tx__actions">
                    <span className="wdr-admin-tx__official-note">
                        {t("admin.transactions.official_totals")}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void exportFinanceCsv()}
                    >
                        <Download size={16} />
                        {t("admin.transactions.export_csv")}
                    </Button>
                </div>

                <section
                    className="wdr-admin-tx__totals"
                    aria-label={t("admin.transactions.totals_aria")}
                >
                    <div className="wdr-admin-tx__total-card">
                        <span className="wdr-admin-tx__total-label">
                            {t("admin.transactions.total.volume")}
                        </span>
                        <span className="wdr-admin-tx__total-value">
                            {formatPrice(globalTotals.volume, "EUR")}
                        </span>
                    </div>
                    <div className="wdr-admin-tx__total-card wdr-admin-tx__total-card--commission">
                        <span className="wdr-admin-tx__total-label">
                            {t("admin.transactions.total.commissions")}
                        </span>
                        <span className="wdr-admin-tx__total-value">
                            {formatPrice(globalTotals.commissions, "EUR")}
                        </span>
                    </div>
                    <div className="wdr-admin-tx__total-card">
                        <span className="wdr-admin-tx__total-label">
                            {t("admin.transactions.total.partner_net")}
                        </span>
                        <span className="wdr-admin-tx__total-value">
                            {formatPrice(globalTotals.partnerNet, "EUR")}
                        </span>
                    </div>
                    <div className="wdr-admin-tx__total-card">
                        <span className="wdr-admin-tx__total-label">
                            {t("admin.transactions.total.online_collected")}
                        </span>
                        <span className="wdr-admin-tx__total-value">
                            {formatPrice(globalTotals.onlineCollected, "EUR")}
                        </span>
                    </div>
                </section>

                <section className="wdr-admin-tx__risk-panel">
                    <div className="wdr-admin-tx__risk-header">
                        <div>
                            <h2 className="wdr-admin-tx__section-title">
                                {t("admin.transactions.risk.title")}
                            </h2>
                            <p className="wdr-admin-tx__risk-copy">
                                {t("admin.transactions.risk.subtitle")}
                            </p>
                        </div>
                        <span
                            className={[
                                "wdr-admin-tx__risk-total",
                                riskSummary.supportAttention > 0
                                    ? "wdr-admin-tx__risk-total--attention"
                                    : "wdr-admin-tx__risk-total--clear",
                            ].join(" ")}
                        >
                            {t("admin.transactions.risk.total").replace(
                                "{count}",
                                String(riskSummary.supportAttention),
                            )}
                        </span>
                    </div>
                    <div className="wdr-admin-tx__risk-grid">
                        <button
                            className={`wdr-admin-tx__risk-card${riskFilter === "attention" ? " wdr-admin-tx__risk-card--active" : ""}`}
                            onClick={() =>
                                setRiskFilter(
                                    riskFilter === "attention"
                                        ? "all"
                                        : "attention",
                                )
                            }
                        >
                            <span>
                                {t("admin.transactions.risk.attention")}
                            </span>
                            <strong>{riskSummary.supportAttention}</strong>
                            <small>
                                {t("admin.transactions.risk.attention_sub")}
                            </small>
                        </button>
                        <button
                            className={`wdr-admin-tx__risk-card${riskFilter === "external" ? " wdr-admin-tx__risk-card--active" : ""}`}
                            onClick={() =>
                                setRiskFilter(
                                    riskFilter === "external"
                                        ? "all"
                                        : "external",
                                )
                            }
                        >
                            <span>{t("admin.transactions.risk.external")}</span>
                            <strong>{riskSummary.externalErrors}</strong>
                            <small>
                                {t("admin.transactions.risk.external_sub")}
                            </small>
                        </button>
                        <button
                            className={`wdr-admin-tx__risk-card${riskFilter === "payout" ? " wdr-admin-tx__risk-card--active" : ""}`}
                            onClick={() =>
                                setRiskFilter(
                                    riskFilter === "payout" ? "all" : "payout",
                                )
                            }
                        >
                            <span>{t("admin.transactions.risk.payout")}</span>
                            <strong>{riskSummary.payoutAttention}</strong>
                            <small>
                                {t(
                                    "admin.transactions.risk.payout_sub",
                                ).replace(
                                    "{pending}",
                                    String(riskSummary.payoutPending),
                                )}
                            </small>
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="wdr-admin-tx__section-title">
                        {t("admin.transactions.partners.title")}
                    </h2>
                    <div className="wdr-admin-tx__table-wrapper">
                        <table
                            className="wdr-admin-tx__table"
                            aria-label={t("admin.transactions.partners.aria")}
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        {t("admin.transactions.col.provider")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.billing")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.rate")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.stripe_id")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.volume")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.commission")}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.partner_net",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.bookings")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {partnerSummaries.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="wdr-admin-tx__table-empty"
                                        >
                                            {t(
                                                "admin.transactions.no_confirmed",
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    partnerSummaries.map((summary) => (
                                        <tr key={summary.partnerId}>
                                            <td
                                                className="wdr-admin-tx__partner-name"
                                                data-label={t(
                                                    "admin.transactions.col.provider",
                                                )}
                                            >
                                                {summary.companyName}
                                            </td>
                                            <td
                                                className="wdr-admin-tx__billing-cell"
                                                data-label={t(
                                                    "admin.transactions.col.billing",
                                                )}
                                            >
                                                <span>
                                                    {summary.billingLabel}
                                                </span>
                                                <small>
                                                    {summary.taxLabel}
                                                </small>
                                            </td>
                                            <td
                                                data-label={t(
                                                    "admin.transactions.col.rate",
                                                )}
                                            >
                                                <span className="wdr-admin-tx__rate-badge">
                                                    {Math.round(
                                                        summary.rate * 100,
                                                    )}{" "}
                                                    %
                                                </span>
                                            </td>
                                            <td
                                                data-label={t(
                                                    "admin.transactions.col.stripe_id",
                                                )}
                                            >
                                                <code className="wdr-admin-tx__stripe-id">
                                                    {summary.stripeId || "—"}
                                                </code>
                                            </td>
                                            <td
                                                className="wdr-admin-tx__amount"
                                                data-label={t(
                                                    "admin.transactions.col.volume",
                                                )}
                                            >
                                                {formatPrice(
                                                    summary.volume,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td
                                                className="wdr-admin-tx__commission"
                                                data-label={t(
                                                    "admin.transactions.col.commission",
                                                )}
                                            >
                                                {formatPrice(
                                                    summary.commission,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td
                                                className="wdr-admin-tx__net"
                                                data-label={t(
                                                    "admin.transactions.col.partner_net",
                                                )}
                                            >
                                                {formatPrice(
                                                    summary.partnerNet,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td
                                                data-label={t(
                                                    "admin.transactions.col.bookings",
                                                )}
                                            >
                                                {summary.bookingsCount}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div
                    className="wdr-admin-tx__filters"
                    role="group"
                    aria-label={t("admin.transactions.filters_aria")}
                >
                    <select
                        className="wdr-admin-tx__filter-select"
                        value={filterPartner}
                        onChange={(e) => setFilterPartner(e.target.value)}
                        aria-label={t("admin.transactions.filter.partner")}
                    >
                        <option value="all">
                            {t("admin.transactions.filter.partner_all")}
                        </option>
                        {allPartners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                                {partner.role === "PARTNER"
                                    ? partner.companyName
                                    : partner.email}
                            </option>
                        ))}
                    </select>

                    <select
                        className="wdr-admin-tx__filter-select"
                        value={filterBookingStatus}
                        onChange={(e) =>
                            setFilterBookingStatus(
                                e.target.value as BookingStatus | "all",
                            )
                        }
                        aria-label={t(
                            "admin.transactions.filter.booking_status",
                        )}
                    >
                        <option value="all">
                            {t("admin.transactions.filter.status_all")}
                        </option>
                        <option value={BookingStatusNames.AWAITING_PAYMENT}>
                            {t("history.status.awaiting_payment")}
                        </option>
                        <option value={BookingStatusNames.PENDING}>
                            {t("admin.transactions.booking.pending")}
                        </option>
                        <option value={BookingStatusNames.CONFIRMED}>
                            {t("admin.transactions.booking.confirmed")}
                        </option>
                        <option value={BookingStatusNames.CANCELLED}>
                            {t("admin.transactions.booking.cancelled")}
                        </option>
                    </select>

                    <select
                        className="wdr-admin-tx__filter-select"
                        value={filterPaymentStatus}
                        onChange={(e) =>
                            setFilterPaymentStatus(
                                e.target.value as PaymentStatus | "all",
                            )
                        }
                        aria-label={t(
                            "admin.transactions.filter.payment_status",
                        )}
                    >
                        <option value="all">
                            {t("admin.transactions.filter.status_all")}
                        </option>
                        <option value={PaymentStatusNames.PAID}>
                            {t("admin.transactions.payment.paid")}
                        </option>
                        <option value={PaymentStatusNames.PENDING}>
                            {t("admin.transactions.payment.pending")}
                        </option>
                        <option value={PaymentStatusNames.REFUNDED}>
                            {t("admin.transactions.payment.refunded")}
                        </option>
                    </select>

                    <select
                        className="wdr-admin-tx__filter-select"
                        value={filterPayoutStatus}
                        onChange={(e) =>
                            setFilterPayoutStatus(
                                e.target.value as PayoutStatus | "all",
                            )
                        }
                        aria-label={t(
                            "admin.transactions.filter.payout_status",
                        )}
                    >
                        <option value="all">
                            {t("admin.transactions.filter.payout_all")}
                        </option>
                        <option value={PayoutStatusNames.PENDING}>
                            {t("admin.transactions.payout.pending")}
                        </option>
                        <option value={PayoutStatusNames.ON_HOLD}>
                            {t("admin.transactions.payout.on_hold")}
                        </option>
                        <option value={PayoutStatusNames.SCHEDULED}>
                            {t("admin.transactions.payout.scheduled")}
                        </option>
                        <option value={PayoutStatusNames.PAID}>
                            {t("admin.transactions.payout.paid")}
                        </option>
                        <option value={PayoutStatusNames.FAILED}>
                            {t("admin.transactions.payout.failed")}
                        </option>
                    </select>

                    <select
                        className="wdr-admin-tx__filter-select"
                        value={filterExternalStatus}
                        onChange={(e) =>
                            setFilterExternalStatus(
                                e.target.value as
                                    | "all"
                                    | "CONFIRMED"
                                    | "FAILED"
                                    | "PENDING"
                                    | "NONE",
                            )
                        }
                        aria-label={t(
                            "admin.transactions.filter.provider_status",
                        )}
                    >
                        <option value="all">
                            {t("admin.transactions.filter.provider_all")}
                        </option>
                        <option value="CONFIRMED">
                            {t("admin.transactions.external.confirmed")}
                        </option>
                        <option value="FAILED">
                            {t("admin.transactions.external.failed")}
                        </option>
                        <option value="PENDING">
                            {t("admin.transactions.external.pending")}
                        </option>
                        <option value="NONE">
                            {t("admin.transactions.external.none")}
                        </option>
                    </select>

                    <input
                        type="search"
                        className="wdr-admin-tx__filter-select wdr-admin-tx__filter-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label={t("admin.transactions.filter.search")}
                        placeholder={t(
                            "admin.transactions.filter.search_placeholder",
                        )}
                        inputMode="search"
                        lang={locale}
                    />

                    <span className="wdr-admin-tx__filter-count">
                        {t("admin.transactions.count").replace(
                            "{count}",
                            String(filteredBookings.length),
                        )}
                    </span>
                </div>

                <section>
                    <h2 className="wdr-admin-tx__section-title">
                        {t("admin.transactions.details.title")}
                    </h2>
                    <div className="wdr-admin-tx__table-wrapper">
                        <table
                            className="wdr-admin-tx__table"
                            aria-label={t("admin.transactions.details.aria")}
                        >
                            <thead>
                                <tr>
                                    <th scope="col">
                                        {t("admin.transactions.col.id")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.date")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.client")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.service")}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.partner")}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.payment_mode",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.client_total",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.commission")}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.partner_net",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.stripe_line",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.booking_status",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.payment_status",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t(
                                            "admin.transactions.col.payout_status",
                                        )}
                                    </th>
                                    <th scope="col">
                                        {t("admin.transactions.col.actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={14}
                                            className="wdr-admin-tx__table-empty"
                                        >
                                            {t("admin.transactions.no_match")}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map(
                                        ({
                                            booking,
                                            client,
                                            service,
                                            partner,
                                            commission,
                                            partnerNet,
                                        }) => {
                                            const hasExternalIssue =
                                                booking.externalBookingStatus ===
                                                    "FAILED" ||
                                                Boolean(
                                                    booking.externalErrorMessage,
                                                );
                                            const hasPayoutIssue =
                                                booking.status ===
                                                    BookingStatusNames.CONFIRMED &&
                                                isPayoutAttentionStatus(
                                                    booking.payoutStatus,
                                                );

                                            return (
                                                <tr
                                                    key={booking.id}
                                                    className={
                                                        hasExternalIssue ||
                                                        hasPayoutIssue
                                                            ? "wdr-admin-tx__row--attention"
                                                            : undefined
                                                    }
                                                >
                                                    <td
                                                        className="wdr-admin-tx__table-id"
                                                        data-label={t(
                                                            "admin.transactions.col.id",
                                                        )}
                                                    >
                                                        {booking.id}
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__table-date"
                                                        data-label={t(
                                                            "admin.transactions.col.date",
                                                        )}
                                                    >
                                                        {booking.createdAt.toLocaleDateString(
                                                            intlLocale,
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "2-digit",
                                                            },
                                                        )}
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.client",
                                                        )}
                                                    >
                                                        {client
                                                            ? `${client.firstName} ${client.lastName}`
                                                            : booking.clientId}
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__table-service"
                                                        data-label={t(
                                                            "admin.transactions.col.service",
                                                        )}
                                                    >
                                                        <div>
                                                            {service?.title ??
                                                                booking.serviceId}
                                                        </div>
                                                        {formatExtrasSummary(
                                                            booking,
                                                        ) && (
                                                            <div className="wdr-admin-tx__table-extras">
                                                                {t(
                                                                    "admin.transactions.extras",
                                                                ).replace(
                                                                    "{summary}",
                                                                    formatExtrasSummary(
                                                                        booking,
                                                                    ) ?? "",
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.partner",
                                                        )}
                                                    >
                                                        {partner?.role ===
                                                        "PARTNER"
                                                            ? partner.companyName
                                                            : booking.partnerId}
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__table-mode"
                                                        data-label={t(
                                                            "admin.transactions.col.payment_mode",
                                                        )}
                                                    >
                                                        {
                                                            PaymentModeLabels[
                                                                booking
                                                                    .paymentMode
                                                            ]
                                                        }
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__amount"
                                                        data-label={t(
                                                            "admin.transactions.col.client_total",
                                                        )}
                                                    >
                                                        {formatPrice(
                                                            booking.totalPrice,
                                                            booking.currency,
                                                        )}
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__commission"
                                                        data-label={t(
                                                            "admin.transactions.col.commission",
                                                        )}
                                                    >
                                                        {booking.status ===
                                                        BookingStatusNames.CONFIRMED
                                                            ? formatPrice(
                                                                  commission,
                                                                  booking.currency,
                                                              )
                                                            : "—"}
                                                    </td>
                                                    <td
                                                        className="wdr-admin-tx__net"
                                                        data-label={t(
                                                            "admin.transactions.col.partner_net",
                                                        )}
                                                    >
                                                        {booking.status ===
                                                        BookingStatusNames.CONFIRMED
                                                            ? formatPrice(
                                                                  partnerNet,
                                                                  booking.currency,
                                                              )
                                                            : "—"}
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.stripe_line",
                                                        )}
                                                    >
                                                        <code className="wdr-admin-tx__stripe-intent">
                                                            {booking.stripePaymentIntentId ??
                                                                "—"}
                                                        </code>
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.booking_status",
                                                        )}
                                                    >
                                                        <div>
                                                            <span
                                                                className={`wdr-admin-tx__status wdr-admin-tx__status--${getBookingStatusClass(booking.status)}`}
                                                            >
                                                                {getBookingStatusLabel(
                                                                    booking.status,
                                                                    t,
                                                                )}
                                                            </span>
                                                            {booking.externalBookingStatus ? (
                                                                <div className="wdr-admin-tx__table-extras">
                                                                    {t(
                                                                        "admin.transactions.external.label",
                                                                    )}
                                                                    :{" "}
                                                                    {getExternalStatusLabel(
                                                                        booking.externalBookingStatus,
                                                                        t,
                                                                    )}
                                                                    {booking.externalBookingReference
                                                                        ? ` · ${booking.externalBookingReference}`
                                                                        : ""}
                                                                </div>
                                                            ) : null}
                                                            {booking.externalErrorMessage ? (
                                                                <div className="wdr-admin-tx__table-extras">
                                                                    {
                                                                        booking.externalErrorMessage
                                                                    }
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.payment_status",
                                                        )}
                                                    >
                                                        <span
                                                            className={`wdr-admin-tx__status wdr-admin-tx__status--payment-${getPaymentStatusClass(booking.paymentStatus)}`}
                                                        >
                                                            {getPaymentStatusLabel(
                                                                booking.paymentStatus,
                                                                t,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.payout_status",
                                                        )}
                                                    >
                                                        <span
                                                            className={`wdr-admin-tx__status wdr-admin-tx__status--payout-${getPayoutStatusClass(booking.payoutStatus)}`}
                                                        >
                                                            {getPayoutStatusLabel(
                                                                booking.payoutStatus,
                                                                t,
                                                            )}
                                                        </span>
                                                        {booking.payoutNotes ? (
                                                            <div className="wdr-admin-tx__table-extras">
                                                                {
                                                                    booking.payoutNotes
                                                                }
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td
                                                        data-label={t(
                                                            "admin.transactions.col.actions",
                                                        )}
                                                    >
                                                        {booking.status ===
                                                            BookingStatusNames.CONFIRMED &&
                                                        booking.paymentStatus !==
                                                            PaymentStatusNames.REFUNDED ? (
                                                            <div className="wdr-admin-tx__row-actions">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={
                                                                        payoutMutation.isPending ||
                                                                        booking.payoutStatus ===
                                                                            PayoutStatusNames.ON_HOLD
                                                                    }
                                                                    onClick={() =>
                                                                        payoutMutation.mutate(
                                                                            {
                                                                                bookingId:
                                                                                    booking.id,
                                                                                payoutStatus:
                                                                                    PayoutStatusNames.ON_HOLD,
                                                                                payoutNotes:
                                                                                    t(
                                                                                        "admin.transactions.payout.default_hold_note",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        "admin.transactions.payout.mark_hold",
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    disabled={
                                                                        payoutMutation.isPending ||
                                                                        booking.payoutStatus ===
                                                                            PayoutStatusNames.PAID
                                                                    }
                                                                    onClick={() =>
                                                                        payoutMutation.mutate(
                                                                            {
                                                                                bookingId:
                                                                                    booking.id,
                                                                                payoutStatus:
                                                                                    PayoutStatusNames.PAID,
                                                                                payoutNotes:
                                                                                    t(
                                                                                        "admin.transactions.payout.default_paid_note",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    {t(
                                                                        "admin.transactions.payout.mark_paid",
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};
