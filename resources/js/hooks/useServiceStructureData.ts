import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    serviceStructureApi,
    type ServiceAttributePayload,
    type ServiceCategoryPayload,
    type ServiceExtraPayload,
    type ServiceSubcategoryPayload,
} from '@/api/service-structure';

export function useServiceStructureData() {
    const query = useQuery({
        queryKey: ['service-structure'],
        queryFn: async () => serviceStructureApi.list(),
        staleTime: 60_000,
        retry: 1,
    });

    return {
        categories: query.data ?? [],
        isLoading: query.isLoading,
    };
}

function useInvalidateStructure() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ['service-structure'] });
        queryClient.invalidateQueries({ queryKey: ['services'] });
    };
}

export function useCreateServiceCategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (payload: ServiceCategoryPayload) =>
            serviceStructureApi.createCategory(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateServiceCategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<ServiceCategoryPayload>;
        }) => serviceStructureApi.updateCategory(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteServiceCategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (id: string) => serviceStructureApi.deleteCategory(id),
        onSuccess: invalidate,
    });
}

export function useCreateServiceSubcategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (payload: ServiceSubcategoryPayload) =>
            serviceStructureApi.createSubcategory(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateServiceSubcategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<ServiceSubcategoryPayload>;
        }) => serviceStructureApi.updateSubcategory(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteServiceSubcategoryData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (id: string) => serviceStructureApi.deleteSubcategory(id),
        onSuccess: invalidate,
    });
}

export function useCreateServiceAttributeData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (payload: ServiceAttributePayload) =>
            serviceStructureApi.createAttribute(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateServiceAttributeData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<ServiceAttributePayload>;
        }) => serviceStructureApi.updateAttribute(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteServiceAttributeData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (id: string) => serviceStructureApi.deleteAttribute(id),
        onSuccess: invalidate,
    });
}

export function useCreateServiceExtraData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (payload: ServiceExtraPayload) =>
            serviceStructureApi.createExtra(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateServiceExtraData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<ServiceExtraPayload>;
        }) => serviceStructureApi.updateExtra(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteServiceExtraData() {
    const invalidate = useInvalidateStructure();

    return useMutation({
        mutationFn: (id: string) => serviceStructureApi.deleteExtra(id),
        onSuccess: invalidate,
    });
}
