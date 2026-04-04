import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { PrivacyPage } from '@/pages/wdr-pages/PrivacyPage';

export default function Privacy() {
    return (
        <WdrPageShell>
            <SeoHead />
            <PrivacyPage />
        </WdrPageShell>
    );
}
