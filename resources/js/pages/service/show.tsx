import { usePage } from '@inertiajs/react';
import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { ServiceDetailPage } from '@/pages/wdr-pages/ServiceDetailPage';

export default function ServiceShow() {
    const { id, serviceExists } = usePage<{
        id: string;
        serviceExists?: boolean;
    }>().props;

    return (
        <WdrPageShell>
            <SeoHead />
            <ServiceDetailPage id={id} serviceExists={serviceExists} />
        </WdrPageShell>
    );
}
