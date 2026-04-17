/**
 * @file pages/ServiceDetailPage/index.tsx
 * @description Fiche detaillee d'un service de la plateforme Wandireo.
 *
 * Structure :
 *   1. Galerie d'images (navigation principale + bande de miniatures)
 *   2. Colonne info (description, inclus/non-inclus, informations pratiques)
 *   3. Panneau de reservation sticky (dates, options, calcul du total, CTA)
 *   4. Section "Services similaires" (meme categorie)
 */

import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { favoritesApi } from "@/api/favorites";
import {
    Button,
    EmptyState,
    GeoMap,
    ReviewCard,
    ServiceCard,
} from "@/components/wdr";
import { useToast } from "@/components/wdr";
import { useBooking } from "@/context/BookingContext";
import { useUser } from "@/context/UserContext";
import { useAvailabilityData } from "@/hooks/useAvailabilityData";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useReviewsData } from "@/hooks/useReviewsData";
import { useServiceStructureData } from "@/hooks/useServiceStructureData";
import { useServiceData, useServicesData } from "@/hooks/useServicesData";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "@/hooks/useWdrRouter";
import { formatPrice, calcDays, todayISO } from "@/lib/formatters";
import { toServiceCardData } from "@/lib/serviceAdapter";
import { stripMarkdownToText } from "@/lib/textSanitizers";
import type { Service } from "@/types/service";
import NotFoundPage from "../NotFoundPage";
import "./ServiceDetailPage.css";

function toPositiveNumber(value: unknown): number | undefined {
    if (typeof value === "number" && value > 0) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (!Number.isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return undefined;
}

function getFareHarborPriceStatus(service: Service): string | undefined {
    const fareHarbor = service.extraData?.fareharbor;
    const explicitStatus = fareHarbor?.priceStatus;

    if (
        explicitStatus === "KNOWN" ||
        explicitStatus === "DEPOSIT_ONLY" ||
        explicitStatus === "UNKNOWN"
    ) {
        return explicitStatus;
    }

    const rawDepositRequired =
        fareHarbor?.isDepositRequired ??
        (fareHarbor?.raw &&
        typeof fareHarbor.raw === "object" &&
        fareHarbor.raw !== null
            ? (fareHarbor.raw as Record<string, unknown>).is_deposit_required
            : undefined);
    const isDepositRequired =
        rawDepositRequired === true || rawDepositRequired === "true";

    if (service.clientPrice > 0) {
        return "KNOWN";
    }

    if (
        isDepositRequired &&
        typeof getFareHarborDepositAmount(service) === "number"
    ) {
        return "DEPOSIT_ONLY";
    }

    return undefined;
}

function getFareHarborDepositAmount(service: Service): number | undefined {
    const fareHarbor = service.extraData?.fareharbor;
    const depositAmount = toPositiveNumber(fareHarbor?.depositAmount);

    if (depositAmount !== undefined) {
        return depositAmount;
    }

    const depositAmountEur = toPositiveNumber(fareHarbor?.depositAmountEur);

    if (depositAmountEur !== undefined) {
        return depositAmountEur;
    }

    const rawDepositOffset =
        fareHarbor?.raw &&
        typeof fareHarbor.raw === "object" &&
        fareHarbor.raw !== null
            ? toPositiveNumber(
                  (fareHarbor.raw as Record<string, unknown>).deposit_offset,
              )
            : undefined;

    return rawDepositOffset !== undefined
        ? +(rawDepositOffset / 100).toFixed(2)
        : undefined;
}

function getFareHarborDepositCurrency(service: Service): string {
    return service.extraData?.fareharbor?.processorCurrency || service.currency;
}

function cleanRichText(value: string): string {
    return stripMarkdownToText(value)
        .replace(/^\s*[-*+]\s+/gm, "• ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return tokens.filter(Boolean).map((token, index) => {
        if (token.startsWith("`") && token.endsWith("`")) {
            return (
                <code key={index} className="wdr-detail__inline-code">
                    {token.slice(1, -1)}
                </code>
            );
        }

        if (token.startsWith("**") && token.endsWith("**")) {
            return <strong key={index}>{token.slice(2, -2)}</strong>;
        }

        if (token.startsWith("*") && token.endsWith("*")) {
            return <em key={index}>{token.slice(1, -1)}</em>;
        }

        return <React.Fragment key={index}>{token}</React.Fragment>;
    });
}

function renderDescriptionBlocks(value: string): React.ReactNode[] {
    const lines = value.replace(/\r\n/g, "\n").split("\n");
    const blocks: React.ReactNode[] = [];
    let index = 0;

    while (index < lines.length) {
        const currentLine = lines[index].trim();

        if (!currentLine) {
            index += 1;
            continue;
        }

        const headingMatch = currentLine.match(/^(#{1,6})\s*(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;

            blocks.push(
                <div
                    key={`heading-${index}`}
                    className={`wdr-detail__description-heading wdr-detail__description-heading--h${level}`}
                >
                    {renderInlineMarkdown(headingMatch[2].trim())}
                </div>,
            );
            index += 1;
            continue;
        }

        if (/^[-*]\s+/.test(currentLine)) {
            const items: React.ReactNode[] = [];

            while (
                index < lines.length &&
                /^[-*]\s+/.test(lines[index].trim())
            ) {
                items.push(
                    <li key={`ul-item-${index}`}>
                        {renderInlineMarkdown(
                            lines[index].trim().replace(/^[-*]\s+/, ""),
                        )}
                    </li>,
                );
                index += 1;
            }

            blocks.push(
                <ul
                    key={`ul-${index}`}
                    className="wdr-detail__description-list"
                >
                    {items}
                </ul>,
            );
            continue;
        }

        if (/^\d+\.\s+/.test(currentLine)) {
            const items: React.ReactNode[] = [];

            while (
                index < lines.length &&
                /^\d+\.\s+/.test(lines[index].trim())
            ) {
                items.push(
                    <li key={`ol-item-${index}`}>
                        {renderInlineMarkdown(
                            lines[index].trim().replace(/^\d+\.\s+/, ""),
                        )}
                    </li>,
                );
                index += 1;
            }

            blocks.push(
                <ol
                    key={`ol-${index}`}
                    className="wdr-detail__description-list"
                >
                    {items}
                </ol>,
            );
            continue;
        }

        if (/^>\s?/.test(currentLine)) {
            const quoteLines: string[] = [];

            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
                index += 1;
            }

            blocks.push(
                <blockquote
                    key={`quote-${index}`}
                    className="wdr-detail__description-quote"
                >
                    {renderInlineMarkdown(quoteLines.join(" "))}
                </blockquote>,
            );
            continue;
        }

        const paragraphLines: string[] = [];

        while (index < lines.length) {
            const line = lines[index].trim();

            if (
                !line ||
                /^(#{1,6})\s*/.test(line) ||
                /^[-*]\s+/.test(line) ||
                /^\d+\.\s+/.test(line) ||
                /^>\s?/.test(line)
            ) {
                break;
            }

            paragraphLines.push(line);
            index += 1;
        }

        const paragraph = cleanRichText(paragraphLines.join("\n"));

        if (paragraph) {
            blocks.push(
                <p
                    key={`paragraph-${index}`}
                    className="wdr-detail__description-block"
                >
                    {renderInlineMarkdown(paragraph)}
                </p>,
            );
        }
    }

    return blocks;
}

function getLocationLabel(service: Service): string {
    return [service.location.city, service.location.country]
        .filter((value) => Boolean(value && value.trim()))
        .join(", ");
}

function getCategoryLabel(
    category: Service["category"],
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

// ============================================================
// Sous-composants de la galerie d'images
// ============================================================

interface ImageGalleryProps {
    images: string[];
    title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const { t } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const total = images.length;

    const prev = () => setSelectedIndex((i) => (i - 1 + total) % total);
    const next = () => setSelectedIndex((i) => (i + 1) % total);

    const selected = images[selectedIndex] ?? "";

    return (
        <div className="wdr-detail__gallery">
            {/* Image principale */}
            <div className="wdr-detail__gallery-main">
                <img
                    src={selected}
                    alt={`${title} — photo ${selectedIndex + 1} sur ${total}`}
                    className="wdr-detail__gallery-img"
                    loading="eager"
                />

                {/* Indicateur de position */}
                <div
                    className="wdr-detail__gallery-counter"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {selectedIndex + 1} / {total}
                </div>

                {/* Boutons de navigation */}
                {total > 1 && (
                    <>
                        <button
                            type="button"
                            className="wdr-detail__gallery-btn wdr-detail__gallery-btn--prev"
                            onClick={prev}
                            aria-label={t("service.gallery_prev")}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                aria-hidden="true"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="wdr-detail__gallery-btn wdr-detail__gallery-btn--next"
                            onClick={next}
                            aria-label={t("service.gallery_next")}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                aria-hidden="true"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Bande de miniatures */}
            {total > 1 && (
                <div
                    className="wdr-detail__gallery-thumbs"
                    role="tablist"
                    aria-label={t("service.gallery_thumbs")}
                >
                    {images.map((src, idx) => (
                        <button
                            key={src}
                            type="button"
                            role="tab"
                            className={`wdr-detail__gallery-thumb ${idx === selectedIndex ? "wdr-detail__gallery-thumb--active" : ""}`}
                            onClick={() => setSelectedIndex(idx)}
                            aria-selected={idx === selectedIndex}
                            aria-label={t("service.gallery_show_photo").replace(
                                "{index}",
                                String(idx + 1),
                            )}
                        >
                            <img src={src} alt="" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================
// Sous-composant : liste Inclus / Non inclus
// ============================================================

interface CheckListProps {
    items: string[];
    type: "included" | "excluded";
}

const CheckList: React.FC<CheckListProps> = ({ items, type }) => (
    <ul className={`wdr-detail__check-list wdr-detail__check-list--${type}`}>
        {items.map((item) => (
            <li key={item} className="wdr-detail__check-item">
                <svg
                    className="wdr-detail__check-icon"
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
                    {type === "included" ? (
                        <polyline points="20 6 9 17 4 12" />
                    ) : (
                        <>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                    )}
                </svg>
                {item}
            </li>
        ))}
    </ul>
);

// ============================================================
// Sous-composant : etoiles de notation
// ============================================================

const StarRating: React.FC<{ rating: number; count: number }> = ({
    rating,
    count,
}) => {
    const { t } = useTranslation();
    const filled = Math.round(rating);

    return (
        <div
            className="wdr-detail__rating"
            aria-label={t("service.rating_label")
                .replace("{rating}", rating.toFixed(1))
                .replace("{count}", String(count))}
        >
            {Array.from({ length: 5 }, (_, i) => (
                <svg
                    key={i}
                    className={`wdr-detail__star ${i < filled ? "wdr-detail__star--filled" : "wdr-detail__star--empty"}`}
                    viewBox="0 0 24 24"
                    fill={i < filled ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={i < filled ? 0 : 1.5}
                    width="18"
                    height="18"
                    aria-hidden="true"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            <span className="wdr-detail__rating-value">
                {rating.toFixed(1)}
            </span>
            <span className="wdr-detail__rating-count">
                {t("service.reviews_count").replace("{count}", String(count))}
            </span>
        </div>
    );
};

// ============================================================
// Panneau de reservation (BookingPanel)
// ============================================================

interface BookingPanelProps {
    service: Service;
    serviceExtras: Array<{
        id: string;
        name: string;
        description?: string;
        defaultPrice: number;
        inputType: "CHECKBOX" | "REQUIRED";
    }>;
}

const BookingPanel: React.FC<BookingPanelProps> = ({
    service,
    serviceExtras,
}) => {
    const { error } = useToast();
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { initDraft } = useBooking();
    const { t } = useTranslation();
    const today = todayISO();
    const priceStatus = getFareHarborPriceStatus(service);
    const depositAmount = getFareHarborDepositAmount(service);
    const depositCurrency = getFareHarborDepositCurrency(service);
    const showImportedPriceFallback = service.clientPrice <= 0;
    const showDepositOnlyPrice =
        priceStatus === "DEPOSIT_ONLY" &&
        typeof depositAmount === "number" &&
        depositAmount > 0;
    const depositDisplay = showDepositOnlyPrice
        ? formatPrice(depositAmount, depositCurrency)
        : "";
    const depositOnlySummary = showDepositOnlyPrice
        ? t("service.external_deposit_only_summary").replace(
              "{amount}",
              depositDisplay,
          )
        : "";
    const canReserve = !showImportedPriceFallback;

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [selectedOptionalExtraIds, setSelectedOptionalExtraIds] = useState<
        string[]
    >([]);
    const [participants, setParticipants] = useState(
        service.category === "ACTIVITE" ? service.minParticipants : 1,
    );
    const requiredExtras = useMemo(
        () => serviceExtras.filter((extra) => extra.inputType === "REQUIRED"),
        [serviceExtras],
    );
    const optionalExtras = useMemo(
        () => serviceExtras.filter((extra) => extra.inputType === "CHECKBOX"),
        [serviceExtras],
    );
    const selectedBaseExtras = useMemo(
        () => [
            ...requiredExtras,
            ...optionalExtras.filter((extra) =>
                selectedOptionalExtraIds.includes(extra.id),
            ),
        ],
        [optionalExtras, requiredExtras, selectedOptionalExtraIds],
    );
    const selectedExtras = useMemo(
        () =>
            selectedBaseExtras.map((extra) => ({
                id: extra.id,
                name: extra.name,
                unitPrice: +extra.defaultPrice.toFixed(2),
                quantity: 1,
                totalPrice: +extra.defaultPrice.toFixed(2),
                inputType: extra.inputType,
            })),
        [selectedBaseExtras],
    );
    const extrasPartnerTotal = useMemo(
        () =>
            selectedBaseExtras.reduce(
                (sum, extra) => sum + extra.defaultPrice,
                0,
            ),
        [selectedBaseExtras],
    );
    const extrasCommissionTotal = 0;
    const extrasTotal = +selectedExtras
        .reduce((sum, extra) => sum + extra.totalPrice, 0)
        .toFixed(2);

    const toggleOptionalExtra = (extraId: string) => {
        setSelectedOptionalExtraIds((current) =>
            current.includes(extraId)
                ? current.filter((id) => id !== extraId)
                : [...current, extraId],
        );
    };

    /**
     * Calcul du total en EUR selon le type de service.
     *   ACTIVITE     : clientPrice * participants
     *   BATEAU       : clientPrice * jours
     *   HEBERGEMENT  : clientPrice * nuits
     *   VOITURE      : clientPrice * jours
     */
    const totalPrice = useMemo(() => {
        if (service.category === "ACTIVITE") {
            return service.clientPrice * participants + extrasTotal;
        }

        const days = calcDays(dateFrom, dateTo);

        return days > 0
            ? service.clientPrice * days + extrasTotal
            : service.clientPrice + extrasTotal;
    }, [service, dateFrom, dateTo, participants, extrasTotal]);

    const daysCount = calcDays(dateFrom, dateTo);

    /** Libelle de l'unite de prix */
    const priceUnitLabel = useMemo(() => {
        switch (service.pricingUnit) {
            case "PAR_PERSONNE":
                return t("service.pricing_unit.person");
            case "PAR_GROUPE":
                return t("service.pricing_unit.group");
            case "PAR_JOUR":
                return t("service.pricing_unit.day");
            case "PAR_NUIT":
                return t("service.pricing_unit.night");
            case "PAR_SEMAINE":
                return t("service.pricing_unit.week");
            case "PAR_DEMI_JOURNEE":
                return t("service.pricing_unit.half_day");
            default:
                return "";
        }
    }, [service.pricingUnit, t]);

    /** Validation simple avant soumission */
    const handleReserve = () => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            navigate({ name: "login" });

            return;
        }

        if (!canReserve) {
            error(t("service.external_price_unavailable"));

            return;
        }

        if (service.category === "ACTIVITE") {
            if (!dateFrom) {
                error(t("service.booking.error.select_date"));

                return;
            }

            if (!timeSlot && service.schedule.startTimes.length > 0) {
                error(t("service.booking.error.select_slot"));

                return;
            }
        } else {
            if (!dateFrom || !dateTo) {
                error(t("service.booking.error.select_dates"));

                return;
            }

            if (daysCount <= 0) {
                error(t("service.booking.error.invalid_dates"));

                return;
            }
        }

        /**
         * Construction du brouillon de reservation.
         *
         * Calcul des unites de facturation selon la categorie :
         *   ACTIVITE   => participants (facturation a la personne)
         *   BATEAU     => jours (calcDays)
         *   VOITURE    => jours (calcDays)
         *   HEBERGEMENT => nuits (calcDays)
         *
         * Decomposition du prix (identite algebrique garantie par le modele) :
         *   partnerTotal    = service.partnerPrice    * units
         *   commissionTotal = service.commissionAmount * units
         *   clientTotal     = service.clientPrice     * units
         *   => partnerTotal + commissionTotal = clientTotal  ✓
         */
        const units =
            service.category === "ACTIVITE" ? participants : daysCount;

        const partnerTotal = service.partnerPrice * units + extrasPartnerTotal;
        const commissionTotal =
            service.commissionAmount * units + extrasCommissionTotal;
        const clientTotal = service.clientPrice * units + extrasTotal;

        // Calcul du repartition online / sur place selon le mode de paiement
        let amountDueOnline: number;
        let amountDueOnSite: number;

        if (service.paymentMode === "FULL_CASH_ON_SITE") {
            amountDueOnline = 0;
            amountDueOnSite = clientTotal;
        } else if (service.paymentMode === "COMMISSION_ONLINE_REST_ON_SITE") {
            amountDueOnline = commissionTotal;
            amountDueOnSite = partnerTotal;
        } else {
            // FULL_ONLINE (default)
            amountDueOnline = clientTotal;
            amountDueOnSite = 0;
        }

        initDraft({
            service,
            dateFrom,
            dateTo: dateTo || undefined,
            timeSlot: timeSlot || undefined,
            participants,
            units,
            partnerTotal,
            commissionTotal,
            clientTotal,
            currency: service.currency,
            paymentMode: service.paymentMode,
            amountDueOnline,
            amountDueOnSite,
            selectedExtras,
            extrasTotal,
        });

        navigate({ name: "cart" });
    };

    return (
        <div className="wdr-detail__booking-panel">
            {/* Prix de base */}
            <div className="wdr-detail__booking-price">
                {showDepositOnlyPrice ? (
                    <>
                        <span className="wdr-detail__booking-label-chip">
                            {t("service.external_price_total_label")}
                        </span>
                        <span className="wdr-detail__booking-amount wdr-detail__booking-amount--external">
                            {t("service.external_price_total_unknown")}
                        </span>
                    </>
                ) : showImportedPriceFallback ? (
                    <>
                        <span className="wdr-detail__booking-label-chip">
                            {t("service.external_price_label")}
                        </span>
                        <span className="wdr-detail__booking-amount wdr-detail__booking-amount--external">
                            {t("service.external_price_unavailable")}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="wdr-detail__booking-amount">
                            {formatPrice(service.clientPrice, service.currency)}
                        </span>
                        <span className="wdr-detail__booking-unit">
                            {priceUnitLabel}
                        </span>
                    </>
                )}
            </div>

            {showDepositOnlyPrice && (
                    <div className="wdr-detail__booking-external-meta">
                        <div className="wdr-detail__booking-external-row">
                            <span className="wdr-detail__booking-external-label">
                                {t("service.deposit")}
                            </span>
                        <strong className="wdr-detail__booking-external-value">
                            {depositDisplay}
                        </strong>
                        </div>
                        <p className="wdr-detail__booking-external-note">
                            {depositOnlySummary}
                        </p>
                        <p className="wdr-detail__booking-external-note">
                            {t("service.external_price_not_provided")}
                        </p>
                        <p className="wdr-detail__booking-external-note">
                            {t("service.external_price_confirmed_partner")}
                        </p>
                </div>
            )}

            {/* Note rapide */}
            {service.rating !== undefined && (
                <div className="wdr-detail__booking-rating">
                    <span
                        className="wdr-detail__booking-star"
                        aria-hidden="true"
                    >
                        &#9733;
                    </span>
                    <strong>{service.rating.toFixed(1)}</strong>
                    <span>
                        {t("service.reviews_count").replace(
                            "{count}",
                            String(service.reviewCount),
                        )}
                    </span>
                </div>
            )}

            <hr className="wdr-detail__booking-divider" />

            {/* Formulaire : champs selon la categorie */}
            <div className="wdr-detail__booking-form">
                {service.category === "ACTIVITE" ? (
                    <>
                        {/* Date de l'activite */}
                        <div className="wdr-detail__booking-field">
                            <label
                                htmlFor="booking-date"
                                className="wdr-detail__booking-label"
                            >
                                {t("service.booking.date_activity")}
                            </label>
                            <input
                                id="booking-date"
                                type="date"
                                className="wdr-detail__booking-input"
                                value={dateFrom}
                                min={today}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        {/* Creneau horaire */}
                        {service.schedule.startTimes.length > 0 && (
                            <div className="wdr-detail__booking-field">
                                <label
                                    htmlFor="booking-time"
                                    className="wdr-detail__booking-label"
                                >
                                    {t("service.booking.time_slot")}
                                </label>
                                <select
                                    id="booking-time"
                                    className="wdr-detail__booking-input"
                                    value={timeSlot}
                                    onChange={(e) =>
                                        setTimeSlot(e.target.value)
                                    }
                                >
                                    <option value="">
                                        {t("service.booking.choose_slot")}
                                    </option>
                                    {service.schedule.startTimes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Nombre de participants */}
                        <div className="wdr-detail__booking-field">
                            <label
                                htmlFor="booking-participants"
                                className="wdr-detail__booking-label"
                            >
                                {t("service.booking.participants")
                                    .replace(
                                        "{min}",
                                        String(service.minParticipants),
                                    )
                                    .replace(
                                        "{max}",
                                        String(service.maxParticipants),
                                    )}
                            </label>
                            <div className="wdr-detail__booking-counter">
                                <button
                                    type="button"
                                    className="wdr-detail__booking-counter-btn"
                                    onClick={() =>
                                        setParticipants((p) =>
                                            Math.max(
                                                service.minParticipants,
                                                p - 1,
                                            ),
                                        )
                                    }
                                    aria-label={t(
                                        "service.booking.decrease_participants",
                                    )}
                                    disabled={
                                        participants <= service.minParticipants
                                    }
                                >
                                    &minus;
                                </button>
                                <output
                                    id="booking-participants"
                                    className="wdr-detail__booking-counter-val"
                                    aria-live="polite"
                                >
                                    {participants}
                                </output>
                                <button
                                    type="button"
                                    className="wdr-detail__booking-counter-btn"
                                    onClick={() =>
                                        setParticipants((p) =>
                                            Math.min(
                                                service.maxParticipants,
                                                p + 1,
                                            ),
                                        )
                                    }
                                    aria-label={t(
                                        "service.booking.increase_participants",
                                    )}
                                    disabled={
                                        participants >= service.maxParticipants
                                    }
                                >
                                    &#43;
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Dates d'arrivee et de depart (bateau / hebergement / voiture) */}
                        <div className="wdr-detail__booking-field">
                            <label
                                htmlFor="booking-checkin"
                                className="wdr-detail__booking-label"
                            >
                                {service.category === "HEBERGEMENT"
                                    ? t("service.check_in")
                                    : t("service.booking.pickup")}
                            </label>
                            <input
                                id="booking-checkin"
                                type="date"
                                className="wdr-detail__booking-input"
                                value={dateFrom}
                                min={today}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);

                                    if (dateTo && dateTo <= e.target.value) {
                                        setDateTo("");
                                    }
                                }}
                            />
                        </div>

                        <div className="wdr-detail__booking-field">
                            <label
                                htmlFor="booking-checkout"
                                className="wdr-detail__booking-label"
                            >
                                {service.category === "HEBERGEMENT"
                                    ? t("service.check_out")
                                    : t("service.booking.return")}
                            </label>
                            <input
                                id="booking-checkout"
                                type="date"
                                className="wdr-detail__booking-input"
                                value={dateTo}
                                min={dateFrom || today}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        {/* Recapitulatif nuits/jours */}
                        {daysCount > 0 && (
                            <p
                                className="wdr-detail__booking-duration"
                                aria-live="polite"
                            >
                                {daysCount}{" "}
                                {service.category === "HEBERGEMENT"
                                    ? daysCount === 1
                                        ? t("service.booking.night_one")
                                        : t("service.booking.night_other")
                                    : daysCount === 1
                                      ? t("service.booking.day_one")
                                      : t("service.booking.day_other")}
                            </p>
                        )}
                    </>
                )}

                {serviceExtras.length > 0 && (
                    <div className="wdr-detail__booking-field">
                        <label className="wdr-detail__booking-label">
                            {t("service.booking.extras")}
                        </label>
                        <div className="wdr-detail__booking-extras">
                            {requiredExtras.map((extra) => (
                                <label
                                    key={extra.id}
                                    className="wdr-detail__booking-extra wdr-detail__booking-extra--locked"
                                >
                                    <input type="checkbox" checked disabled />
                                    <span>
                                        {extra.name}
                                        {extra.description
                                            ? ` - ${extra.description}`
                                            : ""}
                                    </span>
                                    <strong>
                                        {formatPrice(
                                            extra.defaultPrice *
                                                (1 + service.commissionRate),
                                            service.currency,
                                        )}
                                    </strong>
                                </label>
                            ))}
                            {optionalExtras.map((extra) => (
                                <label
                                    key={extra.id}
                                    className="wdr-detail__booking-extra"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedOptionalExtraIds.includes(
                                            extra.id,
                                        )}
                                        onChange={() =>
                                            toggleOptionalExtra(extra.id)
                                        }
                                    />
                                    <span>
                                        {extra.name}
                                        {extra.description
                                            ? ` - ${extra.description}`
                                            : ""}
                                    </span>
                                    <strong>
                                        {formatPrice(
                                            extra.defaultPrice *
                                                (1 + service.commissionRate),
                                            service.currency,
                                        )}
                                    </strong>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <hr className="wdr-detail__booking-divider" />

            {/* Total */}
            <div className="wdr-detail__booking-total">
                <span>{t("service.booking.total")}</span>
                <strong className="wdr-detail__booking-total-amount">
                    {formatPrice(totalPrice, service.currency)}
                </strong>
            </div>

            {/* Bouton CTA */}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canReserve}
                onClick={handleReserve}
            >
                {t("service.booking.reserve")}
            </Button>

            <p className="wdr-detail__booking-note">
                {t("service.booking.note")}
            </p>
        </div>
    );
};

// ============================================================
// Composant principal : ServiceDetailPage
// ============================================================

interface ServiceDetailPageProps {
    id: string;
    serviceExists?: boolean;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
    id,
    serviceExists,
}) => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const queryClient = useQueryClient();
    const { t, intlLocale, locale } = useTranslation();

    const { service: apiService, isLoading, isFetched, isNotFound } =
        useServiceData(id);
    const service = apiService ?? null;
    const { services } = useServicesData(
        service ? { category: service.category } : undefined,
    );
    const { favorites } = useFavoritesData(
        currentUser?.role === "CLIENT" ? currentUser.id : "",
    );

    // Services similaires (meme categorie, maximum 3)
    const similarServices = useMemo(() => {
        if (!service) {
            return [];
        }

        return services
            .filter(
                (s) => s.category === service.category && s.id !== service.id,
            )
            .slice(0, 3)
            .map(toServiceCardData);
    }, [service, services]);

    const { reviews } = useReviewsData(id);
    const { availabilities } = useAvailabilityData(id);
    const { categories: structureCategories } = useServiceStructureData();
    const isFavorite = useMemo(() => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            return false;
        }

        return favorites.some((favorite) => favorite.serviceId === id);
    }, [currentUser, favorites, id]);

    const toggleFavorite = async () => {
        if (!currentUser || currentUser.role !== "CLIENT") {
            navigate({ name: "login" });

            return;
        }

        if (isFavorite) {
            await favoritesApi.remove(id);
        } else {
            await favoritesApi.add(id);
        }

        await queryClient.invalidateQueries({
            queryKey: ["favorites", currentUser.id],
        });
    };

    const shouldShowLoading =
        Boolean(id) &&
        (isLoading || (!service && !isFetched && serviceExists !== false));
    const shouldShowNotFound =
        !shouldShowLoading && !service && (serviceExists === false || isNotFound);

    if (shouldShowLoading) {
        return (
            <div className="wdr-detail__loading" aria-busy="true">
                <div className="wdr-detail__loading-shell">
                    <div className="wdr-detail__loading-breadcrumb" />
                    <div className="wdr-detail__loading-gallery" />
                    <div className="wdr-detail__loading-layout">
                        <div className="wdr-detail__loading-main">
                            <div className="wdr-detail__loading-line wdr-detail__loading-line--title" />
                            <div className="wdr-detail__loading-line wdr-detail__loading-line--meta" />
                            <div className="wdr-detail__loading-line" />
                            <div className="wdr-detail__loading-line" />
                            <div className="wdr-detail__loading-line wdr-detail__loading-line--short" />
                        </div>
                        <div className="wdr-detail__loading-panel" />
                    </div>
                </div>
            </div>
        );
    }

    if (shouldShowNotFound) {
        return <NotFoundPage />;
    }

    if (!service) {
        return null;
    }

    const categoryLabel = getCategoryLabel(service.category, locale);
    const selectedStructureCategory =
        structureCategories.find(
            (entry) => entry.id === service.serviceCategoryId,
        ) ?? null;
    const dynamicAttributeLabels = new Map(
        (selectedStructureCategory?.attributes ?? []).map((attribute) => [
            attribute.key,
            attribute.label,
        ]),
    );
    const dynamicAttributes = Object.entries(
        (service.extraData?.attributes as Record<string, string | boolean>) ??
            {},
    ).filter(([, value]) => value !== "" && value !== false && value != null);
    const locationLabel = getLocationLabel(service);
    const descriptionBlocks = renderDescriptionBlocks(service.description);
    const serviceExtras = (selectedStructureCategory?.extras ?? []).filter(
        (extra) => extra.isActive,
    );
    const mapMarkers = useMemo(
        () =>
            service.location.coordinates
                ? [
                      {
                          id: service.id,
                          title: service.title,
                          latitude: service.location.coordinates.latitude,
                          longitude: service.location.coordinates.longitude,
                          subtitle: locationLabel,
                      },
                  ]
                : [],
        [locationLabel, service],
    );

    return (
        <div className="wdr-detail">
            {/* ============================================================
          Fil d'Ariane
          ============================================================ */}
            <nav
                className="wdr-detail__breadcrumb"
                aria-label={t("service.breadcrumb")}
            >
                <div className="wdr-detail__breadcrumb-inner">
                    <button
                        type="button"
                        className="wdr-detail__breadcrumb-link"
                        onClick={() => navigate({ name: "home" })}
                    >
                        {t("nav.home")}
                    </button>
                    <span aria-hidden="true">/</span>
                    <button
                        type="button"
                        className="wdr-detail__breadcrumb-link"
                        onClick={() =>
                            navigate({
                                name: "search",
                                query: "",
                                category: service.category,
                                dateFrom: "",
                                dateTo: "",
                            })
                        }
                    >
                        {categoryLabel}
                    </button>
                    <span aria-hidden="true">/</span>
                    <span
                        className="wdr-detail__breadcrumb-current"
                        aria-current="page"
                    >
                        {service.title}
                    </span>
                </div>
            </nav>

            {/* ============================================================
          Galerie d'images
          ============================================================ */}
            <div className="wdr-detail__gallery-wrapper">
                <ImageGallery images={service.images} title={service.title} />
            </div>

            {/* ============================================================
          Corps : infos + panneau de reservation
          ============================================================ */}
            <div className="wdr-detail__layout">
                {/* ---- Colonne gauche : informations detaillees ---- */}
                <div className="wdr-detail__info">
                    {/* En-tete du service */}
                    <header className="wdr-detail__service-header">
                        <div className="wdr-detail__service-header-top">
                            <div className="wdr-detail__service-badges">
                                <span className="wdr-detail__category-badge">
                                    {categoryLabel}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={`wdr-detail__fav-btn ${isFavorite ? "wdr-detail__fav-btn--active" : ""}`}
                                onClick={toggleFavorite}
                                aria-label={
                                    isFavorite
                                        ? t("service.favorite_remove")
                                        : t("service.favorite_add")
                                }
                                title={
                                    isFavorite
                                        ? t("service.favorite_remove")
                                        : t("service.favorite_add")
                                }
                            >
                                <svg
                                    width="20"
                                    height="20"
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
                        </div>
                        <h1 className="wdr-detail__title">{service.title}</h1>

                        <div className="wdr-detail__meta">
                            {service.rating !== undefined && (
                                <StarRating
                                    rating={service.rating}
                                    count={service.reviewCount}
                                />
                            )}
                            {locationLabel && (
                                <address
                                    className="wdr-detail__location"
                                    aria-label={t("service.location")}
                                >
                                    <svg
                                        width="14"
                                        height="14"
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
                                    {locationLabel}
                                </address>
                            )}
                        </div>
                    </header>

                    {/* Description */}
                    <section
                        className="wdr-detail__section"
                        aria-labelledby="desc-heading"
                    >
                        <h2
                            id="desc-heading"
                            className="wdr-detail__section-title"
                        >
                            {t("service.description")}
                        </h2>
                        <div className="wdr-detail__description">
                            {descriptionBlocks.map((block, index) => (
                                <React.Fragment key={index}>
                                    {block}
                                </React.Fragment>
                            ))}
                        </div>
                    </section>

                    {mapMarkers.length > 0 && (
                        <section
                            className="wdr-detail__section"
                            aria-labelledby="map-heading"
                        >
                            <div className="wdr-detail__section-header-inline">
                                <h2
                                    id="map-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.location")}
                                </h2>
                                <a
                                    className="wdr-detail__map-link"
                                    href={`https://www.openstreetmap.org/?mlat=${mapMarkers[0].latitude}&mlon=${mapMarkers[0].longitude}#map=13/${mapMarkers[0].latitude}/${mapMarkers[0].longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t("service.map_open")}
                                </a>
                            </div>
                            <GeoMap
                                markers={mapMarkers}
                                height={320}
                                className="wdr-detail__map"
                            />
                        </section>
                    )}

                    {(service.serviceCategoryName ||
                        service.serviceSubcategoryName ||
                        dynamicAttributes.length > 0) && (
                        <section
                            className="wdr-detail__section"
                            aria-labelledby="dynamic-heading"
                        >
                            <h2
                                id="dynamic-heading"
                                className="wdr-detail__section-title"
                            >
                                {t("service.features")}
                            </h2>
                            <dl className="wdr-detail__info-grid">
                                {service.serviceCategoryName && (
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.detail_category")}</dt>
                                        <dd>{service.serviceCategoryName}</dd>
                                    </div>
                                )}
                                {service.serviceSubcategoryName && (
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.subcategory")}</dt>
                                        <dd>
                                            {service.serviceSubcategoryName}
                                        </dd>
                                    </div>
                                )}
                                {dynamicAttributes.map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="wdr-detail__info-item"
                                    >
                                        <dt>
                                            {dynamicAttributeLabels.get(key) ??
                                                key.replaceAll("_", " ")}
                                        </dt>
                                        <dd>
                                            {typeof value === "boolean"
                                                ? value
                                                    ? t("service.yes")
                                                    : t("service.no")
                                                : String(value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}

                    {serviceExtras.length > 0 && (
                        <section
                            className="wdr-detail__section"
                            aria-labelledby="extras-heading"
                        >
                            <h2
                                id="extras-heading"
                                className="wdr-detail__section-title"
                            >
                                {t("service.extras_available")}
                            </h2>
                            <dl className="wdr-detail__info-grid">
                                {serviceExtras.map((extra) => (
                                    <div
                                        key={extra.id}
                                        className="wdr-detail__info-item"
                                    >
                                        <dt>{extra.name}</dt>
                                        <dd>
                                            {extra.description
                                                ? `${extra.description} - `
                                                : ""}
                                            {formatPrice(
                                                extra.defaultPrice *
                                                    (1 +
                                                        service.commissionRate),
                                                service.currency,
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}

                    {/* Sections specifiques a la categorie */}
                    {service.category === "ACTIVITE" && (
                        <>
                            {/* Inclus */}
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="included-heading"
                            >
                                <h2
                                    id="included-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.included")}
                                </h2>
                                <CheckList
                                    items={service.included}
                                    type="included"
                                />
                            </section>

                            {/* Non inclus */}
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="excluded-heading"
                            >
                                <h2
                                    id="excluded-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.excluded")}
                                </h2>
                                <CheckList
                                    items={service.notIncluded}
                                    type="excluded"
                                />
                            </section>

                            {/* Informations pratiques */}
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="practical-heading"
                            >
                                <h2
                                    id="practical-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.practical_info")}
                                </h2>
                                <dl className="wdr-detail__info-grid">
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.meeting_point")}</dt>
                                        <dd>{service.meetingPoint}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.departure_times")}</dt>
                                        <dd>
                                            {service.schedule.startTimes.join(
                                                " - ",
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.difficulty")}</dt>
                                        <dd>
                                            {service.difficulty.replace(
                                                "_",
                                                " ",
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.participants")}</dt>
                                        <dd>
                                            {service.minParticipants} -{" "}
                                            {service.maxParticipants} personnes
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.minimum_age")}</dt>
                                        <dd>{service.minAgeYears} ans</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.languages")}</dt>
                                        <dd>
                                            {service.languages
                                                .join(", ")
                                                .toUpperCase()}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.group_type")}</dt>
                                        <dd>
                                            {service.groupType.replace(
                                                "_",
                                                " ",
                                            )}
                                        </dd>
                                    </div>
                                    {service.requiresMedicalClearance && (
                                        <div className="wdr-detail__info-item wdr-detail__info-item--alert">
                                            <dt>
                                                {t("service.medical_clearance")}
                                            </dt>
                                            <dd>
                                                {t(
                                                    "service.medical_clearance_required",
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </section>
                        </>
                    )}

                    {service.category === "BATEAU" && (
                        <>
                            {/* Amenagements */}
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="amenities-heading"
                            >
                                <h2
                                    id="amenities-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.boats_amenities")}
                                </h2>
                                <CheckList
                                    items={service.amenities}
                                    type="included"
                                />
                            </section>

                            {/* Specifications techniques */}
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="specs-heading"
                            >
                                <h2
                                    id="specs-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.specifications")}
                                </h2>
                                <dl className="wdr-detail__info-grid">
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.boat_type")}</dt>
                                        <dd>{service.boatType}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.passengers")}</dt>
                                        <dd>
                                            {t("service.capacity_max").replace(
                                                "{count}",
                                                String(
                                                    service.passengerCapacity,
                                                ),
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.berths")}</dt>
                                        <dd>{service.sleepingBerths}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.length")}</dt>
                                        <dd>{service.lengthMeters} m</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.rental_mode")}</dt>
                                        <dd>
                                            {service.rentalMode.replace(
                                                /_/g,
                                                " ",
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.deposit")}</dt>
                                        <dd>
                                            {formatPrice(
                                                service.depositAmountEur,
                                                "EUR",
                                            )}
                                        </dd>
                                    </div>
                                    {service.licenseRequired && (
                                        <div className="wdr-detail__info-item wdr-detail__info-item--alert">
                                            <dt>
                                                {t("service.license_required")}
                                            </dt>
                                            <dd>{service.licenseType}</dd>
                                        </div>
                                    )}
                                </dl>
                            </section>
                        </>
                    )}

                    {service.category === "HEBERGEMENT" && (
                        <>
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="amenities-heading"
                            >
                                <h2
                                    id="amenities-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.equipment")}
                                </h2>
                                <CheckList
                                    items={service.amenities}
                                    type="included"
                                />
                            </section>

                            <section
                                className="wdr-detail__section"
                                aria-labelledby="stay-heading"
                            >
                                <h2
                                    id="stay-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.stay_conditions")}
                                </h2>
                                <dl className="wdr-detail__info-grid">
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.check_in")}</dt>
                                        <dd>
                                            {t("service.check_in_from").replace(
                                                "{time}",
                                                service.checkInTime,
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.check_out")}</dt>
                                        <dd>
                                            {t(
                                                "service.check_out_before",
                                            ).replace(
                                                "{time}",
                                                service.checkOutTime,
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.capacity")}</dt>
                                        <dd>
                                            {t("service.capacity_max").replace(
                                                "{count}",
                                                String(service.maxGuests),
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.minimum_stay")}</dt>
                                        <dd>
                                            {t(
                                                "service.minimum_stay_nights",
                                            ).replace(
                                                "{count}",
                                                String(
                                                    service.minimumStayNights,
                                                ),
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.cancellation")}</dt>
                                        <dd>{service.cancellationPolicy}</dd>
                                    </div>
                                </dl>
                            </section>

                            {service.houseRules.length > 0 && (
                                <section
                                    className="wdr-detail__section"
                                    aria-labelledby="rules-heading"
                                >
                                    <h2
                                        id="rules-heading"
                                        className="wdr-detail__section-title"
                                    >
                                        {t("service.house_rules")}
                                    </h2>
                                    <ul className="wdr-detail__rule-list">
                                        {service.houseRules.map((rule) => (
                                            <li key={rule}>{rule}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </>
                    )}

                    {service.category === "VOITURE" && (
                        <>
                            <section
                                className="wdr-detail__section"
                                aria-labelledby="car-specs-heading"
                            >
                                <h2
                                    id="car-specs-heading"
                                    className="wdr-detail__section-title"
                                >
                                    {t("service.car_features")}
                                </h2>
                                <dl className="wdr-detail__info-grid">
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.vehicle")}</dt>
                                        <dd>
                                            {service.brand} {service.model} (
                                            {service.year})
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.transmission")}</dt>
                                        <dd>{service.transmission}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.fuel")}</dt>
                                        <dd>{service.fuelType}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.seats")}</dt>
                                        <dd>{service.seats}</dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.luggage")}</dt>
                                        <dd>
                                            {t("service.luggage_details")
                                                .replace(
                                                    "{large}",
                                                    String(
                                                        service.luggage
                                                            .largeSuitcases,
                                                    ),
                                                )
                                                .replace(
                                                    "{small}",
                                                    String(
                                                        service.luggage
                                                            .smallBags,
                                                    ),
                                                )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.mileage")}</dt>
                                        <dd>
                                            {service.mileageLimit === "ILLIMITE"
                                                ? t("service.unlimited")
                                                : t(
                                                      "service.mileage_per_day",
                                                  ).replace(
                                                      "{count}",
                                                      String(
                                                          service.mileageLimit,
                                                      ),
                                                  )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.insurance")}</dt>
                                        <dd>
                                            {service.insuranceIncluded
                                                ? t("service.included_feminine")
                                                : t(
                                                      "service.not_included_feminine",
                                                  )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.deposit")}</dt>
                                        <dd>
                                            {formatPrice(
                                                service.depositAmountEur,
                                                "EUR",
                                            )}
                                        </dd>
                                    </div>
                                    <div className="wdr-detail__info-item">
                                        <dt>{t("service.driver_age")}</dt>
                                        <dd>
                                            {t(
                                                "service.driver_age_min",
                                            ).replace(
                                                "{age}",
                                                String(service.driverMinAge),
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            {service.deliveryAvailable &&
                                service.deliveryLocations && (
                                    <section
                                        className="wdr-detail__section"
                                        aria-labelledby="pickup-heading"
                                    >
                                        <h2
                                            id="pickup-heading"
                                            className="wdr-detail__section-title"
                                        >
                                            {t("service.pickup_points")}
                                        </h2>
                                        <ul className="wdr-detail__rule-list">
                                            {service.deliveryLocations.map(
                                                (loc) => (
                                                    <li key={loc}>{loc}</li>
                                                ),
                                            )}
                                        </ul>
                                    </section>
                                )}
                        </>
                    )}
                </div>

                {/* ---- Colonne droite : panneau de reservation ---- */}
                <div className="wdr-detail__booking-col">
                    <BookingPanel
                        service={service}
                        serviceExtras={serviceExtras}
                    />
                </div>
            </div>

            {/* ============================================================
          Section : Disponibilites
          ============================================================ */}
            {availabilities.length > 0 && (
                <section
                    className="wdr-detail__availability"
                    aria-labelledby="avail-heading"
                >
                    <div className="wdr-detail__section-wrapper">
                        <h2
                            id="avail-heading"
                            className="wdr-detail__similar-title"
                        >
                            {t("service.availability")}
                        </h2>
                        <div className="wdr-detail__avail-grid">
                            {availabilities.slice(0, 6).map((avail) => (
                                <div
                                    key={avail.id}
                                    className="wdr-detail__avail-card"
                                >
                                    <span className="wdr-detail__avail-date">
                                        {avail.date}
                                    </span>
                                    <div className="wdr-detail__avail-slots">
                                        {avail.slots.map((slot) => (
                                            <span
                                                key={slot.startTime}
                                                className="wdr-detail__avail-slot"
                                            >
                                                {slot.startTime}
                                                <small>
                                                    ({slot.maxCapacity}{" "}
                                                    {t("service.places")})
                                                </small>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================================
          Section : Avis clients
          ============================================================ */}
            <section
                className="wdr-detail__reviews"
                aria-labelledby="reviews-heading"
            >
                <div className="wdr-detail__section-wrapper">
                    <h2
                        id="reviews-heading"
                        className="wdr-detail__similar-title"
                    >
                        {t("service.customer_reviews").replace(
                            "{count}",
                            String(reviews.length),
                        )}
                    </h2>
                    {reviews.length === 0 ? (
                        <EmptyState
                            title={t("service.no_reviews_title")}
                            description={t("service.no_reviews_desc")}
                        />
                    ) : (
                        <div className="wdr-detail__reviews-grid">
                            {reviews.map((review) => {
                                return (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        authorName={
                                            review.authorName ?? "Utilisateur"
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ============================================================
          Section : Services similaires
          ============================================================ */}
            {similarServices.length > 0 && (
                <section
                    className="wdr-detail__similar"
                    aria-labelledby="similar-heading"
                >
                    <div className="wdr-detail__similar-inner">
                        <h2
                            id="similar-heading"
                            className="wdr-detail__similar-title"
                        >
                            {t("service.similar")}
                        </h2>
                        <div className="wdr-detail__similar-grid">
                            {similarServices.map((s) => (
                                <ServiceCard
                                    key={s.id}
                                    service={s}
                                    variant="compact"
                                    onBookClick={(sid) =>
                                        navigate({ name: "service", id: sid })
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
