/**
 * @file Button/index.tsx
 * @description Composant Button principal du design system Wandireo.
 *   Supporte 4 variantes visuelles, 3 tailles, et les états loading / disabled.
 *   Utilisable comme bouton HTML natif (<button>) avec tous ses attributs.
 */

import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variante visuelle. Par defaut: 'primary' */
    variant?: ButtonVariant;
    /** Taille du bouton. Par defaut: 'md' */
    size?: ButtonSize;
    /**
     * Affiche un spinner d'attente et desactive les interactions.
     * A utiliser pendant les operations asynchrones (appels API, soumissions de formulaire).
     */
    loading?: boolean;
    /** Etend le bouton a la largeur totale de son conteneur */
    fullWidth?: boolean;
    /** Icone affichee a gauche du label (masquee pendant le chargement) */
    leftIcon?: React.ReactNode;
    /** Icone affichee a droite du label */
    rightIcon?: React.ReactNode;
}

/**
 * Button polyvalent du design system Wandireo.
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleReservation}>
 *   Reserver maintenant
 * </Button>
 *
 * <Button variant="danger" loading={isDeleting} leftIcon={<TrashIcon />}>
 *   Supprimer
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    className = '',
    type = 'button',
    ...rest
}) => {
    const isDisabled = disabled || loading;

    const classNames = [
        'wdr-btn',
        `wdr-btn--${variant}`,
        `wdr-btn--${size}`,
        fullWidth ? 'wdr-btn--full' : '',
        loading ? 'wdr-btn--loading' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classNames}
            disabled={isDisabled}
            aria-busy={loading}
            aria-disabled={isDisabled}
            {...rest}
        >
            {/* Spinner remplace l'icone gauche durant le chargement */}
            {loading && (
                <span
                    className="wdr-btn__spinner"
                    aria-hidden="true"
                    role="presentation"
                />
            )}

            {leftIcon && !loading && (
                <span
                    className="wdr-btn__icon wdr-btn__icon--left"
                    aria-hidden="true"
                >
                    {leftIcon}
                </span>
            )}

            {children && <span className="wdr-btn__label">{children}</span>}

            {rightIcon && (
                <span
                    className="wdr-btn__icon wdr-btn__icon--right"
                    aria-hidden="true"
                >
                    {rightIcon}
                </span>
            )}
        </button>
    );
};

export default Button;
