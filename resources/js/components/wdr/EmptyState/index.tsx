/**
 * @file EmptyState/index.tsx
 * @description Composant générique "aucun résultat" avec icône, titre,
 *   sous-titre et action optionnelle.
 */

import React from 'react';
import { Button } from '../Button';
import './EmptyState.css';

export interface EmptyStateProps {
    /** Icône SVG ou emoji affiché en haut. Si absent, une icône par défaut est utilisée. */
    icon?: React.ReactNode;
    title: string;
    description?: string;
    /** Libellé du bouton d'action. */
    actionLabel?: string;
    /** Callback déclenché lors du clic sur le bouton d'action. */
    onAction?: () => void;
    className?: string;
}

const DefaultIcon: React.FC = () => (
    <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 11h6M11 8v6" />
    </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}) => (
    <div className={`wdr-empty-state ${className}`.trim()} role="status">
        <span className="wdr-empty-state__icon" aria-hidden="true">
            {icon ?? <DefaultIcon />}
        </span>
        <h3 className="wdr-empty-state__title">{title}</h3>
        {description && (
            <p className="wdr-empty-state__description">{description}</p>
        )}
        {actionLabel && onAction && (
            <Button variant="primary" size="md" onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </div>
);

export default EmptyState;
