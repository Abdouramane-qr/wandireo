/**
 * @file favorites.ts
 * @description Endpoints des favoris client.
 */

import { normalizeFavorite } from '@/lib/api-normalizers';
import api from './client';

export const favoritesApi = {
    list: () =>
        api
            .get<unknown[]>('/favorites')
            .then((response) => response.data.map(normalizeFavorite)),

    add: (serviceId: string) =>
        api
            .post<unknown>('/favorites', { serviceId })
            .then((response) => normalizeFavorite(response.data)),

    remove: (serviceId: string) =>
        api.delete(`/favorites/${serviceId}`).then((r) => r.data),
};
