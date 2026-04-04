/**
 * @file pages/ProfilePage/index.tsx
 * @description Gestion du profil voyageur.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/wdr';
import { useToast } from '@/components/wdr/Toast/ToastProvider';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import './ProfilePage.css';

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
    { value: 'fr', label: 'Francais' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Espanol' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Portugues' },
];

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'Dollar US (USD)' },
    { value: 'GBP', label: 'Livre sterling (GBP)' },
    { value: 'CHF', label: 'Franc suisse (CHF)' },
    { value: 'CAD', label: 'Dollar canadien (CAD)' },
];

const UserIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const GlobeIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const ShieldIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

interface ProfileFormState {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    language: string;
    preferredCurrency: string;
}

interface ProfileFieldProps {
    id: string;
    label: string;
    type?: React.HTMLInputTypeAttribute;
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    autoComplete?: string;
    readOnlyNote?: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    readOnly = false,
    autoComplete,
    readOnlyNote,
}) => (
    <div className="wdr-profile__field">
        <label htmlFor={id} className="wdr-profile__label">
            {label}
        </label>
        <input
            id={id}
            type={type}
            className={`wdr-profile__input${readOnly ? ' wdr-profile__input--readonly' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            autoComplete={autoComplete}
        />
        {readOnly && readOnlyNote && (
            <span className="wdr-profile__readonly-note">{readOnlyNote}</span>
        )}
    </div>
);

interface ProfileSelectProps {
    id: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({
    id,
    label,
    value,
    options,
    onChange,
}) => (
    <div className="wdr-profile__field">
        <label htmlFor={id} className="wdr-profile__label">
            {label}
        </label>
        <select
            id={id}
            className="wdr-profile__select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const ProfilePage: React.FC = () => {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const toast = useToast();
    const { t, intlLocale } = useTranslation();
    const preferredCurrency =
        currentUser?.role === 'CLIENT' ? currentUser.preferredCurrency : 'EUR';

    useEffect(() => {
        if (!currentUser) {
            navigate({ name: 'home' });
        }
    }, [currentUser, navigate]);

    const [form, setForm] = useState<ProfileFormState>({
        firstName: currentUser?.firstName ?? '',
        lastName: currentUser?.lastName ?? '',
        email: currentUser?.email ?? '',
        phoneNumber: currentUser?.phoneNumber ?? '',
        language: currentUser?.language ?? 'fr',
        preferredCurrency: preferredCurrency ?? 'EUR',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = useCallback(
        (field: keyof ProfileFormState) => (value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        await new Promise<void>((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        toast.success(t('profile.save_success_desc'), {
            title: t('profile.save_success_title'),
        });
    }, [t, toast]);

    if (!currentUser) {
        return null;
    }

    const avatarInitials =
        form.firstName.charAt(0).toUpperCase() +
        form.lastName.charAt(0).toUpperCase();
    const memberSince = t('profile.member_since').replace(
        '{date}',
        new Intl.DateTimeFormat(intlLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(currentUser.createdAt),
    );

    return (
        <div className="wdr-profile">
            <div className="wdr-profile__inner">
                <nav
                    className="wdr-profile__breadcrumb"
                    aria-label={t('profile.back_dashboard')}
                >
                    <button
                        type="button"
                        className="wdr-profile__back-btn"
                        onClick={() => navigate({ name: 'dashboard' })}
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
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        {t('profile.back_dashboard')}
                    </button>
                </nav>

                <header className="wdr-profile__header">
                    <div className="wdr-profile__avatar" aria-hidden="true">
                        {avatarInitials}
                    </div>
                    <div className="wdr-profile__identity">
                        <h1 className="wdr-profile__name">
                            {form.firstName} {form.lastName}
                        </h1>
                        <p className="wdr-profile__email">{form.email}</p>
                        <p className="wdr-profile__since">{memberSince}</p>
                    </div>
                </header>

                <section
                    className="wdr-profile__section"
                    aria-label={t('profile.personal')}
                >
                    <div className="wdr-profile__section-header">
                        <div className="wdr-profile__section-icon wdr-profile__section-icon--personal">
                            <UserIcon />
                        </div>
                        <h2 className="wdr-profile__section-title">
                            {t('profile.personal')}
                        </h2>
                    </div>

                    <div className="wdr-profile__fields-grid">
                        <ProfileField
                            id="profile-firstname"
                            label={t('profile.first_name')}
                            value={form.firstName}
                            onChange={handleChange('firstName')}
                            autoComplete="given-name"
                        />
                        <ProfileField
                            id="profile-lastname"
                            label={t('profile.last_name')}
                            value={form.lastName}
                            onChange={handleChange('lastName')}
                            autoComplete="family-name"
                        />
                        <ProfileField
                            id="profile-email"
                            label={t('profile.email')}
                            type="email"
                            value={form.email}
                            onChange={handleChange('email')}
                            readOnly
                            autoComplete="email"
                            readOnlyNote={t('profile.readonly_note')}
                        />
                        <ProfileField
                            id="profile-phone"
                            label={t('profile.phone')}
                            type="tel"
                            value={form.phoneNumber}
                            onChange={handleChange('phoneNumber')}
                            autoComplete="tel"
                        />
                    </div>
                </section>

                <section
                    className="wdr-profile__section"
                    aria-label={t('profile.preferences')}
                >
                    <div className="wdr-profile__section-header">
                        <div className="wdr-profile__section-icon wdr-profile__section-icon--prefs">
                            <GlobeIcon />
                        </div>
                        <h2 className="wdr-profile__section-title">
                            {t('profile.preferences')}
                        </h2>
                    </div>

                    <div className="wdr-profile__fields-grid">
                        <ProfileSelect
                            id="profile-language"
                            label={t('profile.language')}
                            value={form.language}
                            options={LANGUAGE_OPTIONS}
                            onChange={handleChange('language')}
                        />
                        <ProfileSelect
                            id="profile-currency"
                            label={t('profile.currency')}
                            value={form.preferredCurrency}
                            options={CURRENCY_OPTIONS}
                            onChange={handleChange('preferredCurrency')}
                        />
                    </div>
                </section>

                <div className="wdr-profile__actions">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? t('profile.saving') : t('profile.save')}
                    </Button>
                </div>

                <section
                    className="wdr-profile__section wdr-profile__section--info"
                    aria-label={t('profile.security')}
                >
                    <div className="wdr-profile__section-header">
                        <div className="wdr-profile__section-icon wdr-profile__section-icon--security">
                            <ShieldIcon />
                        </div>
                        <h2 className="wdr-profile__section-title">
                            {t('profile.security')}
                        </h2>
                    </div>

                    <div className="wdr-profile__info-block">
                        <div className="wdr-profile__info-row">
                            <span className="wdr-profile__info-label">
                                {t('profile.password')}
                            </span>
                            <span className="wdr-profile__info-value">
                                {t('profile.password_desc')}
                            </span>
                        </div>
                        <div className="wdr-profile__info-row">
                            <span className="wdr-profile__info-label">
                                {t('profile.two_factor')}
                            </span>
                            <span className="wdr-profile__info-value wdr-profile__info-value--muted">
                                {t('profile.two_factor_desc')}
                            </span>
                        </div>
                        <div className="wdr-profile__info-row">
                            <span className="wdr-profile__info-label">
                                {t('profile.sessions')}
                            </span>
                            <span className="wdr-profile__info-value">
                                {t('profile.sessions_desc')}
                            </span>
                        </div>
                    </div>
                </section>

                <div className="wdr-profile__danger-zone">
                    <Button variant="ghost" size="sm" onClick={logout}>
                        {t('nav.logout')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
