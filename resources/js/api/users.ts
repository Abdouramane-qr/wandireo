/**
 * @file users.ts
 * @description Endpoints de gestion des utilisateurs.
 */

import { normalizeUser } from '@/lib/api-normalizers';
import api from './client';

export interface UpdateMeRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    language?: string;
    profilePicture?: string;
}

export interface UpdatePartnerRequest {
    companyName?: string;
    businessAddress?: string;
}

export interface AdminUpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    language?: string;
    preferredCurrency?: string;
    companyName?: string;
    commissionRate?: number;
    stripeConnectedAccountId?: string;
    businessAddress?: string;
    role?: 'CLIENT' | 'PARTNER' | 'ADMIN';
    partnerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    partnerRejectionReason?: string;
    mandateContractStatus?:
        | 'NOT_SENT'
        | 'PENDING_SIGNATURE'
        | 'SIGNED'
        | 'REJECTED';
    mandateContractFilePath?: string;
}

export interface AdminCreatePartnerRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    businessAddress?: string;
    phoneNumber?: string;
    commissionRate?: number;
    partnerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    mandateContractStatus?:
        | 'NOT_SENT'
        | 'PENDING_SIGNATURE'
        | 'SIGNED'
        | 'REJECTED';
    mandateContractFilePath?: string;
}

export interface AdminCreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'CLIENT' | 'PARTNER' | 'ADMIN';
    phoneNumber?: string;
    language?: string;
    preferredCurrency?: string;
    companyName?: string;
    businessAddress?: string;
    commissionRate?: number;
    partnerStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    mandateContractStatus?:
        | 'NOT_SENT'
        | 'PENDING_SIGNATURE'
        | 'SIGNED'
        | 'REJECTED';
    mandateContractFilePath?: string;
}

export interface UsersParams {
    search?: string;
    role?: string;
    partnerStatus?: string;
    page?: number;
    limit?: number;
}

export const usersApi = {
    me: () => api.get<unknown>('/users/me').then((r) => normalizeUser(r.data)),

    updateMe: (data: UpdateMeRequest | UpdatePartnerRequest) =>
        api
            .patch<unknown>('/users/me', data)
            .then((r) => normalizeUser(r.data)),

    changePassword: (oldPassword: string, newPassword: string) =>
        api
            .post<{
                message: string;
            }>('/users/me/password', { oldPassword, newPassword })
            .then((r) => r.data),

    /** Admin : liste tous les utilisateurs. */
    adminList: (params?: UsersParams) =>
        api
            .get<{ data: unknown[]; total: number }>('/users', { params })
            .then((r) => ({
                ...r.data,
                data: r.data.data.map(normalizeUser),
            })),

    /** Admin : modifier un utilisateur (commission, suspension). */
    adminUpdate: (id: string, data: AdminUpdateUserRequest) =>
        api
            .patch<unknown>(`/users/${id}`, {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone_number: data.phoneNumber,
                language: data.language,
                preferred_currency: data.preferredCurrency,
                company_name: data.companyName,
                commission_rate: data.commissionRate,
                stripe_connected_account_id: data.stripeConnectedAccountId,
                business_address: data.businessAddress,
                role: data.role,
                partner_status: data.partnerStatus,
                partner_rejection_reason: data.partnerRejectionReason,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
            })
            .then((r) => normalizeUser(r.data)),

    adminCreatePartner: (data: AdminCreatePartnerRequest) =>
        api
            .post<unknown>('/users/partners', {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: data.password,
                company_name: data.companyName,
                business_address: data.businessAddress,
                phone_number: data.phoneNumber,
                commission_rate: data.commissionRate,
                partner_status: data.partnerStatus,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
            })
            .then((r) => normalizeUser(r.data)),

    adminCreate: (data: AdminCreateUserRequest) =>
        api
            .post<unknown>('/users', {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: data.password,
                role: data.role,
                phone_number: data.phoneNumber,
                language: data.language,
                preferred_currency: data.preferredCurrency,
                company_name: data.companyName,
                business_address: data.businessAddress,
                commission_rate: data.commissionRate,
                partner_status: data.partnerStatus,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
            })
            .then((r) => normalizeUser(r.data)),

    adminUploadContract: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('contract', file);

        return api
            .post<unknown>(`/users/${id}/contract`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((r) => normalizeUser(r.data));
    },
};
