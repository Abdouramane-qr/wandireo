/**
 * @file favorite.ts
 * @description Type pour les favoris clients sur Wandireo.
 */

export interface Favorite {
    id: string;
    /** Référence au ClientUser.id propriétaire du favori. */
    clientId: string;
    /** Référence au Service.id mis en favori. */
    serviceId: string;
    addedAt: Date;
}
