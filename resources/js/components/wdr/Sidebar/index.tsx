import { Link as InertiaLink } from '@inertiajs/react';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { Search, X, Compass, Bike, ShipWheel, TentTree, CarFront, BookOpen, UserPlus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { localizePath } from '@/lib/locale';
import type { BaseUser } from '@/types/wdr-user';
import { Button } from '../Button';
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
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key !== 'Tab' || !sidebarRef.current) return;

            const focusable = Array.from(sidebarRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

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
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <>
            <div className="wdr-sidebar-overlay" onClick={onClose} aria-hidden="true" />

            <div ref={sidebarRef} className="wdr-sidebar" role="navigation">
                {/* 1. HEADER */}
                <div className="wdr-sidebar__header">
                    <span className="wdr-sidebar__logo-text">
                        Wandi<span>reo</span>
                    </span>
                    <button className="wdr-sidebar__close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="wdr-sidebar__scroll-area">
                    {/* 2. SEARCH BAR */}
                    <div className="wdr-sidebar__search-container">
                        <div className="wdr-sidebar__search-wrapper">
                            <Search className="wdr-sidebar__search-icon" size={18} />
                            <input 
                                type="text" 
                                className="wdr-sidebar__search-input" 
                                placeholder={t('nav.search') + "..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 3. MENU SECTION "Découvrir" */}
                    <div className="wdr-sidebar__section">
                        <p className="wdr-sidebar__section-title">{t('sidebar.discover')}</p>
                        <nav className="wdr-sidebar__nav-list">
                            {PUBLIC_NAV_ITEMS.map((item) => {
                                const isActive = isNavItemActive(currentPath, item.href);
                                return (
                                    <InertiaLink
                                        key={item.href}
                                        href={localizePath(item.href) ?? item.href}
                                        className={`wdr-sidebar__nav-item ${isActive ? 'wdr-sidebar__nav-item--active' : ''}`}
                                        onClick={onClose}
                                    >
                                        <span className="wdr-sidebar__item-icon">{item.icon}</span>
                                        <span className="wdr-sidebar__item-label">{t(item.labelKey)}</span>
                                    </InertiaLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="wdr-sidebar__divider" />

                    {/* 4. SECONDARY SECTION */}
                    <div className="wdr-sidebar__section">
                        <nav className="wdr-sidebar__nav-list">
                            <InertiaLink href={localizePath('/blog') ?? '/blog'} className="wdr-sidebar__nav-item" onClick={onClose}>
                                <span className="wdr-sidebar__item-icon"><BookOpen size={20} /></span>
                                <span className="wdr-sidebar__item-label">{t('nav.blog')}</span>
                            </InertiaLink>
                            <InertiaLink href={localizePath('/partenaire/inscription') ?? '/partenaire/inscription'} className="wdr-sidebar__nav-item" onClick={onClose}>
                                <span className="wdr-sidebar__item-icon"><UserPlus size={20} /></span>
                                <span className="wdr-sidebar__item-label">{t('nav.become_partner')}</span>
                            </InertiaLink>
                        </nav>
                    </div>
                </div>

                {/* 5. FOOTER (Sticky) */}
                <div className="wdr-sidebar__footer">
                    {user ? (
                        <Button variant="primary" fullWidth onClick={() => { onClose(); onLogoutClick?.(); }}>
                            {t('nav.logout')}
                        </Button>
                    ) : (
                        <div className="wdr-sidebar__auth-stack">
                            <button className="wdr-sidebar__btn-login" onClick={() => { onClose(); onLoginClick?.(); }}>
                                {t('nav.login')}
                            </button>
                            <button className="wdr-sidebar__btn-register" onClick={() => { onClose(); onRegisterClick?.(); }}>
                                {t('sidebar.create_account')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
};

export default Sidebar;
