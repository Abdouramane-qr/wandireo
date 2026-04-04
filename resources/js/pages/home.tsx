import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { HomePage } from '@/pages/wdr-pages/HomePage';

export default function Home() {
    return (
        <WdrPageShell>
            <SeoHead />
            <HomePage />
        </WdrPageShell>
    );
}
