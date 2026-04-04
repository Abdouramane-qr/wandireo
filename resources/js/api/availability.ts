/**
 * @file availability.ts
 * @description Endpoints des disponibilités de services.
 */

import { normalizeAvailability } from '@/lib/api-normalizers';
import api from './client';

export const availabilityApi = {
    /** Retourne les créneaux disponibles pour un service sur les 30 prochains jours. */
    list: (serviceId: string) =>
        api
            .get<unknown[]>('/availability', { params: { serviceId } })
            .then((response) => response.data.map(normalizeAvailability)),
};
