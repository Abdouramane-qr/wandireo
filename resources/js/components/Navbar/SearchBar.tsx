import React from "react";
import { SearchResults } from "@/components/Navbar/SearchResults";
import { useSearch } from "@/hooks/useSearch";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";

const SearchIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export function SearchBar() {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { results, isLoading } = useSearch(query);

    React.useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            inputRef.current?.focus();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [isOpen]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsOpen(false);
        navigate({
            name: "search",
            query: query.trim(),
        });
    };

    return (
        <div
            ref={containerRef}
            className="wdr-navbar-search"
        >
            <button
                type="button"
                className={`wdr-navbar-search__toggle ${isOpen ? "wdr-navbar-search__toggle--active" : ""}`}
                aria-label={t("nav.search")}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={() => setIsOpen((current) => !current)}
            >
                <SearchIcon />
            </button>

            {isOpen && (
                <div className="wdr-navbar-search__panel" role="dialog">
                    <form
                        className="wdr-navbar-search__form"
                        role="search"
                        onSubmit={handleSubmit}
                    >
                        <label className="wdr-navbar-search__field">
                            <span className="wdr-navbar-search__icon">
                                <SearchIcon />
                            </span>
                            <input
                                ref={inputRef}
                                type="search"
                                className="wdr-navbar-search__input"
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                }}
                                onFocus={() => {
                                    if (query.trim()) {
                                        setIsOpen(true);
                                    }
                                }}
                                placeholder={t("nav.search")}
                                aria-label={t("nav.search")}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="wdr-navbar-search__close"
                                aria-label={t("common.close")}
                                onClick={() => setIsOpen(false)}
                            >
                                &#10005;
                            </button>
                        </label>

                        <SearchResults
                            query={query}
                            results={results}
                            isLoading={isLoading}
                            onSelect={() => setIsOpen(false)}
                        />
                    </form>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
