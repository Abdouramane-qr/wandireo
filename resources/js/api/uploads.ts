/**
 * @file uploads.ts
 * @description Endpoint de generation d'URL pre-signees S3 ou fallback local.
 */

import api from './client';

export interface PresignRequest {
    fileName: string;
    contentType: string;
    folder?: 'services' | 'blog' | 'avatars';
}

export interface PresignResponse {
    uploadUrl: string;
    publicUrl: string;
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function isSameOriginUpload(url: string): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const resolvedUrl = new URL(url, window.location.origin);

        return resolvedUrl.origin === window.location.origin;
    } catch {
        return false;
    }
}

export const uploadsApi = {
    presign: (data: PresignRequest) =>
        api.post<PresignResponse>('/uploads/presign', data).then((r) => r.data),

    uploadFile: (uploadUrl: string, file: File) => {
        if (isSameOriginUpload(uploadUrl)) {
            const formData = new FormData();
            const csrfToken = readCookie('XSRF-TOKEN');
            formData.append('file', file);

            return fetch(uploadUrl, {
                method: 'POST',
                headers: csrfToken
                    ? {
                          'X-XSRF-TOKEN': csrfToken,
                      }
                    : undefined,
                body: formData,
                credentials: 'include',
            });
        }

        return fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
            credentials: 'include',
        });
    },
};
