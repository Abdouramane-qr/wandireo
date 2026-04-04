/**
 * @file RatingStars/index.tsx
 * @description Composant autonome d'affichage et de saisie de note sur 5.
 *   Mode 'display' : lecture seule avec aria-label.
 *   Mode 'input'   : saisie interactive avec survol et clic.
 */

import React, { useState } from 'react';
import './RatingStars.css';

export type RatingStarsMode = 'display' | 'input';
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface RatingStarsProps {
    /** Valeur courante (1-5). Peut être undefined en mode input avant saisie. */
    value?: number;
    /** Mode d'utilisation. Par défaut : 'display'. */
    mode?: RatingStarsMode;
    /** Taille des étoiles. Par défaut : 'md'. */
    size?: 'sm' | 'md' | 'lg';
    /** Callback déclenché lors d'un changement de note (mode input uniquement). */
    onChange?: (rating: RatingValue) => void;
    className?: string;
}

const STAR_PATH =
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

const Star: React.FC<{
    filled: boolean;
    hovered: boolean;
    index: number;
    mode: RatingStarsMode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
}> = ({
    filled,
    hovered,
    index,
    mode,
    onMouseEnter,
    onMouseLeave,
    onClick,
}) => {
    const isInteractive = mode === 'input';
    const isLit = filled || hovered;

    return (
        <svg
            className={[
                'wdr-stars__star',
                isLit ? 'wdr-stars__star--filled' : 'wdr-stars__star--empty',
                isInteractive ? 'wdr-stars__star--interactive' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            viewBox="0 0 24 24"
            fill={isLit ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={isLit ? 0 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={
                isInteractive
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
onClick?.();
}
                      }
                    : undefined
            }
            data-index={index}
        >
            <path d={STAR_PATH} />
        </svg>
    );
};

export const RatingStars: React.FC<RatingStarsProps> = ({
    value = 0,
    mode = 'display',
    size = 'md',
    onChange,
    className = '',
}) => {
    const [hoverIndex, setHoverIndex] = useState<number>(-1);

    const activeValue = hoverIndex >= 0 ? hoverIndex + 1 : value;

    const label =
        value > 0
            ? `Note : ${value} sur 5`
            : mode === 'input'
              ? 'Sélectionner une note'
              : 'Aucune note';

    return (
        <span
            className={[
                'wdr-stars',
                `wdr-stars--${size}`,
                `wdr-stars--${mode}`,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            aria-label={label}
            role={mode === 'input' ? 'group' : undefined}
        >
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    index={i}
                    filled={i < Math.round(activeValue)}
                    hovered={mode === 'input' && hoverIndex >= i}
                    mode={mode}
                    onMouseEnter={
                        mode === 'input' ? () => setHoverIndex(i) : undefined
                    }
                    onMouseLeave={
                        mode === 'input' ? () => setHoverIndex(-1) : undefined
                    }
                    onClick={
                        mode === 'input'
                            ? () => onChange?.((i + 1) as RatingValue)
                            : undefined
                    }
                />
            ))}
        </span>
    );
};

export default RatingStars;
