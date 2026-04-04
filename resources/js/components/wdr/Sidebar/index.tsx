import { Link as InertiaLink } from '@inertiajs/react';
import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { BaseUser } from '@/types/wdr-user';
import { Button } from '../Button';
import './Sidebar.css';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const CompassIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

const WavesIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
);

const HotelIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const CarIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

const ActivityIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { label: 'Destinations', href: '/recherche', icon: <CompassIcon /> },
    {
        label: 'Activités',
        href: '/recherche?category=ACTIVITE',
        icon: <ActivityIcon />,
    },
    {
        label: 'Bateaux & Croisières',
        href: '/recherche?category=BATEAU',
        icon: <WavesIcon />,
    },
    {
        label: 'Hébergements',
        href: '/recherche?category=HEBERGEMENT',
        icon: <HotelIcon />,
    },
    {
        label: 'Location de voitures',
        href: '/recherche?category=VOITURE',
        icon: <CarIcon />,
    },
];

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user?: BaseUser | null;
    currentPath?: string;
    onLoginClick?: () => void;
    onRegisterClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    user,
    currentPath = '/',
    onLoginClick,
    onRegisterClick,
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();

                return;
            }

            if (e.key !== 'Tab' || !sidebarRef.current) {
return;
}

            const focusableElements = Array.from(
                sidebarRef.current.querySelectorAll<HTMLElement>(
                    FOCUSABLE_SELECTORS,
                ),
            );

            if (focusableElements.length === 0) {
return;
}

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (!isOpen) {
return;
}

        previousFocusRef.current = document.activeElement;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);

        const frame = requestAnimationFrame(() => {
            sidebarRef.current
                ?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS)
                ?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';

            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
return null;
}

    const userInitial = user ? user.firstName.charAt(0).toUpperCase() : '';
    const userRoleLabel =
        user?.role === 'PARTNER'
            ? 'Partenaire'
            : user?.role === 'ADMIN'
              ? 'Administrateur'
              : 'Voyageur';

    return ReactDOM.createPortal(
        <>
            <div
                className="wdr-sidebar-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                ref={sidebarRef}
                className="wdr-sidebar"
                role="navigation"
                aria-label="Menu de navigation mobile"
            >
                <div className="wdr-sidebar__header">
                    <InertiaLink
                        href="/"
                        className="wdr-sidebar__logo"
                        aria-label="Wandireo - Retour a l'accueil"
                        onClick={onClose}
                    >
                        <div
                            className="wdr-sidebar__logo-mark"
                            aria-hidden="true"
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
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="wdr-sidebar__logo-text">
                            Wandi<span>reo</span>
                        </span>
                    </InertiaLink>

                    <button
                        className="wdr-sidebar__close-btn"
                        onClick={onClose}
                        aria-label="Fermer le menu"
                        type="button"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="wdr-sidebar__body">
                    <nav
                        className="wdr-sidebar__nav"
                        aria-label="Categories de services"
                    >
                        <p className="wdr-sidebar__nav-title">Decouvrir</p>
                        {NAV_ITEMS.map((item) => {
                            const isActive = currentPath === item.href;

                            return (
                                <InertiaLink
                                    key={item.href}
                                    href={item.href}
                                    className={[
                                        'wdr-sidebar__nav-link',
                                        isActive
                                            ? 'wdr-sidebar__nav-link--active'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={onClose}
                                >
                                    <span className="wdr-sidebar__nav-icon">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </InertiaLink>
                            );
                        })}
                    </nav>

                    <hr className="wdr-sidebar__divider" />

                    <nav
                        className="wdr-sidebar__nav"
                        aria-label="Liens supplementaires"
                    >
                        <p className="wdr-sidebar__nav-title">Wandireo</p>
                        <InertiaLink
                            href="/partenaire/inscription"
                            className="wdr-sidebar__nav-link"
                            onClick={onClose}
                        >
                            Devenir Partenaire
                        </InertiaLink>
                        <InertiaLink
                            href="/guide"
                            className="wdr-sidebar__nav-link"
                            onClick={onClose}
                        >
                            Centre d'aide
                        </InertiaLink>
                        <a
                            href="https://wa.me/351928282231"
                            className="wdr-sidebar__nav-link"
                            onClick={onClose}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Nous contacter
                        </a>
                    </nav>
                </div>

                <div className="wdr-sidebar__footer">
                    {user ? (
                        <div className="wdr-sidebar__user-info">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="wdr-sidebar__user-avatar"
                                    width="40"
                                    height="40"
                                />
                            ) : (
                                <div
                                    className="wdr-sidebar__user-initial"
                                    aria-hidden="true"
                                >
                                    {userInitial}
                                </div>
                            )}
                            <div>
                                <p className="wdr-sidebar__user-name">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="wdr-sidebar__user-role">
                                    {userRoleLabel}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    onClose();
                                    onLoginClick?.();
                                }}
                            >
                                Connexion
                            </Button>
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => {
                                    onClose();
                                    onRegisterClick?.();
                                }}
                            >
                                Creer un compte
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
};

export default Sidebar;
