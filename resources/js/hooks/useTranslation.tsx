import { usePage } from "@inertiajs/react";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { useCallback, useEffect } from "react";
import {
    initReactI18next,
    useTranslation as useI18nextTranslation,
} from "react-i18next";
import {
    FALLBACK_LOCALE,
    INTL_LOCALES,
    type Locale,
    normalizeLocale,
    withLocale,
} from "@/lib/locale";

import { buildAuthBookingFrTranslations } from "@/translations/authBookingFr";
import { buildAuthBookingEnTranslations } from "@/translations/authBookingEn";
import { buildAuthBookingPtTranslations } from "@/translations/authBookingPt";
import { buildAuthBookingEsTranslations } from "@/translations/authBookingEs";
import { buildDiscoveryFrTranslations } from "@/translations/discoveryFr";
import { buildDiscoveryEnTranslations } from "@/translations/discoveryEn";
import { buildDiscoveryPtTranslations } from "@/translations/discoveryPt";
import { buildDiscoveryEsTranslations } from "@/translations/discoveryEs";
import { buildServiceFrTranslations } from "@/translations/serviceFr";
import { buildServiceEnTranslations } from "@/translations/serviceEn";
import { buildServicePtTranslations } from "@/translations/servicePt";
import { buildServiceEsTranslations } from "@/translations/serviceEs";
import { buildPublicPagesFrTranslations } from "@/translations/publicPagesFr";
import { buildPublicPagesEnTranslations } from "@/translations/publicPagesEn";
import { buildPublicPagesPtTranslations } from "@/translations/publicPagesPt";
import { buildPublicPagesEsTranslations } from "@/translations/publicPagesEs";
import { buildPartnerFrTranslations } from "@/translations/partnerFr";
import { buildPartnerEnTranslations } from "@/translations/partnerEn";
import { buildPartnerPtTranslations } from "@/translations/partnerPt";
import { buildPartnerEsTranslations } from "@/translations/partnerEs";
import { buildAdminFrTranslations } from "@/translations/adminFr";
import { buildAdminEnTranslations } from "@/translations/adminEn";
import { buildAdminPtTranslations } from "@/translations/adminPt";
import { buildAdminEsTranslations } from "@/translations/adminEs";
import { buildSharedUiTranslations } from "@/translations/sharedUi";
import { buildFareHarborTranslations } from "@/translations/fareHarbor";
import { buildMainTranslations } from "@/translations/mainTranslations";

export type { Locale } from "@/lib/locale";

const translations: Record<Locale, Record<string, string>> = {
    fr: {
        ...buildMainTranslations("fr"),
        ...buildAuthBookingFrTranslations(),
        ...buildDiscoveryFrTranslations(),
        ...buildServiceFrTranslations(),
        ...buildPublicPagesFrTranslations(),
        ...buildPartnerFrTranslations(),
        ...buildAdminFrTranslations(),
        ...buildSharedUiTranslations("fr"),
        ...buildFareHarborTranslations("fr"),
    },
    en: {
        ...buildMainTranslations("en"),
        ...buildAuthBookingEnTranslations(),
        ...buildDiscoveryEnTranslations(),
        ...buildServiceEnTranslations(),
        ...buildPublicPagesEnTranslations(),
        ...buildPartnerEnTranslations(),
        ...buildAdminEnTranslations(),
        ...buildSharedUiTranslations("en"),
        ...buildFareHarborTranslations("en"),
    },
    pt: {
        ...buildMainTranslations("pt"),
        ...buildAuthBookingPtTranslations(),
        ...buildDiscoveryPtTranslations(),
        ...buildServicePtTranslations(),
        ...buildPublicPagesPtTranslations(),
        ...buildPartnerPtTranslations(),
        ...buildAdminPtTranslations(),
        ...buildSharedUiTranslations("pt"),
        ...buildFareHarborTranslations("pt"),
    },
    es: {
        ...buildMainTranslations("es"),
        ...buildAuthBookingEsTranslations(),
        ...buildDiscoveryEsTranslations(),
        ...buildServiceEsTranslations(),
        ...buildPublicPagesEsTranslations(),
        ...buildPartnerEsTranslations(),
        ...buildAdminEsTranslations(),
        ...buildSharedUiTranslations("es"),
        ...buildFareHarborTranslations("es"),
    },
    it: {
        ...buildMainTranslations("it"),
        ...buildSharedUiTranslations("it"),
        ...buildFareHarborTranslations("it"),
    },
    de: {
        ...buildMainTranslations("de"),
        ...buildSharedUiTranslations("de"),
        ...buildFareHarborTranslations("de"),
    },
};

// Ensure all locales have FR fallback for missing keys
const otherLocales: Locale[] = ["pt", "en", "es", "it", "de"];
for (const locale of otherLocales) {
    translations[locale] = {
        ...translations.fr,
        ...translations[locale],
    };
}

const i18nResources = Object.fromEntries(
    Object.entries(translations).map(([locale, catalog]) => [
        locale,
        { translation: catalog },
    ]),
) as Record<Locale, { translation: Record<string, string> }>;

export function useTranslation() {
    const { props, url } = usePage<{
        locale?: Locale;
        supportedLocales?: Locale[];
        fallbackLocale?: Locale;
    }>();
    const locale = props.locale || FALLBACK_LOCALE;
    const { t: rawTranslate, i18n: i18nInstance } = useI18nextTranslation();

    useEffect(() => {
        if (i18nInstance.language !== locale) {
            void i18nInstance.changeLanguage(locale);
        }

        document.documentElement.lang = locale;
        window.localStorage.setItem("wandireo-locale", locale);
    }, [i18nInstance, locale]);

    const t = useCallback(
        (key: string): string => {
            const fallbackLocale = props.fallbackLocale || FALLBACK_LOCALE;

            return rawTranslate(key, {
                defaultValue:
                    translations[locale]?.[key] ??
                    translations[fallbackLocale]?.[key] ??
                    translations.fr[key] ??
                    key,
            });
        },
        [locale, props.fallbackLocale, rawTranslate],
    );

    const setLocale = (newLocale: Locale) => {
        const targetLocale = normalizeLocale(newLocale) ?? FALLBACK_LOCALE;
        const maxAge = 365 * 24 * 60 * 60;

        document.cookie = `locale=${targetLocale};path=/;max-age=${maxAge};SameSite=Lax`;
        window.localStorage.setItem("wandireo-locale", targetLocale);
        window.location.assign(withLocale(url, targetLocale));
    };

    return {
        t,
        locale,
        intlLocale: INTL_LOCALES[locale],
        setLocale,
    };
}

if (!i18n.isInitialized) {
    void i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources: i18nResources,
            lng: FALLBACK_LOCALE,
            fallbackLng: FALLBACK_LOCALE,
            supportedLngs: Object.keys(i18nResources),
            interpolation: {
                escapeValue: false,
            },
            detection: {
                order: ["htmlTag", "cookie", "localStorage", "navigator"],
                caches: ["localStorage", "cookie"],
                lookupCookie: "locale",
                lookupLocalStorage: "wandireo-locale",
            },
        });
}
