import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { GuidePage } from '@/pages/wdr-pages/GuidePage';

export default function Guide() {
    return (
        <WdrPageShell>
            <SeoHead />
            <GuidePage />
        </WdrPageShell>
    );
}
