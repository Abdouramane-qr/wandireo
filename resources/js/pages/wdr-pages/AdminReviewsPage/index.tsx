import React, { useEffect, useMemo, useState } from "react";
import { AdminSectionNav, Button, useToast } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import {
    useAdminDeleteReviewData,
    useAdminReviewModerationData,
    useAdminReviewsData,
} from "@/hooks/useReviewsData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import "./AdminReviewsPage.css";

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED";

export const AdminReviewsPage: React.FC = () => {
    const { currentUser } = useUser();
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t, intlLocale } = useTranslation();
    const [status, setStatus] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const { reviews } = useAdminReviewsData({
        status: status === "all" ? undefined : status,
        q: search.trim() || undefined,
    });
    const moderateReview = useAdminReviewModerationData();
    const deleteReview = useAdminDeleteReviewData();

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: "home" });
            return;
        }

        if (currentUser.role !== "ADMIN") {
            navigate({ name: "dashboard" });
        }
    }, [currentUser, navigate]);

    const counts = useMemo(
        () => ({
            pending: reviews.filter((review) => review.status === "PENDING")
                .length,
            approved: reviews.filter((review) => review.status === "APPROVED")
                .length,
            rejected: reviews.filter((review) => review.status === "REJECTED")
                .length,
        }),
        [reviews],
    );

    if (!currentUser || currentUser.role !== "ADMIN") {
        return null;
    }

    async function handleStatus(
        id: string,
        nextStatus: "PENDING" | "APPROVED" | "REJECTED",
    ) {
        try {
            await moderateReview.mutateAsync({ id, status: nextStatus });
            success(t("admin.reviews.update_success"));
        } catch {
            error(t("admin.reviews.update_error"));
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm(t("admin.reviews.delete_confirm"))) {
            return;
        }

        try {
            await deleteReview.mutateAsync(id);
            success(t("admin.reviews.delete_success"));
        } catch {
            error(t("admin.reviews.delete_error"));
        }
    }

    return (
        <div className="wdr-admin-reviews">
            <section className="wdr-admin-reviews__hero">
                <div>
                    <p className="wdr-admin-reviews__eyebrow">
                        {t("nav.admin")}
                    </p>
                    <h1>{t("admin.reviews.title")}</h1>
                    <p>{t("admin.reviews.subtitle")}</p>
                </div>
                <div className="wdr-admin-reviews__stats">
                    <span>
                        {t("admin.reviews.pending_count").replace(
                            "{count}",
                            String(counts.pending),
                        )}
                    </span>
                    <span>
                        {t("admin.reviews.approved_count").replace(
                            "{count}",
                            String(counts.approved),
                        )}
                    </span>
                    <span>
                        {t("admin.reviews.rejected_count").replace(
                            "{count}",
                            String(counts.rejected),
                        )}
                    </span>
                </div>
            </section>

            <AdminSectionNav active="reviews" />

            <div className="wdr-admin-reviews__body">
                <div className="wdr-admin-reviews__toolbar">
                    <input
                        className="wdr-admin-reviews__search"
                        type="search"
                        placeholder={t("admin.reviews.search")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select
                        className="wdr-admin-reviews__select"
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value as StatusFilter)
                        }
                    >
                        <option value="all">
                            {t("admin.reviews.all_statuses")}
                        </option>
                        <option value="PENDING">
                            {t("admin.reviews.pending")}
                        </option>
                        <option value="APPROVED">
                            {t("admin.reviews.approve")}
                        </option>
                        <option value="REJECTED">
                            {t("admin.reviews.reject")}
                        </option>
                    </select>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ name: "admin-dashboard" })}
                    >
                        {t("admin.reviews.back")}
                    </Button>
                </div>

                <div className="wdr-admin-reviews__list">
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="wdr-admin-reviews__card"
                        >
                            <div className="wdr-admin-reviews__card-head">
                                <div>
                                    <strong>
                                        {review.authorName ?? "Utilisateur"}
                                    </strong>
                                    <span>
                                        {review.serviceTitle ??
                                            review.serviceId}
                                    </span>
                                    <small>
                                        {review.partnerName ??
                                            t("admin.reviews.unknown_partner")}
                                    </small>
                                </div>
                                <span
                                    className={`wdr-admin-reviews__status wdr-admin-reviews__status--${String(review.status ?? "APPROVED").toLowerCase()}`}
                                >
                                    {review.status ?? "APPROVED"}
                                </span>
                            </div>
                            <p className="wdr-admin-reviews__comment">
                                {review.comment}
                            </p>
                            <div className="wdr-admin-reviews__meta">
                                <span>
                                    {t("admin.reviews.rating").replace(
                                        "{rating}",
                                        String(review.rating),
                                    )}
                                </span>
                                <span>
                                    {review.createdAt.toLocaleDateString(
                                        intlLocale,
                                    )}
                                </span>
                            </div>
                            <div className="wdr-admin-reviews__actions">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() =>
                                        void handleStatus(review.id, "APPROVED")
                                    }
                                >
                                    {t("admin.reviews.approve")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        void handleStatus(review.id, "REJECTED")
                                    }
                                >
                                    {t("admin.reviews.reject")}
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => void handleDelete(review.id)}
                                >
                                    {t("admin.reviews.delete")}
                                </Button>
                            </div>
                        </article>
                    ))}

                    {reviews.length === 0 && (
                        <div className="wdr-admin-reviews__empty">
                            {t("admin.reviews.empty")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default AdminReviewsPage;
