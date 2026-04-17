import { Link as InertiaLink } from '@inertiajs/react';
import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Check, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/hooks/useTranslation';
import { localizePath } from '@/lib/locale';
import type { BaseUser } from '@/types/wdr-user';
import { Button } from '../Button';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { PUBLIC_NAV_ITEMS, isNavItemActive } from '../navigation';
import './Sidebar.css';

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
    onLogoutClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    user,
    currentPath = '/',
    onLoginClick,
    onRegisterClick,
    onLogoutClick,
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);
    const { t } = useTranslation();
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();

    const currentThemeIcon =
        appearance === 'system' ? (
            <Monitor size={16} />
        ) : resolvedAppearance === 'dark' ? (
            <Sun size={16} />
        ) : (
            <Moon size={16} />
        );

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
            ? t('sidebar.role.partner')
            : user?.role === 'ADMIN'
              ? t('sidebar.role.admin')
              : t('sidebar.role.traveler');

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
                aria-label={t('sidebar.mobile_nav')}
            >
                <div className="wdr-sidebar__header">
                    <InertiaLink
                        href={localizePath('/') ?? '/'}
                        className="wdr-sidebar__logo"
                        aria-label={t('sidebar.logo_aria')}
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
                        aria-label={t('sidebar.close_menu')}
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
                        aria-label={t('sidebar.service_categories')}
                    >
                        <p className="wdr-sidebar__nav-title">{t('sidebar.discover')}</p>
                        {PUBLIC_NAV_ITEMS.map((item) => {
                            const isActive = isNavItemActive(
                                currentPath,
                                item.href,
                            );

                            return (
                                <InertiaLink
                                    key={item.href}
                                    href={localizePath(item.href) ?? item.href}
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
                                    {t(item.labelKey)}
                                </InertiaLink>
                            );
                        })}
                    </nav>

                    <hr className="wdr-sidebar__divider" />

                    <nav
                        className="wdr-sidebar__nav"
                        aria-label={t('sidebar.additional_links')}
                    >
                        <p className="wdr-sidebar__nav-title">{t('sidebar.brand')}</p>
                        {user?.role === 'ADMIN' ? (
                            <InertiaLink
                                href={localizePath('/admin') ?? '/admin'}
                                className="wdr-sidebar__nav-link"
                                onClick={onClose}
                            >
                                {t('nav.admin')}
                            </InertiaLink>
                        ) : user?.role === 'PARTNER' ? (
                            <>
                                <InertiaLink
                                    href={localizePath('/partenaire') ?? '/partenaire'}
                                    className="wdr-sidebar__nav-link"
                                    onClick={onClose}
                                >
                                    {t('header.dashboard')}
                                </InertiaLink>
                                <InertiaLink
                                    href={
                                        localizePath('/partenaire/catalogue') ??
                                        '/partenaire/catalogue'
                                    }
                                    className="wdr-sidebar__nav-link"
                                    onClick={onClose}
                                >
                                    {t('header.catalog')}
                                </InertiaLink>
                            </>
                        ) : (
                            <InertiaLink
                                href={localizePath('/partenaire/inscription') ?? '/partenaire/inscription'}
                                className="wdr-sidebar__nav-link"
                                onClick={onClose}
                            >
                                {t('nav.become_partner')}
                            </InertiaLink>
                        )}
                        <InertiaLink
                            href={localizePath('/guide') ?? '/guide'}
                            className="wdr-sidebar__nav-link"
                            onClick={onClose}
                        >
                            {t('footer.help_center')}
                        </InertiaLink>
                        <a
                            href="https://wa.me/351928282231"
                            className="wdr-sidebar__nav-link"
                            onClick={onClose}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('sidebar.contact_us')}
                        </a>
                    </nav>

                    <hr className="wdr-sidebar__divider" />

                    <div className="wdr-sidebar__nav" aria-label={t('theme.change')}>
                        <p className="wdr-sidebar__nav-title">{t('profile.preferences')}</p>
                        <div className="wdr-sidebar__preferences">
                            <div className="wdr-sidebar__preference-group">
                                <span className="wdr-sidebar__preference-label">
                                    <span className="wdr-sidebar__nav-icon">
                                        {currentThemeIcon}
                                    </span>
                                    {t('theme.change')}
                                </span>
                                <div className="wdr-sidebar__theme-actions">
                                    {(
                                        [
                                            ['light', t('theme.light')],
                                            ['dark', t('theme.dark')],
                                            ['system', t('theme.system')],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            className={[
                                                'wdr-sidebar__theme-chip',
                                                appearance === value
                                                    ? 'wdr-sidebar__theme-chip--active'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            onClick={() => updateAppearance(value)}
                                            type="button"
                                        >
                                            <span>{label}</span>
                                            {appearance === value ? (
                                                <Check size={14} />
                                            ) : null}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="wdr-sidebar__preference-group">
                                <span className="wdr-sidebar__preference-label">
                                    <span className="wdr-sidebar__nav-icon">
                                        <Globe size={16} />
                                    </span>
                                    {t('language.change')}
                                </span>
                                <LanguageSwitcher className="wdr-sidebar__language-switcher" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wdr-sidebar__footer">
                    {user ? (
                        <>
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
                            {user.role === 'CLIENT' ? (
                                <>
                                    <InertiaLink
                                        href={localizePath('/mon-espace') ?? '/mon-espace'}
                                        className="wdr-sidebar__nav-link"
                                        onClick={onClose}
                                    >
                                        {t('header.dashboard')}
                                    </InertiaLink>
                                    <InertiaLink
                                        href={
                                            localizePath('/mes-reservations') ??
                                            '/mes-reservations'
                                        }
                                        className="wdr-sidebar__nav-link"
                                        onClick={onClose}
                                    >
                                        {t('partner.bookings.title')}
                                    </InertiaLink>
                                </>
                            ) : null}
                            {onLogoutClick ? (
                                <Button
                                    variant="ghost"
                                    fullWidth
                                    onClick={() => {
                                        onClose();
                                        onLogoutClick();
                                    }}
                                >
                                    {t('nav.logout')}
                                </Button>
                            ) : null}
                        </>
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
                                {t('nav.login')}
                            </Button>
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => {
                                    onClose();
                                    onRegisterClick?.();
                                }}
                            >
                                {t('sidebar.create_account')}
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
