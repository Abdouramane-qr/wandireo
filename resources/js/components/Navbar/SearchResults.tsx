import type { SearchResponse, SearchResultItem } from "@/api/search";
import { Link } from "@/components/wdr/Link";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchResultsProps {
    query: string;
    results: SearchResponse;
    isLoading: boolean;
    onSelect: () => void;
}

interface SearchResultGroupProps {
    label: string;
    items: SearchResultItem[];
    onSelect: () => void;
}

function SearchResultGroup({
    label,
    items,
    onSelect,
}: SearchResultGroupProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="wdr-navbar-search__group">
            <p className="wdr-navbar-search__group-title">{label}</p>
            <div className="wdr-navbar-search__group-items">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="wdr-navbar-search__result"
                        onClick={onSelect}
                    >
                        <span className="wdr-navbar-search__result-copy">
                            <span className="wdr-navbar-search__result-title">
                                {item.title}
                            </span>
                            {item.location && (
                                <span className="wdr-navbar-search__result-meta">
                                    {item.location}
                                </span>
                            )}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export function SearchResults({
    query,
    results,
    isLoading,
    onSelect,
}: SearchResultsProps) {
    const { t } = useTranslation();
    const trimmedQuery = query.trim();
    const hasResults =
        results.activities.length > 0 ||
        results.boats.length > 0 ||
        results.accommodations.length > 0 ||
        results.cars.length > 0;

    if (!trimmedQuery) {
        return null;
    }

    return (
        <div className="wdr-navbar-search__dropdown" role="listbox">
            {isLoading ? (
                <div className="wdr-navbar-search__status">
                    {t("common.loading")}
                </div>
            ) : hasResults ? (
                <>
                    <SearchResultGroup
                        label={t("search.activities")}
                        items={results.activities}
                        onSelect={onSelect}
                    />
                    <SearchResultGroup
                        label={t("search.boats")}
                        items={results.boats}
                        onSelect={onSelect}
                    />
                    <SearchResultGroup
                        label={t("search.accommodations")}
                        items={results.accommodations}
                        onSelect={onSelect}
                    />
                    <SearchResultGroup
                        label={t("search.cars")}
                        items={results.cars}
                        onSelect={onSelect}
                    />
                </>
            ) : (
                <div className="wdr-navbar-search__status">
                    {t("search.no_results")}
                </div>
            )}
        </div>
    );
}

export default SearchResults;
