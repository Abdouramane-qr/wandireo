/**
 * @file pages/FavoritesPage/index.tsx
 * @description Page des favoris utilisateur.
 */

import React, { useMemo, useState } from "react";
import { favoritesApi } from "@/api/favorites";
import { Breadcrumb, EmptyState, ServiceCard } from "@/components/wdr";
import { useUser } from "@/context/UserContext";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { toServiceCardData } from "@/lib/serviceAdapter";
import "./FavoritesPage.css";

export const FavoritesPage: React.FC = () => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { t } = useTranslation();
    const { favorites } = useFavoritesData(currentUser?.id ?? "");
    const { services } = useServicesData();
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

    const favoriteServiceIds = useMemo(() => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            return [];
        }

        return favorites
            .filter((f) => !removedIds.has(f.serviceId))
            .sort((a, b) => {
                const aTime =
                    a.addedAt instanceof Date
                        ? a.addedAt.getTime()
                        : new Date(a.addedAt).getTime();
                const bTime =
                    b.addedAt instanceof Date
                        ? b.addedAt.getTime()
                        : new Date(b.addedAt).getTime();

                return bTime - aTime;
            })
            .map((f) => f.serviceId);
    }, [currentUser, favorites, removedIds]);

    const favoriteServices = useMemo(() => {
        return favoriteServiceIds
            .map((id) => services.find((s) => s.id === id))
            .filter((s): s is NonNullable<typeof s> => s !== undefined)
            .map(toServiceCardData);
    }, [favoriteServiceIds, services]);

    const handleRemove = async (serviceId: string) => {
        setRemovedIds((prev) => new Set([...prev, serviceId]));
        await favoritesApi.remove(serviceId);
    };

    const countLabel =
        favoriteServices.length === 1
            ? t("favorites.count_one")
            : t("favorites.count_other");

    return (
        <div className="wdr-favs">
            <div className="wdr-favs__header">
                <div className="wdr-favs__header-inner">
                    <Breadcrumb
                        items={[
                            {
                                label: t("nav.home"),
                                onClick: () => navigate({ name: "home" }),
                            },
                            { label: t("favorites.title") },
                        ]}
                    />
                    <h1 className="wdr-favs__title">{t("favorites.title")}</h1>
                    {favoriteServices.length > 0 && (
                        <p className="wdr-favs__count">
                            {favoriteServices.length} {countLabel}
                        </p>
                    )}
                </div>
            </div>

            <div className="wdr-favs__body">
                <div className="wdr-favs__inner">
                    {favoriteServices.length === 0 ? (
                        <EmptyState
                            title={t("favorites.empty_title")}
                            description={t("favorites.empty_desc")}
                            actionLabel={t("favorites.discover")}
                            onAction={() =>
                                navigate({
                                    name: "search",
                                    query: "",
                                    category: "",
                                    dateFrom: "",
                                    dateTo: "",
                                })
                            }
                        />
                    ) : (
                        <div className="wdr-favs__grid">
                            {favoriteServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="wdr-favs__item"
                                >
                                    <ServiceCard
                                        service={service}
                                        variant="default"
                                        onBookClick={(id) =>
                                            navigate({ name: "service", id })
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="wdr-favs__remove-btn"
                                        onClick={() => handleRemove(service.id)}
                                        aria-label={t(
                                            "favorites.remove_aria",
                                        ).replace("{title}", service.title)}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            aria-hidden="true"
                                        >
                                            <line
                                                x1="18"
                                                y1="6"
                                                x2="6"
                                                y2="18"
                                            />
                                            <line
                                                x1="6"
                                                y1="6"
                                                x2="18"
                                                y2="18"
                                            />
                                        </svg>
                                        {t("favorites.remove")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritesPage;
