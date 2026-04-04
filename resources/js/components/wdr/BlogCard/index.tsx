import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { BlogPost } from '../../../types/blog';
import './BlogCard.css';

export interface BlogCardProps {
    post: BlogPost;
    onClick?: (slug: string) => void;
    className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    post,
    onClick,
    className = '',
}) => {
    const { intlLocale, t } = useTranslation();

    const handleClick = () => onClick?.(post.slug);
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleClick();
        }
    };

    const formatDate = (date: Date): string =>
        new Intl.DateTimeFormat(intlLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);

    return (
        <article
            className={`wdr-blog-card ${className}`.trim()}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? 'button' : undefined}
            aria-label={post.title}
        >
            <div className="wdr-blog-card__image-wrapper">
                {post.coverImage ? (
                    <img
                        src={post.coverImage}
                        alt={`${t('blog.cover_alt')} : ${post.title}`}
                        className="wdr-blog-card__image"
                        loading="lazy"
                        width="400"
                        height="220"
                    />
                ) : (
                    <div
                        className="wdr-blog-card__image-placeholder"
                        aria-label={t('blog.cover_fallback')}
                    />
                )}
                {post.tags.length > 0 && (
                    <span className="wdr-blog-card__tag">{post.tags[0]}</span>
                )}
            </div>

            <div className="wdr-blog-card__body">
                {post.publishedAt && (
                    <time
                        className="wdr-blog-card__date"
                        dateTime={post.publishedAt.toISOString()}
                    >
                        {formatDate(post.publishedAt)}
                    </time>
                )}
                <h3 className="wdr-blog-card__title">{post.title}</h3>
                <p className="wdr-blog-card__excerpt">{post.excerpt}</p>
            </div>

            <div className="wdr-blog-card__footer">
                <span className="wdr-blog-card__read-more" aria-hidden="true">
                    {t('blog.read_more')}
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </article>
    );
};

export default BlogCard;
