import React, { useEffect, useMemo, useState } from "react";
import { AdminSectionNav } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useAdminBookingsData } from "@/hooks/useBookingsData";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdminUsersData } from "@/hooks/useUsersData";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames, PaymentStatusNames } from "@/types/booking";
import type { PaymentStatus } from "@/types/booking";
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

function getBookingStatusLabel(
    status: string,
    t: (key: string) => string,
): string {
    if (status === BookingStatusNames.CONFIRMED) {
        return t("admin.transactions.booking.confirmed");
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

    if (status === BookingStatusNames.PENDING) {
        return "pending";
    }

    return "cancelled";
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

export const AdminTransactionsPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { t, intlLocale } = useTranslation();
    const { bookings } = useAdminBookingsData();
    const { services } = useServicesData({ adminAll: true, limit: 200 });
    const { users } = useAdminUsersData();

    const allPartners = users.filter((user) => user.role === "PARTNER");
    const allClients = users.filter((user) => user.role === "CLIENT");

    const [filterPartner, setFilterPartner] = useState<string>("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<
        PaymentStatus | "all"
    >("all");

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

    const filteredBookings = useMemo(
        () =>
            enrichedBookings.filter((entry) => {
                if (
                    filterPartner !== "all" &&
                    entry.booking.partnerId !== filterPartner
                ) {
                    return false;
                }

                if (
                    filterPaymentStatus !== "all" &&
                    entry.booking.paymentStatus !== filterPaymentStatus
                ) {
                    return false;
                }

                return true;
            }),
        [enrichedBookings, filterPartner, filterPaymentStatus],
    );

    const globalTotals = useMemo(() => {
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

    const partnerSummaries = useMemo(() => {
        const summaryMap = new Map<
            string,
            {
                partnerId: string;
                companyName: string;
                rate: number;
                stripeId: string;
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
                    volume: entry.booking.totalPrice,
                    commission: entry.commission,
                    partnerNet: entry.partnerNet,
                    bookingsCount: 1,
                });
            });

        return Array.from(summaryMap.values());
    }, [enrichedBookings]);

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
                                            colSpan={7}
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
                                            <td className="wdr-admin-tx__partner-name">
                                                {summary.companyName}
                                            </td>
                                            <td>
                                                <span className="wdr-admin-tx__rate-badge">
                                                    {Math.round(
                                                        summary.rate * 100,
                                                    )}{" "}
                                                    %
                                                </span>
                                            </td>
                                            <td>
                                                <code className="wdr-admin-tx__stripe-id">
                                                    {summary.stripeId || "—"}
                                                </code>
                                            </td>
                                            <td className="wdr-admin-tx__amount">
                                                {formatPrice(
                                                    summary.volume,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td className="wdr-admin-tx__commission">
                                                {formatPrice(
                                                    summary.commission,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td className="wdr-admin-tx__net">
                                                {formatPrice(
                                                    summary.partnerNet,
                                                    "EUR",
                                                )}
                                            </td>
                                            <td>{summary.bookingsCount}</td>
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={12}
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
                                        }) => (
                                            <tr key={booking.id}>
                                                <td className="wdr-admin-tx__table-id">
                                                    {booking.id}
                                                </td>
                                                <td className="wdr-admin-tx__table-date">
                                                    {booking.createdAt.toLocaleDateString(
                                                        intlLocale,
                                                        {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "2-digit",
                                                        },
                                                    )}
                                                </td>
                                                <td>
                                                    {client
                                                        ? `${client.firstName} ${client.lastName}`
                                                        : booking.clientId}
                                                </td>
                                                <td className="wdr-admin-tx__table-service">
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
                                                <td>
                                                    {partner?.role === "PARTNER"
                                                        ? partner.companyName
                                                        : booking.partnerId}
                                                </td>
                                                <td className="wdr-admin-tx__table-mode">
                                                    {
                                                        PaymentModeLabels[
                                                            booking.paymentMode
                                                        ]
                                                    }
                                                </td>
                                                <td className="wdr-admin-tx__amount">
                                                    {formatPrice(
                                                        booking.totalPrice,
                                                        booking.currency,
                                                    )}
                                                </td>
                                                <td className="wdr-admin-tx__commission">
                                                    {booking.status ===
                                                    BookingStatusNames.CONFIRMED
                                                        ? formatPrice(
                                                              commission,
                                                              booking.currency,
                                                          )
                                                        : "—"}
                                                </td>
                                                <td className="wdr-admin-tx__net">
                                                    {booking.status ===
                                                    BookingStatusNames.CONFIRMED
                                                        ? formatPrice(
                                                              partnerNet,
                                                              booking.currency,
                                                          )
                                                        : "—"}
                                                </td>
                                                <td>
                                                    <code className="wdr-admin-tx__stripe-intent">
                                                        {booking.stripePaymentIntentId ??
                                                            "—"}
                                                    </code>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`wdr-admin-tx__status wdr-admin-tx__status--${getBookingStatusClass(booking.status)}`}
                                                    >
                                                        {getBookingStatusLabel(
                                                            booking.status,
                                                            t,
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`wdr-admin-tx__status wdr-admin-tx__status--payment-${getPaymentStatusClass(booking.paymentStatus)}`}
                                                    >
                                                        {getPaymentStatusLabel(
                                                            booking.paymentStatus,
                                                            t,
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ),
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
