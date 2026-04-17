import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { bookingsApi } from "@/api/bookings";
import { Button, useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { usePartnerBookingsData } from "@/hooks/useBookingsData";
import { usePartnerApprovalGuard } from "@/hooks/usePartnerApprovalGuard";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice } from "@/lib/formatters";
import { BookingStatusNames } from "@/types/booking";
import type { BookingStatus } from "@/types/booking";
import "./PartnerBookingsPage.css";

const CheckIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UsersIcon: React.FC = () => (
    <svg
        width="15"
        height="15"
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

const ArrowLeftIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

function formatDate(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatBookingExtrasSummary(booking: {
    selectedExtras?: Array<{ name: string; quantity: number }>;
    extrasTotal?: number;
    currency: string;
}): string | null {
    if (!booking.selectedExtras || booking.selectedExtras.length === 0) {
        return null;
    }

    const extrasLabel = booking.selectedExtras
        .map((extra) =>
            extra.quantity > 1
                ? `${extra.name} x${extra.quantity}`
                : extra.name,
        )
        .join(", ");

    return `${extrasLabel} · ${formatPrice(booking.extrasTotal ?? 0, booking.currency)}`;
}

function statusLabel(
    status: BookingStatus,
    t: (key: string) => string,
): string {
    switch (status) {
        case BookingStatusNames.CONFIRMED:
            return t("partner.bookings.status.confirmed");
        case BookingStatusNames.PENDING:
            return t("partner.bookings.status.pending");
        case BookingStatusNames.CANCELLED:
            return t("partner.bookings.status.cancelled");
    }
}

interface ModalRefusProps {
    bookingId: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

const ModalRefus: React.FC<ModalRefusProps> = ({
    bookingId,
    onConfirm,
    onCancel,
    isSubmitting,
}) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!reason.trim()) {
            setError(t("partner.bookings.reject_modal.error"));

            return;
        }

        onConfirm(reason.trim());
    };

    return (
        <div
            className="wdr-partner-bk__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-refus-title"
            onClick={(event) => {
                if (event.target === event.currentTarget && !isSubmitting) {
                    onCancel();
                }
            }}
        >
            <div className="wdr-partner-bk__modal">
                <h2
                    id="modal-refus-title"
                    className="wdr-partner-bk__modal-title"
                >
                    {t("partner.bookings.reject_modal.title").replace(
                        "{id}",
                        bookingId,
                    )}
                </h2>
                <p className="wdr-partner-bk__modal-desc">
                    {t("partner.bookings.reject_modal.description")}
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className={`wdr-partner-bk__modal-textarea${error ? "wdr-partner-bk__modal-textarea--error" : ""}`}
                        value={reason}
                        onChange={(event) => {
                            setReason(event.target.value);
                            setError("");
                        }}
                        placeholder={t(
                            "partner.bookings.reject_modal.placeholder",
                        )}
                        rows={4}
                        maxLength={500}
                        autoFocus
                        disabled={isSubmitting}
                    />
                    {error && (
                        <p className="wdr-partner-bk__modal-error">{error}</p>
                    )}

                    <div className="wdr-partner-bk__modal-actions">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            {t("partner.bookings.reject_modal.cancel")}
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            leftIcon={<XIcon />}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? t("partner.bookings.reject_modal.submitting")
                                : t("partner.bookings.reject_modal.submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type FilterTab = "all" | BookingStatus;

export const PartnerBookingsPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t, intlLocale } = useTranslation();
    const { isBlocked } = usePartnerApprovalGuard();
    const queryClient = useQueryClient();
    const { bookings: apiBookings } = usePartnerBookingsData(
        currentUser?.id ?? "",
    );
    const { services } = useServicesData();

    const [activeTab, setActiveTab] = useState<FilterTab>("all");
    const [refusingId, setRefusingId] = useState<string | null>(null);
    const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });

            return;
        }

        if (currentUser.role !== "PARTNER") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const bookings = useMemo(
        () =>
            [...apiBookings].sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            ),
        [apiBookings],
    );

    const servicesById: Record<string, string> = useMemo(
        () =>
            Object.fromEntries(
                services.map((service) => [service.id, service.title]),
            ),
        [services],
    );

    const pendingCount = useMemo(
        () =>
            bookings.filter(
                (booking) => booking.status === BookingStatusNames.PENDING,
            ).length,
        [bookings],
    );

    const filteredBookings = useMemo(
        () =>
            activeTab === "all"
                ? bookings
                : bookings.filter((booking) => booking.status === activeTab),
        [activeTab, bookings],
    );

    const filterTabs: Array<{ key: FilterTab; label: string }> = [
        { key: "all", label: t("partner.bookings.tab.all") },
        {
            key: BookingStatusNames.PENDING,
            label: t("partner.bookings.tab.pending"),
        },
        {
            key: BookingStatusNames.CONFIRMED,
            label: t("partner.bookings.tab.confirmed"),
        },
        {
            key: BookingStatusNames.CANCELLED,
            label: t("partner.bookings.tab.cancelled"),
        },
    ];

    const refreshBookings = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ["bookings", "partner", currentUser?.id ?? ""],
        });
    }, [currentUser?.id, queryClient]);

    const handleAccept = useCallback(
        async (id: string) => {
            setIsUpdatingId(id);

            try {
                await bookingsApi.updateStatus(
                    id,
                    BookingStatusNames.CONFIRMED,
                );
                await refreshBookings();
                success(t("partner.bookings.toast.confirm_success"));
            } catch {
                error(t("partner.bookings.toast.confirm_error"));
            } finally {
                setIsUpdatingId(null);
            }
        },
        [error, refreshBookings, success, t],
    );

    const handleRefuseConfirm = useCallback(
        async (reason: string) => {
            if (!refusingId) {
                return;
            }

            setIsUpdatingId(refusingId);

            try {
                await bookingsApi.updateStatus(
                    refusingId,
                    BookingStatusNames.CANCELLED,
                    reason,
                );
                await refreshBookings();
                setRefusingId(null);
                success(t("partner.bookings.toast.reject_success"));
            } catch {
                error(t("partner.bookings.toast.reject_error"));
            } finally {
                setIsUpdatingId(null);
            }
        },
        [error, refusingId, refreshBookings, success, t],
    );

    if (isBlocked || !currentUser || currentUser.role !== "PARTNER") {
        return null;
    }

    return (
        <div className="wdr-partner-bk">
            <div className="wdr-partner-bk__header">
                <div className="wdr-partner-bk__header-inner">
                    <div className="wdr-partner-bk__header-left">
                        <button
                            type="button"
                            className="wdr-partner-bk__back-btn"
                            onClick={() =>
                                navigate({ name: "partner-dashboard" })
                            }
                            aria-label={t("partner.bookings.back_dashboard")}
                        >
                            <ArrowLeftIcon />
                        </button>
                        <div>
                            <h1 className="wdr-partner-bk__title">
                                {t("partner.bookings.title")}
                            </h1>
                            <p className="wdr-partner-bk__subtitle">
                                {bookings.length}{" "}
                                {bookings.length === 1
                                    ? t("partner.bookings.count_one")
                                    : t("partner.bookings.count_other")}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="wdr-partner-bk__tabs"
                    role="tablist"
                    aria-label={t("partner.bookings.tabs_aria")}
                >
                    {filterTabs.map(({ key, label }) => {
                        const isPendingTab = key === BookingStatusNames.PENDING;

                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === key}
                                className={[
                                    "wdr-partner-bk__tab",
                                    activeTab === key
                                        ? "wdr-partner-bk__tab--active"
                                        : "",
                                ]
                                    .join(" ")
                                    .trim()}
                                onClick={() => setActiveTab(key)}
                            >
                                {label}
                                {isPendingTab && pendingCount > 0 && (
                                    <span
                                        className="wdr-partner-bk__tab-badge"
                                        aria-label={t(
                                            "partner.bookings.pending_badge",
                                        ).replace(
                                            "{count}",
                                            String(pendingCount),
                                        )}
                                    >
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="wdr-partner-bk__body">
                {filteredBookings.length === 0 ? (
                    <div className="wdr-partner-bk__empty">
                        <p>
                            {t("partner.bookings.empty_prefix")}{" "}
                            {activeTab !== "all"
                                ? t("partner.bookings.empty_status").replace(
                                      "{status}",
                                      statusLabel(
                                          activeTab as BookingStatus,
                                          t,
                                      ),
                                  )
                                : ""}{" "}
                            {t("partner.bookings.empty_suffix")}
                        </p>
                    </div>
                ) : (
                    <ul className="wdr-partner-bk__list" role="list">
                        {filteredBookings.map((booking) => {
                            const isPending =
                                booking.status === BookingStatusNames.PENDING;
                            const isConfirmed =
                                booking.status === BookingStatusNames.CONFIRMED;
                            const isCancelled =
                                booking.status === BookingStatusNames.CANCELLED;
                            const extrasSummary =
                                formatBookingExtrasSummary(booking);

                            return (
                                <li
                                    key={booking.id}
                                    className={[
                                        "wdr-partner-bk__card",
                                        isPending
                                            ? "wdr-partner-bk__card--pending"
                                            : "",
                                        isConfirmed
                                            ? "wdr-partner-bk__card--confirmed"
                                            : "",
                                        isCancelled
                                            ? "wdr-partner-bk__card--cancelled"
                                            : "",
                                    ]
                                        .join(" ")
                                        .trim()}
                                >
                                    <div className="wdr-partner-bk__card-header">
                                        <div className="wdr-partner-bk__card-id-block">
                                            <span className="wdr-partner-bk__card-id">
                                                {t(
                                                    "partner.bookings.booking_id",
                                                ).replace("{id}", booking.id)}
                                            </span>
                                            <span
                                                className={[
                                                    "wdr-partner-bk__badge",
                                                    `wdr-partner-bk__badge--${booking.status.toLowerCase()}`,
                                                ].join(" ")}
                                                aria-label={t(
                                                    "partner.bookings.status_aria",
                                                ).replace(
                                                    "{status}",
                                                    statusLabel(
                                                        booking.status,
                                                        t,
                                                    ),
                                                )}
                                            >
                                                {statusLabel(booking.status, t)}
                                            </span>
                                        </div>
                                        <span className="wdr-partner-bk__card-received">
                                            {t(
                                                "partner.bookings.received_on",
                                            ).replace(
                                                "{date}",
                                                formatDate(
                                                    booking.createdAt,
                                                    intlLocale,
                                                ),
                                            )}
                                        </span>
                                    </div>

                                    <h2 className="wdr-partner-bk__card-service">
                                        {servicesById[booking.serviceId] ??
                                            booking.serviceId}
                                    </h2>

                                    <div className="wdr-partner-bk__card-details">
                                        <span className="wdr-partner-bk__detail">
                                            <CalendarIcon />
                                            {formatDate(
                                                booking.startDate,
                                                intlLocale,
                                            )}
                                        </span>
                                        <span className="wdr-partner-bk__detail">
                                            <UsersIcon />
                                            {booking.participants}{" "}
                                            {booking.participants === 1
                                                ? t(
                                                      "partner.bookings.participants_one",
                                                  )
                                                : t(
                                                      "partner.bookings.participants_other",
                                                  )}
                                        </span>
                                        <span className="wdr-partner-bk__detail wdr-partner-bk__detail--price">
                                            {formatPrice(
                                                booking.totalPrice,
                                                booking.currency,
                                            )}
                                        </span>
                                    </div>

                                    {extrasSummary && (
                                        <p className="wdr-partner-bk__card-extras">
                                            {t(
                                                "partner.bookings.extras",
                                            ).replace(
                                                "{summary}",
                                                extrasSummary,
                                            )}
                                        </p>
                                    )}

                                    {booking.notes && (
                                        <blockquote className="wdr-partner-bk__card-notes">
                                            {booking.notes}
                                        </blockquote>
                                    )}

                                    {isCancelled &&
                                        booking.cancellationReason && (
                                            <p className="wdr-partner-bk__card-cancel-reason">
                                                {t(
                                                    "partner.bookings.reason",
                                                ).replace(
                                                    "{reason}",
                                                    booking.cancellationReason,
                                                )}
                                            </p>
                                        )}

                                    {isPending && (
                                        <div className="wdr-partner-bk__card-actions">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                leftIcon={<CheckIcon />}
                                                onClick={() =>
                                                    void handleAccept(
                                                        booking.id,
                                                    )
                                                }
                                                disabled={
                                                    isUpdatingId === booking.id
                                                }
                                            >
                                                {t("partner.bookings.accept")}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                leftIcon={<XIcon />}
                                                onClick={() =>
                                                    setRefusingId(booking.id)
                                                }
                                                disabled={
                                                    isUpdatingId === booking.id
                                                }
                                            >
                                                {t("partner.bookings.reject")}
                                            </Button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {refusingId !== null && (
                <ModalRefus
                    bookingId={refusingId}
                    onConfirm={(reason) => {
                        void handleRefuseConfirm(reason);
                    }}
                    onCancel={() => setRefusingId(null)}
                    isSubmitting={isUpdatingId === refusingId}
                />
            )}
        </div>
    );
};
