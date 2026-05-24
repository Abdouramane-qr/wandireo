/**
 * @file users.ts
 * @description Endpoints de gestion des utilisateurs.
 */

import { normalizeUser } from "@/lib/api-normalizers";
import api from "./client";

export interface UpdateMeRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    language?: string;
    preferredCurrency?: string;
    profilePicture?: string;
    companyName?: string;
    businessAddress?: string;
    legalCompanyName?: string;
    taxCountry?: string;
    vatNumber?: string;
    businessRegistrationNumber?: string;
    billingEmail?: string;
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
    legalCompanyName?: string;
    taxCountry?: string;
    vatNumber?: string;
    businessRegistrationNumber?: string;
    billingEmail?: string;
    role?: "CLIENT" | "PARTNER" | "ADMIN";
    permissions?: string[];
    partnerStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    partnerRejectionReason?: string;
    mandateContractStatus?:
        | "NOT_SENT"
        | "PENDING_SIGNATURE"
        | "SIGNED"
        | "REJECTED";
    mandateContractFilePath?: string;
    mandateContractText?: string;
}

export interface AdminCreatePartnerRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    businessAddress?: string;
    legalCompanyName?: string;
    taxCountry?: string;
    vatNumber?: string;
    businessRegistrationNumber?: string;
    billingEmail?: string;
    phoneNumber?: string;
    commissionRate?: number;
    partnerStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    mandateContractStatus?:
        | "NOT_SENT"
        | "PENDING_SIGNATURE"
        | "SIGNED"
        | "REJECTED";
    mandateContractFilePath?: string;
    mandateContractText?: string;
}

export interface AdminCreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "CLIENT" | "PARTNER" | "ADMIN";
    phoneNumber?: string;
    language?: string;
    preferredCurrency?: string;
    companyName?: string;
    businessAddress?: string;
    legalCompanyName?: string;
    taxCountry?: string;
    vatNumber?: string;
    businessRegistrationNumber?: string;
    billingEmail?: string;
    commissionRate?: number;
    partnerStatus?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    mandateContractStatus?:
        | "NOT_SENT"
        | "PENDING_SIGNATURE"
        | "SIGNED"
        | "REJECTED";
    mandateContractFilePath?: string;
    mandateContractText?: string;
}

export interface PartnerContractSignRequest {
    accepted: boolean;
}

export interface AdminContractTemplateResponse {
    contractText: string;
    updatedPartners?: number;
}

export interface UsersParams {
    search?: string;
    role?: string;
    partnerStatus?: string;
    page?: number;
    limit?: number;
}

export const usersApi = {
    me: () => api.get<unknown>("/users/me").then((r) => normalizeUser(r.data)),

    updateMe: (data: UpdateMeRequest) =>
        api
            .patch<unknown>("/users/me", {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone_number: data.phoneNumber,
                language: data.language,
                preferred_currency: data.preferredCurrency,
                company_name: data.companyName,
                business_address: data.businessAddress,
                legal_company_name: data.legalCompanyName,
                tax_country: data.taxCountry,
                vat_number: data.vatNumber,
                business_registration_number: data.businessRegistrationNumber,
                billing_email: data.billingEmail,
            })
            .then((r) => normalizeUser(r.data)),

    changePassword: (oldPassword: string, newPassword: string) =>
        api
            .post<{
                message: string;
            }>("/users/me/password", { oldPassword, newPassword })
            .then((r) => r.data),

    /** Admin : liste tous les utilisateurs. */
    adminList: (params?: UsersParams) =>
        api
            .get<{ data: unknown[]; total: number }>("/users", { params })
            .then((r) => ({
                ...r.data,
                data: r.data.data.map(normalizeUser),
            })),

    adminListAll: async (params?: UsersParams) => {
        const firstPage = await usersApi.adminList({
            ...params,
            page: 1,
            limit: params?.limit ?? 100,
        });

        const currentPage = Number(
            (firstPage as { current_page?: number }).current_page ?? 1,
        );
        const lastPage = Number(
            (firstPage as { last_page?: number }).last_page ?? 1,
        );

        if (lastPage <= 1) {
            return firstPage;
        }

        const remainingPages = await Promise.all(
            Array.from({ length: lastPage - currentPage }, (_, index) =>
                usersApi.adminList({
                    ...params,
                    page: index + currentPage + 1,
                    limit: params?.limit ?? 100,
                }),
            ),
        );

        return {
            ...firstPage,
            data: [firstPage, ...remainingPages].flatMap((page) => page.data),
        };
    },

    adminContractTemplate: () =>
        api
            .get<{ contract_text: string }>("/users/contract-template")
            .then((r) => ({
                contractText: r.data.contract_text,
            })),

    adminUpdateContractTemplate: (
        contractText: string,
        applyToPartners = true,
    ) =>
        api
            .patch<{
                contract_text: string;
                updated_partners: number;
            }>("/users/contract-template", {
                contract_text: contractText,
                apply_to_partners: applyToPartners,
            })
            .then(
                (r): AdminContractTemplateResponse => ({
                    contractText: r.data.contract_text,
                    updatedPartners: r.data.updated_partners,
                }),
            ),

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
                legal_company_name: data.legalCompanyName,
                tax_country: data.taxCountry,
                vat_number: data.vatNumber,
                business_registration_number: data.businessRegistrationNumber,
                billing_email: data.billingEmail,
                role: data.role,
                permissions: data.permissions,
                partner_status: data.partnerStatus,
                partner_rejection_reason: data.partnerRejectionReason,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
                mandate_contract_text: data.mandateContractText,
            })
            .then((r) => normalizeUser(r.data)),

    adminCreatePartner: (data: AdminCreatePartnerRequest) =>
        api
            .post<unknown>("/users/partners", {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: data.password,
                company_name: data.companyName,
                business_address: data.businessAddress,
                legal_company_name: data.legalCompanyName,
                tax_country: data.taxCountry,
                vat_number: data.vatNumber,
                business_registration_number: data.businessRegistrationNumber,
                billing_email: data.billingEmail,
                phone_number: data.phoneNumber,
                commission_rate: data.commissionRate,
                partner_status: data.partnerStatus,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
                mandate_contract_text: data.mandateContractText,
            })
            .then((r) => normalizeUser(r.data)),

    adminCreate: (data: AdminCreateUserRequest) =>
        api
            .post<unknown>("/users", {
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
                legal_company_name: data.legalCompanyName,
                tax_country: data.taxCountry,
                vat_number: data.vatNumber,
                business_registration_number: data.businessRegistrationNumber,
                billing_email: data.billingEmail,
                commission_rate: data.commissionRate,
                partner_status: data.partnerStatus,
                mandate_contract_status: data.mandateContractStatus,
                mandate_contract_file_path: data.mandateContractFilePath,
                mandate_contract_text: data.mandateContractText,
            })
            .then((r) => normalizeUser(r.data)),

    adminUploadContract: (id: string, file: File) => {
        const formData = new FormData();
        formData.append("contract", file);

        return api
            .post<unknown>(`/users/${id}/contract`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((r) => normalizeUser(r.data));
    },

    adminMarkContractSigned: (id: string) =>
        api
            .post<unknown>(`/users/${id}/contract/mark-signed`)
            .then((r) => normalizeUser(r.data)),

    adminResetPassword: (id: string, password?: string) =>
        api
            .post<{
                user: unknown;
                temporary_password: string;
            }>(`/users/${id}/password`, { password })
            .then((r) => ({
                user: normalizeUser(r.data.user),
                temporaryPassword: r.data.temporary_password,
            })),

    partnerSignContract: (data: PartnerContractSignRequest) =>
        api
            .post<unknown>("/partner/contract/sign", {
                accepted: data.accepted,
            })
            .then((r) => normalizeUser(r.data)),
};
