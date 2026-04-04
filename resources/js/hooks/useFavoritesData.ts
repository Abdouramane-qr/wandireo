/**
 * @file useFavoritesData.ts
 * @description Couche de données favoris basée sur l'API Laravel.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { favoritesApi } from '@/api/favorites';
import type { Favorite } from '@/types/favorite';

export function useFavoritesData(clientId: string): {
    favorites: Favorite[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['favorites', clientId],
        queryFn: () => favoritesApi.list(),
        staleTime: 60_000,
        enabled: Boolean(clientId),
        retry: 1,
    });

    const favorites = useMemo<Favorite[]>(() => {
        if (query.data && Array.isArray(query.data)) {
            return query.data;
        }

        return [];
    }, [query.data]);

    return { favorites, isLoading: query.isLoading };
}

export function useToggleFavoriteData(serviceId: string, clientId: string) {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: () => favoritesApi.add(serviceId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['favorites', clientId],
            }),
    });

    const removeMutation = useMutation({
        mutationFn: () => favoritesApi.remove(serviceId),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['favorites', clientId],
            }),
    });

    return { addMutation, removeMutation };
}
