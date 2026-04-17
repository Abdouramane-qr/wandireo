/**
 * @file useServicesData.ts
 * @description Couche de donnees services basee sur l'API Laravel.
 */

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useMemo } from "react";
import { servicesApi } from "@/api/services";
import type { ServicesParams } from "@/api/services";
import type { Service } from "@/types/service";

interface UseServicesDataOptions {
    fetchAll?: boolean;
}

export function useServicesData(params?: ServicesParams): {
    services: Service[];
    isLoading: boolean;
    isApiActive: boolean;
} {
    return useServicesDataWithOptions(params);
}

export function useServicesDataWithOptions(
    params?: ServicesParams,
    options?: UseServicesDataOptions,
): {
    services: Service[];
    isLoading: boolean;
    isApiActive: boolean;
} {
    const query = useQuery({
        queryKey: [
            "services",
            "list",
            params ?? {},
            options?.fetchAll ?? false,
        ],
        queryFn: async () =>
            options?.fetchAll
                ? servicesApi.listAll(params)
                : servicesApi.list(params),
        staleTime: 60_000,
        retry: 1,
    });

    const services = useMemo<Service[]>(
        () => query.data?.data ?? [],
        [query.data],
    );

    return {
        services,
        isLoading: query.isLoading,
        isApiActive: !query.isError,
    };
}

export function useServiceData(id: string): {
    service: Service | undefined;
    isLoading: boolean;
    isError: boolean;
    error: AxiosError | null;
    isFetched: boolean;
    isNotFound: boolean;
} {
    const query = useQuery({
        queryKey: ["services", "detail", id],
        queryFn: async () => servicesApi.get(id),
        staleTime: 60_000,
        enabled: Boolean(id),
        retry: 1,
    });

    const error = (query.error as AxiosError | null) ?? null;

    return {
        service: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error,
        isFetched: query.isFetched,
        isNotFound: error?.response?.status === 404,
    };
}
