import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { BlogPage } from '@/pages/wdr-pages/BlogPage';

export default function Blog() {
    return (
        <WdrPageShell>
            <SeoHead />
            <BlogPage />
        </WdrPageShell>
    );
}
