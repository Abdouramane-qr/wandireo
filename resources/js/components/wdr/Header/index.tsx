import React from 'react';
import { Check, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Locale, useTranslation } from '@/hooks/useTranslation';
import type { BaseUser } from '@/types/wdr-user';
import { Button } from '../Button';
import { Link } from '../Link';
import './Header.css';

interface NavItem {
    labelKey: string;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { labelKey: 'nav.search', href: '/recherche' },
    { labelKey: 'search.activities', href: '/recherche?category=ACTIVITE' },
    { labelKey: 'search.boats', href: '/recherche?category=BATEAU' },
    {
        labelKey: 'search.accommodations',
        href: '/recherche?category=HEBERGEMENT',
    },
    { labelKey: 'search.cars', href: '/recherche?category=VOITURE' },
    { labelKey: 'nav.blog', href: '/blog' },
];

const LOCALES: { code: Locale; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'it', label: 'IT' },
    { code: 'de', label: 'DE' },
];

export interface HeaderProps {
    user?: BaseUser | null;
    currentPath?: string;
    onLogoClick?: () => void;
    onLoginClick?: () => void;
    onRegisterClick?: () => void;
    onPartnerClick?: () => void;
    onAdminClick?: () => void;
    onLogoutClick?: () => void;
    onMenuOpen?: () => void;
}

const HamburgerIcon: React.FC = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const WandireoLogo: React.FC = () => (
    <img
        src="/wandireo.png"
        alt=""
        className="wdr-header__logo-image"
        aria-hidden="true"
    />
);

export const Header: React.FC<HeaderProps> = ({
    user,
    currentPath = '/',
    onLogoClick,
    onLoginClick,
    onRegisterClick,
    onPartnerClick,
    onAdminClick,
    onLogoutClick,
    onMenuOpen,
}) => {
    const { t, locale, setLocale } = useTranslation();
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const [isLangMenuOpen, setIsLangMenuOpen] = React.useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);

    const isAuthenticated = !!user;
    const isPartner = user?.role === 'PARTNER';
    const isAdmin = user?.role === 'ADMIN';

    const navItems = React.useMemo(() => {
        if (isAdmin) {
            return [
                { label: t('nav.admin'), href: '/admin' },
                { label: 'Utilisateurs', href: '/admin/utilisateurs' },
                { label: 'Catalogue', href: '/admin/services' },
                { label: t('nav.blog'), href: '/admin/blog' },
            ];
        }

        if (isPartner) {
            return [
                { label: 'Tableau de bord', href: '/partenaire' },
                { label: 'Catalogue', href: '/partenaire/catalogue' },
                { label: 'Reservations', href: '/partenaire/reservations' },
            ];
        }

        return NAV_ITEMS.map((item) => ({
            label: t(item.labelKey),
            href: item.href,
        }));
    }, [isAdmin, isPartner, t]);

    const userInitial = user ? user.firstName.charAt(0).toUpperCase() : '';

    const currentThemeIcon =
        appearance === 'system' ? (
            <Monitor size={18} />
        ) : resolvedAppearance === 'dark' ? (
            <Sun size={18} />
        ) : (
            <Moon size={18} />
        );

    const handleLogoClick = (event: React.MouseEvent) => {
        if (!onLogoClick) {
            return;
        }

        event.preventDefault();
        onLogoClick();
    };

    return (
        <header className="wdr-header" role="banner">
            <div className="wdr-header__inner">
                <a
                    href="/"
                    className="wdr-header__logo"
                    onClick={handleLogoClick}
                    aria-label="Wandireo - Retour a l'accueil"
                >
                    <WandireoLogo />
                </a>

                <nav
                    className="wdr-header__nav"
                    aria-label="Navigation principale"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            variant="nav"
                            isActive={currentPath === item.href}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="wdr-header__actions">
                    <div className="wdr-header__tools">
                        <div className="wdr-header__lang-selector">
                            <button
                                className="wdr-header__tool-btn"
                                onClick={() => {
                                    setIsThemeMenuOpen((prev) => !prev);
                                    setIsLangMenuOpen(false);
                                }}
                                title={t('theme.change')}
                            >
                                {currentThemeIcon}
                            </button>

                            {isThemeMenuOpen && (
                                <div className="wdr-header__lang-menu">
                                    {(
                                        [
                                            ['light', t('theme.light')],
                                            ['dark', t('theme.dark')],
                                            ['system', t('theme.system')],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            className={`wdr-header__lang-item ${appearance === value ? 'active' : ''}`}
                                            onClick={() => {
                                                updateAppearance(value);
                                                setIsThemeMenuOpen(false);
                                            }}
                                        >
                                            <span>{label}</span>
                                            {appearance === value && (
                                                <Check size={14} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="wdr-header__lang-selector">
                            <button
                                className="wdr-header__tool-btn"
                                onClick={() => {
                                    setIsLangMenuOpen((prev) => !prev);
                                    setIsThemeMenuOpen(false);
                                }}
                                title={t('language.change')}
                            >
                                <Globe size={18} />
                                <span className="wdr-header__lang-code">
                                    {locale.toUpperCase()}
                                </span>
                            </button>

                            {isLangMenuOpen && (
                                <div className="wdr-header__lang-menu">
                                    {LOCALES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`wdr-header__lang-item ${locale === lang.code ? 'active' : ''}`}
                                            onClick={() => {
                                                setLocale(lang.code);
                                                setIsLangMenuOpen(false);
                                            }}
                                        >
                                            <span>{lang.label}</span>
                                            {locale === lang.code && (
                                                <Check size={14} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <span className="wdr-header__cta--desktop-only">
                        {isAdmin ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onAdminClick}
                            >
                                {t('nav.admin')}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onPartnerClick}
                            >
                                {isPartner
                                    ? t('nav.partner')
                                    : t('nav.become_partner')}
                            </Button>
                        )}
                    </span>

                    {isAuthenticated ? (
                        <div className="wdr-header__user">
                            <div className="wdr-header__user-info">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="wdr-header__avatar"
                                        width="32"
                                        height="32"
                                    />
                                ) : (
                                    <div
                                        className="wdr-header__avatar-initial"
                                        aria-hidden="true"
                                    >
                                        {userInitial}
                                    </div>
                                )}
                                <span className="wdr-header__user-name">
                                    {user.firstName}
                                </span>
                            </div>
                            {onLogoutClick && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogoutClick}
                                >
                                    {t('nav.logout')}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="wdr-header__auth-btns">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLoginClick}
                            >
                                {t('nav.login')}
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onRegisterClick}
                            >
                                {t('nav.register')}
                            </Button>
                        </div>
                    )}

                    <button
                        className="wdr-header__menu-btn"
                        type="button"
                        aria-label="Ouvrir le menu de navigation"
                        aria-expanded={false}
                        onClick={onMenuOpen}
                    >
                        <HamburgerIcon />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
