import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    EMPTY_SEARCH_RESULTS,
    searchApi,
    type SearchResponse,
} from "@/api/search";

const SEARCH_DEBOUNCE_MS = 300;

export function useSearch(query: string): {
    debouncedQuery: string;
    results: SearchResponse;
    isLoading: boolean;
    hasResults: boolean;
} {
    const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeout);
    }, [query]);

    const searchQuery = useQuery({
        queryKey: ["search", "global", debouncedQuery],
        queryFn: async () => searchApi.search(debouncedQuery),
        enabled: debouncedQuery.length > 0,
        staleTime: 30_000,
        retry: 1,
    });

    const results = searchQuery.data ?? EMPTY_SEARCH_RESULTS;
    const hasResults =
        results.activities.length > 0 ||
        results.boats.length > 0 ||
        results.accommodations.length > 0 ||
        results.cars.length > 0;

    return {
        debouncedQuery,
        results,
        isLoading: searchQuery.isLoading || searchQuery.isFetching,
        hasResults,
    };
}
