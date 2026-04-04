/**
 * @file mockFavorites.ts
 * @description Favoris clients factices pour Wandireo.com.
 *
 * 3 favoris pour client_001 (Alice Voyageuse).
 */

import type { Favorite } from '@/types/favorite';

export const mockFavorites: Favorite[] = [
    {
        id: 'fav_001',
        clientId: 'client_001',
        serviceId: 'act_001',
        addedAt: new Date('2026-03-05'),
    },
    {
        id: 'fav_002',
        clientId: 'client_001',
        serviceId: 'boat_001',
        addedAt: new Date('2026-03-12'),
    },
    {
        id: 'fav_003',
        clientId: 'client_001',
        serviceId: 'heb_001',
        addedAt: new Date('2026-03-20'),
    },
];
