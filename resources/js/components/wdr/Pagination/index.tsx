/**
 * @file Pagination/index.tsx
 * @description Composant de navigation entre pages de résultats.
 */

import React from 'react';
import './Pagination.css';

export interface PaginationProps {
    /** Page courante (1-based). */
    currentPage: number;
    /** Nombre total de pages. */
    totalPages: number;
    /** Callback déclenché lors d'un changement de page. */
    onPageChange: (page: number) => void;
    /** Nombre de pages affichées autour de la page courante. Par défaut : 2. */
    siblingCount?: number;
    className?: string;
}

function getPageRange(
    current: number,
    total: number,
    sibling: number,
): (number | '…')[] {
    const range: (number | '…')[] = [];

    const left = Math.max(2, current - sibling);
    const right = Math.min(total - 1, current + sibling);

    range.push(1);

    if (left > 2) {
range.push('…');
}

    for (let i = left; i <= right; i++) {
range.push(i);
}

    if (right < total - 1) {
range.push('…');
}

    if (total > 1) {
range.push(total);
}

    return range;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 2,
    className = '',
}) => {
    if (totalPages <= 1) {
return null;
}

    const pages = getPageRange(currentPage, totalPages, siblingCount);

    return (
        <nav
            className={`wdr-pagination ${className}`.trim()}
            aria-label="Navigation entre les pages"
        >
            {/* Précédent */}
            <button
                className="wdr-pagination__btn wdr-pagination__btn--prev"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
                type="button"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* Pages */}
            {pages.map((page, i) =>
                page === '…' ? (
                    <span
                        key={`ellipsis-${i}`}
                        className="wdr-pagination__ellipsis"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        className={[
                            'wdr-pagination__btn',
                            page === currentPage
                                ? 'wdr-pagination__btn--active'
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => onPageChange(page as number)}
                        aria-label={`Page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                        type="button"
                    >
                        {page}
                    </button>
                ),
            )}

            {/* Suivant */}
            <button
                className="wdr-pagination__btn wdr-pagination__btn--next"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
                type="button"
            >
                <svg
                    width="16"
                    height="16"
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
            </button>
        </nav>
    );
};

export default Pagination;
