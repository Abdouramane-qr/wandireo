/**
 * @file ServiceCard/index.tsx
 * @description Carte de presentation uniforme pour les offres de services Wandireo.
 *   Affiche l'ensemble des informations pertinentes pour qu'un voyageur puisse
 *   evaluer un service et initier une reservation.
 *
 *   Variants disponibles :
 *   - 'default'  : Carte standard pour les grilles de resultats de recherche.
 *   - 'compact'  : Version reduite pour les sections "Suggestions similaires".
 *   - 'featured' : Carte mise en avant (accueil, campagnes editoriales).
 */

import React from "react";
import type { ServiceCardData } from "../../../types/service";
import { useTranslation } from "../../../hooks/useTranslation";
import { Button } from "../Button";
import "./ServiceCard.css";

export type ServiceCardVariant = "default" | "compact" | "featured";

export interface ServiceCardProps {
    /** Donnees normalisees du service a afficher */
    service: ServiceCardData;
    /** Variante visuelle. Par defaut: 'default' */
    variant?: ServiceCardVariant;
    /** Indique si ce service est dans les favoris de l'utilisateur courant */
    isFavorite?: boolean;
    /** Callback declenche lors du clic sur le bouton favori */
    onFavoriteToggle?: (serviceId: string) => void;
    /** Callback declenche lors du clic sur le bouton "Reserver" */
    onBookClick?: (serviceId: string) => void;
    /** Classes CSS supplementaires appliquees a l'article */
    className?: string;
}

/* ============================================================
   Utilitaires de formatage
   ============================================================ */

/**
 * Formate une duree en minutes en texte lisible en francais.
 *   45    -> "45 min"
 *   90    -> "1h30"
 *   120   -> "2h"
 *   1440  -> "1 jour"
 *   2880  -> "2 jours"
 */
function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return mins > 0
            ? `${hours}h${String(mins).padStart(2, "0")}`
            : `${hours}h`;
    }

    const days = Math.floor(minutes / 1440);

    return days === 1 ? "1 jour" : `${days} jours`;
}

/**
 * Formate un prix avec la devise selon la locale francaise.
 *   (1250, "EUR") -> "1 250 €"
 *   (85, "EUR")   -> "85 €"
 */
function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function isDepositOnlyStatus(value: unknown): value is "DEPOSIT_ONLY" {
    return value === "DEPOSIT_ONLY";
}

function getCategoryLabel(
    category: ServiceCardData["category"],
    locale: string,
): string {
    switch (category) {
        case "ACTIVITE":
            return locale === "en"
                ? "Activity"
                : locale === "pt"
                  ? "Atividade"
                  : locale === "es"
                    ? "Actividad"
                    : locale === "it"
                      ? "Attivita"
                      : locale === "de"
                        ? "Aktivitat"
                        : "Activité";
        case "BATEAU":
            return locale === "en"
                ? "Boat"
                : locale === "pt"
                  ? "Barco"
                  : locale === "es"
                    ? "Barco"
                    : locale === "it"
                      ? "Barca"
                      : locale === "de"
                        ? "Boot"
                        : "Bateau";
        case "HEBERGEMENT":
            return locale === "en"
                ? "Stay"
                : locale === "pt"
                  ? "Alojamento"
                  : locale === "es"
                    ? "Alojamiento"
                    : locale === "it"
                      ? "Alloggio"
                      : locale === "de"
                        ? "Unterkunft"
                        : "Hébergement";
        case "VOITURE":
            return locale === "en"
                ? "Car"
                : locale === "pt"
                  ? "Carro"
                  : locale === "es"
                    ? "Coche"
                    : locale === "it"
                      ? "Auto"
                      : locale === "de"
                        ? "Auto"
                        : "Voiture";
    }
}

/* ============================================================
   Sous-composants internes
   ============================================================ */

/** Etoile SVG individuelle (pleine ou vide) */
const Star: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg
        className={`wdr-card__star ${filled ? "wdr-card__star--filled" : "wdr-card__star--empty"}`}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        aria-hidden="true"
    >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

/** Rangee de 5 etoiles representant la note globale */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const { t } = useTranslation();
    const filledCount = Math.round(rating);

    return (
        <span
            className="wdr-card__stars"
            aria-label={t("service.card.rating_aria").replace(
                "{rating}",
                rating.toFixed(1),
            )}
        >
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} filled={i < filledCount} />
            ))}
        </span>
    );
};

/* ============================================================
   Composant principal
   ============================================================ */

/**
 * ServiceCard - Design System Wandireo
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    variant = "default",
    isFavorite = false,
    onFavoriteToggle,
    onBookClick,
    className = "",
}) => {
    const { t, locale } = useTranslation();
    const {
        id,
        title,
        shortDescription,
        price,
        currency,
        category,
        thumbnailUrl,
        location,
        durationMinutes,
        rating,
        reviewCount,
        partnerName,
        partnerAvatar,
        isAvailable,
        isFeatured,
        highlights,
        sourceProvider,
        externalPriceStatus,
        externalDepositAmount,
        externalDepositCurrency,
    } = service;

    const cardClassNames = [
        "wdr-card",
        `wdr-card--${variant}`,
        isFeatured ? "wdr-card--featured" : "",
        !isAvailable ? "wdr-card--unavailable" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const partnerInitial = partnerName.charAt(0).toUpperCase();
    const hasImportedPriceState =
        sourceProvider === "FAREHARBOR" ||
        typeof externalPriceStatus === "string";
    const showExternalPriceFallback = hasImportedPriceState && price <= 0;
    const showDepositOnlyPrice =
        hasImportedPriceState &&
        isDepositOnlyStatus(externalPriceStatus) &&
        typeof externalDepositAmount === "number" &&
        externalDepositAmount > 0;
    const externalDepositLabel = showDepositOnlyPrice
        ? formatPrice(
              externalDepositAmount,
              externalDepositCurrency || currency,
          )
        : "";
    const depositOnlySummary = showDepositOnlyPrice
        ? t("service.external_deposit_only_summary").replace(
              "{amount}",
              externalDepositLabel,
          )
        : "";
    const locationLabel = [location.city, location.country]
        .filter((value) => Boolean(value && value.trim()))
        .join(", ");

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFavoriteToggle?.(id);
    };

    const handleBookClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBookClick?.(id);
    };

    return (
        <article className={cardClassNames} aria-label={title}>
            {/* ---- Zone image ---- */}
            <div className="wdr-card__image-wrapper">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={t("service.card.image_alt").replace(
                            "{title}",
                            title,
                        )}
                        className="wdr-card__image"
                        loading="lazy"
                        width="400"
                        height="216"
                    />
                ) : (
                    <div
                        className="wdr-card__image-placeholder"
                        aria-hidden="true"
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}

                {/* Badges superposes */}
                <div className="wdr-card__badges" aria-hidden="true">
                    <span className="wdr-card__badge wdr-card__badge--category">
                        {getCategoryLabel(category, locale)}
                    </span>
                    {isFeatured && (
                        <span className="wdr-card__badge wdr-card__badge--featured">
                            {t("service.card.featured_badge")}
                        </span>
                    )}
                </div>

                {/* Bouton favori */}
                <button
                    className={[
                        "wdr-card__favorite-btn",
                        isFavorite ? "wdr-card__favorite-btn--active" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    onClick={handleFavoriteClick}
                    aria-label={
                        isFavorite
                            ? t("service.card.favorite_remove")
                            : t("service.card.favorite_add")
                    }
                    aria-pressed={isFavorite}
                    type="button"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Point de disponibilite */}
                <div
                    className={[
                        "wdr-card__availability-dot",
                        isAvailable
                            ? "wdr-card__availability-dot--available"
                            : "wdr-card__availability-dot--unavailable",
                    ].join(" ")}
                    title={
                        isAvailable
                            ? t("service.card.available")
                            : t("service.card.unavailable")
                    }
                    aria-hidden="true"
                />
            </div>

            {/* ---- Corps de la carte ---- */}
            <div className="wdr-card__body">
                {/* Localisation */}
                {locationLabel && (
                    <div className="wdr-card__location">
                        <svg
                            width="13"
                            height="13"
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
                        <span>{locationLabel}</span>
                    </div>
                )}

                {/* Titre */}
                <h3 className="wdr-card__title">{title}</h3>

                {/* Description (masquee en variante compact) */}
                {variant !== "compact" && shortDescription && (
                    <p className="wdr-card__description">{shortDescription}</p>
                )}

                {highlights.length > 0 && (
                    <div className="wdr-card__meta">
                        {highlights.map((highlight) => (
                            <span
                                key={highlight}
                                className="wdr-card__meta-item"
                            >
                                {highlight}
                            </span>
                        ))}
                    </div>
                )}

                {/* Meta : duree et note */}
                <div className="wdr-card__meta">
                    {durationMinutes > 0 && (
                        <span className="wdr-card__meta-item">
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{formatDuration(durationMinutes)}</span>
                        </span>
                    )}

                    {reviewCount > 0 && (
                        <span className="wdr-card__meta-item">
                            <StarRating rating={rating} />
                            <span className="wdr-card__rating-count">
                                ({reviewCount})
                            </span>
                        </span>
                    )}
                </div>

                {/* Partenaire */}
                <div className="wdr-card__partner">
                    {partnerAvatar ? (
                        <img
                            src={partnerAvatar}
                            alt={t("service.card.partner_avatar_alt").replace(
                                "{partnerName}",
                                partnerName,
                            )}
                            className="wdr-card__partner-avatar"
                            width="24"
                            height="24"
                        />
                    ) : (
                        <div
                            className="wdr-card__partner-initial"
                            aria-hidden="true"
                        >
                            {partnerInitial}
                        </div>
                    )}
                    <span>{partnerName}</span>
                </div>
            </div>

            {/* ---- Pied de carte ---- */}
            <div className="wdr-card__footer">
                <div className="wdr-card__price-block">
                    <span className="wdr-card__price-label">
                        {showDepositOnlyPrice
                            ? t("service.external_price_total_label")
                            : showExternalPriceFallback
                              ? t("service.external_price_label")
                              : t("service.card.from_price")}
                    </span>
                    <span className="wdr-card__price">
                        {showDepositOnlyPrice
                            ? t("service.external_price_total_unknown")
                            : showExternalPriceFallback
                              ? t("service.external_price_unavailable")
                              : formatPrice(price, currency)}
                        {!showExternalPriceFallback &&
                            !showDepositOnlyPrice && (
                                <span className="wdr-card__price-unit">
                                    {t("service.card.price_unit_person")}
                                </span>
                            )}
                    </span>
                    {showDepositOnlyPrice && (
                        <>
                            <span className="wdr-card__price-note">
                                {depositOnlySummary}
                            </span>
                            <span className="wdr-card__price-note">
                                {t("service.external_price_not_provided")}
                            </span>
                            <span className="wdr-card__price-note wdr-card__price-note--subtle">
                                {t("service.external_price_confirmed_partner")}
                            </span>
                        </>
                    )}
                </div>

                <Button
                    variant={isAvailable ? "primary" : "ghost"}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={handleBookClick}
                    aria-label={
                        isAvailable
                            ? t("service.card.book_aria").replace(
                                  "{title}",
                                  title,
                              )
                            : t("service.card.unavailable_aria").replace(
                                  "{title}",
                                  title,
                              )
                    }
                >
                    {isAvailable
                        ? t("service.card.book")
                        : t("service.card.unavailable")}
                </Button>
            </div>
        </article>
    );
};

export default ServiceCard;
