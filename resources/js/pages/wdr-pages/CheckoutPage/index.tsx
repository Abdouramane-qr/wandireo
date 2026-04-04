import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/components/wdr';
import { useBooking } from '@/context/BookingContext';
import type { TravelerInfo } from '@/context/BookingContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import './CheckoutPage.css';

type FormErrors = Partial<Record<keyof TravelerInfo, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CHECKOUT_COPY = {
    fr: {
        steps: ['Panier', 'Informations', 'Paiement', 'Confirmation'],
        title: 'Informations voyageur',
        subtitle:
            'Ces informations seront transmises au prestataire pour constituer votre dossier.',
        identity: 'Identité',
        contact: 'Coordonnées de contact',
        specialRequests: 'Demandes spéciales',
        optional: 'optionnel',
        firstName: 'Prénom',
        lastName: 'Nom',
        nationality: 'Nationalité',
        nationalityPlaceholder: 'Ex. : Française, Belge, Suisse...',
        email: 'Adresse e-mail',
        emailPlaceholder: 'votre@email.com',
        emailHint:
            'La confirmation de réservation sera envoyée à cette adresse.',
        phone: 'Téléphone',
        phonePlaceholder: '+33 6 12 34 56 78',
        phoneHint: 'Utile en cas d’imprévu le jour de l’activité.',
        messageLabel: 'Message au prestataire',
        messagePlaceholder:
            'Allergies, handicap, anniversaire, préférences particulières...',
        back: 'Retour au panier',
        continue: 'Continuer — Paiement',
        order: 'Votre commande',
        partnerPrice: 'Prix prestataire',
        extras: 'Extras',
        serviceFee: 'Frais de service',
        total: 'Total TTC',
        errors: {
            firstName: 'Le prénom est obligatoire.',
            lastName: 'Le nom est obligatoire.',
            emailRequired: "L'adresse e-mail est obligatoire.",
            emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
            phone: 'Le numéro de téléphone est obligatoire.',
            nationality: 'La nationalité est obligatoire.',
        },
    },
    en: {
        steps: ['Cart', 'Details', 'Payment', 'Confirmation'],
        title: 'Traveller information',
        subtitle:
            'These details will be shared with the provider to prepare your booking.',
        identity: 'Identity',
        contact: 'Contact details',
        specialRequests: 'Special requests',
        optional: 'optional',
        firstName: 'First name',
        lastName: 'Last name',
        nationality: 'Nationality',
        nationalityPlaceholder: 'e.g. French, Belgian, Swiss...',
        email: 'Email address',
        emailPlaceholder: 'your@email.com',
        emailHint: 'Your booking confirmation will be sent to this address.',
        phone: 'Phone number',
        phonePlaceholder: '+33 6 12 34 56 78',
        phoneHint: 'Useful if anything changes on the day of the activity.',
        messageLabel: 'Message to the provider',
        messagePlaceholder:
            'Allergies, accessibility, birthday, special preferences...',
        back: 'Back to cart',
        continue: 'Continue — Payment',
        order: 'Your booking',
        partnerPrice: 'Provider price',
        extras: 'Extras',
        serviceFee: 'Service fee',
        total: 'Total incl. tax',
        errors: {
            firstName: 'First name is required.',
            lastName: 'Last name is required.',
            emailRequired: 'Email address is required.',
            emailInvalid: 'Please enter a valid email address.',
            phone: 'Phone number is required.',
            nationality: 'Nationality is required.',
        },
    },
    pt: {
        steps: ['Carrinho', 'Informações', 'Pagamento', 'Confirmação'],
        title: 'Informações do viajante',
        subtitle:
            'Estas informações serão enviadas ao parceiro para preparar a sua reserva.',
        identity: 'Identidade',
        contact: 'Contacto',
        specialRequests: 'Pedidos especiais',
        optional: 'opcional',
        firstName: 'Nome',
        lastName: 'Apelido',
        nationality: 'Nacionalidade',
        nationalityPlaceholder: 'Ex.: Francesa, Belga, Suíça...',
        email: 'E-mail',
        emailPlaceholder: 'o.seu@email.com',
        emailHint: 'A confirmação da reserva será enviada para este endereço.',
        phone: 'Telefone',
        phonePlaceholder: '+351 912 345 678',
        phoneHint: 'Útil em caso de imprevisto no dia da atividade.',
        messageLabel: 'Mensagem ao parceiro',
        messagePlaceholder:
            'Alergias, acessibilidade, aniversário, preferências especiais...',
        back: 'Voltar ao carrinho',
        continue: 'Continuar — Pagamento',
        order: 'A sua reserva',
        partnerPrice: 'Preço do parceiro',
        extras: 'Extras',
        serviceFee: 'Taxa de serviço',
        total: 'Total com IVA',
        errors: {
            firstName: 'O nome é obrigatório.',
            lastName: 'O apelido é obrigatório.',
            emailRequired: 'O e-mail é obrigatório.',
            emailInvalid: 'Introduza um e-mail válido.',
            phone: 'O telefone é obrigatório.',
            nationality: 'A nacionalidade é obrigatória.',
        },
    },
    es: {
        steps: ['Carrito', 'Información', 'Pago', 'Confirmación'],
        title: 'Información del viajero',
        subtitle:
            'Estos datos se compartirán con el proveedor para preparar su reserva.',
        identity: 'Identidad',
        contact: 'Datos de contacto',
        specialRequests: 'Solicitudes especiales',
        optional: 'opcional',
        firstName: 'Nombre',
        lastName: 'Apellido',
        nationality: 'Nacionalidad',
        nationalityPlaceholder: 'Ej.: Francesa, Belga, Suiza...',
        email: 'Correo electrónico',
        emailPlaceholder: 'su@email.com',
        emailHint:
            'La confirmación de la reserva se enviará a esta dirección.',
        phone: 'Teléfono',
        phonePlaceholder: '+34 612 345 678',
        phoneHint: 'Útil en caso de imprevisto el día de la actividad.',
        messageLabel: 'Mensaje al proveedor',
        messagePlaceholder:
            'Alergias, accesibilidad, cumpleaños, preferencias especiales...',
        back: 'Volver al carrito',
        continue: 'Continuar — Pago',
        order: 'Su reserva',
        partnerPrice: 'Precio del proveedor',
        extras: 'Extras',
        serviceFee: 'Gastos de servicio',
        total: 'Total con impuestos',
        errors: {
            firstName: 'El nombre es obligatorio.',
            lastName: 'El apellido es obligatorio.',
            emailRequired: 'El correo electrónico es obligatorio.',
            emailInvalid: 'Introduzca un correo electrónico válido.',
            phone: 'El teléfono es obligatorio.',
            nationality: 'La nacionalidad es obligatoria.',
        },
    },
    it: {
        steps: ['Carrello', 'Informazioni', 'Pagamento', 'Conferma'],
        title: 'Informazioni del viaggiatore',
        subtitle:
            'Questi dati saranno condivisi con il partner per preparare la prenotazione.',
        identity: 'Identità',
        contact: 'Contatti',
        specialRequests: 'Richieste speciali',
        optional: 'facoltativo',
        firstName: 'Nome',
        lastName: 'Cognome',
        nationality: 'Nazionalità',
        nationalityPlaceholder: 'Es.: Francese, Belga, Svizzera...',
        email: 'Indirizzo e-mail',
        emailPlaceholder: 'tuo@email.com',
        emailHint:
            'La conferma della prenotazione sarà inviata a questo indirizzo.',
        phone: 'Telefono',
        phonePlaceholder: '+39 312 345 6789',
        phoneHint: 'Utile in caso di imprevisti il giorno dell’attività.',
        messageLabel: 'Messaggio al partner',
        messagePlaceholder:
            'Allergie, accessibilità, compleanno, preferenze particolari...',
        back: 'Torna al carrello',
        continue: 'Continua — Pagamento',
        order: 'La tua prenotazione',
        partnerPrice: 'Prezzo del partner',
        extras: 'Extra',
        serviceFee: 'Commissione di servizio',
        total: 'Totale IVA inclusa',
        errors: {
            firstName: 'Il nome è obbligatorio.',
            lastName: 'Il cognome è obbligatorio.',
            emailRequired: "L'indirizzo e-mail è obbligatorio.",
            emailInvalid: 'Inserisci un indirizzo e-mail valido.',
            phone: 'Il telefono è obbligatorio.',
            nationality: 'La nazionalità è obbligatoria.',
        },
    },
    de: {
        steps: ['Warenkorb', 'Informationen', 'Zahlung', 'Bestätigung'],
        title: 'Reisendeninformationen',
        subtitle:
            'Diese Angaben werden an den Anbieter übermittelt, um Ihre Buchung vorzubereiten.',
        identity: 'Identität',
        contact: 'Kontaktdaten',
        specialRequests: 'Besondere Wünsche',
        optional: 'optional',
        firstName: 'Vorname',
        lastName: 'Nachname',
        nationality: 'Nationalität',
        nationalityPlaceholder:
            'z. B. Französisch, Belgisch, Schweizerisch...',
        email: 'E-Mail-Adresse',
        emailPlaceholder: 'ihre@email.de',
        emailHint:
            'Die Buchungsbestätigung wird an diese Adresse gesendet.',
        phone: 'Telefon',
        phonePlaceholder: '+49 151 234 56789',
        phoneHint:
            'Hilfreich bei kurzfristigen Änderungen am Aktivitätstag.',
        messageLabel: 'Nachricht an den Anbieter',
        messagePlaceholder:
            'Allergien, Barrierefreiheit, Geburtstag, besondere Wünsche...',
        back: 'Zurück zum Warenkorb',
        continue: 'Weiter — Zahlung',
        order: 'Ihre Buchung',
        partnerPrice: 'Anbieterpreis',
        extras: 'Extras',
        serviceFee: 'Servicegebühr',
        total: 'Gesamt inkl. MwSt.',
        errors: {
            firstName: 'Der Vorname ist erforderlich.',
            lastName: 'Der Nachname ist erforderlich.',
            emailRequired: 'Die E-Mail-Adresse ist erforderlich.',
            emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            phone: 'Die Telefonnummer ist erforderlich.',
            nationality: 'Die Nationalität ist erforderlich.',
        },
    },
} as const;

function validate(values: TravelerInfo, locale: keyof typeof CHECKOUT_COPY) {
    const copy = CHECKOUT_COPY[locale];
    const errors: FormErrors = {};

    if (!values.firstName.trim()) {
        errors.firstName = copy.errors.firstName;
    }

    if (!values.lastName.trim()) {
        errors.lastName = copy.errors.lastName;
    }

    if (!values.email.trim()) {
        errors.email = copy.errors.emailRequired;
    } else if (!EMAIL_RE.test(values.email)) {
        errors.email = copy.errors.emailInvalid;
    }

    if (!values.phone.trim()) {
        errors.phone = copy.errors.phone;
    }

    if (!values.nationality.trim()) {
        errors.nationality = copy.errors.nationality;
    }

    return errors;
}

export const CheckoutPage: React.FC = () => {
    const { draft, travelerInfo, saveTravelerInfo } = useBooking();
    const { navigate } = useRouter();
    const { locale } = useTranslation();
    const copy = CHECKOUT_COPY[locale];
    const [values, setValues] = useState<TravelerInfo>(
        travelerInfo ?? {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            nationality: '',
            specialRequests: '',
        },
    );
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (!draft) {
            navigate({ name: 'home' });
        }
    }, [draft, navigate]);

    if (!draft) {
        return null;
    }

    const handleChange = (field: keyof TravelerInfo, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate(values, locale);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstErrorKey = Object.keys(validationErrors)[0];
            document.getElementById(`checkout-${firstErrorKey}`)?.focus();
            return;
        }

        saveTravelerInfo(values);
        navigate({ name: 'payment' });
    };

    const { service } = draft;

    return (
        <div className="wdr-checkout">
            <div className="wdr-checkout__inner">
                <nav
                    className="wdr-checkout__steps"
                    aria-label="Booking steps"
                >
                    <ol className="wdr-checkout__steps-list">
                        <li className="wdr-checkout__step wdr-checkout__step--done">
                            <button
                                type="button"
                                className="wdr-checkout__step-btn"
                                onClick={() => navigate({ name: 'cart' })}
                            >
                                {copy.steps[0]}
                            </button>
                        </li>
                        <li className="wdr-checkout__step wdr-checkout__step--separator" aria-hidden="true">
                            &rsaquo;
                        </li>
                        <li className="wdr-checkout__step wdr-checkout__step--active" aria-current="step">
                            {copy.steps[1]}
                        </li>
                        <li className="wdr-checkout__step wdr-checkout__step--separator" aria-hidden="true">
                            &rsaquo;
                        </li>
                        <li className="wdr-checkout__step">{copy.steps[2]}</li>
                        <li className="wdr-checkout__step wdr-checkout__step--separator" aria-hidden="true">
                            &rsaquo;
                        </li>
                        <li className="wdr-checkout__step">{copy.steps[3]}</li>
                    </ol>
                </nav>

                <header className="wdr-checkout__header">
                    <h1 className="wdr-checkout__title">{copy.title}</h1>
                    <p className="wdr-checkout__subtitle">{copy.subtitle}</p>
                </header>

                <div className="wdr-checkout__layout">
                    <section className="wdr-checkout__form-section" aria-label={copy.title}>
                        <form
                            id="checkout-form"
                            className="wdr-checkout__form"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">{copy.identity}</legend>
                                <div className="wdr-checkout__row">
                                    <Input
                                        id="checkout-firstName"
                                        label={copy.firstName}
                                        required
                                        autoComplete="given-name"
                                        value={values.firstName}
                                        error={errors.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                    />
                                    <Input
                                        id="checkout-lastName"
                                        label={copy.lastName}
                                        required
                                        autoComplete="family-name"
                                        value={values.lastName}
                                        error={errors.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                    />
                                </div>

                                <Input
                                    id="checkout-nationality"
                                    label={copy.nationality}
                                    required
                                    autoComplete="country-name"
                                    placeholder={copy.nationalityPlaceholder}
                                    value={values.nationality}
                                    error={errors.nationality}
                                    onChange={(e) => handleChange('nationality', e.target.value)}
                                />
                            </fieldset>

                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">{copy.contact}</legend>
                                <Input
                                    id="checkout-email"
                                    label={copy.email}
                                    type="email"
                                    required
                                    autoComplete="email"
                                    placeholder={copy.emailPlaceholder}
                                    value={values.email}
                                    error={errors.email}
                                    hint={copy.emailHint}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                                <Input
                                    id="checkout-phone"
                                    label={copy.phone}
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    placeholder={copy.phonePlaceholder}
                                    value={values.phone}
                                    error={errors.phone}
                                    hint={copy.phoneHint}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </fieldset>

                            <fieldset className="wdr-checkout__fieldset">
                                <legend className="wdr-checkout__legend">
                                    {copy.specialRequests} ({copy.optional})
                                </legend>
                                <div className="wdr-checkout__field">
                                    <label
                                        htmlFor="checkout-specialRequests"
                                        className="wdr-checkout__label"
                                    >
                                        {copy.messageLabel}
                                    </label>
                                    <textarea
                                        id="checkout-specialRequests"
                                        className="wdr-checkout__textarea"
                                        rows={4}
                                        placeholder={copy.messagePlaceholder}
                                        value={values.specialRequests}
                                        onChange={(e) =>
                                            handleChange(
                                                'specialRequests',
                                                e.target.value,
                                            )
                                        }
                                        maxLength={500}
                                    />
                                    <p className="wdr-checkout__counter" aria-live="polite">
                                        {values.specialRequests.length} / 500
                                    </p>
                                </div>
                            </fieldset>

                            <div className="wdr-checkout__actions">
                                <Button type="button" variant="ghost" size="md" onClick={() => navigate({ name: 'cart' })}>
                                    {copy.back}
                                </Button>
                                <Button type="submit" variant="primary" size="lg">
                                    {copy.continue}
                                </Button>
                            </div>
                        </form>
                    </section>

                    <aside className="wdr-checkout__aside" aria-label={copy.order}>
                        <h3 className="wdr-checkout__aside-title">{copy.order}</h3>
                        <div className="wdr-checkout__aside-service">
                            <img
                                src={service.images[0] ?? ''}
                                alt={service.title}
                                className="wdr-checkout__aside-img"
                                loading="lazy"
                            />
                            <p className="wdr-checkout__aside-service-title">
                                {service.title}
                            </p>
                        </div>

                        <dl className="wdr-checkout__aside-prices">
                            <div className="wdr-checkout__aside-price-row">
                                <dt>{copy.partnerPrice}</dt>
                                <dd>{formatPrice(draft.partnerTotal, draft.currency)}</dd>
                            </div>
                            {draft.extrasTotal > 0 && (
                                <div className="wdr-checkout__aside-price-row">
                                    <dt>{copy.extras}</dt>
                                    <dd>{formatPrice(draft.extrasTotal, draft.currency)}</dd>
                                </div>
                            )}
                            <div className="wdr-checkout__aside-price-row">
                                <dt>{copy.serviceFee}</dt>
                                <dd>{formatPrice(draft.commissionTotal, draft.currency)}</dd>
                            </div>
                            <hr className="wdr-checkout__aside-divider" aria-hidden="true" />
                            <div className="wdr-checkout__aside-price-row wdr-checkout__aside-price-row--total">
                                <dt>{copy.total}</dt>
                                <dd>{formatPrice(draft.clientTotal, draft.currency)}</dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            </div>
        </div>
    );
};
