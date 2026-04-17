import React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { SearchBar } from "@/components/Navbar/SearchBar";
import { useAppearance } from "@/hooks/use-appearance";
import { useTranslation } from "@/hooks/useTranslation";
import { localizePath, stripLocaleFromPath } from "@/lib/locale";
import type { BaseUser } from "@/types/wdr-user";
import { Button } from "../Button";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Link } from "../Link";
import { PUBLIC_NAV_ITEMS, isNavItemActive } from "../navigation";
import "./Header.css";

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
    currentPath = "/",
    onLogoClick,
    onLoginClick,
    onRegisterClick,
    onPartnerClick,
    onAdminClick,
    onLogoutClick,
    onMenuOpen,
}) => {
    const { t } = useTranslation();
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);

    const isAuthenticated = !!user;
    const isPartner = user?.role === "PARTNER";
    const isAdmin = user?.role === "ADMIN";
    const normalizedCurrentPath = stripLocaleFromPath(currentPath);

    const navItems = React.useMemo(() => {
        if (isAdmin) {
            return [
                { label: t("nav.admin"), href: "/admin" },
                { label: t("header.admin_users"), href: "/admin/utilisateurs" },
                { label: t("header.catalog"), href: "/admin/services" },
                { label: t("nav.blog"), href: "/admin/blog" },
            ];
        }

        if (isPartner) {
            return [
                { label: t("header.dashboard"), href: "/partenaire" },
                { label: t("header.catalog"), href: "/partenaire/catalogue" },
                {
                    label: t("partner.bookings.title"),
                    href: "/partenaire/reservations",
                },
            ];
        }

        return PUBLIC_NAV_ITEMS.map((item) => ({
            label: t(item.labelKey),
            href: item.href,
        }));
    }, [isAdmin, isPartner, t]);

    const showGlobalSearch = !isAdmin && !isPartner;

    const userInitial = user ? user.firstName.charAt(0).toUpperCase() : "";

    const currentThemeIcon =
        appearance === "system" ? (
            <Monitor size={18} />
        ) : resolvedAppearance === "dark" ? (
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
                    href={localizePath("/") ?? "/"}
                    className="wdr-header__logo"
                    onClick={handleLogoClick}
                    aria-label={t("header.logo_aria")}
                >
                    <WandireoLogo />
                </a>

                <nav
                    className="wdr-header__nav"
                    aria-label={t("header.primary_nav_aria")}
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            variant="nav"
                            isActive={isNavItemActive(
                                normalizedCurrentPath,
                                item.href,
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="wdr-header__actions">
                    {showGlobalSearch && <SearchBar />}

                    <div className="wdr-header__tools">
                        <div className="wdr-header__lang-selector">
                            <button
                                className="wdr-header__tool-btn"
                                onClick={() => {
                                    setIsThemeMenuOpen((prev) => !prev);
                                }}
                                title={t("theme.change")}
                            >
                                {currentThemeIcon}
                            </button>

                            {isThemeMenuOpen && (
                                <div className="wdr-header__lang-menu">
                                    {(
                                        [
                                            ["light", t("theme.light")],
                                            ["dark", t("theme.dark")],
                                            ["system", t("theme.system")],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            className={`wdr-header__lang-item ${appearance === value ? "active" : ""}`}
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

                        <LanguageSwitcher />
                    </div>

                    <span className="wdr-header__cta--desktop-only">
                        {isAdmin ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onAdminClick}
                            >
                                {t("nav.admin")}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onPartnerClick}
                            >
                                {isPartner
                                    ? t("nav.partner")
                                    : t("nav.become_partner")}
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
                                    className="wdr-header__logout-btn"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLogoutClick}
                                >
                                    {t("nav.logout")}
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
                                {t("nav.login")}
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onRegisterClick}
                            >
                                {t("nav.register")}
                            </Button>
                        </div>
                    )}

                    <button
                        className="wdr-header__menu-btn"
                        type="button"
                        aria-label={t("header.open_menu")}
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
