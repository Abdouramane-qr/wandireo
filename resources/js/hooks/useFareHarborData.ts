import { useQuery } from "@tanstack/react-query";
import { fareHarborApi } from "@/api/fareharbor";
import type { FareHarborCompany } from "@/types/fareharbor";

export function useFareHarborCompaniesData(): {
    companies: FareHarborCompany[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ["fareharbor", "companies"],
        queryFn: () => fareHarborApi.list(),
        staleTime: 30_000,
        retry: 1,
    });

    return {
        companies: query.data ?? [],
        isLoading: query.isLoading,
    };
}
