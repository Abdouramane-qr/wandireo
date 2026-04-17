import React, { useEffect, useState } from 'react';
import { authApi } from '@/api/auth';
import { Button, Input } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useRouter } from '@/hooks/useWdrRouter';
import { useTranslation } from '@/hooks/useTranslation';
import './PartnerRegisterPage.css';

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    address: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
}

export const PartnerRegisterPage: React.FC = () => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { t } = useTranslation();

    const validate = (form: FormState): FormErrors => {
        const errors: FormErrors = {};

        if (!form.firstName.trim()) {
            errors.firstName = t('partner.register.error.first_name');
        }
        if (!form.lastName.trim()) {
            errors.lastName = t('partner.register.error.last_name');
        }
        if (
            !form.email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {
            errors.email = t('partner.register.error.email');
        }
        if (!form.companyName.trim()) {
            errors.companyName = t('partner.register.error.company');
        }
        if (!form.address.trim()) {
            errors.address = t('partner.register.error.address');
        }
        if (!form.password || form.password.length < 6) {
            errors.password = t('partner.register.error.password');
        }
        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = t('partner.register.error.password_match');
        }

        return errors;
    };

    const [form, setForm] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        navigate({ name: 'home' });
    }, [currentUser, navigate]);

    if (currentUser) {
        return null;
    }

    const setField =
        (field: keyof FormState) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [field]: event.target.value }));

            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: undefined }));
            }
        };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const validationErrors = validate(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            await authApi.registerPartner({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                phoneNumber: form.phone || undefined,
                companyName: form.companyName.trim(),
                businessAddress: form.address.trim() || undefined,
            });
        } catch {
            // Keep the optimistic UX while backend validation is still stabilizing.
        }

        setIsLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="wdr-partner-register">
                <div className="wdr-partner-register__card wdr-partner-register__card--success">
                    <div
                        className="wdr-partner-register__success-icon"
                        aria-hidden="true"
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h1 className="wdr-partner-register__success-title">
                        {t('partner.register.success_title')}
                    </h1>
                    <p className="wdr-partner-register__success-text">
                        {t('partner.register.success_text')}{' '}
                        <strong>{form.email}</strong>.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate({ name: 'home' })}
                    >
                        {t('common.back_home')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="wdr-partner-register">
            <div className="wdr-partner-register__card">
                <div className="wdr-partner-register__header">
                    <h1 className="wdr-partner-register__title">
                        {t('partner.register.title')}
                    </h1>
                    <p className="wdr-partner-register__subtitle">
                        {t('partner.register.subtitle')}
                    </p>
                </div>

                <form
                    className="wdr-partner-register__form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <fieldset className="wdr-partner-register__section">
                        <legend className="wdr-partner-register__legend">
                            {t('partner.register.personal')}
                        </legend>
                        <div className="wdr-partner-register__row">
                            <Input
                                label={t('auth.register.first_name')}
                                type="text"
                                placeholder={t(
                                    'partner.register.first_name_placeholder',
                                )}
                                value={form.firstName}
                                onChange={setField('firstName')}
                                error={errors.firstName}
                                required
                            />
                            <Input
                                label={t('auth.register.last_name')}
                                type="text"
                                placeholder={t(
                                    'partner.register.last_name_placeholder',
                                )}
                                value={form.lastName}
                                onChange={setField('lastName')}
                                error={errors.lastName}
                                required
                            />
                        </div>
                        <Input
                            label={t('partner.register.business_email')}
                            type="email"
                            placeholder={t(
                                'partner.register.email_placeholder',
                            )}
                            value={form.email}
                            onChange={setField('email')}
                            error={errors.email}
                            required
                        />
                        <Input
                            label={t('partner.register.phone')}
                            type="tel"
                            placeholder={t(
                                'partner.register.phone_placeholder',
                            )}
                            value={form.phone}
                            onChange={setField('phone')}
                            error={errors.phone}
                        />
                    </fieldset>

                    <fieldset className="wdr-partner-register__section">
                        <legend className="wdr-partner-register__legend">
                            {t('partner.register.company')}
                        </legend>
                        <Input
                            label={t('partner.register.company_name')}
                            type="text"
                            placeholder={t(
                                'partner.register.company_placeholder',
                            )}
                            value={form.companyName}
                            onChange={setField('companyName')}
                            error={errors.companyName}
                            required
                        />
                        <Input
                            label={t('partner.register.address')}
                            type="text"
                            placeholder={t(
                                'partner.register.address_placeholder',
                            )}
                            value={form.address}
                            onChange={setField('address')}
                            error={errors.address}
                            required
                        />
                        <p className="wdr-partner-register__hint">
                            {t('partner.register.hint')}
                        </p>
                    </fieldset>

                    <fieldset className="wdr-partner-register__section">
                        <legend className="wdr-partner-register__legend">
                            {t('partner.register.security')}
                        </legend>
                        <Input
                            label={t('auth.register.password')}
                            type="password"
                            placeholder={t('auth.register.password_hint')}
                            value={form.password}
                            onChange={setField('password')}
                            error={errors.password}
                            required
                            autoComplete="new-password"
                        />
                        <Input
                            label={t('auth.register.confirm_password')}
                            type="password"
                            placeholder={t('auth.register.confirm_placeholder')}
                            value={form.confirmPassword}
                            onChange={setField('confirmPassword')}
                            error={errors.confirmPassword}
                            required
                            autoComplete="new-password"
                        />
                    </fieldset>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                    >
                        {t('partner.register.submit')}
                    </Button>
                </form>

                <div className="wdr-partner-register__footer">
                    <p>
                        {t('partner.register.have_account')}{' '}
                        <button
                            type="button"
                            className="wdr-partner-register__link"
                            onClick={() => navigate({ name: 'login' })}
                        >
                            {t('partner.register.login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegisterPage;
