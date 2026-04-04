import {
    normalizeServiceAttribute,
    normalizeServiceCategory,
    normalizeServiceExtra,
    normalizeServiceSubcategory,
} from '@/lib/api-normalizers';
import type {
    ServiceAttributeDefinition,
    ServiceCategory,
    ServiceCategoryDefinition,
    ServiceExtraDefinition,
    ServiceSubcategoryDefinition,
} from '@/types/service';
import api from './client';

export interface ServiceCategoryPayload {
    serviceType: ServiceCategory;
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export interface ServiceSubcategoryPayload {
    serviceCategoryId: string;
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export interface ServiceAttributePayload {
    serviceCategoryId: string;
    label: string;
    key: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    isRequired?: boolean;
    isFilterable?: boolean;
    sortOrder?: number;
    options?: Array<{
        label: string;
        value: string;
        sortOrder?: number;
    }>;
}

export interface ServiceExtraPayload {
    serviceCategoryId: string;
    name: string;
    description?: string;
    defaultPrice?: number;
    inputType: 'CHECKBOX' | 'REQUIRED';
    isRequired?: boolean;
    isActive?: boolean;
    sortOrder?: number;
}

export const serviceStructureApi = {
    list: () =>
        api
            .get<{ data: unknown[] }>('/service-structure')
            .then((response) =>
                response.data.data.map(normalizeServiceCategory),
            ),

    createCategory: (payload: ServiceCategoryPayload) =>
        api
            .post<unknown>('/service-structure/categories', {
                service_type: payload.serviceType,
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceCategory(response.data)),

    updateCategory: (id: string, payload: Partial<ServiceCategoryPayload>) =>
        api
            .patch<unknown>(`/service-structure/categories/${id}`, {
                service_type: payload.serviceType,
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceCategory(response.data)),

    deleteCategory: (id: string) =>
        api.delete(`/service-structure/categories/${id}`).then((r) => r.data),

    createSubcategory: (payload: ServiceSubcategoryPayload) =>
        api
            .post<unknown>('/service-structure/subcategories', {
                service_category_id: payload.serviceCategoryId,
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceSubcategory(response.data)),

    updateSubcategory: (
        id: string,
        payload: Partial<ServiceSubcategoryPayload>,
    ) =>
        api
            .patch<unknown>(`/service-structure/subcategories/${id}`, {
                service_category_id: payload.serviceCategoryId,
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceSubcategory(response.data)),

    deleteSubcategory: (id: string) =>
        api
            .delete(`/service-structure/subcategories/${id}`)
            .then((r) => r.data),

    createAttribute: (payload: ServiceAttributePayload) =>
        api
            .post<unknown>('/service-structure/attributes', {
                service_category_id: payload.serviceCategoryId,
                label: payload.label,
                key: payload.key,
                type: payload.type,
                is_required: payload.isRequired,
                is_filterable: payload.isFilterable,
                sort_order: payload.sortOrder,
                options: payload.options?.map((option) => ({
                    label: option.label,
                    value: option.value,
                    sort_order: option.sortOrder,
                })),
            })
            .then((response) => normalizeServiceAttribute(response.data)),

    updateAttribute: (id: string, payload: Partial<ServiceAttributePayload>) =>
        api
            .patch<unknown>(`/service-structure/attributes/${id}`, {
                service_category_id: payload.serviceCategoryId,
                label: payload.label,
                key: payload.key,
                type: payload.type,
                is_required: payload.isRequired,
                is_filterable: payload.isFilterable,
                sort_order: payload.sortOrder,
                options: payload.options?.map((option) => ({
                    label: option.label,
                    value: option.value,
                    sort_order: option.sortOrder,
                })),
            })
            .then((response) => normalizeServiceAttribute(response.data)),

    deleteAttribute: (id: string) =>
        api.delete(`/service-structure/attributes/${id}`).then((r) => r.data),

    createExtra: (payload: ServiceExtraPayload) =>
        api
            .post<unknown>('/service-structure/extras', {
                service_category_id: payload.serviceCategoryId,
                name: payload.name,
                description: payload.description,
                default_price: payload.defaultPrice,
                input_type: payload.inputType,
                is_required: payload.isRequired,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceExtra(response.data)),

    updateExtra: (id: string, payload: Partial<ServiceExtraPayload>) =>
        api
            .patch<unknown>(`/service-structure/extras/${id}`, {
                service_category_id: payload.serviceCategoryId,
                name: payload.name,
                description: payload.description,
                default_price: payload.defaultPrice,
                input_type: payload.inputType,
                is_required: payload.isRequired,
                is_active: payload.isActive,
                sort_order: payload.sortOrder,
            })
            .then((response) => normalizeServiceExtra(response.data)),

    deleteExtra: (id: string) =>
        api.delete(`/service-structure/extras/${id}`).then((r) => r.data),
};

export type {
    ServiceAttributeDefinition,
    ServiceCategoryDefinition,
    ServiceExtraDefinition,
    ServiceSubcategoryDefinition,
};
