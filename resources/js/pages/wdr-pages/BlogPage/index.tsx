/**
 * @file pages/BlogPage/index.tsx
 * @description Liste paginée des articles de blog publiés, filtrables par tag.
 */

import React, { useMemo, useState } from "react";
import { BlogCard, EmptyState, Pagination } from "@/components/wdr";
import { useBlogPostsData } from "@/hooks/useBlogData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { BlogStatusNames } from "@/types/blog";
import "./BlogPage.css";

const PAGE_SIZE = 6;

export const BlogPage: React.FC = () => {
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const [activeTag, setActiveTag] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { posts: published } = useBlogPostsData({
        status: BlogStatusNames.PUBLISHED,
    });

    const allTags = useMemo(() => {
        const set = new Set<string>();
        published.forEach((p) => p.tags.forEach((t: string) => set.add(t)));

        return Array.from(set).sort();
    }, [published]);

    const filtered = useMemo(
        () =>
            activeTag
                ? published.filter((p) => p.tags.includes(activeTag))
                : published,
        [published, activeTag],
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const handleTagClick = (tag: string) => {
        setActiveTag((prev) => (prev === tag ? "" : tag));
        setCurrentPage(1);
    };

    const handlePostClick = (slug: string) => {
        navigate({ name: "blog-post", slug });
    };

    return (
        <div className="wdr-blog">
            {/* En-tête */}
            <div className="wdr-blog__hero">
                <div className="wdr-blog__hero-inner">
                    <h1 className="wdr-blog__title">{t("blog.title")}</h1>
                    <p className="wdr-blog__subtitle">{t("blog.subtitle")}</p>
                </div>
            </div>

            <div className="wdr-blog__container">
                {/* Filtres par tag */}
                {allTags.length > 0 && (
                    <div
                        className="wdr-blog__tags"
                        role="group"
                        aria-label={t("blog.filter_tags")}
                    >
                        <button
                            type="button"
                            className={`wdr-blog__tag-btn ${activeTag === "" ? "wdr-blog__tag-btn--active" : ""}`}
                            onClick={() => handleTagClick("")}
                        >
                            {t("blog.all_posts")}
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                className={`wdr-blog__tag-btn ${activeTag === tag ? "wdr-blog__tag-btn--active" : ""}`}
                                onClick={() => handleTagClick(tag)}
                                aria-pressed={activeTag === tag}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Résultats */}
                {paginated.length === 0 ? (
                    <EmptyState
                        title={t("blog.no_posts")}
                        description={t("blog.no_posts_desc")}
                        actionLabel={t("blog.all_posts")}
                        onAction={() => handleTagClick("")}
                    />
                ) : (
                    <>
                        <div className="wdr-blog__grid">
                            {paginated.map((post) => (
                                <BlogCard
                                    key={post.id}
                                    post={post}
                                    onClick={handlePostClick}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setCurrentPage(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="wdr-blog__pagination"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
