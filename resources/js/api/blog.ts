/**
 * @file blog.ts
 * @description Endpoints du blog.
 */

import { normalizeBlogPost } from '@/lib/api-normalizers';
import type { BlogPost, BlogStatus } from '@/types/blog';
import api from './client';

export interface BlogPostsParams {
    status?: BlogStatus;
    tag?: string;
    page?: number;
    limit?: number;
}

export interface BlogPostsResponse {
    data: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateBlogPostRequest {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    tags: string[];
    status: BlogStatus;
}

export const blogApi = {
    list: (params?: BlogPostsParams) =>
        api
            .get<{
                data: unknown[];
                total: number;
                current_page: number;
                last_page: number;
            }>('/blog/posts', { params })
            .then((response) => ({
                data: response.data.data.map(normalizeBlogPost),
                total: response.data.total,
                page: response.data.current_page,
                totalPages: response.data.last_page,
            })),

    getBySlug: (slug: string) =>
        api
            .get<unknown>(`/blog/posts/${slug}`)
            .then((response) => normalizeBlogPost(response.data)),

    getById: (id: string) =>
        api
            .get<unknown>(`/blog/posts/by-id/${id}`)
            .then((response) => normalizeBlogPost(response.data)),

    create: (data: CreateBlogPostRequest) =>
        api
            .post<unknown>('/blog/posts', data)
            .then((response) => normalizeBlogPost(response.data)),

    update: (id: string, data: Partial<CreateBlogPostRequest>) =>
        api
            .patch<unknown>(`/blog/posts/${id}`, data)
            .then((response) => normalizeBlogPost(response.data)),

    delete: (id: string) => api.delete(`/blog/posts/${id}`).then((r) => r.data),
};
