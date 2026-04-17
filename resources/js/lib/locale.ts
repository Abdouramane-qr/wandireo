export type Locale = 'fr' | 'en' | 'pt' | 'es' | 'it' | 'de';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'pt', 'es', 'it', 'de'];
export const FALLBACK_LOCALE: Locale = 'fr';

export const INTL_LOCALES: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    pt: 'pt-PT',
    es: 'es-ES',
    it: 'it-IT',
    de: 'de-DE',
};

export const LOCALE_LABELS: Record<Locale, string> = {
    fr: 'Français',
    en: 'English',
    pt: 'Português',
    es: 'Español',
    it: 'Italiano',
    de: 'Deutsch',
};

function splitPath(path: string): {
    pathname: string;
    search: string;
    hash: string;
} {
    const [pathnameWithSearch, hash = ''] = path.split('#', 2);
    const [pathname = '/', search = ''] = pathnameWithSearch.split('?', 2);

    return {
        pathname: pathname || '/',
        search: search ? `?${search}` : '',
        hash: hash ? `#${hash}` : '',
    };
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().slice(0, 2).toLowerCase() as Locale;

    return SUPPORTED_LOCALES.includes(normalized) ? normalized : null;
}

export function getLocaleFromPath(pathname: string): Locale | null {
    const [segment] = pathname.replace(/^\/+/, '').split('/');

    return normalizeLocale(segment);
}

export function getBrowserLocale(): Locale {
    if (typeof window === 'undefined') {
        return FALLBACK_LOCALE;
    }

    return (
        getLocaleFromPath(window.location.pathname) ??
        normalizeLocale(document.documentElement.lang) ??
        normalizeLocale(window.localStorage.getItem('wandireo-locale')) ??
        FALLBACK_LOCALE
    );
}

export function stripLocaleFromPath(path: string): string {
    const { pathname, search, hash } = splitPath(path);
    const locale = getLocaleFromPath(pathname);

    if (!locale) {
        return `${pathname}${search}${hash}`;
    }

    const nextPathname = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';

    return `${nextPathname}${search}${hash}`;
}

export function localizePath(
    path: string | undefined,
    locale: Locale = getBrowserLocale(),
): string | undefined {
    if (!path) {
        return path;
    }

    if (/^(https?:|mailto:|tel:|#)/i.test(path)) {
        return path;
    }

    const normalized = path.startsWith('/') ? path : `/${path}`;
    const unlocalized = stripLocaleFromPath(normalized);

    if (unlocalized === '/') {
        return `/${locale}`;
    }

    return `/${locale}${unlocalized}`;
}

export function withLocale(path: string, locale: Locale): string {
    return localizePath(path, locale) ?? path;
}
