/**
 * @file useReviewsData.ts
 * @description Couche de données avis basée sur l'API Laravel.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reviewsApi, type AdminReviewsParams } from '@/api/reviews';
import type { Review } from '@/types/review';

export function useReviewsData(serviceId: string): {
    reviews: Review[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['reviews', serviceId],
        queryFn: () => reviewsApi.list(serviceId),
        staleTime: 60_000,
        enabled: Boolean(serviceId),
        retry: 1,
    });

    const reviews = useMemo<Review[]>(() => {
        if (query.data && Array.isArray(query.data)) {
            return query.data;
        }

        return [];
    }, [query.data]);

    return { reviews, isLoading: query.isLoading };
}

export function useAdminReviewsData(params?: AdminReviewsParams): {
    reviews: Review[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['reviews', 'admin', params ?? {}],
        queryFn: () => reviewsApi.adminList(params),
        staleTime: 30_000,
        retry: 1,
    });

    return { reviews: query.data ?? [], isLoading: query.isLoading };
}

export function useAdminReviewModerationData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
        }) => reviewsApi.adminUpdate(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}

export function useAdminDeleteReviewData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reviewsApi.adminDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}
