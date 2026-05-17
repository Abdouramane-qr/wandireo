import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    partnerDocumentsApi,
    type AdminPartnerDocumentsParams,
} from "@/api/partner-documents";
import type {
    PartnerDocument,
    PartnerDocumentStatus,
    PartnerDocumentType,
} from "@/types/partner-document";

export function usePartnerDocumentsData(): {
    documents: PartnerDocument[];
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ["partner-documents", "mine"],
        queryFn: async () => (await partnerDocumentsApi.mine()).data,
        staleTime: 60_000,
        retry: 1,
    });

    return {
        documents: query.data ?? [],
        isLoading: query.isLoading,
    };
}

export function usePartnerDocumentUploadData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            documentType: PartnerDocumentType;
            document: File;
            expiresAt?: string;
        }) => partnerDocumentsApi.upload(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["partner-documents", "mine"],
            });
            queryClient.invalidateQueries({
                queryKey: ["partner-documents", "admin"],
            });
            queryClient.invalidateQueries({
                queryKey: ["audit-log"],
            });
        },
    });
}

export function useAdminPartnerDocumentsData(
    params?: AdminPartnerDocumentsParams,
): {
    documents: PartnerDocument[];
    total: number;
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ["partner-documents", "admin", params ?? {}],
        queryFn: async () => partnerDocumentsApi.adminList(params),
        staleTime: 60_000,
        retry: 1,
    });

    return {
        documents: query.data?.data ?? [],
        total: query.data?.total ?? 0,
        isLoading: query.isLoading,
    };
}

export function useAdminPartnerDocumentReviewData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            status,
            rejectionReason,
            expiresAt,
        }: {
            id: number;
            status: Exclude<PartnerDocumentStatus, "UPLOADED">;
            rejectionReason?: string;
            expiresAt?: string;
        }) =>
            partnerDocumentsApi.adminUpdate(id, {
                status,
                rejectionReason,
                expiresAt,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["partner-documents"],
            });
            queryClient.invalidateQueries({
                queryKey: ["audit-log"],
            });
        },
    });
}
