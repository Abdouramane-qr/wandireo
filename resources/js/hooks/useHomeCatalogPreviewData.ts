import { useQuery } from "@tanstack/react-query";
import { homeApi, type HomeCatalogPreview } from "@/api/home";
import { useTranslation } from "@/hooks/useTranslation";

export function useHomeCatalogPreviewData(): {
    preview: HomeCatalogPreview | undefined;
    isLoading: boolean;
    isApiActive: boolean;
} {
    const { locale } = useTranslation();
    const query = useQuery({
        queryKey: ["home", "catalog-preview", locale],
        queryFn: homeApi.catalogPreview,
        staleTime: 300_000,
        retry: 1,
    });

    return {
        preview: query.data,
        isLoading: query.isLoading,
        isApiActive: !query.isError,
    };
}
