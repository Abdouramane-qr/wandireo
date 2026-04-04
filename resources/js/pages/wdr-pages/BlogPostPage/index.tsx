/**
 * @file pages/BlogPostPage/index.tsx
 * @description Lecture d'un article de blog. Le contenu HTML est assaini
 * via sanitizeHtml avant rendu.
 */

import React, { useMemo } from 'react';
import { BlogCard, Breadcrumb } from '@/components/wdr';
import { useBlogPostData, useBlogPostsData } from '@/hooks/useBlogData';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { BlogStatusNames } from '@/types/blog';
import { NotFoundPage } from '../NotFoundPage';
import './BlogPostPage.css';

interface BlogPostPageProps {
    slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
    const { t, intlLocale } = useTranslation();
    const { navigate } = useRouter();

    const { post } = useBlogPostData(slug);
    const { posts: allPublished } = useBlogPostsData({
        status: BlogStatusNames.PUBLISHED,
    });

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat(intlLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const relatedPosts = useMemo(() => {
        if (!post) {
return [];
}

        return allPublished
            .filter(
                (p) =>
                    p.id !== post.id &&
                    p.tags.some((t: string) => post.tags.includes(t)),
            )
            .slice(0, 3);
    }, [post, allPublished]);

    if (!post) {
return <NotFoundPage />;
}

    const safeContent = sanitizeHtml(post.content);

    return (
        <article className="wdr-post">
            {/* Fil d'Ariane */}
            <div className="wdr-post__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t('nav.home'),
                            onClick: () => navigate({ name: 'home' }),
                        },
                        {
                            label: t('nav.blog'),
                            onClick: () => navigate({ name: 'blog' }),
                        },
                        { label: post.title },
                    ]}
                />
            </div>

            {/* Image de couverture */}
            {post.coverImage && (
                <div className="wdr-post__cover-wrapper">
                    <img
                        src={post.coverImage}
                        alt={`Illustration : ${post.title}`}
                        className="wdr-post__cover"
                        loading="eager"
                    />
                </div>
            )}

            {/* En-tête */}
            <header className="wdr-post__header">
                {/* Tags */}
                <div className="wdr-post__tags" aria-label="Thèmes">
                    {post.tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className="wdr-post__tag"
                            onClick={() => navigate({ name: 'blog' })}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <h1 className="wdr-post__title">{post.title}</h1>
                <p className="wdr-post__excerpt">{post.excerpt}</p>

                {post.publishedAt && (
                    <div className="wdr-post__meta">
                        <time dateTime={post.publishedAt.toISOString()}>
                            {t('blog.published_on')} {formatDate(post.publishedAt)}
                        </time>
                        {post.updatedAt > post.publishedAt && (
                            <span className="wdr-post__updated">
                                · {t('blog.updated_on')} {formatDate(post.updatedAt)}
                            </span>
                        )}
                    </div>
                )}
            </header>

            {/* Contenu assaini */}
            <div
                className="wdr-post__body"
                dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {/* Articles suggérés */}
            {relatedPosts.length > 0 && (
                <section
                    className="wdr-post__related"
                    aria-labelledby="related-heading"
                >
                    <div className="wdr-post__related-inner">
                        <h2
                            id="related-heading"
                            className="wdr-post__related-title"
                        >
                            {t('blog.related_posts')}
                        </h2>
                        <div className="wdr-post__related-grid">
                            {relatedPosts.map((p) => (
                                <BlogCard
                                    key={p.id}
                                    post={p}
                                    onClick={(s) =>
                                        navigate({ name: 'blog-post', slug: s })
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
};

export default BlogPostPage;
