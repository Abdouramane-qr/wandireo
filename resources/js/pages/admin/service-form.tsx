import { usePage } from '@inertiajs/react';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { PartnerServiceFormPage } from '@/pages/wdr-pages/PartnerServiceFormPage';

export default function AdminServiceForm() {
    const { serviceId } = usePage<{ serviceId?: string }>().props;

    return (
        <WdrPageShell>
            <PartnerServiceFormPage adminMode serviceId={serviceId} />
        </WdrPageShell>
    );
}
