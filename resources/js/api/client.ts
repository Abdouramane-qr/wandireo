/**
 * @file client.ts
 * @description Client HTTP centralise pour les appels API Wandireo.
 *
 * L'application web s'appuie sur la session Laravel/Fortify et les cookies
 * du meme domaine. Aucun token n'est stocke dans le navigateur.
 */

import axios from 'axios';

const SESSION_KEY = 'wandireo-session-id';

function getBrowserSessionId(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const existing = window.localStorage.getItem(SESSION_KEY);

    if (existing) {
        return existing;
    }

    const next =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `wandireo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(SESSION_KEY, next);

    return next;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    timeout: 15_000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.request.use((config) => {
    const sessionId = getBrowserSessionId();

    if (sessionId) {
        config.headers['X-Wandireo-Session'] = sessionId;
    }

    return config;
});

export default api;
