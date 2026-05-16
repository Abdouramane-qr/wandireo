import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { paymentsApi, type PaymentSessionStatusResponse } from '@/api/payments';
import { Button } from '@/components/wdr';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { useRouter } from '@/hooks/useWdrRouter';
import '@/pages/wdr-pages/PaymentPage/PaymentPage.css';

type PaymentSuccessProps = Record<string, unknown> & {
    bookingId?: string;
    sessionId?: string;
};

export default function PaymentSuccess() {
    const { bookingId, sessionId } = usePage<PaymentSuccessProps>().props;
    const { navigate } = useRouter();
    const [status, setStatus] =
        useState<PaymentSessionStatusResponse['status']>('pending');
    const [sessionStatus, setSessionStatus] =
        useState<PaymentSessionStatusResponse | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) {
            setError('Session Stripe introuvable.');
            return;
        }

        let cancelled = false;
        let timeoutId: number | undefined;

        const poll = async () => {
            try {
                const response = await paymentsApi.statusBySession(sessionId);

                if (cancelled) {
                    return;
                }

                setSessionStatus(response);
                setStatus(response.status);

                if (response.status === 'pending') {
                    timeoutId = window.setTimeout(() => {
                        void poll();
                    }, 2000);
                }
            } catch {
                if (!cancelled) {
                    setError("Impossible de verifier l'etat du paiement.");
                }
            }
        };

        void poll();

        return () => {
            cancelled = true;

            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [sessionId]);

    const isExternalPending =
        sessionStatus?.status === 'paid'
        && sessionStatus.externalBookingStatus !== undefined
        && sessionStatus.externalBookingStatus !== 'CONFIRMED';

    return (
        <WdrPageShell>
            <div className="wdr-payment wdr-payment--status">
                <div className="wdr-payment__inner">
                    <header className="wdr-payment__header">
                        <h1 className="wdr-payment__title">
                            Paiement en verification
                        </h1>
                        <p className="wdr-payment__subtitle">
                            Stripe vous a redirige vers Wandireo. La validation
                            definitive depend du webhook serveur.
                        </p>
                    </header>

                    <section className="wdr-payment__cash-panel">
                        {error ? (
                            <p className="wdr-payment__error" role="alert">
                                {error}
                            </p>
                        ) : null}

                        {!error && status === 'pending' ? (
                            <p className="wdr-payment__sync-note">
                                Verification du paiement en cours...
                            </p>
                        ) : null}

                        {!error && status === 'paid' ? (
                            <p className="wdr-payment__sync-note">
                                {isExternalPending
                                    ? "Paiement confirme. La reservation est encore en cours de validation et reste visible dans votre historique."
                                    : sessionStatus?.externalBookingReference
                                      ? 'Paiement et reservation confirmes. Votre reservation apparait maintenant dans votre historique.'
                                      : 'Paiement confirme. Votre reservation apparait maintenant dans votre historique.'}
                            </p>
                        ) : null}

                        {!error && status === 'failed' ? (
                            <p className="wdr-payment__error" role="alert">
                                Le paiement n'a pas ete valide.
                            </p>
                        ) : null}

                        {!error && status === 'refunded' ? (
                            <p className="wdr-payment__error" role="alert">
                                La reservation n'a pas pu etre finalisee. Le remboursement a ete enclenche.
                            </p>
                        ) : null}

                        {!error &&
                        sessionStatus?.externalBookingStatus === 'FAILED' &&
                        sessionStatus.externalErrorMessage ? (
                            <p className="wdr-payment__error" role="alert">
                                {sessionStatus.externalErrorMessage}
                            </p>
                        ) : null}

                        {bookingId ? (
                            <p className="wdr-payment__sync-note">
                                Reference reservation: <strong>{bookingId}</strong>
                            </p>
                        ) : null}

                        {sessionStatus?.externalBookingReference ? (
                            <p className="wdr-payment__sync-note">
                                Reference de validation:{" "}
                                <strong>
                                    {sessionStatus.externalBookingReference}
                                </strong>
                            </p>
                        ) : null}

                        <div className="wdr-payment__cash-actions">
                            <Button
                                variant="ghost"
                                onClick={() => navigate({ name: 'home' })}
                            >
                                Retour a l'accueil
                            </Button>
                            <Button
                                onClick={() =>
                                    navigate({ name: 'bookings-history' })
                                }
                            >
                                Voir mes reservations
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </WdrPageShell>
    );
}
