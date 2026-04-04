import { usePage } from '@inertiajs/react';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { ConfirmationPage } from '@/pages/wdr-pages/ConfirmationPage';
export default function Confirmation() {
    const { bookingId } = usePage<{ bookingId: string }>().props;

    return (
        <WdrPageShell>
            <ConfirmationPage bookingId={bookingId} />
        </WdrPageShell>
    );
}
