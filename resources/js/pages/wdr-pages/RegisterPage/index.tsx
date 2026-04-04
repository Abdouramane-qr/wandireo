import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useRouter } from '@/hooks/useWdrRouter';
import { useTranslation } from '@/hooks/useTranslation';
import './RegisterPage.css';

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
}

export const RegisterPage: React.FC = () => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { t } = useTranslation();

    const validate = (form: FormState): FormErrors => {
        const errors: FormErrors = {};

        if (!form.firstName.trim()) {
            errors.firstName = t('auth.register.error.first_name');
        }

        if (!form.lastName.trim()) {
            errors.lastName = t('auth.register.error.last_name');
        }

        if (!form.email.trim()) {
            errors.email = t('auth.register.error.email_required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = t('auth.register.error.email_invalid');
        }

        if (!form.password) {
            errors.password = t('auth.register.error.password_required');
        } else if (form.password.length < 6) {
            errors.password = t('auth.register.error.password_length');
        }

        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = t('auth.register.error.password_match');
        }

        if (!form.acceptTerms) {
            errors.acceptTerms = t('auth.register.error.accept_terms');
        }

        return errors;
    };

    const [form, setForm] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        if (currentUser.role === 'PARTNER') {
            navigate({ name: 'partner-dashboard' });
            return;
        }

        if (currentUser.role === 'ADMIN') {
            navigate({ name: 'admin-dashboard' });
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
            const value =
                event.target.type === 'checkbox'
                    ? event.target.checked
                    : event.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));

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
        router.post(
            '/register',
            {
                name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                password_confirmation: form.confirmPassword,
            },
            {
                preserveScroll: true,
                onError: (serverErrors) => {
                    setErrors({
                        firstName:
                            typeof serverErrors.firstName === 'string'
                                ? serverErrors.firstName
                                : undefined,
                        lastName:
                            typeof serverErrors.lastName === 'string'
                                ? serverErrors.lastName
                                : undefined,
                        email:
                            typeof serverErrors.email === 'string'
                                ? serverErrors.email
                                : undefined,
                        password:
                            typeof serverErrors.password === 'string'
                                ? serverErrors.password
                                : undefined,
                        confirmPassword:
                            typeof serverErrors.password_confirmation ===
                            'string'
                                ? serverErrors.password_confirmation
                                : undefined,
                    });
                },
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <div className="wdr-register">
            <div className="wdr-register__card">
                <div className="wdr-register__header">
                    <h1 className="wdr-register__title">
                        {t('auth.register.title')}
                    </h1>
                    <p className="wdr-register__subtitle">
                        {t('auth.register.subtitle')}
                    </p>
                </div>

                <form
                    className="wdr-register__form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="wdr-register__row">
                        <Input
                            label={t('auth.register.first_name')}
                            type="text"
                            placeholder="Alice"
                            value={form.firstName}
                            onChange={setField('firstName')}
                            error={errors.firstName}
                            required
                            autoComplete="given-name"
                        />
                        <Input
                            label={t('auth.register.last_name')}
                            type="text"
                            placeholder="Voyageuse"
                            value={form.lastName}
                            onChange={setField('lastName')}
                            error={errors.lastName}
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    <Input
                        label={t('auth.login.email')}
                        type="email"
                        placeholder={t('auth.login.email_placeholder')}
                        value={form.email}
                        onChange={setField('email')}
                        error={errors.email}
                        required
                        autoComplete="email"
                    />

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

                    <label className="wdr-register__checkbox">
                        <input
                            type="checkbox"
                            checked={form.acceptTerms}
                            onChange={setField('acceptTerms')}
                        />
                        <span>
                            {t('auth.register.accept_terms_prefix')}{' '}
                            <button
                                type="button"
                                className="wdr-register__link"
                                onClick={() => navigate({ name: 'terms' })}
                            >
                                {t('auth.register.terms')}
                            </button>{' '}
                            {t('auth.register.accept_terms_join')}{' '}
                            <button
                                type="button"
                                className="wdr-register__link"
                                onClick={() => navigate({ name: 'privacy' })}
                            >
                                {t('auth.register.privacy')}
                            </button>
                        </span>
                    </label>
                    {errors.acceptTerms && (
                        <span className="wdr-register__checkbox-error">
                            {errors.acceptTerms}
                        </span>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                    >
                        {t('auth.register.submit')}
                    </Button>
                </form>

                <div className="wdr-register__footer">
                    <p>
                        {t('auth.register.have_account')}{' '}
                        <button
                            type="button"
                            className="wdr-register__link"
                            onClick={() => navigate({ name: 'login' })}
                        >
                            {t('auth.register.login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
