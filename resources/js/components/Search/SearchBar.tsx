import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface DestinationOption {
    country: string;
    cities: string[];
}

interface CategoryOption {
    value: string;
    label: string;
}

interface SearchBarProps {
    query: string;
    dateFrom: string;
    dateTo: string;
    category: string;
    today: string;
    destinationOptions: DestinationOption[];
    categoryOptions: CategoryOption[];
    onQueryChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => void;
}

const SearchIcon: React.FC = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const MapPinIcon: React.FC = () => (
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
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const CategoryIcon: React.FC = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

export function SearchBar({
    query,
    dateFrom,
    dateTo,
    category,
    today,
    destinationOptions,
    categoryOptions,
    onQueryChange,
    onDateFromChange,
    onDateToChange,
    onCategoryChange,
    onSubmit,
}: SearchBarProps) {
    const { t } = useTranslation();
    const datePlaceholder = "jj/mm/aaaa";

    return (
        <form
            className="wdr-home__search-bar"
            onSubmit={onSubmit}
            role="search"
            aria-label={t("home.search_aria")}
        >
            <div className="wdr-home__sfield">
                <span className="wdr-home__sfield-icon">
                    <MapPinIcon />
                </span>
                <div className="wdr-home__sfield-body">
                    <span className="wdr-home__sfield-label">
                        {t("home.destination")}
                    </span>
                    <select
                        className="wdr-home__sfield-input wdr-home__sfield-select"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        aria-label={t("home.destination")}
                    >
                        <option value="">{t("search.all_destinations")}</option>
                        {destinationOptions.map(({ country, cities }) => (
                            <optgroup key={country} label={country}>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            <span className="wdr-home__sdivider" aria-hidden="true" />

            <div className="wdr-home__sfield wdr-home__sfield--date">
                <span className="wdr-home__sfield-icon">
                    <CalendarIcon />
                </span>
                <div className="wdr-home__sfield-body">
                    <span className="wdr-home__sfield-label">
                        {t("home.departure")}
                    </span>
                    <div className="wdr-home__date-input-wrap">
                        <input
                            type="date"
                            className="wdr-home__sfield-input wdr-home__sfield-input--date"
                            value={dateFrom}
                            min={today}
                            onChange={(event) =>
                                onDateFromChange(event.target.value)
                            }
                            aria-label={t("search.date_from")}
                        />
                        {!dateFrom && (
                            <span
                                className="wdr-home__date-placeholder"
                                aria-hidden="true"
                            >
                                {datePlaceholder}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <span className="wdr-home__sdivider" aria-hidden="true" />

            <div className="wdr-home__sfield wdr-home__sfield--date">
                <span className="wdr-home__sfield-icon">
                    <CalendarIcon />
                </span>
                <div className="wdr-home__sfield-body">
                    <span className="wdr-home__sfield-label">
                        {t("home.return")}
                    </span>
                    <div className="wdr-home__date-input-wrap">
                        <input
                            type="date"
                            className="wdr-home__sfield-input wdr-home__sfield-input--date"
                            value={dateTo}
                            min={dateFrom || today}
                            onChange={(event) =>
                                onDateToChange(event.target.value)
                            }
                            aria-label={t("search.date_to")}
                        />
                        {!dateTo && (
                            <span
                                className="wdr-home__date-placeholder"
                                aria-hidden="true"
                            >
                                {datePlaceholder}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <span className="wdr-home__sdivider" aria-hidden="true" />

            <div className="wdr-home__sfield wdr-home__sfield--cat">
                <span className="wdr-home__sfield-icon">
                    <CategoryIcon />
                </span>
                <div className="wdr-home__sfield-body">
                    <span className="wdr-home__sfield-label">
                        {t("home.category")}
                    </span>
                    <select
                        className="wdr-home__sfield-input wdr-home__sfield-select"
                        value={category}
                        onChange={(event) => onCategoryChange(event.target.value)}
                        aria-label={t("home.category")}
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button type="submit" className="wdr-home__search-btn">
                <SearchIcon />
                <span>{t("home.search")}</span>
            </button>
        </form>
    );
}

export default SearchBar;
