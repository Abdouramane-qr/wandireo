import { usePage } from '@inertiajs/react';
import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { ServiceDetailPage } from '@/pages/wdr-pages/ServiceDetailPage';

export default function ServiceShow() {
    const { id } = usePage<{ id: string }>().props;

    return (
        <WdrPageShell>
            <SeoHead />
            <ServiceDetailPage id={id} />
        </WdrPageShell>
    );
}
