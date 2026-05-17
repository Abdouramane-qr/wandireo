import api from "@/api/client";
import type {
    PartnerDocument,
    PartnerDocumentStatus,
    PartnerDocumentType,
} from "@/types/partner-document";

function asDate(value: unknown): Date | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(String(value));

    return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizePartnerDocument(raw: unknown): PartnerDocument {
    const data =
        raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

    return {
        id: Number(data.id),
        partnerId: Number(data.partnerId),
        partnerName:
            typeof data.partnerName === "string" ? data.partnerName : undefined,
        uploadedBy:
            data.uploadedBy == null ? undefined : Number(data.uploadedBy),
        reviewedBy:
            data.reviewedBy == null ? undefined : Number(data.reviewedBy),
        documentType: String(data.documentType) as PartnerDocumentType,
        status: String(data.status) as PartnerDocumentStatus,
        filePath: String(data.filePath ?? ""),
        originalName:
            typeof data.originalName === "string"
                ? data.originalName
                : undefined,
        mimeType: typeof data.mimeType === "string" ? data.mimeType : undefined,
        sizeBytes: data.sizeBytes == null ? undefined : Number(data.sizeBytes),
        rejectionReason:
            typeof data.rejectionReason === "string"
                ? data.rejectionReason
                : undefined,
        reviewedAt: asDate(data.reviewedAt),
        expiresAt: asDate(data.expiresAt),
        createdAt: asDate(data.createdAt) ?? new Date(0),
        updatedAt: asDate(data.updatedAt) ?? new Date(0),
    };
}

export interface PartnerDocumentsResponse {
    data: PartnerDocument[];
}

export interface AdminPartnerDocumentsParams {
    partnerId?: number;
    status?: PartnerDocumentStatus;
    page?: number;
    limit?: number;
}

export interface AdminPartnerDocumentsResponse {
    data: PartnerDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const partnerDocumentsApi = {
    mine: () =>
        api.get<{ data: unknown[] }>("/partner/documents").then(
            (response): PartnerDocumentsResponse => ({
                data: response.data.data.map(normalizePartnerDocument),
            }),
        ),

    upload: (payload: {
        documentType: PartnerDocumentType;
        document: File;
        expiresAt?: string;
    }) => {
        const formData = new FormData();
        formData.append("document_type", payload.documentType);
        formData.append("document", payload.document);

        if (payload.expiresAt) {
            formData.append("expires_at", payload.expiresAt);
        }

        return api
            .post<unknown>("/partner/documents", formData)
            .then((response) => normalizePartnerDocument(response.data));
    },

    adminList: (params?: AdminPartnerDocumentsParams) =>
        api
            .get<{
                data: unknown[];
                total: number;
                current_page: number;
                per_page: number;
                last_page: number;
            }>("/partner-documents", { params })
            .then(
                (response): AdminPartnerDocumentsResponse => ({
                    data: response.data.data.map(normalizePartnerDocument),
                    total: response.data.total,
                    page: response.data.current_page,
                    limit: response.data.per_page,
                    totalPages: response.data.last_page,
                }),
            ),

    adminUpdate: (
        id: number,
        payload: {
            status: Exclude<PartnerDocumentStatus, "UPLOADED">;
            rejectionReason?: string;
            expiresAt?: string;
        },
    ) =>
        api
            .patch<unknown>(`/partner-documents/${id}`, {
                status: payload.status,
                rejection_reason: payload.rejectionReason,
                expires_at: payload.expiresAt,
            })
            .then((response) => normalizePartnerDocument(response.data)),
};
