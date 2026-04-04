import { usePage } from '@inertiajs/react';
import SeoHead from '@/components/seo/SeoHead';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { BlogPostPage } from '@/pages/wdr-pages/BlogPostPage';

export default function BlogShow() {
    const { slug } = usePage<{ slug: string }>().props;

    return (
        <WdrPageShell>
            <SeoHead />
            <BlogPostPage slug={slug} />
        </WdrPageShell>
    );
}
