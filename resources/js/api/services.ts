/**
 * @file services.ts
 * @description Endpoints du catalogue de services.
 */

import { normalizeService } from "@/lib/api-normalizers";
import type { Locale } from "@/lib/locale";
import type { Service, ServiceCategory } from "@/types/service";
import api from "./client";

export type LocalizedTextInput = string | Partial<Record<Locale, string>>;

export interface ServicesParams {
    category?: ServiceCategory;
    sourceType?: "LOCAL" | "EXTERNAL";
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    destination?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: "rating_desc" | "price_asc" | "price_desc" | "relevance";
    page?: number;
    limit?: number;
    partnerId?: string;
    adminAll?: boolean;
}

export interface ServicesResponse {
    data: Service[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ServiceUpsertPayload {
    partner_id?: string;
    title: LocalizedTextInput;
    description: LocalizedTextInput;
    category: ServiceCategory;
    service_category_id?: string;
    service_subcategory_id?: string;
    location_city: string;
    location_country: string;
    location_region?: string;
    partner_price: number;
    pricing_unit: string;
    payment_mode: string;
    booking_mode?: "INSTANT" | "REQUEST" | "EXTERNAL_REDIRECT";
    featured?: boolean;
    video_url?: string;
    tags?: string[];
    images?: string[];
    is_available?: boolean;
    extra_data?: Record<string, unknown>;
}

export const servicesApi = {
    list: (params?: ServicesParams) =>
        api
            .get<{
                data: unknown[];
                total: number;
                current_page: number;
                per_page: number;
                last_page: number;
            }>("/services", { params })
            .then((r) => ({
                data: r.data.data.map(normalizeService),
                total: r.data.total,
                page: r.data.current_page,
                limit: r.data.per_page,
                totalPages: r.data.last_page,
            })),

    listAll: async (params?: ServicesParams) => {
        const firstPage = await servicesApi.list({
            ...params,
            page: 1,
            limit: params?.limit ?? 100,
        });

        if (firstPage.totalPages <= 1) {
            return firstPage;
        }

        const remainingPages = await Promise.all(
            Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
                servicesApi.list({
                    ...params,
                    page: index + 2,
                    limit: firstPage.limit,
                }),
            ),
        );

        return {
            data: [firstPage, ...remainingPages].flatMap((page) => page.data),
            total: firstPage.total,
            page: 1,
            limit: firstPage.total,
            totalPages: 1,
        };
    },

    get: (id: string) =>
        api
            .get<unknown>(`/services/${id}`)
            .then((r) => normalizeService(r.data)),

    create: (data: ServiceUpsertPayload) =>
        api
            .post<unknown>("/services", data)
            .then((r) => normalizeService(r.data)),

    update: (id: string, data: Partial<ServiceUpsertPayload>) =>
        api
            .patch<unknown>(`/services/${id}`, data)
            .then((r) => normalizeService(r.data)),

    delete: (id: string) => api.delete(`/services/${id}`).then((r) => r.data),

    toggleAvailability: (id: string, isAvailable: boolean) =>
        api
            .patch<{
                isAvailable: boolean;
            }>(`/services/${id}/toggle-availability`, { isAvailable })
            .then((r) => r.data),
};
