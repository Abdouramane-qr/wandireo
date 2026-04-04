/**
 * @file user.ts
 * @description Définition des types et interfaces pour les utilisateurs de la plateforme Wandireo.
 */

export const UserRoleNames = {
    CLIENT: 'CLIENT',
    PARTNER: 'PARTNER',
    ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRoleNames)[keyof typeof UserRoleNames];

export const PartnerStatusNames = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
} as const;

export type PartnerStatus =
    (typeof PartnerStatusNames)[keyof typeof PartnerStatusNames];

export const MandateContractStatusNames = {
    NOT_SENT: 'NOT_SENT',
    PENDING_SIGNATURE: 'PENDING_SIGNATURE',
    SIGNED: 'SIGNED',
    REJECTED: 'REJECTED',
} as const;

export type MandateContractStatus =
    (typeof MandateContractStatusNames)[keyof typeof MandateContractStatusNames];

export interface BaseUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    phoneNumber?: string;
    language?: string;
    bookingsCount?: number;
    reviewsCount?: number;
}

/**
 * Interface pour le Client
 * Peut réserver des activités et services, puis laisser des avis.
 */
export interface ClientUser extends BaseUser {
    role: 'CLIENT';
    bookings: string[]; // IDs des réservations
    reviews: string[]; // IDs des avis laissés
    preferredCurrency?: string;
}

/**
 * Interface pour le Partenaire (Prestataire)
 * Gère ses activités, services, produits, ventes et disponibilités.
 */
export interface PartnerUser extends BaseUser {
    role: 'PARTNER';
    companyName: string;
    stripeConnectedAccountId?: string;
    businessAddress?: string;
    partnerStatus: PartnerStatus;
    partnerValidatedAt?: Date;
    partnerRejectionReason?: string;
    mandateContractStatus: MandateContractStatus;
    mandateContractFilePath?: string;
    mandateSignedAt?: Date;
    onboardingCompletedAt?: Date;
    activities: string[]; // IDs des activités/services proposés
    commissionRate: number; // Taux spécifique au partenaire
    totalSales: number;
}

/**
 * Interface pour l'Administrateur
 * Modération, gestion globale, configuration Stripe et Stripe Connect,
 * gestion des commissions, langues et localisations.
 */
export interface AdminUser extends BaseUser {
    role: 'ADMIN';
    permissions: string[];
    managedLanguages: string[];
    managedLocations: string[];
}

export type User = ClientUser | PartnerUser | AdminUser;
