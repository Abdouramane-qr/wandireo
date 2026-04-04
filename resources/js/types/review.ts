/**
 * @file review.ts
 * @description Type pour les avis clients sur les services Wandireo.
 */

export interface Review {
    id: string;
    /** Référence au ClientUser.id auteur de l'avis. */
    clientId: string;
    /** Référence au Service.id concerné. */
    serviceId: string;
    /** Note sur 5. Valeur entière entre 1 et 5 inclus. */
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    moderatedAt?: Date;
    moderatedBy?: string;
    createdAt: Date;
    authorName?: string;
    serviceTitle?: string;
    partnerName?: string;
}
