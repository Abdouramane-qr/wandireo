/**
 * @file pages/ForgotPasswordPage/index.tsx
 * @description Réinitialisation de mot de passe — affiche un message de
 * confirmation simulé après saisie de l'email.
 */

import React, { useState } from 'react';
import { authApi } from '@/api/auth';
import { Button, Input } from '@/components/wdr';
import { useRouter } from '@/hooks/useWdrRouter';
import './ForgotPasswordPage.css';

export const ForgotPasswordPage: React.FC = () => {
    const { navigate } = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Veuillez saisir une adresse email valide.');

            return;
        }

        setIsLoading(true);

        try {
            await authApi.forgotPassword(email.trim().toLowerCase());
        } catch {
            // Backend absent ou erreur → on affiche quand même le message de confirmation
            // (sécurité : ne pas révéler si l'email existe)
        }

        setIsLoading(false);
        setSent(true);
    };

    return (
        <div className="wdr-forgot">
            <div className="wdr-forgot__card">
                {!sent ? (
                    <>
                        <div className="wdr-forgot__header">
                            <h1 className="wdr-forgot__title">
                                Mot de passe oublié
                            </h1>
                            <p className="wdr-forgot__subtitle">
                                Saisissez votre adresse email et nous vous
                                enverrons un lien de réinitialisation.
                            </p>
                        </div>

                        <form
                            className="wdr-forgot__form"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <Input
                                label="Adresse email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                error={error || undefined}
                                required
                                autoComplete="email"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                            >
                                Envoyer le lien
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="wdr-forgot__success">
                        <div
                            className="wdr-forgot__success-icon"
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
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h2 className="wdr-forgot__success-title">
                            Email envoyé !
                        </h2>
                        <p className="wdr-forgot__success-text">
                            Si un compte est associé à <strong>{email}</strong>,
                            vous recevrez un email avec les instructions pour
                            réinitialiser votre mot de passe.
                        </p>
                    </div>
                )}

                <div className="wdr-forgot__footer">
                    <button
                        type="button"
                        className="wdr-forgot__back"
                        onClick={() => navigate({ name: 'login' })}
                    >
                        ← Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
