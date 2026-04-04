/**
 * @file useBookingsData.ts
 * @description Couche de donnees reservations basee sur l'API Laravel.
 */

import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import type { Booking } from '@/types/booking';

export function useMyBookingsData(clientId: string): {
    bookings: Booking[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['bookings', 'mine', clientId],
        queryFn: async () => bookingsApi.mine(),
        staleTime: 30_000,
        retry: 1,
        enabled: Boolean(clientId),
    });

    return { bookings: query.data ?? [], isLoading: query.isLoading };
}

export function usePartnerBookingsData(partnerId: string): {
    bookings: Booking[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['bookings', 'partner', partnerId],
        queryFn: async () => bookingsApi.partnerIncoming(),
        staleTime: 30_000,
        retry: 1,
        enabled: Boolean(partnerId),
    });

    return { bookings: query.data ?? [], isLoading: query.isLoading };
}

export function useAdminBookingsData(): {
    bookings: Booking[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['bookings', 'admin'],
        queryFn: async () => {
            const response = await bookingsApi.adminList();

            return response.data;
        },
        staleTime: 30_000,
        retry: 1,
    });

    return { bookings: query.data ?? [], isLoading: query.isLoading };
}
