import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { LegalPage } from '@/pages/wdr-pages/LegalPage';

export default function Legal() {
    return (
        <WdrPageShell>
            <SeoHead />
            <LegalPage />
        </WdrPageShell>
    );
}
