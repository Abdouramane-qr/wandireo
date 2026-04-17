/**
 * @file Link/index.tsx
 * @description Composant Link du design system Wandireo.
 *   Gere les variantes visuelles, l'etat actif (navigation),
 *   et la securite des liens externes (noopener noreferrer).
 */

import { Link as InertiaLink } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { localizePath } from '@/lib/locale';
import './Link.css';

export type LinkVariant = 'default' | 'muted' | 'nav' | 'underline';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Variante visuelle. Par defaut: 'default' */
    variant?: LinkVariant;
    /** Marque le lien comme actif (usage dans la navigation) */
    isActive?: boolean;
    /**
     * Force l'affichage de l'icone de lien externe.
     * Active automatiquement si target="_blank".
     */
    showExternalIcon?: boolean;
}

function normalizeInternalHref(href?: string): string | undefined {
    if (!href) {
return href;
}

    if (href.startsWith('#/')) {
return href.slice(1);
}

    return localizePath(href);
}

function ExternalIcon() {
    const { t } = useTranslation();

    return (
        <span
            className="wdr-link__external-icon"
            aria-label={t('common.external_link')}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="11"
                height="11"
                aria-hidden="true"
            >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        </span>
    );
}

/**
 * Composant Link style du design system Wandireo.
 * Securise automatiquement les liens ouverts dans un nouvel onglet.
 */
export const Link: React.FC<LinkProps> = ({
    variant = 'default',
    isActive = false,
    showExternalIcon = false,
    children,
    href,
    target,
    rel,
    className = '',
    ...rest
}) => {
    const normalizedHref = normalizeInternalHref(href);
    const isExternal =
        target === '_blank' ||
        Boolean(normalizedHref?.match(/^(https?:|mailto:|tel:)/i)) ||
        Boolean(normalizedHref?.startsWith('#'));

    const safeRel = isExternal
        ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ')
        : rel;

    const classNames = [
        'wdr-link',
        `wdr-link--${variant}`,
        isActive ? 'wdr-link--active' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    if (!isExternal && normalizedHref) {
        return (
            <InertiaLink href={normalizedHref} className={classNames}>
                {children}
                {(showExternalIcon || isExternal) && <ExternalIcon />}
            </InertiaLink>
        );
    }

    return (
        <a
            href={normalizedHref}
            target={target}
            rel={safeRel}
            className={classNames}
            {...rest}
        >
            {children}
            {(showExternalIcon || isExternal) && <ExternalIcon />}
        </a>
    );
};

export default Link;
