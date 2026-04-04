import React, { useEffect, useState } from 'react';
import { Button } from '@/components/wdr';
import { useBooking } from '@/context/BookingContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import './PaymentPage.css';

const PAYMENT_COPY = {
    fr: {
        steps: ['Panier', 'Informations', 'Confirmation'],
        title: 'Finaliser la réservation',
        subtitle:
            'Cette étape confirme la réservation et enregistre le montant validé par le serveur.',
        summaryTitle: 'Résumé de validation',
        traveler: 'Voyageur',
        service: 'Service',
        extras: 'Extras',
        total: 'Montant total',
        payLater: 'À régler plus tard',
        payNow: 'À payer maintenant',
        syncing: 'Vérification du montant avec le serveur...',
        syncError: 'Le montant n’a pas pu être revérifié avec le serveur.',
        submitError:
            'La réservation n’a pas pu être enregistrée. Veuillez réessayer.',
        back: 'Retour',
        confirming: 'Enregistrement...',
        verifying: 'Vérification...',
        confirm: 'Confirmer la réservation',
        order: 'Votre commande',
        customer: 'Voyageur',
        partnerPrice: 'Prix prestataire',
        serviceFee: 'Frais de service',
        totalVat: 'Total TTC',
    },
    en: {
        steps: ['Cart', 'Details', 'Confirmation'],
        title: 'Complete your booking',
        subtitle:
            'This step confirms the booking and saves the amount validated by the server.',
        summaryTitle: 'Validation summary',
        traveler: 'Traveller',
        service: 'Service',
        extras: 'Extras',
        total: 'Total amount',
        payLater: 'To be paid later',
        payNow: 'To pay now',
        syncing: 'Checking the amount with the server...',
        syncError: 'The amount could not be revalidated with the server.',
        submitError: 'The booking could not be saved. Please try again.',
        back: 'Back',
        confirming: 'Saving...',
        verifying: 'Checking...',
        confirm: 'Confirm booking',
        order: 'Your booking',
        customer: 'Traveller',
        partnerPrice: 'Provider price',
        serviceFee: 'Service fee',
        totalVat: 'Total incl. tax',
    },
    pt: {
        steps: ['Carrinho', 'Informações', 'Confirmação'],
        title: 'Finalizar a reserva',
        subtitle:
            'Este passo confirma a reserva e guarda o valor validado pelo servidor.',
        summaryTitle: 'Resumo de validação',
        traveler: 'Viajante',
        service: 'Serviço',
        extras: 'Extras',
        total: 'Montante total',
        payLater: 'A pagar mais tarde',
        payNow: 'A pagar agora',
        syncing: 'A verificar o valor com o servidor...',
        syncError: 'Não foi possível voltar a validar o valor com o servidor.',
        submitError:
            'Não foi possível registar a reserva. Tente novamente.',
        back: 'Voltar',
        confirming: 'A guardar...',
        verifying: 'A verificar...',
        confirm: 'Confirmar reserva',
        order: 'A sua reserva',
        customer: 'Viajante',
        partnerPrice: 'Preço do parceiro',
        serviceFee: 'Taxa de serviço',
        totalVat: 'Total com IVA',
    },
    es: {
        steps: ['Carrito', 'Información', 'Confirmación'],
        title: 'Finalizar la reserva',
        subtitle:
            'Este paso confirma la reserva y guarda el importe validado por el servidor.',
        summaryTitle: 'Resumen de validación',
        traveler: 'Viajero',
        service: 'Servicio',
        extras: 'Extras',
        total: 'Importe total',
        payLater: 'A pagar más tarde',
        payNow: 'A pagar ahora',
        syncing: 'Comprobando el importe con el servidor...',
        syncError: 'No se pudo volver a validar el importe con el servidor.',
        submitError:
            'No se pudo registrar la reserva. Inténtelo de nuevo.',
        back: 'Volver',
        confirming: 'Guardando...',
        verifying: 'Verificando...',
        confirm: 'Confirmar reserva',
        order: 'Su reserva',
        customer: 'Viajero',
        partnerPrice: 'Precio del proveedor',
        serviceFee: 'Gastos de servicio',
        totalVat: 'Total con impuestos',
    },
    it: {
        steps: ['Carrello', 'Informazioni', 'Conferma'],
        title: 'Completa la prenotazione',
        subtitle:
            'Questo passaggio conferma la prenotazione e salva l’importo validato dal server.',
        summaryTitle: 'Riepilogo di convalida',
        traveler: 'Viaggiatore',
        service: 'Servizio',
        extras: 'Extra',
        total: 'Importo totale',
        payLater: 'Da pagare più tardi',
        payNow: 'Da pagare ora',
        syncing: 'Verifica dell’importo con il server...',
        syncError: 'Impossibile verificare di nuovo l’importo con il server.',
        submitError:
            'Impossibile registrare la prenotazione. Riprova.',
        back: 'Indietro',
        confirming: 'Salvataggio...',
        verifying: 'Verifica...',
        confirm: 'Conferma prenotazione',
        order: 'La tua prenotazione',
        customer: 'Viaggiatore',
        partnerPrice: 'Prezzo del partner',
        serviceFee: 'Commissione di servizio',
        totalVat: 'Totale IVA inclusa',
    },
    de: {
        steps: ['Warenkorb', 'Informationen', 'Bestätigung'],
        title: 'Buchung abschließen',
        subtitle:
            'Dieser Schritt bestätigt die Buchung und speichert den vom Server validierten Betrag.',
        summaryTitle: 'Bestätigungsübersicht',
        traveler: 'Reisender',
        service: 'Service',
        extras: 'Extras',
        total: 'Gesamtbetrag',
        payLater: 'Später zu zahlen',
        payNow: 'Jetzt zu zahlen',
        syncing: 'Betrag wird mit dem Server geprüft...',
        syncError:
            'Der Betrag konnte nicht erneut mit dem Server geprüft werden.',
        submitError:
            'Die Buchung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.',
        back: 'Zurück',
        confirming: 'Speichern...',
        verifying: 'Prüfung...',
        confirm: 'Buchung bestätigen',
        order: 'Ihre Buchung',
        customer: 'Reisender',
        partnerPrice: 'Anbieterpreis',
        serviceFee: 'Servicegebühr',
        totalVat: 'Gesamt inkl. MwSt.',
    },
} as const;

export const PaymentPage: React.FC = () => {
    const { draft, travelerInfo, confirmPayment, syncDraftPricing } =
        useBooking();
    const { navigate } = useRouter();
    const { locale } = useTranslation();
    const copy = PAYMENT_COPY[locale];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!draft) {
            navigate({ name: 'home' });
            return;
        }

        if (!travelerInfo) {
            navigate({ name: 'checkout' });
        }
    }, [draft, travelerInfo, navigate]);

    useEffect(() => {
        if (!draft || !travelerInfo) {
            return;
        }

        let cancelled = false;

        void (async () => {
            setIsSyncing(true);
            setSubmitError('');

            try {
                await syncDraftPricing();
            } catch {
                if (!cancelled) {
                    setSubmitError(copy.syncError);
                }
            } finally {
                if (!cancelled) {
                    setIsSyncing(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        copy.syncError,
        draft?.dateFrom,
        draft?.dateTo,
        draft?.participants,
        draft?.paymentMode,
        draft?.selectedExtras,
        draft?.service.id,
        syncDraftPricing,
        travelerInfo,
    ]);

    if (!draft || !travelerInfo) {
        return null;
    }

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const bookingId = await confirmPayment();
            navigate({ name: 'confirmation', bookingId });
        } catch {
            setSubmitError(copy.submitError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="wdr-payment">
            <div className="wdr-payment__inner">
                <nav className="wdr-payment__steps" aria-label="Booking steps">
                    <ol className="wdr-payment__steps-list">
                        <li className="wdr-payment__step wdr-payment__step--done">
                            <button
                                type="button"
                                className="wdr-payment__step-btn"
                                onClick={() => navigate({ name: 'cart' })}
                            >
                                {copy.steps[0]}
                            </button>
                        </li>
                        <li className="wdr-payment__step wdr-payment__step--separator" aria-hidden="true">
                            &rsaquo;
                        </li>
                        <li className="wdr-payment__step wdr-payment__step--done">
                            <button
                                type="button"
                                className="wdr-payment__step-btn"
                                onClick={() => navigate({ name: 'checkout' })}
                            >
                                {copy.steps[1]}
                            </button>
                        </li>
                        <li className="wdr-payment__step wdr-payment__step--separator" aria-hidden="true">
                            &rsaquo;
                        </li>
                        <li className="wdr-payment__step wdr-payment__step--active" aria-current="step">
                            {copy.steps[2]}
                        </li>
                    </ol>
                </nav>

                <header className="wdr-payment__header">
                    <h1 className="wdr-payment__title">{copy.title}</h1>
                    <p className="wdr-payment__subtitle">{copy.subtitle}</p>
                </header>

                <div className="wdr-payment__layout">
                    <section className="wdr-payment__form-section" aria-label={copy.title}>
                        <div className="wdr-payment__cash-panel">
                            <div className="wdr-payment__cash-icon" aria-hidden="true">
                                &#128221;
                            </div>
                            <h2 className="wdr-payment__cash-title">
                                {copy.summaryTitle}
                            </h2>
                            <ul className="wdr-payment__cash-list">
                                <li>
                                    {copy.traveler}: {travelerInfo.firstName}{' '}
                                    {travelerInfo.lastName}
                                </li>
                                <li>Email: {travelerInfo.email}</li>
                                <li>{copy.service}: {draft.service.title}</li>
                                {draft.selectedExtras.length > 0 && (
                                    <li>
                                        {copy.extras}:{' '}
                                        {draft.selectedExtras
                                            .map((extra) => extra.name)
                                            .join(', ')}
                                    </li>
                                )}
                                <li>
                                    {copy.total}:{' '}
                                    {formatPrice(
                                        draft.clientTotal,
                                        draft.currency,
                                    )}
                                </li>
                                <li>
                                    {copy.payLater}:{' '}
                                    {formatPrice(
                                        draft.amountDueOnSite,
                                        draft.currency,
                                    )}
                                </li>
                                {draft.amountDueOnline > 0 && (
                                    <li>
                                        {copy.payNow}:{' '}
                                        {formatPrice(
                                            draft.amountDueOnline,
                                            draft.currency,
                                        )}
                                    </li>
                                )}
                            </ul>

                            {isSyncing ? (
                                <p className="wdr-payment__sync-note">
                                    {copy.syncing}
                                </p>
                            ) : null}

                            {submitError ? (
                                <p className="wdr-payment__error" role="alert">
                                    {submitError}
                                </p>
                            ) : null}

                            <div className="wdr-payment__cash-actions">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={() =>
                                        navigate({ name: 'checkout' })
                                    }
                                    disabled={isSubmitting}
                                >
                                    {copy.back}
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="lg"
                                    loading={isSubmitting || isSyncing}
                                    onClick={handleConfirm}
                                    disabled={isSyncing}
                                >
                                    {isSubmitting
                                        ? copy.confirming
                                        : isSyncing
                                          ? copy.verifying
                                          : copy.confirm}
                                </Button>
                            </div>
                        </div>
                    </section>

                    <aside className="wdr-payment__aside" aria-label={copy.order}>
                        <h3 className="wdr-payment__aside-title">{copy.order}</h3>
                        <div className="wdr-payment__aside-service">
                            <img
                                src={draft.service.images[0] ?? ''}
                                alt={draft.service.title}
                                className="wdr-payment__aside-img"
                                loading="lazy"
                            />
                            <p className="wdr-payment__aside-service-title">
                                {draft.service.title}
                            </p>
                        </div>
                        <div className="wdr-payment__aside-traveler">
                            <h4 className="wdr-payment__aside-traveler-title">
                                {copy.customer}
                            </h4>
                            <p className="wdr-payment__aside-traveler-name">
                                {travelerInfo.firstName} {travelerInfo.lastName}
                            </p>
                            <p className="wdr-payment__aside-traveler-email">
                                {travelerInfo.email}
                            </p>
                        </div>
                        <dl className="wdr-payment__aside-prices">
                            <div className="wdr-payment__aside-price-row">
                                <dt>{copy.partnerPrice}</dt>
                                <dd>{formatPrice(draft.partnerTotal, draft.currency)}</dd>
                            </div>
                            {draft.extrasTotal > 0 && (
                                <div className="wdr-payment__aside-price-row">
                                    <dt>{copy.extras}</dt>
                                    <dd>{formatPrice(draft.extrasTotal, draft.currency)}</dd>
                                </div>
                            )}
                            <div className="wdr-payment__aside-price-row">
                                <dt>{copy.serviceFee}</dt>
                                <dd>{formatPrice(draft.commissionTotal, draft.currency)}</dd>
                            </div>
                            <hr className="wdr-payment__aside-divider" aria-hidden="true" />
                            <div className="wdr-payment__aside-price-row wdr-payment__aside-price-row--total">
                                <dt>{copy.totalVat}</dt>
                                <dd>{formatPrice(draft.clientTotal, draft.currency)}</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
