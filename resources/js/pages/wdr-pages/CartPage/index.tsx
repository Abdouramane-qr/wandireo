/**
 * @file pages/CartPage/index.tsx
 * @description Panier / Recapitulatif — Etape 1 du tunnel de reservation Wandireo.
 *
 * Affiche :
 *   - La vignette et les informations du service selectionne
 *   - Le detail de la selection (dates, creneau, participants)
 *   - La decomposition transparente du prix :
 *       Prix prestataire + Frais de service Wandireo = Total TTC
 *   - Le CTA pour progresser vers la saisie des informations voyageur
 */

import React from 'react';
import { Button } from '@/components/wdr';
import { useBooking  } from '@/context/BookingContext';
import type {BookingDraft} from '@/context/BookingContext';
import { useRouter } from '@/hooks/useWdrRouter';
import { formatPrice } from '@/lib/formatters';
import {
    ServiceCategoryLabels,
    PaymentModeLabels,
    PaymentModeDescriptions,
    PaymentModeNames,
} from '@/types/service';
import './CartPage.css';

// ============================================================
// Helpers locaux
// ============================================================

/**
 * Libelle de la quantite selon la categorie de service.
 * Exemples : "2 participants", "3 jours", "5 nuits"
 */
function buildQuantityLabel(draft: BookingDraft): string {
    const { service, units, participants } = draft;

    switch (service.category) {
        case 'ACTIVITE':
            return participants > 1
                ? `${participants} participants`
                : '1 participant';
        case 'HEBERGEMENT':
            return units > 1 ? `${units} nuits` : '1 nuit';
        case 'BATEAU':
        case 'VOITURE':
        default:
            return units > 1 ? `${units} jours` : '1 jour';
    }
}

/**
 * Formate une date ISO YYYY-MM-DD en libelle long francais.
 * Exemple : "2026-06-15" -> "15 juin 2026"
 */
function formatDateLong(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// ============================================================
// Icone de localisation (SVG inline, sans dependance externe)
// ============================================================

const LocationIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

// ============================================================
// Icone bouclier securite
// ============================================================

const ShieldIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// ============================================================
// Etat vide : aucun brouillon de reservation
// ============================================================

const EmptyCart: React.FC = () => {
    const { navigate } = useRouter();

    return (
        <div className="wdr-cart wdr-cart--empty">
            <div className="wdr-cart__empty-box">
                <p className="wdr-cart__empty-message">
                    Aucune reservation en cours. Veuillez selectionner un
                    service depuis le catalogue.
                </p>
                <Button onClick={() => navigate({ name: 'home' })}>
                    Retourner au catalogue
                </Button>
            </div>
        </div>
    );
};

// ============================================================
// Composant principal : CartPage
// ============================================================

export const CartPage: React.FC = () => {
    const { draft } = useBooking();
    const { navigate } = useRouter();

    // Acces direct par URL sans brouillon : renvoie vers l'accueil
    if (!draft) {
return <EmptyCart />;
}

    const { service } = draft;
    const thumbnail = service.images[0] ?? '';
    const quantityLabel = buildQuantityLabel(draft);
    const commissionPercent = Math.round(service.commissionRate * 100);

    return (
        <div className="wdr-cart">
            <div className="wdr-cart__inner">
                {/* Fil d'Ariane des etapes */}
                <nav
                    className="wdr-cart__steps"
                    aria-label="Etapes de reservation"
                >
                    <ol className="wdr-cart__steps-list">
                        <li
                            className="wdr-cart__step wdr-cart__step--active"
                            aria-current="step"
                        >
                            Panier
                        </li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-cart__step">Informations</li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-cart__step">Paiement</li>
                        <li
                            className="wdr-cart__step wdr-cart__step--separator"
                            aria-hidden="true"
                        >
                            &rsaquo;
                        </li>
                        <li className="wdr-cart__step">Confirmation</li>
                    </ol>
                </nav>

                {/* Titre de la page */}
                <header className="wdr-cart__header">
                    <h1 className="wdr-cart__title">Votre panier</h1>
                    <p className="wdr-cart__subtitle">
                        Verifiez votre selection avant de saisir vos
                        informations.
                    </p>
                </header>

                <div className="wdr-cart__layout">
                    {/* --- Colonne gauche : recap du service --- */}
                    <section
                        className="wdr-cart__service"
                        aria-label="Service selectionne"
                    >
                        <div className="wdr-cart__service-card">
                            <img
                                src={thumbnail}
                                alt={service.title}
                                className="wdr-cart__service-img"
                                loading="lazy"
                            />

                            <div className="wdr-cart__service-info">
                                <span className="wdr-cart__service-category">
                                    {ServiceCategoryLabels[service.category]}
                                </span>

                                <h2 className="wdr-cart__service-title">
                                    {service.title}
                                </h2>

                                <p className="wdr-cart__service-location">
                                    <LocationIcon />
                                    {service.location.city},{' '}
                                    {service.location.country}
                                </p>

                                {/* Notation si disponible */}
                                {service.rating !== undefined && (
                                    <div className="wdr-cart__service-rating">
                                        <span
                                            className="wdr-cart__service-star"
                                            aria-hidden="true"
                                        >
                                            &#9733;
                                        </span>
                                        <strong>
                                            {service.rating.toFixed(1)}
                                        </strong>
                                        <span className="wdr-cart__service-reviews">
                                            ({service.reviewCount} avis)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail de la selection */}
                        <div className="wdr-cart__selection">
                            <h3 className="wdr-cart__selection-title">
                                Votre selection
                            </h3>
                            <dl className="wdr-cart__selection-grid">
                                <div className="wdr-cart__selection-row">
                                    <dt>Date{draft.dateTo ? 's' : ''}</dt>
                                    <dd>
                                        {formatDateLong(draft.dateFrom)}
                                        {draft.dateTo && (
                                            <>
                                                {' '}
                                                &rarr;{' '}
                                                {formatDateLong(draft.dateTo)}
                                            </>
                                        )}
                                    </dd>
                                </div>

                                {draft.timeSlot && (
                                    <div className="wdr-cart__selection-row">
                                        <dt>Creneau</dt>
                                        <dd>{draft.timeSlot}</dd>
                                    </div>
                                )}

                                <div className="wdr-cart__selection-row">
                                    <dt>Quantite</dt>
                                    <dd>{quantityLabel}</dd>
                                </div>

                                <div className="wdr-cart__selection-row">
                                    <dt>Destination</dt>
                                    <dd>
                                        {service.location.city},{' '}
                                        {service.location.country}
                                    </dd>
                                </div>

                                {draft.selectedExtras.length > 0 && (
                                    <div className="wdr-cart__selection-row">
                                        <dt>Extras</dt>
                                        <dd>
                                            {draft.selectedExtras
                                                .map((extra) => extra.name)
                                                .join(', ')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </section>

                    {/* --- Colonne droite : decomposition des prix + CTA --- */}
                    <aside
                        className="wdr-cart__summary"
                        aria-label="Recapitulatif et prix"
                    >
                        <h3 className="wdr-cart__summary-title">
                            Detail du prix
                        </h3>

                        {/* Badge mode de paiement */}
                        <div
                            className={`wdr-cart__payment-mode-badge wdr-cart__payment-mode-badge--${draft.paymentMode.toLowerCase().replace(/_/g, '-')}`}
                            title={PaymentModeDescriptions[draft.paymentMode]}
                        >
                            {PaymentModeLabels[draft.paymentMode]}
                        </div>

                        <dl className="wdr-cart__price-breakdown">
                            {draft.paymentMode ===
                            PaymentModeNames.FULL_CASH_ON_SITE ? (
                                /* Mode : tout sur place — pas de paiement en ligne */
                                <>
                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Prix prestataire
                                            <span className="wdr-cart__price-meta">
                                                ({quantityLabel})
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.partnerTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    {draft.extrasTotal > 0 && (
                                        <div className="wdr-cart__price-row">
                                            <dt className="wdr-cart__price-label">
                                                Extras
                                            </dt>
                                            <dd className="wdr-cart__price-value">
                                                {formatPrice(
                                                    draft.extrasTotal,
                                                    draft.currency,
                                                )}
                                            </dd>
                                        </div>
                                    )}

                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Frais de service Wandireo
                                            <span className="wdr-cart__price-meta">
                                                ({commissionPercent}%)
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.commissionTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <hr
                                        className="wdr-cart__price-divider"
                                        aria-hidden="true"
                                    />

                                    <div className="wdr-cart__price-row wdr-cart__price-row--total">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--total">
                                            A regler sur place
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--total">
                                            {formatPrice(
                                                draft.clientTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--now">
                                            Montant du maintenant
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--now">
                                            0 &euro; (gratuit)
                                        </dd>
                                    </div>
                                </>
                            ) : draft.paymentMode ===
                              PaymentModeNames.COMMISSION_ONLINE_REST_ON_SITE ? (
                                /* Mode : commission en ligne, reste sur place */
                                <>
                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Prix prestataire
                                            <span className="wdr-cart__price-meta">
                                                ({quantityLabel})
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.partnerTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    {draft.extrasTotal > 0 && (
                                        <div className="wdr-cart__price-row">
                                            <dt className="wdr-cart__price-label">
                                                Extras
                                            </dt>
                                            <dd className="wdr-cart__price-value">
                                                {formatPrice(
                                                    draft.extrasTotal,
                                                    draft.currency,
                                                )}
                                            </dd>
                                        </div>
                                    )}

                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Frais de service Wandireo
                                            <span className="wdr-cart__price-meta">
                                                ({commissionPercent}%)
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.commissionTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <hr
                                        className="wdr-cart__price-divider"
                                        aria-hidden="true"
                                    />

                                    <div className="wdr-cart__price-row wdr-cart__price-row--total">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--total">
                                            Total TTC
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--total">
                                            {formatPrice(
                                                draft.clientTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <hr
                                        className="wdr-cart__price-divider wdr-cart__price-divider--light"
                                        aria-hidden="true"
                                    />

                                    <div className="wdr-cart__price-row wdr-cart__price-row--now">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--now">
                                            A payer maintenant (en ligne)
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--now">
                                            {formatPrice(
                                                draft.amountDueOnline,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <div className="wdr-cart__price-row wdr-cart__price-row--onsite">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--onsite">
                                            A regler sur place
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--onsite">
                                            {formatPrice(
                                                draft.amountDueOnSite,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>
                                </>
                            ) : (
                                /* Mode : paiement integral en ligne (FULL_ONLINE) */
                                <>
                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Prix prestataire
                                            <span className="wdr-cart__price-meta">
                                                ({quantityLabel})
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.partnerTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    {draft.extrasTotal > 0 && (
                                        <div className="wdr-cart__price-row">
                                            <dt className="wdr-cart__price-label">
                                                Extras
                                            </dt>
                                            <dd className="wdr-cart__price-value">
                                                {formatPrice(
                                                    draft.extrasTotal,
                                                    draft.currency,
                                                )}
                                            </dd>
                                        </div>
                                    )}

                                    <div className="wdr-cart__price-row">
                                        <dt className="wdr-cart__price-label">
                                            Frais de service Wandireo
                                            <span className="wdr-cart__price-meta">
                                                ({commissionPercent}%)
                                            </span>
                                        </dt>
                                        <dd className="wdr-cart__price-value">
                                            {formatPrice(
                                                draft.commissionTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>

                                    <hr
                                        className="wdr-cart__price-divider"
                                        aria-hidden="true"
                                    />

                                    <div className="wdr-cart__price-row wdr-cart__price-row--total">
                                        <dt className="wdr-cart__price-label wdr-cart__price-label--total">
                                            Total TTC
                                        </dt>
                                        <dd className="wdr-cart__price-value wdr-cart__price-value--total">
                                            {formatPrice(
                                                draft.clientTotal,
                                                draft.currency,
                                            )}
                                        </dd>
                                    </div>
                                </>
                            )}
                        </dl>

                        {/* Mention securite */}
                        <p className="wdr-cart__secure-note">
                            <ShieldIcon />
                            {draft.paymentMode ===
                            PaymentModeNames.FULL_CASH_ON_SITE
                                ? 'Réservation garantie. Paiement sur place en espèces.'
                                : 'Paiement 100% sécurisé. Confirmation immédiate.'}
                        </p>

                        {/* CTA principal */}
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate({ name: 'checkout' })}
                        >
                            Continuer — Mes informations
                        </Button>

                        {/* Retour a la fiche service */}
                        <Button
                            variant="ghost"
                            size="md"
                            fullWidth
                            onClick={() =>
                                navigate({ name: 'service', id: service.id })
                            }
                            className="wdr-cart__back-btn"
                        >
                            Modifier la selection
                        </Button>
                    </aside>
                </div>
            </div>
        </div>
    );
};
