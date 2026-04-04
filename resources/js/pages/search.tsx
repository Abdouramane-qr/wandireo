import { usePage } from '@inertiajs/react';
import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { SearchPage } from '@/pages/wdr-pages/SearchPage';

interface SearchPageProps {
    q?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: unknown;
}

export default function Search() {
    const { q, category, dateFrom, dateTo } = usePage<SearchPageProps>().props;

    return (
        <WdrPageShell>
            <SeoHead />
            <SearchPage
                q={q}
                category={category}
                dateFrom={dateFrom}
                dateTo={dateTo}
            />
        </WdrPageShell>
    );
}
