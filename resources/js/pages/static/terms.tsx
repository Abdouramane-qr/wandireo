import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { TermsPage } from '@/pages/wdr-pages/TermsPage';

export default function Terms() {
    return (
        <WdrPageShell>
            <SeoHead />
            <TermsPage />
        </WdrPageShell>
    );
}
