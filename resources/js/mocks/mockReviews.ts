/**
 * @file mockReviews.ts
 * @description Avis clients factices pour Wandireo.com.
 *
 * IDs clients référencés : client_001 (Alice Voyageuse), client_002 (John Doe)
 * IDs services référencés : act_001, act_002, act_003, boat_001, heb_001
 */

import type { Review } from '@/types/review';

export const mockReviews: Review[] = [
    {
        id: 'rev_201',
        clientId: 'client_001',
        serviceId: 'act_001',
        rating: 5,
        comment:
            'Expérience absolument magique ! La croisière de nuit sur la Seine avec les illuminations de la Tour Eiffel est inoubliable. Le guide était très cultivé et passionné. Je recommande vivement.',
        createdAt: new Date('2026-03-10'),
    },
    {
        id: 'rev_202',
        clientId: 'client_001',
        serviceId: 'boat_001',
        rating: 4,
        comment:
            'Belle journée en mer, le catamaran était en parfait état et le skipper très professionnel. Seul bémol : le départ a pris du retard. Sinon, tout était parfait.',
        createdAt: new Date('2026-02-28'),
    },
    {
        id: 'rev_203',
        clientId: 'client_002',
        serviceId: 'act_002',
        rating: 4,
        comment:
            'Super randonnée avec un moniteur expérimenté. Les paysages étaient à couper le souffle. Le niveau intermédiaire est bien adapté. Je reviendrai !',
        createdAt: new Date('2026-03-05'),
    },
    {
        id: 'rev_204',
        clientId: 'client_001',
        serviceId: 'act_003',
        rating: 5,
        comment:
            "L'observation des cétacés a dépassé toutes mes attentes. Nous avons vu des dauphins et un groupe de baleines à bosse ! L'équipe était passionnée et très pédagogue.",
        createdAt: new Date('2026-03-18'),
    },
    {
        id: 'rev_205',
        clientId: 'client_002',
        serviceId: 'heb_001',
        rating: 3,
        comment:
            'Hébergement correct, bien situé. La chambre était propre mais un peu petite. Le petit-déjeuner était bon. Le rapport qualité-prix reste acceptable pour la région.',
        createdAt: new Date('2026-03-01'),
    },
    {
        id: 'rev_206',
        clientId: 'client_002',
        serviceId: 'act_001',
        rating: 5,
        comment:
            'Une des meilleures soirées de mon séjour parisien. La vue depuis le pont est spectaculaire et le guide très agréable. À faire absolument !',
        createdAt: new Date('2026-03-22'),
    },
    {
        id: 'rev_207',
        clientId: 'client_001',
        serviceId: 'heb_001',
        rating: 4,
        comment:
            'Très bel établissement avec une vue imprenable. Le personnel est aux petits soins. Je recommande la chambre côté mer.',
        createdAt: new Date('2026-02-15'),
    },
];
