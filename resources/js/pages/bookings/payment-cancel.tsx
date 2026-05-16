import { usePage } from '@inertiajs/react';
import { Button } from '@/components/wdr';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { useRouter } from '@/hooks/useWdrRouter';
import '@/pages/wdr-pages/PaymentPage/PaymentPage.css';

type PaymentCancelProps = Record<string, unknown> & {
    bookingId?: string;
};

export default function PaymentCancel() {
    const { bookingId } = usePage<PaymentCancelProps>().props;
    const { navigate } = useRouter();

    return (
        <WdrPageShell>
            <div className="wdr-payment wdr-payment--status">
                <div className="wdr-payment__inner">
                    <header className="wdr-payment__header">
                        <h1 className="wdr-payment__title">Paiement annule</h1>
                        <p className="wdr-payment__subtitle">
                            Aucun paiement n'a ete confirme. Si un checkout
                            provisoire existe encore, il sera expire
                            automatiquement par le serveur.
                        </p>
                    </header>

                    <section className="wdr-payment__cash-panel">
                        {bookingId ? (
                            <p className="wdr-payment__sync-note">
                                Reference reservation: <strong>{bookingId}</strong>
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
