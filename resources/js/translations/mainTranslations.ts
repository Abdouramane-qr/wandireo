import type { Locale } from "@/lib/locale";
import { buildMainFrTranslations } from "./mainFr";
import { buildMainEnTranslations } from "./mainEn";
import { buildMainPtTranslations } from "./mainPt";
import { buildMainEsTranslations } from "./mainEs";
import { buildMainItTranslations } from "./mainIt";
import { buildMainDeTranslations } from "./mainDe";

export function buildMainTranslations(locale: Locale): Record<string, string> {
    const base = buildMainFrTranslations(); // Fallback values from FR

    switch (locale) {
        case "en":
            return { ...base, ...buildMainEnTranslations() };
        case "pt":
            return { ...base, ...buildMainPtTranslations() };
        case "es":
            return { ...base, ...buildMainEsTranslations() };
        case "it":
            return { ...base, ...buildMainItTranslations() };
        case "de":
            return { ...base, ...buildMainDeTranslations() };
        case "fr":
        default:
            return base;
    }
}
