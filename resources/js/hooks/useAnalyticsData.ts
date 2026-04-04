import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export function useAnalyticsFunnelData(days = 30) {
    return useQuery({
        queryKey: ['analytics', 'funnel', days],
        queryFn: () => analyticsApi.funnel(days),
        staleTime: 60_000,
        retry: 1,
    });
}
