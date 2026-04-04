/**
 * @file mockAvailability.ts
 * @description Créneaux de disponibilité factices pour Wandireo.com.
 *
 * Couvre les 30 prochains jours à partir du 2026-03-30 pour 3 services :
 *   - act_001 : Croisière Privée en Seine (créneaux du soir)
 *   - act_003 : Observation des Cétacés (créneaux matinaux)
 *   - boat_001 : Location journée en mer (journées complètes)
 */

import type { Availability } from '@/types/availability';

export const mockAvailability: Availability[] = [
    // ── act_001 : Croisière Privée en Seine ────────────────────────────────────
    {
        id: 'avail_001',
        serviceId: 'act_001',
        date: '2026-04-01',
        slots: [
            { startTime: '20:00', maxCapacity: 8 },
            { startTime: '22:00', maxCapacity: 12 },
        ],
    },
    {
        id: 'avail_002',
        serviceId: 'act_001',
        date: '2026-04-03',
        slots: [
            { startTime: '20:00', maxCapacity: 12 },
            { startTime: '22:00', maxCapacity: 6 },
        ],
    },
    {
        id: 'avail_003',
        serviceId: 'act_001',
        date: '2026-04-05',
        slots: [
            { startTime: '20:00', maxCapacity: 12 },
            { startTime: '22:00', maxCapacity: 12 },
        ],
    },
    {
        id: 'avail_004',
        serviceId: 'act_001',
        date: '2026-04-08',
        slots: [
            { startTime: '20:30', maxCapacity: 10 },
            { startTime: '22:30', maxCapacity: 10 },
        ],
    },
    {
        id: 'avail_005',
        serviceId: 'act_001',
        date: '2026-04-12',
        slots: [{ startTime: '20:00', maxCapacity: 12 }],
    },
    {
        id: 'avail_006',
        serviceId: 'act_001',
        date: '2026-04-15',
        slots: [
            { startTime: '20:00', maxCapacity: 4 },
            { startTime: '22:00', maxCapacity: 12 },
        ],
    },
    {
        id: 'avail_007',
        serviceId: 'act_001',
        date: '2026-04-19',
        slots: [
            { startTime: '20:00', maxCapacity: 12 },
            { startTime: '22:00', maxCapacity: 8 },
        ],
    },
    {
        id: 'avail_008',
        serviceId: 'act_001',
        date: '2026-04-26',
        slots: [{ startTime: '20:30', maxCapacity: 12 }],
    },

    // ── act_003 : Observation des Cétacés ─────────────────────────────────────
    {
        id: 'avail_101',
        serviceId: 'act_003',
        date: '2026-04-02',
        slots: [{ startTime: '08:00', maxCapacity: 15 }],
    },
    {
        id: 'avail_102',
        serviceId: 'act_003',
        date: '2026-04-06',
        slots: [
            { startTime: '08:00', maxCapacity: 15 },
            { startTime: '13:00', maxCapacity: 10 },
        ],
    },
    {
        id: 'avail_103',
        serviceId: 'act_003',
        date: '2026-04-09',
        slots: [{ startTime: '08:00', maxCapacity: 12 }],
    },
    {
        id: 'avail_104',
        serviceId: 'act_003',
        date: '2026-04-13',
        slots: [
            { startTime: '08:00', maxCapacity: 15 },
            { startTime: '13:00', maxCapacity: 15 },
        ],
    },
    {
        id: 'avail_105',
        serviceId: 'act_003',
        date: '2026-04-16',
        slots: [{ startTime: '08:00', maxCapacity: 8 }],
    },
    {
        id: 'avail_106',
        serviceId: 'act_003',
        date: '2026-04-20',
        slots: [{ startTime: '08:00', maxCapacity: 15 }],
    },
    {
        id: 'avail_107',
        serviceId: 'act_003',
        date: '2026-04-23',
        slots: [
            { startTime: '08:00', maxCapacity: 15 },
            { startTime: '13:00', maxCapacity: 10 },
        ],
    },
    {
        id: 'avail_108',
        serviceId: 'act_003',
        date: '2026-04-27',
        slots: [{ startTime: '08:00', maxCapacity: 15 }],
    },

    // ── boat_001 : Location journée en mer ────────────────────────────────────
    {
        id: 'avail_201',
        serviceId: 'boat_001',
        date: '2026-04-04',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_202',
        serviceId: 'boat_001',
        date: '2026-04-07',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_203',
        serviceId: 'boat_001',
        date: '2026-04-11',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_204',
        serviceId: 'boat_001',
        date: '2026-04-14',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_205',
        serviceId: 'boat_001',
        date: '2026-04-18',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_206',
        serviceId: 'boat_001',
        date: '2026-04-21',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_207',
        serviceId: 'boat_001',
        date: '2026-04-25',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
    {
        id: 'avail_208',
        serviceId: 'boat_001',
        date: '2026-04-28',
        slots: [{ startTime: '09:00', maxCapacity: 1 }],
    },
];
