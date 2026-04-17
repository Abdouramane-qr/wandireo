import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { blogApi } from "@/api/blog";
import { Breadcrumb, Button, useToast } from "@/components/wdr";
import { useBlogPostsData } from "@/hooks/useBlogData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { BlogStatusNames } from "@/types/blog";
import type { BlogStatus } from "@/types/blog";
import "./AdminBlogPage.css";

function formatDate(date: Date | null, intlLocale: string): string {
    if (!date) {
        return "-";
    }

    return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export const AdminBlogPage: React.FC = () => {
    const { navigate } = useRouter();
    const { success, error } = useToast();
    const { t, intlLocale } = useTranslation();
    const queryClient = useQueryClient();
    const { posts } = useBlogPostsData({ status: undefined, limit: 100 });
    const [filter, setFilter] = useState<BlogStatus | "ALL">("ALL");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const filtered = useMemo(
        () =>
            filter === "ALL"
                ? posts
                : posts.filter((post) => post.status === filter),
        [filter, posts],
    );

    const publishedCount = posts.filter(
        (post) => post.status === BlogStatusNames.PUBLISHED,
    ).length;
    const draftCount = posts.filter(
        (post) => post.status === BlogStatusNames.DRAFT,
    ).length;

    async function refreshBlogQueries(): Promise<void> {
        await queryClient.invalidateQueries({ queryKey: ["blog"] });
    }

    async function toggleStatus(id: string): Promise<void> {
        const post = posts.find((entry) => entry.id === id);

        if (!post) {
            return;
        }

        const nextStatus: BlogStatus =
            post.status === BlogStatusNames.PUBLISHED
                ? BlogStatusNames.DRAFT
                : BlogStatusNames.PUBLISHED;

        setBusyId(id);

        try {
            await blogApi.update(id, { status: nextStatus });
            await refreshBlogQueries();
            success(
                nextStatus === BlogStatusNames.PUBLISHED
                    ? t("admin.blog.toast.publish")
                    : t("admin.blog.toast.unpublish"),
            );
        } catch {
            error(t("admin.blog.toast.status_error"));
        } finally {
            setBusyId(null);
        }
    }

    async function handleDelete(id: string): Promise<void> {
        setBusyId(id);

        try {
            await blogApi.delete(id);
            await refreshBlogQueries();
            setDeleteConfirmId(null);
            success(t("admin.blog.toast.delete_success"));
        } catch {
            error(t("admin.blog.toast.delete_error"));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="wdr-ablog">
            <div className="wdr-ablog__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t("admin.blog.home"),
                            onClick: () => navigate({ name: "home" }),
                        },
                        {
                            label: t("admin.blog.admin"),
                            onClick: () =>
                                navigate({ name: "admin-dashboard" }),
                        },
                        { label: t("nav.blog") },
                    ]}
                />
            </div>

            <div className="wdr-ablog__header">
                <div className="wdr-ablog__header-inner">
                    <div className="wdr-ablog__header-text">
                        <h1 className="wdr-ablog__title">
                            {t("admin.blog.title")}
                        </h1>
                        <p className="wdr-ablog__subtitle">
                            <strong>{publishedCount}</strong>{" "}
                            {t("admin.blog.published").toLowerCase()} &middot;{" "}
                            <strong>{draftCount}</strong>{" "}
                            {t("admin.blog.drafts").toLowerCase()}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate({ name: "admin-blog-editor" })}
                    >
                        + {t("admin.blog.new")}
                    </Button>
                </div>
            </div>

            <div className="wdr-ablog__filters">
                <div className="wdr-ablog__filters-inner">
                    {(
                        [
                            "ALL",
                            BlogStatusNames.PUBLISHED,
                            BlogStatusNames.DRAFT,
                        ] as const
                    ).map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`wdr-ablog__filter-btn ${filter === value ? "wdr-ablog__filter-btn--active" : ""}`}
                            onClick={() => setFilter(value)}
                        >
                            {value === "ALL"
                                ? `${t("admin.blog.all")} (${posts.length})`
                                : value === BlogStatusNames.PUBLISHED
                                  ? `${t("admin.blog.published")} (${publishedCount})`
                                  : `${t("admin.blog.drafts")} (${draftCount})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="wdr-ablog__body">
                <div className="wdr-ablog__inner">
                    {filtered.length === 0 ? (
                        <p className="wdr-ablog__empty">
                            {t("admin.blog.empty")}
                        </p>
                    ) : (
                        <div className="wdr-ablog__table-wrapper">
                            <table className="wdr-ablog__table">
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            {t("admin.blog.column.title")}
                                        </th>
                                        <th scope="col">
                                            {t("admin.blog.column.status")}
                                        </th>
                                        <th scope="col">
                                            {t("admin.blog.column.tags")}
                                        </th>
                                        <th scope="col">
                                            {t("admin.blog.column.date")}
                                        </th>
                                        <th scope="col">
                                            <span className="sr-only">
                                                {t("support.ticket_actions")}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="wdr-ablog__row"
                                        >
                                            <td className="wdr-ablog__cell wdr-ablog__cell--title">
                                                {post.coverImage && (
                                                    <img
                                                        src={post.coverImage}
                                                        alt=""
                                                        className="wdr-ablog__thumb"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="wdr-ablog__title-group">
                                                    <span className="wdr-ablog__post-title">
                                                        {post.title}
                                                    </span>
                                                    <span className="wdr-ablog__post-slug">
                                                        {post.slug ||
                                                            slugify(post.title)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="wdr-ablog__cell">
                                                <span
                                                    className={`wdr-ablog__badge wdr-ablog__badge--${post.status.toLowerCase()}`}
                                                >
                                                    {post.status ===
                                                    BlogStatusNames.PUBLISHED
                                                        ? t(
                                                              "admin.blog.status.published",
                                                          )
                                                        : t(
                                                              "admin.blog.status.draft",
                                                          )}
                                                </span>
                                            </td>

                                            <td className="wdr-ablog__cell wdr-ablog__cell--tags">
                                                {post.tags
                                                    .slice(0, 3)
                                                    .map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="wdr-ablog__tag"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                            </td>

                                            <td className="wdr-ablog__cell wdr-ablog__cell--date">
                                                {post.status ===
                                                BlogStatusNames.PUBLISHED ? (
                                                    formatDate(
                                                        post.publishedAt,
                                                        intlLocale,
                                                    )
                                                ) : (
                                                    <span className="wdr-ablog__draft-date">
                                                        {t(
                                                            "admin.blog.updated",
                                                        )}{" "}
                                                        {formatDate(
                                                            post.updatedAt,
                                                            intlLocale,
                                                        )}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="wdr-ablog__cell wdr-ablog__cell--actions">
                                                <div className="wdr-ablog__actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate({
                                                                name: "admin-blog-editor",
                                                                postId: post.id,
                                                            })
                                                        }
                                                        disabled={
                                                            busyId === post.id
                                                        }
                                                    >
                                                        {t("admin.blog.edit")}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            void toggleStatus(
                                                                post.id,
                                                            )
                                                        }
                                                        disabled={
                                                            busyId === post.id
                                                        }
                                                    >
                                                        {post.status ===
                                                        BlogStatusNames.PUBLISHED
                                                            ? t(
                                                                  "admin.blog.unpublish",
                                                              )
                                                            : t(
                                                                  "admin.blog.publish",
                                                              )}
                                                    </Button>
                                                    {deleteConfirmId ===
                                                    post.id ? (
                                                        <div className="wdr-ablog__delete-confirm">
                                                            <span>
                                                                {t(
                                                                    "admin.blog.confirm",
                                                                )}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="wdr-ablog__delete-yes"
                                                                onClick={() =>
                                                                    void handleDelete(
                                                                        post.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    busyId ===
                                                                    post.id
                                                                }
                                                            >
                                                                {t(
                                                                    "admin.blog.yes",
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="wdr-ablog__delete-no"
                                                                onClick={() =>
                                                                    setDeleteConfirmId(
                                                                        null,
                                                                    )
                                                                }
                                                                disabled={
                                                                    busyId ===
                                                                    post.id
                                                                }
                                                            >
                                                                {t(
                                                                    "admin.blog.no",
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="wdr-ablog__delete-btn"
                                                            onClick={() =>
                                                                setDeleteConfirmId(
                                                                    post.id,
                                                                )
                                                            }
                                                            aria-label={`${t("admin.blog.delete_aria")} "${post.title}"`}
                                                            disabled={
                                                                busyId ===
                                                                post.id
                                                            }
                                                        >
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                aria-hidden="true"
                                                            >
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14H6L5 6" />
                                                                <path d="M10 11v6M14 11v6" />
                                                                <path d="M9 6V4h6v2" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBlogPage;
export { slugify };
