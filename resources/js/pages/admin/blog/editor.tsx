import { usePage } from '@inertiajs/react';
import WdrPageShell from '@/components/wdr/WdrPageShell';
import { AdminBlogEditorPage } from '@/pages/wdr-pages/AdminBlogEditorPage';
export default function AdminBlogEditor() {
    const { postId } = usePage<{ postId?: string }>().props;

    return (
        <WdrPageShell>
            <AdminBlogEditorPage postId={postId} />
        </WdrPageShell>
    );
}
