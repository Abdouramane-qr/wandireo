import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarSyncApi } from '@/api/calendarSync';

export function useCalendarSyncData(
    serviceId: string,
    enabled = true,
) {
    return useQuery({
        queryKey: ['calendar-sync', serviceId],
        queryFn: () => calendarSyncApi.get(serviceId),
        enabled: enabled && Boolean(serviceId),
        retry: 1,
        staleTime: 30_000,
    });
}

export function useSaveCalendarSyncData(serviceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { importUrl?: string }) =>
            calendarSyncApi.save(serviceId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['calendar-sync', serviceId],
            });
        },
    });
}

export function useRunCalendarSyncData(serviceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => calendarSyncApi.sync(serviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['calendar-sync', serviceId],
            });
            queryClient.invalidateQueries({
                queryKey: ['availability', serviceId],
            });
        },
    });
}
