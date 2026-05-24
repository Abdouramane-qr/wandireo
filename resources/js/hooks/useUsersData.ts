/**
 * @file useUsersData.ts
 * @description Couche de donnees utilisateurs basee sur l'API Laravel.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users";
import type {
    AdminCreateUserRequest,
    AdminCreatePartnerRequest,
    AdminUpdateUserRequest,
    PartnerContractSignRequest,
    UsersParams,
} from "@/api/users";
import type { User } from "@/types/wdr-user";

export function useAdminUsersData(
    params?: UsersParams,
    enabled = true,
): {
    users: User[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ["users", "admin", params ?? {}],
        queryFn: async () => (await usersApi.adminListAll(params)).data,
        staleTime: 60_000,
        retry: 1,
        enabled,
    });

    return { users: query.data ?? [], isLoading: query.isLoading };
}

export function useAdminContractTemplateData(enabled = true) {
    return useQuery({
        queryKey: ["users", "contract-template"],
        queryFn: () => usersApi.adminContractTemplate(),
        staleTime: 60_000,
        retry: 1,
        enabled,
    });
}

export function useAdminUpdateUserData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: AdminUpdateUserRequest;
        }) => usersApi.adminUpdate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminUpdateContractTemplateData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            contractText,
            applyToPartners,
        }: {
            contractText: string;
            applyToPartners?: boolean;
        }) =>
            usersApi.adminUpdateContractTemplate(contractText, applyToPartners),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["users", "contract-template"],
            });
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminCreatePartnerData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AdminCreatePartnerRequest) =>
            usersApi.adminCreatePartner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminCreateUserData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AdminCreateUserRequest) =>
            usersApi.adminCreate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminUploadPartnerContractData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            usersApi.adminUploadContract(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminMarkPartnerContractSignedData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: string }) =>
            usersApi.adminMarkContractSigned(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function useAdminResetUserPasswordData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, password }: { id: string; password?: string }) =>
            usersApi.adminResetPassword(id, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["audit-log"] });
        },
    });
}

export function usePartnerSignContractData() {
    return useMutation({
        mutationFn: (data: PartnerContractSignRequest) =>
            usersApi.partnerSignContract(data),
    });
}
