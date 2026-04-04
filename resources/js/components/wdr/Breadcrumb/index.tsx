/**
 * @file Breadcrumb/index.tsx
 * @description Fil d'Ariane pour les pages profondes (fiche service, article de blog).
 */

import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
    label: string;
    /** Si absent, l'item est traité comme la page courante (non cliquable). */
    onClick?: () => void;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

const ChevronIcon: React.FC = () => (
    <svg
        className="wdr-breadcrumb__separator"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M9 18l6-6-6-6" />
    </svg>
);

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className = '',
}) => {
    if (items.length === 0) {
return null;
}

    return (
        <nav
            aria-label="Fil d'Ariane"
            className={`wdr-breadcrumb ${className}`.trim()}
        >
            <ol className="wdr-breadcrumb__list">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;

                    return (
                        <li key={i} className="wdr-breadcrumb__item">
                            {i > 0 && <ChevronIcon />}
                            {isLast || !item.onClick ? (
                                <span
                                    className="wdr-breadcrumb__current"
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="wdr-breadcrumb__link"
                                    onClick={item.onClick}
                                >
                                    {item.label}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
