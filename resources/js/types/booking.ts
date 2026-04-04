/**
 * @file booking.ts
 * @description Définition des types et interfaces pour les réservations de la plateforme Wandireo.
 *
 * Modèle de données centré sur la transaction entre un Client,
 * un Partenaire et un Service (activité, hébergement, transport...).
 */

import type { PaymentMode } from './service';
import type { ServiceExtraInputType } from './service';

// ---------------------------------------------------------------------------
// Statut de la réservation
// ---------------------------------------------------------------------------

/**
 * Représente le cycle de vie complet d'une réservation.
 *
 * Flux standard : PENDING -> CONFIRMED
 * Flux d'annulation : PENDING | CONFIRMED -> CANCELLED
 */
export const BookingStatusNames = {
    /** En attente de confirmation par le partenaire ou de paiement du client. */
    PENDING: 'PENDING',
    /** Réservation validée par le partenaire et paiement accepté. */
    CONFIRMED: 'CONFIRMED',
    /** Réservation annulée (par le client ou le partenaire). */
    CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus =
    (typeof BookingStatusNames)[keyof typeof BookingStatusNames];

// ---------------------------------------------------------------------------
// Statut du paiement
// ---------------------------------------------------------------------------

/**
 * Représente l'état du flux financier associé à une réservation.
 *
 * PENDING  : Aucun paiement capturé (ex. : réservation en attente ou pré-autorisation).
 * PAID     : Montant total capturé via Stripe.
 * REFUNDED : Remboursement émis à la suite d'une annulation éligible.
 */
export const PaymentStatusNames = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus =
    (typeof PaymentStatusNames)[keyof typeof PaymentStatusNames];

// ---------------------------------------------------------------------------
// Interface principale : Booking
// ---------------------------------------------------------------------------

export interface Booking {
    /** Identifiant unique de la réservation. Format : 'book_XXX'. */
    id: string;

    /** Référence vers l'utilisateur ClientUser (mockUsers.ts -> ClientUser.id). */
    clientId: string;

    /** Référence vers l'utilisateur PartnerUser (mockUsers.ts -> PartnerUser.id). */
    partnerId: string;

    /**
     * Référence vers le service réservé.
     * Correspond à un identifiant du catalogue (mockServices.ts -> Activity.id).
     */
    serviceId: string;

    /** Statut actuel de la réservation dans son cycle de vie. */
    status: BookingStatus;

    /** Statut du paiement associé à cette réservation. */
    paymentStatus: PaymentStatus;

    /** Date de début de l'activité ou du séjour. */
    startDate: Date;

    /** Date de fin (optionnelle pour les activités sur plusieurs jours). */
    endDate?: Date;

    /** Nombre de participants inclus dans cette réservation. */
    participants: number;

    /** Prix unitaire par participant en devise locale, hors commission. */
    unitPrice: number;

    /**
     * Prix total facturé au client.
     * Calcul : unitPrice * participants.
     * Toute logique de remise ou de supplément est appliquée avant stockage.
     */
    totalPrice: number;

    /** Code ISO 4217 de la devise (ex. 'EUR', 'USD'). */
    currency: string;

    /**
     * Identifiant de l'intent de paiement Stripe (optionnel en phase mock).
     * Sera renseigné lors de l'intégration avec l'API Stripe.
     */
    stripePaymentIntentId?: string;

    /** Mode de paiement configure pour ce service par le prestataire. */
    paymentMode: PaymentMode;

    selectedExtras?: Array<{
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
        totalPrice: number;
        inputType: ServiceExtraInputType;
    }>;

    extrasTotal?: number;

    /**
     * Montant effectivement preleve en ligne lors de la reservation.
     * Equals clientTotal for FULL_ONLINE, commissionTotal for COMMISSION_ONLINE_REST_ON_SITE,
     * 0 for FULL_CASH_ON_SITE.
     */
    amountPaidOnline: number;

    /** Notes libres transmises par le client lors de la réservation. */
    notes?: string;

    /**
     * Motif de l'annulation.
     * Doit être renseigné uniquement lorsque status === 'CANCELLED'.
     */
    cancellationReason?: string;

    /** Date de création de la réservation. */
    createdAt: Date;

    /** Date de la dernière mise à jour du statut ou des informations. */
    updatedAt: Date;
}
