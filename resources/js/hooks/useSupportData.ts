import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/api/support';
import type { SupportParams, SupportStatus, SupportPriority } from '@/types/support';

export function useSupportTicketsData(params: SupportParams = {}) {
    return useQuery({
        queryKey: ['support', 'tickets', params],
        queryFn: () => supportApi.list(params),
    });
}

export function useUpdateSupportTicketData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: { status?: SupportStatus; priority?: SupportPriority } }) =>
            supportApi.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
        },
    });
}

export function useCreateSupportTicketData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            subject: string;
            message: string;
            status?: SupportStatus;
            priority?: SupportPriority;
        }) => supportApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
        },
    });
}
