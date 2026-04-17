import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BlogCard, Button, ServiceCard } from "@/components/wdr";
import { SearchBar } from "@/components/Search/SearchBar";
import { favoritesApi } from "@/api/favorites";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useBlogPostsData } from "@/hooks/useBlogData";
import { useGeoContext } from "@/hooks/useGeoContext";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { useUser } from "@/context/UserContext";
import { todayISO } from "@/lib/formatters";
import { toServiceCardData } from "@/lib/serviceAdapter";
import { BlogStatusNames } from "@/types/blog";
import "./HomePage.css";

const ALGARVE_CITIES = [
    "Lagos",
    "Alvor",
    "Portimão",
    "Silves",
    "Benagil",
    "Armação de Pêra",
    "Vilamoura",
    "Albufeira",
];

const DESTINATION_CARDS = [
    "Lagos",
    "Alvor",
    "Portimão",
    "Silves",
    "Benagil",
    "Armação de Pêra",
    "Vilamoura",
    "Albufeira",
];

const WhatsAppIcon: React.FC = () => (
    <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M19.11 17.21c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14s-.7.88-.86 1.06c-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.35-.79-.71-1.33-1.59-1.48-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.91 2.92 4.63 4.09.65.28 1.16.44 1.56.56.66.21 1.27.18 1.75.11.53-.08 1.6-.65 1.82-1.27.22-.62.22-1.15.16-1.27-.06-.11-.24-.18-.51-.32Z" />
        <path d="M27 16c0 6.08-4.92 11-11 11-1.93 0-3.8-.5-5.45-1.45L5 27l1.53-5.36A10.94 10.94 0 0 1 5 16C5 9.92 9.92 5 16 5s11 4.92 11 11Zm-11-9.25c-5.11 0-9.25 4.14-9.25 9.25 0 1.78.51 3.51 1.47 4.99l.23.36-.91 3.18 3.25-.85.34.2A9.2 9.2 0 0 0 16 25.25c5.11 0 9.25-4.14 9.25-9.25S21.11 6.75 16 6.75Z" />
    </svg>
);

export const HomePage: React.FC = () => {
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const { currentUser } = useUser();
    const queryClient = useQueryClient();
    const geoContext = useGeoContext();
    const [query, setQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [category, setCategory] = useState("");

    const today = todayISO();
    const { services } = useServicesData();
    const { favorites } = useFavoritesData(currentUser?.id ?? "");
    const { posts: allPosts } = useBlogPostsData({
        status: BlogStatusNames.PUBLISHED,
    });

    const favoriteServiceIds = useMemo(
        () => new Set(favorites.map((favorite) => favorite.serviceId)),
        [favorites],
    );

    const categoryOptions = useMemo(
        () => [
            { value: "", label: t("home.category.all") },
            { value: "ACTIVITE", label: t("home.category.activity") },
            { value: "BATEAU", label: t("home.category.boat") },
            {
                value: "HEBERGEMENT",
                label: t("home.category.accommodation"),
            },
            { value: "VOITURE", label: t("home.category.car") },
        ],
        [t],
    );

    const highlights = useMemo(
        () => [
            t("home.highlight.1"),
            t("home.highlight.2"),
            t("home.highlight.3"),
            t("home.highlight.4"),
            t("home.highlight.5"),
            t("home.highlight.6"),
        ],
        [t],
    );

    const faqItems = useMemo(
        () =>
            Array.from({ length: 8 }, (_, index) => ({
                question: t(`home.faq.${index + 1}.q`),
                answer: t(`home.faq.${index + 1}.a`),
            })),
        [t],
    );

    const destinationOptions = useMemo(() => {
        const algarveSet = new Set(ALGARVE_CITIES);
        const extraCities = new Map<string, Set<string>>();

        for (const service of services) {
            if (algarveSet.has(service.location.city)) {
                continue;
            }

            if (!extraCities.has(service.location.country)) {
                extraCities.set(service.location.country, new Set());
            }

            extraCities
                .get(service.location.country)
                ?.add(service.location.city);
        }

        return [
            { country: "Algarve", cities: ALGARVE_CITIES },
            ...Array.from(extraCities.entries())
                .sort(([a], [b]) => a.localeCompare(b, "fr"))
                .map(([country, cities]) => ({
                    country,
                    cities: Array.from(cities).sort((a, b) =>
                        a.localeCompare(b, "fr"),
                    ),
                })),
        ].sort((a, b) => {
            if (a.country === "Algarve") {
                return -1;
            }

            if (b.country === "Algarve") {
                return 1;
            }

            if (
                geoContext.countryName &&
                a.country === geoContext.countryName
            ) {
                return -1;
            }

            if (
                geoContext.countryName &&
                b.country === geoContext.countryName
            ) {
                return 1;
            }

            return a.country.localeCompare(b.country, "fr");
        });
    }, [geoContext.countryName, services]);

    const latestPosts = useMemo(() => allPosts.slice(0, 3), [allPosts]);

    const featuredServices = useMemo(
        () =>
            [...services]
                .filter((service) => service.isAvailable)
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                .slice(0, 4)
                .map((service) => ({
                    ...toServiceCardData(service),
                    isFeatured: true,
                })),
        [services],
    );

    const categoryTiles = useMemo(
        () =>
            [
                {
                    value: "ACTIVITE",
                    label: t("home.tile.activities"),
                    description: t("home.tile.activities_desc"),
                    colorVar: "--primary",
                },
                {
                    value: "BATEAU",
                    label: t("home.tile.boats"),
                    description: t("home.tile.boats_desc"),
                    colorVar: "--brand-purple",
                },
                {
                    value: "HEBERGEMENT",
                    label: t("home.tile.accommodations"),
                    description: t("home.tile.accommodations_desc"),
                    colorVar: "--accent",
                },
                {
                    value: "VOITURE",
                    label: t("home.tile.cars"),
                    description: t("home.tile.cars_desc"),
                    colorVar: "--secondary",
                },
            ].map((tile) => ({
                ...tile,
                count: services.filter(
                    (service) => service.category === tile.value,
                ).length,
            })),
        [services, t],
    );

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        navigate({
            name: "search",
            query: query.trim(),
            category,
            dateFrom,
            dateTo,
        });
    };

    const handleFavoriteToggle = async (serviceId: string) => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            navigate({ name: "login" });

            return;
        }

        if (favoriteServiceIds.has(serviceId)) {
            await favoritesApi.remove(serviceId);
        } else {
            await favoritesApi.add(serviceId);
        }

        await queryClient.invalidateQueries({
            queryKey: ["favorites", currentUser.id],
        });
    };

    return (
        <div className="wdr-home">
            <section
                className="wdr-home__hero"
                aria-label={t("home.hero_aria")}
            >
                <div className="wdr-home__hero-backdrop" aria-hidden="true" />

                <div className="wdr-home__hero-content">
                    <h1 className="wdr-home__hero-title">
                        {t("home.hero_title")}
                    </h1>
                    <p className="wdr-home__hero-subtitle">
                        {t("home.hero_subtitle")}
                    </p>

                    {geoContext.countryName && (
                        <p className="wdr-home__hero-geo">
                            {geoContext.countryName} •{" "}
                            {geoContext.suggestedCurrency}
                        </p>
                    )}

                    <div className="wdr-home__hero-cta">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() =>
                                navigate({
                                    name: "search",
                                    query: "",
                                    category: "",
                                    dateFrom: "",
                                    dateTo: "",
                                })
                            }
                        >
                            {t("home.hero_cta")}
                        </Button>
                    </div>

                    <SearchBar
                        query={query}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        category={category}
                        today={today}
                        destinationOptions={destinationOptions}
                        categoryOptions={categoryOptions}
                        onQueryChange={setQuery}
                        onDateFromChange={(value) => {
                            setDateFrom(value);

                            if (dateTo && dateTo < value) {
                                setDateTo("");
                            }
                        }}
                        onDateToChange={setDateTo}
                        onCategoryChange={setCategory}
                        onSubmit={handleSearch}
                    />
                </div>
            </section>

            <section
                className="wdr-home__section wdr-home__intro"
                aria-labelledby="intro-heading"
            >
                <div className="wdr-home__container">
                    <div className="wdr-home__intro-grid">
                        <div className="wdr-home__intro-copy">
                            <h2
                                id="intro-heading"
                                className="wdr-home__section-title"
                            >
                                {t("home.intro_title")}
                            </h2>
                            <p className="wdr-home__intro-text">
                                {t("home.intro_text")}
                            </p>
                        </div>
                        <ul className="wdr-home__highlights" role="list">
                            {highlights.map((highlight) => (
                                <li
                                    key={highlight}
                                    className="wdr-home__highlight-item"
                                >
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section
                className="wdr-home__section wdr-home__featured"
                aria-labelledby="featured-heading"
            >
                <div className="wdr-home__container">
                    <div className="wdr-home__section-header">
                        <h2
                            id="featured-heading"
                            className="wdr-home__section-title"
                        >
                            {t("home.featured_title")}
                        </h2>
                        <button
                            className="wdr-home__see-all"
                            onClick={() =>
                                navigate({
                                    name: "search",
                                    query: "",
                                    category: "",
                                    dateFrom: "",
                                    dateTo: "",
                                })
                            }
                            type="button"
                        >
                            {t("home.see_all")}
                        </button>
                    </div>

                    <div className="wdr-home__service-grid">
                        {featuredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                variant="featured"
                                isFavorite={favoriteServiceIds.has(service.id)}
                                onFavoriteToggle={handleFavoriteToggle}
                                onBookClick={(serviceId) =>
                                    navigate({ name: "service", id: serviceId })
                                }
                            />
                        ))}
                    </div>
                </div>
            </section>

            {latestPosts.length > 0 && (
                <section
                    className="wdr-home__section wdr-home__blog"
                    aria-labelledby="blog-heading"
                >
                    <div className="wdr-home__container">
                        <div className="wdr-home__section-header">
                            <h2
                                id="blog-heading"
                                className="wdr-home__section-title"
                            >
                                {t("home.latest_posts")}
                            </h2>
                            <button
                                className="wdr-home__see-all"
                                onClick={() => navigate({ name: "blog" })}
                                type="button"
                            >
                                {t("home.see_all")}
                            </button>
                        </div>
                        <div className="wdr-home__blog-grid">
                            {latestPosts.map((post) => (
                                <BlogCard
                                    key={post.id}
                                    post={post}
                                    onClick={(slug) =>
                                        navigate({ name: "blog-post", slug })
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section
                className="wdr-home__section wdr-home__categories"
                aria-labelledby="categories-heading"
            >
                <div className="wdr-home__container">
                    <h2
                        id="categories-heading"
                        className="wdr-home__section-title"
                    >
                        {t("home.main_categories")}
                    </h2>

                    <div className="wdr-home__category-grid">
                        {categoryTiles.map((tile) => (
                            <button
                                key={tile.value}
                                className={`wdr-home__category-card wdr-home__category-card--${tile.value.toLowerCase()}`}
                                onClick={() =>
                                    navigate({
                                        name: "search",
                                        query: "",
                                        category: tile.value,
                                        dateFrom: "",
                                        dateTo: "",
                                    })
                                }
                                type="button"
                                aria-label={t(
                                    "home.category_card_aria",
                                ).replace("{category}", tile.label)}
                            >
                                <span className="wdr-home__category-count">
                                    {tile.count}{" "}
                                    {tile.count > 1
                                        ? t("home.count.experience_other")
                                        : t("home.count.experience_one")}
                                </span>
                                <h3 className="wdr-home__category-name">
                                    {tile.label}
                                </h3>
                                <p className="wdr-home__category-desc">
                                    {tile.description}
                                </p>
                                <span
                                    className="wdr-home__category-arrow"
                                    aria-hidden="true"
                                >
                                    &rarr;
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="wdr-home__section wdr-home__destinations"
                aria-labelledby="destinations-heading"
            >
                <div className="wdr-home__container">
                    <div className="wdr-home__section-header">
                        <h2
                            id="destinations-heading"
                            className="wdr-home__section-title"
                        >
                            {t("home.destinations_title")}
                        </h2>
                        <button
                            className="wdr-home__see-all"
                            onClick={() =>
                                navigate({
                                    name: "search",
                                    query: "",
                                    category: "",
                                    dateFrom: "",
                                    dateTo: "",
                                })
                            }
                            type="button"
                        >
                            {t("home.explore_region")}
                        </button>
                    </div>

                    <div className="wdr-home__destination-grid">
                        {DESTINATION_CARDS.map((city) => (
                            <button
                                key={city}
                                type="button"
                                className="wdr-home__destination-card"
                                onClick={() =>
                                    navigate({
                                        name: "search",
                                        query: city,
                                        category: "",
                                        dateFrom: "",
                                        dateTo: "",
                                    })
                                }
                            >
                                <span className="wdr-home__destination-kicker">
                                    Algarve
                                </span>
                                <h3 className="wdr-home__destination-name">
                                    {city}
                                </h3>
                                <p className="wdr-home__destination-copy">
                                    {t("home.destination_copy")} {city}.
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="wdr-home__section wdr-home__how-it-works"
                aria-labelledby="how-it-works-heading"
            >
                <div className="wdr-home__container">
                    <h2
                        id="how-it-works-heading"
                        className="wdr-home__section-title"
                    >
                        {t("home.how_it_works")}
                    </h2>

                    <ol
                        className="wdr-home__steps"
                        aria-label={t("home.steps_aria")}
                    >
                        <li className="wdr-home__step">
                            <div
                                className="wdr-home__step-number"
                                aria-hidden="true"
                            >
                                01
                            </div>
                            <h3 className="wdr-home__step-title">
                                {t("home.step1_title")}
                            </h3>
                            <p className="wdr-home__step-desc">
                                {t("home.step1_desc")}
                            </p>
                        </li>

                        <li className="wdr-home__step">
                            <div
                                className="wdr-home__step-number"
                                aria-hidden="true"
                            >
                                02
                            </div>
                            <h3 className="wdr-home__step-title">
                                {t("home.step2_title")}
                            </h3>
                            <p className="wdr-home__step-desc">
                                {t("home.step2_desc")}
                            </p>
                        </li>

                        <li className="wdr-home__step">
                            <div
                                className="wdr-home__step-number"
                                aria-hidden="true"
                            >
                                03
                            </div>
                            <h3 className="wdr-home__step-title">
                                {t("home.step3_title")}
                            </h3>
                            <p className="wdr-home__step-desc">
                                {t("home.step3_desc")}
                            </p>
                        </li>
                    </ol>
                </div>
            </section>

            <section
                id="faq"
                className="wdr-home__section wdr-home__faq"
                aria-labelledby="faq-heading"
            >
                <div className="wdr-home__container">
                    <div className="wdr-home__section-header">
                        <h2
                            id="faq-heading"
                            className="wdr-home__section-title"
                        >
                            {t("home.faq_title")}
                        </h2>
                    </div>

                    <div className="wdr-home__faq-grid">
                        {faqItems.map((item) => (
                            <details
                                key={item.question}
                                className="wdr-home__faq-item"
                            >
                                <summary className="wdr-home__faq-question">
                                    {item.question}
                                </summary>
                                <p className="wdr-home__faq-answer">
                                    {item.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="wdr-home__partner-cta"
                aria-label={t("home.partner_aria")}
            >
                <div className="wdr-home__container wdr-home__partner-cta-inner">
                    <div>
                        <h2 className="wdr-home__partner-title">
                            {t("home.partner_title")}
                        </h2>
                        <p className="wdr-home__partner-desc">
                            {t("home.partner_desc")}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => navigate({ name: "partner-register" })}
                    >
                        {t("home.partner_cta")}
                    </Button>
                </div>
            </section>

            <a
                href="https://wa.me/351928282231"
                className="wdr-home__whatsapp-float"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.whatsapp_aria")}
                title={t("home.whatsapp_title")}
            >
                <WhatsAppIcon />
            </a>
        </div>
    );
};

export default HomePage;
