/**
 * @file useBlogData.ts
 * @description Couche de donnees blog basee sur l'API Laravel.
 */

import { useQuery } from '@tanstack/react-query';
import { blogApi  } from '@/api/blog';
import type {BlogPostsParams} from '@/api/blog';
import type { BlogPost } from '@/types/blog';

export function useBlogPostsData(params?: BlogPostsParams): {
    posts: BlogPost[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['blog', 'list', params ?? {}],
        queryFn: async () => {
            const response = await blogApi.list(params);

            return response.data;
        },
        staleTime: 120_000,
        retry: 1,
    });

    return { posts: query.data ?? [], isLoading: query.isLoading };
}

export function useBlogPostData(slug: string): {
    post: BlogPost | undefined;
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['blog', 'post', slug],
        queryFn: async () => blogApi.getBySlug(slug),
        staleTime: 120_000,
        enabled: Boolean(slug),
        retry: 1,
    });

    return { post: query.data, isLoading: query.isLoading };
}

export function useAdminBlogPostData(id: string): {
    post: BlogPost | undefined;
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ['blog', 'admin-post', id],
        queryFn: async () => blogApi.getById(id),
        staleTime: 120_000,
        enabled: Boolean(id),
        retry: 1,
    });

    return { post: query.data, isLoading: query.isLoading };
}
