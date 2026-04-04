import { usePage } from '@inertiajs/react';

export interface GeoContext {
    countryCode?: string | null;
    countryName?: string | null;
    suggestedLocale: string;
    suggestedCurrency: string;
    source: string;
}

type SharedPageProps = {
    geoContext?: GeoContext;
};

export function useGeoContext(): GeoContext {
    const page = usePage<SharedPageProps>();

    return (
        page.props.geoContext ?? {
            countryCode: null,
            countryName: null,
            suggestedLocale: 'fr',
            suggestedCurrency: 'EUR',
            source: 'none',
        }
    );
}
