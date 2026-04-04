/**
 * @file ReviewCard/index.tsx
 * @description Affichage d'un avis client : note en étoiles, commentaire, auteur, date.
 */

import React from 'react';
import type { Review } from '../../../types/review';
import { RatingStars } from '../RatingStars';
import './ReviewCard.css';

export interface ReviewCardProps {
    review: Review;
    /** Nom affiché de l'auteur (résolu depuis le clientId par le parent). */
    authorName: string;
    /** Avatar de l'auteur (optionnel). */
    authorAvatar?: string;
    className?: string;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    authorName,
    authorAvatar,
    className = '',
}) => {
    const initial = authorName.charAt(0).toUpperCase();

    return (
        <article
            className={`wdr-review ${className}`.trim()}
            aria-label={`Avis de ${authorName}`}
        >
            <header className="wdr-review__header">
                <div className="wdr-review__author">
                    {authorAvatar ? (
                        <img
                            src={authorAvatar}
                            alt={authorName}
                            className="wdr-review__avatar"
                            width="40"
                            height="40"
                        />
                    ) : (
                        <div
                            className="wdr-review__avatar-initial"
                            aria-hidden="true"
                        >
                            {initial}
                        </div>
                    )}
                    <div className="wdr-review__author-info">
                        <span className="wdr-review__author-name">
                            {authorName}
                        </span>
                        <time
                            className="wdr-review__date"
                            dateTime={review.createdAt.toISOString()}
                        >
                            {formatDate(review.createdAt)}
                        </time>
                    </div>
                </div>
                <RatingStars value={review.rating} mode="display" size="sm" />
            </header>
            <p className="wdr-review__comment">{review.comment}</p>
        </article>
    );
};

export default ReviewCard;
