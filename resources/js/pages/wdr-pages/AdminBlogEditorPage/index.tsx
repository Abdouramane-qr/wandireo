import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { blogApi } from '@/api/blog';
import { uploadsApi } from '@/api/uploads';
import { Breadcrumb, Button, Input, useToast } from '@/components/wdr';
import { useUser } from '@/context/UserContext';
import { useAdminBlogPostData } from '@/hooks/useBlogData';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from '@/hooks/useWdrRouter';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { BlogStatusNames } from '@/types/blog';
import type { BlogStatus } from '@/types/blog';
import './AdminBlogEditorPage.css';

function slugify(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

interface BlogFormState {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string;
    status: BlogStatus;
}

interface AdminBlogEditorPageProps {
    postId?: string;
}

export const AdminBlogEditorPage: React.FC<AdminBlogEditorPageProps> = ({
    postId,
}) => {
    const { navigate } = useRouter();
    const { currentUser } = useUser();
    const { success, error } = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const isEditing = !!postId;
    const { post: existingPost } = useAdminBlogPostData(postId ?? '');

    const [form, setForm] = useState<BlogFormState>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        tags: '',
        status: BlogStatusNames.DRAFT,
    });
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [errors, setErrors] = useState<
        Partial<Record<keyof BlogFormState, string>>
    >({});

    useEffect(() => {
        if (!existingPost || !isEditing) {
            return;
        }

        setForm({
            title: existingPost.title,
            slug: existingPost.slug,
            excerpt: existingPost.excerpt,
            content: existingPost.content,
            coverImage: existingPost.coverImage,
            tags: existingPost.tags.join(', '),
            status: existingPost.status,
        });
    }, [existingPost, isEditing]);

    const safePreview = useMemo(
        () => sanitizeHtml(form.content),
        [form.content],
    );

    const setField = <K extends keyof BlogFormState>(
        key: K,
        value: BlogFormState[K],
    ) => {
        setForm((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const handleTitleChange = (value: string) => {
        setField('title', value);

        if (!slugManuallyEdited) {
            setField('slug', slugify(value));
        }
    };

    const handleCoverUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setUploadingCover(true);

        try {
            const presigned = await uploadsApi.presign({
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                folder: 'blog',
            });

            const response = await uploadsApi.uploadFile(
                presigned.uploadUrl,
                file,
            );

            if (!response.ok) {
                throw new Error('upload_failed');
            }

            setField('coverImage', presigned.publicUrl);
            success(t('admin.blog.editor.cover_success'));
        } catch {
            error(t('admin.blog.editor.cover_error'));
        } finally {
            setUploadingCover(false);
            event.target.value = '';
        }
    };

    function validate(): boolean {
        const nextErrors: Partial<Record<keyof BlogFormState, string>> = {};

        if (!form.title.trim()) {
            nextErrors.title = t('admin.blog.editor.error.title');
        }

        if (!form.slug.trim()) {
            nextErrors.slug = t('admin.blog.editor.error.slug');
        }

        if (!form.excerpt.trim()) {
            nextErrors.excerpt = t('admin.blog.editor.error.excerpt');
        }

        if (!form.content.trim()) {
            nextErrors.content = t('admin.blog.editor.error.content');
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        if (!validate()) {
            error(t('admin.blog.editor.validate_error'));
            return;
        }

        setSaving(true);

        const payload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            excerpt: form.excerpt.trim(),
            content: form.content,
            coverImage: form.coverImage.trim(),
            tags: form.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            status: form.status,
        };

        try {
            if (isEditing && postId) {
                await blogApi.update(postId, payload);
                success(t('admin.blog.editor.save_success_update'));
            } else {
                await blogApi.create(payload);
                success(t('admin.blog.editor.save_success_create'));
            }

            await queryClient.invalidateQueries({ queryKey: ['blog'] });
            navigate({ name: 'admin-blog' });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const validationErrors = err.response?.data?.errors as
                    | Record<string, string[]>
                    | undefined;
                const firstMessage = validationErrors
                    ? Object.values(validationErrors)
                          .flat()
                          .find(Boolean)
                    : undefined;

                error(firstMessage ?? t('admin.blog.editor.save_error'));
            } else {
                error(t('admin.blog.editor.save_error'));
            }
        } finally {
            setSaving(false);
        }
    }

    const submitLabel = saving
        ? t('admin.blog.editor.actions.saving')
        : uploadingCover
          ? t('admin.blog.editor.actions.uploading')
          : form.status === BlogStatusNames.PUBLISHED
            ? isEditing
                ? t('admin.blog.editor.actions.update')
                : t('admin.blog.editor.actions.publish')
            : isEditing
              ? t('admin.blog.editor.actions.save')
              : t('admin.blog.editor.actions.save_draft');

    return (
        <div className="wdr-editor">
            <div className="wdr-editor__breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        {
                            label: t('admin.blog.home'),
                            onClick: () => navigate({ name: 'home' }),
                        },
                        {
                            label: t('admin.blog.admin'),
                            onClick: () =>
                                navigate({ name: 'admin-dashboard' }),
                        },
                        {
                            label: t('nav.blog'),
                            onClick: () => navigate({ name: 'admin-blog' }),
                        },
                        {
                            label: isEditing
                                ? t('admin.blog.editor.edit')
                                : t('admin.blog.editor.new'),
                        },
                    ]}
                />
            </div>

            <div className="wdr-editor__header">
                <div className="wdr-editor__header-inner">
                    <h1 className="wdr-editor__title">
                        {isEditing
                            ? t('admin.blog.editor.edit')
                            : t('admin.blog.editor.new')}
                    </h1>
                    {currentUser && (
                        <p className="wdr-editor__hint">
                            {t('admin.blog.editor.author')} :{' '}
                            {currentUser.firstName} {currentUser.lastName}
                        </p>
                    )}
                </div>
            </div>

            <form
                className="wdr-editor__form"
                onSubmit={(event) => void handleSubmit(event)}
                noValidate
            >
                <div className="wdr-editor__layout">
                    <div className="wdr-editor__main">
                        <div className="wdr-editor__field">
                            <label
                                htmlFor="ed-title"
                                className="wdr-editor__label"
                            >
                                {t('admin.blog.editor.title')}{' '}
                                <span aria-hidden="true">*</span>
                            </label>
                            <Input
                                id="ed-title"
                                value={form.title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder={t(
                                    'admin.blog.editor.placeholder.title',
                                )}
                                aria-describedby={
                                    errors.title ? 'ed-title-err' : undefined
                                }
                            />
                            {errors.title && (
                                <p
                                    id="ed-title-err"
                                    className="wdr-editor__error"
                                >
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="wdr-editor__field">
                            <label
                                htmlFor="ed-slug"
                                className="wdr-editor__label"
                            >
                                {t('admin.blog.editor.slug')}{' '}
                                <span aria-hidden="true">*</span>
                            </label>
                            <div className="wdr-editor__slug-wrapper">
                                <span className="wdr-editor__slug-prefix">
                                    /blog/
                                </span>
                                <input
                                    id="ed-slug"
                                    type="text"
                                    className="wdr-editor__slug-input"
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugManuallyEdited(true);
                                        setField(
                                            'slug',
                                            e.target.value
                                                .toLowerCase()
                                                .replace(/\s+/g, '-'),
                                        );
                                    }}
                                    placeholder={t(
                                        'admin.blog.editor.placeholder.slug',
                                    )}
                                    aria-describedby={
                                        errors.slug ? 'ed-slug-err' : undefined
                                    }
                                />
                            </div>
                            {errors.slug && (
                                <p
                                    id="ed-slug-err"
                                    className="wdr-editor__error"
                                >
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        <div className="wdr-editor__field">
                            <label
                                htmlFor="ed-excerpt"
                                className="wdr-editor__label"
                            >
                                {t('admin.blog.editor.excerpt')}{' '}
                                <span aria-hidden="true">*</span>
                            </label>
                            <textarea
                                id="ed-excerpt"
                                className="wdr-editor__textarea wdr-editor__textarea--sm"
                                rows={2}
                                value={form.excerpt}
                                onChange={(e) =>
                                    setField('excerpt', e.target.value)
                                }
                                placeholder={t(
                                    'admin.blog.editor.placeholder.excerpt',
                                )}
                                aria-describedby={
                                    errors.excerpt
                                        ? 'ed-excerpt-err'
                                        : undefined
                                }
                            />
                            {errors.excerpt && (
                                <p
                                    id="ed-excerpt-err"
                                    className="wdr-editor__error"
                                >
                                    {errors.excerpt}
                                </p>
                            )}
                        </div>

                        <div className="wdr-editor__field">
                            <div className="wdr-editor__content-header">
                                <label className="wdr-editor__label">
                                    {t('admin.blog.editor.content')}{' '}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <div className="wdr-editor__tabs" role="tablist">
                                    <button
                                        type="button"
                                        role="tab"
                                        className={`wdr-editor__tab ${activeTab === 'edit' ? 'wdr-editor__tab--active' : ''}`}
                                        aria-selected={activeTab === 'edit'}
                                        onClick={() => setActiveTab('edit')}
                                    >
                                        {t('admin.blog.editor.edit_tab')}
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        className={`wdr-editor__tab ${activeTab === 'preview' ? 'wdr-editor__tab--active' : ''}`}
                                        aria-selected={activeTab === 'preview'}
                                        onClick={() => setActiveTab('preview')}
                                    >
                                        {t('admin.blog.editor.preview_tab')}
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'edit' ? (
                                <>
                                    <textarea
                                        id="ed-content"
                                        className="wdr-editor__textarea wdr-editor__textarea--lg"
                                        rows={20}
                                        value={form.content}
                                        onChange={(e) =>
                                            setField('content', e.target.value)
                                        }
                                        placeholder={t(
                                            'admin.blog.editor.placeholder.content',
                                        )}
                                        aria-describedby={
                                            errors.content
                                                ? 'ed-content-err'
                                                : undefined
                                        }
                                        spellCheck
                                    />
                                    {errors.content && (
                                        <p
                                            id="ed-content-err"
                                            className="wdr-editor__error"
                                        >
                                            {errors.content}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div
                                    className="wdr-editor__preview wdr-post__body"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            safePreview ||
                                            `<p><em>${t('admin.blog.editor.placeholder.preview')}</em></p>`,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <aside className="wdr-editor__sidebar">
                        <div className="wdr-editor__panel">
                            <h2 className="wdr-editor__panel-title">
                                {t('admin.blog.editor.status')}
                            </h2>
                            <div className="wdr-editor__field">
                                <div className="wdr-editor__status-btns">
                                    {(
                                        [
                                            BlogStatusNames.DRAFT,
                                            BlogStatusNames.PUBLISHED,
                                        ] as const
                                    ).map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            className={`wdr-editor__status-btn ${form.status === status ? 'wdr-editor__status-btn--active' : ''}`}
                                            onClick={() =>
                                                setField('status', status)
                                            }
                                        >
                                            <span
                                                className={`wdr-editor__status-dot wdr-editor__status-dot--${status.toLowerCase()}`}
                                                aria-hidden="true"
                                            />
                                            {status === BlogStatusNames.DRAFT
                                                ? t(
                                                      'admin.blog.status.draft',
                                                  )
                                                : t(
                                                      'admin.blog.status.published',
                                                  )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="wdr-editor__panel">
                            <h2 className="wdr-editor__panel-title">
                                {t('admin.blog.editor.cover')}
                            </h2>
                            <div className="wdr-editor__field">
                                <input
                                    className="wdr-editor__file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        void handleCoverUpload(event)
                                    }
                                    disabled={uploadingCover || saving}
                                />
                                <p className="wdr-editor__hint">
                                    {t('admin.blog.editor.cover_hint')}
                                </p>
                                {uploadingCover && (
                                    <p className="wdr-editor__hint">
                                        {t(
                                            'admin.blog.editor.cover_uploading',
                                        )}
                                    </p>
                                )}
                                {form.coverImage && (
                                    <div className="wdr-editor__cover-preview">
                                        <img
                                            src={form.coverImage}
                                            alt={t(
                                                'admin.blog.editor.cover_preview',
                                            )}
                                        />
                                    </div>
                                )}
                                {form.coverImage && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setField('coverImage', '')
                                        }
                                        disabled={saving || uploadingCover}
                                    >
                                        {t(
                                            'admin.blog.editor.cover_remove',
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="wdr-editor__panel">
                            <h2 className="wdr-editor__panel-title">
                                {t('admin.blog.column.tags')}
                            </h2>
                            <div className="wdr-editor__field">
                                <Input
                                    value={form.tags}
                                    onChange={(e) =>
                                        setField('tags', e.target.value)
                                    }
                                    placeholder={t(
                                        'admin.blog.editor.placeholder.tags',
                                    )}
                                    aria-label={t(
                                        'admin.blog.editor.tags_aria',
                                    )}
                                />
                                <p className="wdr-editor__hint">
                                    {t('admin.blog.editor.tags_hint')}
                                </p>
                                {form.tags && (
                                    <div className="wdr-editor__tag-preview">
                                        {form.tags
                                            .split(',')
                                            .map((tag) => tag.trim())
                                            .filter(Boolean)
                                            .map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="wdr-editor__tag-chip"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="wdr-editor__panel wdr-editor__panel--actions">
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                disabled={saving || uploadingCover}
                            >
                                {submitLabel}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                fullWidth
                                onClick={() => navigate({ name: 'admin-blog' })}
                                disabled={saving}
                            >
                                {t('admin.blog.editor.actions.back')}
                            </Button>
                        </div>
                    </aside>
                </div>
            </form>
        </div>
    );
};

export default AdminBlogEditorPage;
