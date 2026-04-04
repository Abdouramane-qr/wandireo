import React, { useEffect } from 'react';
import { Button } from '@/components/wdr';
import { useBooking } from '@/context/BookingContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import { PaymentModeNames, ServiceCategoryLabels } from '@/types/service';
import './ConfirmationPage.css';

const CONFIRMATION_COPY = {
    fr: {
        empty: 'Aucune confirmation trouvée pour la référence',
        backHome: "Retour à l'accueil",
        title: 'Réservation confirmée !',
        subtitle:
            'Votre réservation a été enregistrée avec succès. Un récapitulatif sera envoyé à',
        reference: 'Référence',
        stay: 'Votre séjour',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        slot: 'Créneau',
        participants: 'Participants',
        participant: 'participant',
        participantsPlural: 'participants',
        nights: 'Nuits',
        days: 'Jours',
        traveler: 'Voyageur principal',
        fullName: 'Nom complet',
        email: 'E-mail',
        phone: 'Téléphone',
        nationality: 'Nationalité',
        requests: 'Demandes spéciales',
        paymentSummary: 'Récapitulatif du paiement',
        partnerPrice: 'Prix prestataire',
        serviceFee: 'Frais de service',
        total: 'Total TTC',
        paidOnline: 'Payé en ligne',
        payOnsite: 'À régler sur place',
        cashGuaranteed: 'Réservation garantie — Paiement sur place',
        commissionPaid: 'Commission réglée en ligne',
        paymentReceived: 'Paiement reçu',
        nextSteps: 'Prochaines étapes',
        next1Title: 'Confirmation par e-mail',
        next1Desc:
            'Un récapitulatif complet sera envoyé à votre adresse dans quelques minutes.',
        next2Title: 'Prise de contact du prestataire',
        next2Desc:
            'Le prestataire vous contactera sous 24 h pour finaliser les détails logistiques.',
        next3Title: 'Profitez de votre expérience',
        next3Desc: 'Il ne vous reste plus qu’à préparer vos bagages !',
        discoverMore: "Découvrir d'autres activités",
    },
    en: {
        empty: 'No confirmation found for reference',
        backHome: 'Back to home',
        title: 'Booking confirmed!',
        subtitle:
            'Your booking has been successfully recorded. A summary will be sent to',
        reference: 'Reference',
        stay: 'Your stay',
        startDate: 'Start date',
        endDate: 'End date',
        slot: 'Time slot',
        participants: 'Participants',
        participant: 'participant',
        participantsPlural: 'participants',
        nights: 'Nights',
        days: 'Days',
        traveler: 'Main traveller',
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone',
        nationality: 'Nationality',
        requests: 'Special requests',
        paymentSummary: 'Payment summary',
        partnerPrice: 'Provider price',
        serviceFee: 'Service fee',
        total: 'Total incl. tax',
        paidOnline: 'Paid online',
        payOnsite: 'To pay on site',
        cashGuaranteed: 'Booking guaranteed — Pay on site',
        commissionPaid: 'Commission paid online',
        paymentReceived: 'Payment received',
        nextSteps: 'Next steps',
        next1Title: 'Email confirmation',
        next1Desc:
            'A full summary will be sent to your email address within a few minutes.',
        next2Title: 'Provider follow-up',
        next2Desc:
            'The provider will contact you within 24 hours to finalise the logistics.',
        next3Title: 'Enjoy your experience',
        next3Desc: 'All that is left is to get ready for your trip.',
        discoverMore: 'Discover more activities',
    },
    pt: {
        empty: 'Nenhuma confirmação encontrada para a referência',
        backHome: 'Voltar ao início',
        title: 'Reserva confirmada!',
        subtitle:
            'A sua reserva foi registada com sucesso. Um resumo será enviado para',
        reference: 'Referência',
        stay: 'A sua estadia',
        startDate: 'Data de início',
        endDate: 'Data de fim',
        slot: 'Horário',
        participants: 'Participantes',
        participant: 'participante',
        participantsPlural: 'participantes',
        nights: 'Noites',
        days: 'Dias',
        traveler: 'Viajante principal',
        fullName: 'Nome completo',
        email: 'E-mail',
        phone: 'Telefone',
        nationality: 'Nacionalidade',
        requests: 'Pedidos especiais',
        paymentSummary: 'Resumo do pagamento',
        partnerPrice: 'Preço do parceiro',
        serviceFee: 'Taxa de serviço',
        total: 'Total com IVA',
        paidOnline: 'Pago online',
        payOnsite: 'A pagar no local',
        cashGuaranteed: 'Reserva garantida — Pagamento no local',
        commissionPaid: 'Comissão paga online',
        paymentReceived: 'Pagamento recebido',
        nextSteps: 'Próximos passos',
        next1Title: 'Confirmação por e-mail',
        next1Desc:
            'Um resumo completo será enviado para o seu e-mail dentro de alguns minutos.',
        next2Title: 'Contacto do parceiro',
        next2Desc:
            'O parceiro entrará em contacto consigo em 24 horas para finalizar os detalhes.',
        next3Title: 'Aproveite a experiência',
        next3Desc: 'Só falta preparar as malas.',
        discoverMore: 'Descobrir mais atividades',
    },
    es: {
        empty: 'No se encontró ninguna confirmación para la referencia',
        backHome: 'Volver al inicio',
        title: '¡Reserva confirmada!',
        subtitle:
            'Su reserva se ha registrado correctamente. Se enviará un resumen a',
        reference: 'Referencia',
        stay: 'Su estancia',
        startDate: 'Fecha de inicio',
        endDate: 'Fecha de fin',
        slot: 'Horario',
        participants: 'Participantes',
        participant: 'participante',
        participantsPlural: 'participantes',
        nights: 'Noches',
        days: 'Días',
        traveler: 'Viajero principal',
        fullName: 'Nombre completo',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        nationality: 'Nacionalidad',
        requests: 'Solicitudes especiales',
        paymentSummary: 'Resumen del pago',
        partnerPrice: 'Precio del proveedor',
        serviceFee: 'Gastos de servicio',
        total: 'Total con impuestos',
        paidOnline: 'Pagado online',
        payOnsite: 'A pagar en el lugar',
        cashGuaranteed: 'Reserva garantizada — Pago en el lugar',
        commissionPaid: 'Comisión pagada online',
        paymentReceived: 'Pago recibido',
        nextSteps: 'Próximos pasos',
        next1Title: 'Confirmación por correo',
        next1Desc:
            'Se enviará un resumen completo a su correo electrónico en unos minutos.',
        next2Title: 'Contacto del proveedor',
        next2Desc:
            'El proveedor se pondrá en contacto con usted en 24 horas para finalizar la logística.',
        next3Title: 'Disfrute de la experiencia',
        next3Desc: 'Solo queda preparar las maletas.',
        discoverMore: 'Descubrir más actividades',
    },
    it: {
        empty: 'Nessuna conferma trovata per il riferimento',
        backHome: 'Torna alla home',
        title: 'Prenotazione confermata!',
        subtitle:
            'La tua prenotazione è stata registrata con successo. Un riepilogo sarà inviato a',
        reference: 'Riferimento',
        stay: 'Il tuo soggiorno',
        startDate: 'Data di inizio',
        endDate: 'Data di fine',
        slot: 'Fascia oraria',
        participants: 'Partecipanti',
        participant: 'partecipante',
        participantsPlural: 'partecipanti',
        nights: 'Notti',
        days: 'Giorni',
        traveler: 'Viaggiatore principale',
        fullName: 'Nome completo',
        email: 'E-mail',
        phone: 'Telefono',
        nationality: 'Nazionalità',
        requests: 'Richieste speciali',
        paymentSummary: 'Riepilogo del pagamento',
        partnerPrice: 'Prezzo del partner',
        serviceFee: 'Commissione di servizio',
        total: 'Totale IVA inclusa',
        paidOnline: 'Pagato online',
        payOnsite: 'Da pagare sul posto',
        cashGuaranteed: 'Prenotazione garantita — Pagamento sul posto',
        commissionPaid: 'Commissione pagata online',
        paymentReceived: 'Pagamento ricevuto',
        nextSteps: 'Prossimi passi',
        next1Title: 'Conferma via e-mail',
        next1Desc:
            'Un riepilogo completo sarà inviato al tuo indirizzo e-mail entro pochi minuti.',
        next2Title: 'Contatto del partner',
        next2Desc:
            'Il partner ti contatterà entro 24 ore per definire i dettagli logistici.',
        next3Title: 'Goditi l’esperienza',
        next3Desc: 'Non resta che preparare i bagagli.',
        discoverMore: 'Scopri altre attività',
    },
    de: {
        empty: 'Keine Bestätigung für die Referenz gefunden',
        backHome: 'Zur Startseite',
        title: 'Buchung bestätigt!',
        subtitle:
            'Ihre Buchung wurde erfolgreich registriert. Eine Zusammenfassung wird gesendet an',
        reference: 'Referenz',
        stay: 'Ihr Aufenthalt',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        slot: 'Zeitfenster',
        participants: 'Teilnehmer',
        participant: 'Teilnehmer',
        participantsPlural: 'Teilnehmer',
        nights: 'Nächte',
        days: 'Tage',
        traveler: 'Hauptreisender',
        fullName: 'Vollständiger Name',
        email: 'E-Mail',
        phone: 'Telefon',
        nationality: 'Nationalität',
        requests: 'Besondere Wünsche',
        paymentSummary: 'Zahlungsübersicht',
        partnerPrice: 'Anbieterpreis',
        serviceFee: 'Servicegebühr',
        total: 'Gesamt inkl. MwSt.',
        paidOnline: 'Online bezahlt',
        payOnsite: 'Vor Ort zu zahlen',
        cashGuaranteed: 'Buchung garantiert — Zahlung vor Ort',
        commissionPaid: 'Provision online bezahlt',
        paymentReceived: 'Zahlung erhalten',
        nextSteps: 'Nächste Schritte',
        next1Title: 'E-Mail-Bestätigung',
        next1Desc:
            'Eine vollständige Zusammenfassung wird innerhalb weniger Minuten an Ihre E-Mail-Adresse gesendet.',
        next2Title: 'Kontakt durch den Anbieter',
        next2Desc:
            'Der Anbieter wird Sie innerhalb von 24 Stunden kontaktieren, um die Details abzustimmen.',
        next3Title: 'Genießen Sie Ihr Erlebnis',
        next3Desc: 'Jetzt müssen Sie nur noch Ihre Koffer packen.',
        discoverMore: 'Weitere Aktivitäten entdecken',
    },
} as const;

const CheckCircleIcon: React.FC = () => (
    <svg
        className="wdr-confirm__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UserIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

function formatDateLong(isoDate: string, locale: string): string {
    return new Date(isoDate).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

interface ConfirmationPageProps {
    bookingId: string;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
    bookingId,
}) => {
    const { confirmedBooking, draft, travelerInfo, clearBooking } =
        useBooking();
    const { navigate } = useRouter();
    const { locale, intlLocale } = useTranslation();
    const copy = CONFIRMATION_COPY[locale];

    useEffect(() => {
        return () => {};
    }, []);

    if (!confirmedBooking || !draft || !travelerInfo) {
        return (
            <div className="wdr-confirm wdr-confirm--empty">
                <div className="wdr-confirm__empty-box">
                    <p>
                        {copy.empty} <strong>{bookingId}</strong>.
                    </p>
                    <Button onClick={() => navigate({ name: 'home' })}>
                        {copy.backHome}
                    </Button>
                </div>
            </div>
        );
    }

    const { service } = draft;

    const handleGoHome = () => {
        clearBooking();
        navigate({ name: 'home' });
    };

    const handleSearchMore = () => {
        clearBooking();
        navigate({
            name: 'search',
            query: '',
            category: '',
            dateFrom: '',
            dateTo: '',
        });
    };

    return (
        <div className="wdr-confirm">
            <div className="wdr-confirm__inner">
                <section className="wdr-confirm__hero" aria-label={copy.title}>
                    <CheckCircleIcon />
                    <h1 className="wdr-confirm__hero-title">{copy.title}</h1>
                    <p className="wdr-confirm__hero-subtitle">
                        {copy.subtitle}{' '}
                        <strong className="wdr-confirm__hero-email">
                            {travelerInfo.email}
                        </strong>
                        .
                    </p>
                    <div className="wdr-confirm__reference" aria-label={copy.reference}>
                        <span className="wdr-confirm__reference-label">
                            {copy.reference}
                        </span>
                        <code className="wdr-confirm__reference-code">
                            {confirmedBooking.id}
                        </code>
                    </div>
                </section>

                <div className="wdr-confirm__layout">
                    <section className="wdr-confirm__details" aria-label={copy.stay}>
                        <div className="wdr-confirm__service-card">
                            <img
                                src={service.images[0] ?? ''}
                                alt={service.title}
                                className="wdr-confirm__service-img"
                                loading="lazy"
                            />
                            <div className="wdr-confirm__service-info">
                                <span className="wdr-confirm__service-category">
                                    {ServiceCategoryLabels[service.category]}
                                </span>
                                <h2 className="wdr-confirm__service-title">
                                    {service.title}
                                </h2>
                                <p className="wdr-confirm__service-location">
                                    {service.location.city}, {service.location.country}
                                </p>
                            </div>
                        </div>

                        <div className="wdr-confirm__info-block">
                            <h3 className="wdr-confirm__block-title">
                                <CalendarIcon />
                                {copy.stay}
                            </h3>
                            <dl className="wdr-confirm__info-grid">
                                <div className="wdr-confirm__info-row">
                                    <dt>{copy.startDate}</dt>
                                    <dd>{formatDateLong(draft.dateFrom, intlLocale)}</dd>
                                </div>
                                {draft.dateTo && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{copy.endDate}</dt>
                                        <dd>{formatDateLong(draft.dateTo, intlLocale)}</dd>
                                    </div>
                                )}
                                {draft.timeSlot && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{copy.slot}</dt>
                                        <dd>{draft.timeSlot}</dd>
                                    </div>
                                )}
                                {service.category === 'ACTIVITE' ? (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{copy.participants}</dt>
                                        <dd>
                                            {draft.participants}{' '}
                                            {draft.participants > 1
                                                ? copy.participantsPlural
                                                : copy.participant}
                                        </dd>
                                    </div>
                                ) : (
                                    <div className="wdr-confirm__info-row">
                                        <dt>
                                            {service.category === 'HEBERGEMENT'
                                                ? copy.nights
                                                : copy.days}
                                        </dt>
                                        <dd>{draft.units}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="wdr-confirm__info-block">
                            <h3 className="wdr-confirm__block-title">
                                <UserIcon />
                                {copy.traveler}
                            </h3>
                            <dl className="wdr-confirm__info-grid">
                                <div className="wdr-confirm__info-row">
                                    <dt>{copy.fullName}</dt>
                                    <dd>{travelerInfo.firstName} {travelerInfo.lastName}</dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{copy.email}</dt>
                                    <dd>{travelerInfo.email}</dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{copy.phone}</dt>
                                    <dd>{travelerInfo.phone}</dd>
                                </div>
                                <div className="wdr-confirm__info-row">
                                    <dt>{copy.nationality}</dt>
                                    <dd>{travelerInfo.nationality}</dd>
                                </div>
                                {travelerInfo.specialRequests && (
                                    <div className="wdr-confirm__info-row">
                                        <dt>{copy.requests}</dt>
                                        <dd>{travelerInfo.specialRequests}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </section>

                    <aside className="wdr-confirm__aside" aria-label={copy.paymentSummary}>
                        <div className="wdr-confirm__price-card">
                            <h3 className="wdr-confirm__price-title">
                                {copy.paymentSummary}
                            </h3>
                            <dl className="wdr-confirm__price-breakdown">
                                <div className="wdr-confirm__price-row">
                                    <dt>{copy.partnerPrice}</dt>
                                    <dd>{formatPrice(draft.partnerTotal, draft.currency)}</dd>
                                </div>
                                <div className="wdr-confirm__price-row">
                                    <dt>
                                        {copy.serviceFee}
                                        <span className="wdr-confirm__price-meta">
                                            ({Math.round(service.commissionRate * 100)}%)
                                        </span>
                                    </dt>
                                    <dd>{formatPrice(draft.commissionTotal, draft.currency)}</dd>
                                </div>
                                <hr className="wdr-confirm__price-divider" aria-hidden="true" />
                                <div className="wdr-confirm__price-row wdr-confirm__price-row--total">
                                    <dt>{copy.total}</dt>
                                    <dd>{formatPrice(draft.clientTotal, draft.currency)}</dd>
                                </div>
                                {draft.paymentMode !== PaymentModeNames.FULL_CASH_ON_SITE && (
                                    <>
                                        <hr className="wdr-confirm__price-divider wdr-confirm__price-divider--light" aria-hidden="true" />
                                        <div className="wdr-confirm__price-row wdr-confirm__price-row--online">
                                            <dt>{copy.paidOnline}</dt>
                                            <dd>{formatPrice(draft.amountDueOnline, draft.currency)}</dd>
                                        </div>
                                    </>
                                )}
                                {draft.amountDueOnSite > 0 && (
                                    <div className="wdr-confirm__price-row wdr-confirm__price-row--onsite">
                                        <dt>{copy.payOnsite}</dt>
                                        <dd>{formatPrice(draft.amountDueOnSite, draft.currency)}</dd>
                                    </div>
                                )}
                            </dl>

                            {draft.paymentMode === PaymentModeNames.FULL_CASH_ON_SITE ? (
                                <div className="wdr-confirm__paid-badge wdr-confirm__paid-badge--cash">
                                    {copy.cashGuaranteed}
                                </div>
                            ) : (
                                <div className="wdr-confirm__paid-badge">
                                    {draft.paymentMode ===
                                    PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE
                                        ? copy.commissionPaid
                                        : copy.paymentReceived}
                                </div>
                            )}
                        </div>

                        <div className="wdr-confirm__next-steps">
                            <h3 className="wdr-confirm__next-title">{copy.nextSteps}</h3>
                            <ol className="wdr-confirm__next-list">
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">1</span>
                                    <div>
                                        <strong>{copy.next1Title}</strong>
                                        <p>{copy.next1Desc}</p>
                                    </div>
                                </li>
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">2</span>
                                    <div>
                                        <strong>{copy.next2Title}</strong>
                                        <p>{copy.next2Desc}</p>
                                    </div>
                                </li>
                                <li className="wdr-confirm__next-item">
                                    <span className="wdr-confirm__next-num">3</span>
                                    <div>
                                        <strong>{copy.next3Title}</strong>
                                        <p>{copy.next3Desc}</p>
                                    </div>
                                </li>
                            </ol>
                        </div>

                        <div className="wdr-confirm__actions">
                            <Button variant="primary" size="lg" fullWidth onClick={handleGoHome}>
                                {copy.backHome}
                            </Button>
                            <Button
                                variant="secondary"
                                size="md"
                                fullWidth
                                onClick={handleSearchMore}
                                className="wdr-confirm__search-btn"
                            >
                                {copy.discoverMore}
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};
