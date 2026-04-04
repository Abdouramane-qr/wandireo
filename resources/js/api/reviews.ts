/**
 * @file reviews.ts
 * @description Endpoints des avis clients.
 */

import { normalizeReview } from '@/lib/api-normalizers';
import api from './client';

export interface CreateReviewRequest {
    serviceId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
}

export interface AdminReviewsParams {
    q?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const reviewsApi = {
    list: (serviceId: string) =>
        api
            .get<unknown[]>('/reviews', { params: { serviceId } })
            .then((response) => response.data.map(normalizeReview)),

    create: (data: CreateReviewRequest) =>
        api
            .post<unknown>('/reviews', data)
            .then((response) => normalizeReview(response.data)),

    adminList: (params?: AdminReviewsParams) =>
        api
            .get<{ data: unknown[] }>('/admin-reviews', { params })
            .then((response) => response.data.data.map(normalizeReview)),

    adminUpdate: (
        id: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
    ) =>
        api
            .patch<unknown>(`/admin-reviews/${id}`, { status })
            .then((response) => normalizeReview(response.data)),

    adminDelete: (id: string) =>
        api.delete(`/admin-reviews/${id}`).then((response) => response.data),
};
