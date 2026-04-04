import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicePricingApi } from '@/api/servicePricing';
import type { ServicePricingRulePayload } from '@/types/pricing-rule';

export function useServicePricingRulesData(serviceId: string, enabled = true) {
    return useQuery({
        queryKey: ['services', serviceId, 'pricing-rules'],
        queryFn: () => servicePricingApi.list(serviceId),
        enabled: enabled && Boolean(serviceId),
        staleTime: 30_000,
    });
}

export function useCreateServicePricingRuleData(serviceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ServicePricingRulePayload) =>
            servicePricingApi.create(serviceId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['services', serviceId, 'pricing-rules'],
            });
        },
    });
}

export function useDeleteServicePricingRuleData(serviceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ruleId: string) => servicePricingApi.remove(serviceId, ruleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['services', serviceId, 'pricing-rules'],
            });
        },
    });
}
