/**
 * @file availability.ts
 * @description Type pour les créneaux de disponibilité d'un service Wandireo.
 */

export interface TimeSlot {
    /** Heure de début, format "HH:MM". */
    startTime: string;
    /** Capacité maximale restante sur ce créneau. */
    maxCapacity: number;
}

export interface Availability {
    id: string;
    /** Référence au Service.id concerné. */
    serviceId: string;
    /** Date au format ISO 8601 "YYYY-MM-DD". */
    date: string;
    /** Créneaux horaires disponibles pour cette date. */
    slots: TimeSlot[];
}
