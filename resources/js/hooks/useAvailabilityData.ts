/**
 * @file useAvailabilityData.ts
 * @description Couche de données disponibilités basée sur l'API Laravel.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { availabilityApi } from '@/api/availability';
import type { Availability } from '@/types/availability';

export function useAvailabilityData(serviceId: string): {
    availabilities: Availability[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['availability', serviceId],
        queryFn: () => availabilityApi.list(serviceId),
        staleTime: 30_000,
        enabled: Boolean(serviceId),
        retry: 1,
    });

    const availabilities = useMemo<Availability[]>(() => {
        if (query.data && Array.isArray(query.data)) {
            return query.data;
        }

        return [];
    }, [query.data]);

    return { availabilities, isLoading: query.isLoading };
}
