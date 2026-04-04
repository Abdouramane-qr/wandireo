/**
 * @file auth.ts
 * @description Endpoints d'authentification.
 */

import type { User } from '@/types/wdr-user';
import api from './client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}

export interface PartnerRegisterRequest extends RegisterRequest {
    companyName: string;
    businessAddress?: string;
}

export const authApi = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

    registerPartner: (data: PartnerRegisterRequest) =>
        api
            .post<{ message: string }>('/auth/register-partner', data)
            .then((r) => r.data),

    logout: () => api.delete('/auth/logout').then((r) => r.data),

    me: () => api.get<User>('/users/me').then((r) => r.data),

    forgotPassword: (email: string) =>
        api
            .post<{ message: string }>('/auth/forgot-password', { email })
            .then((r) => r.data),
};
