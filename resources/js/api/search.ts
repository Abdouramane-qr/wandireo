import api from "./client";

export interface SearchResultItem {
    id: string;
    title: string;
    category: "ACTIVITE" | "BATEAU" | "HEBERGEMENT" | "VOITURE";
    href: string;
    image?: string;
    location?: string;
}

export interface SearchResponse {
    activities: SearchResultItem[];
    boats: SearchResultItem[];
    accommodations: SearchResultItem[];
    cars: SearchResultItem[];
}

export const EMPTY_SEARCH_RESULTS: SearchResponse = {
    activities: [],
    boats: [],
    accommodations: [],
    cars: [],
};

export const searchApi = {
    search: async (query: string) =>
        api
            .get<SearchResponse>("/search", {
                params: {
                    q: query,
                },
            })
            .then((response) => response.data),
};
