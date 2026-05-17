export type PartnerDocumentType =
    | "BUSINESS_REGISTRATION"
    | "TAX_CERTIFICATE"
    | "INSURANCE"
    | "IDENTITY"
    | "OTHER";

export type PartnerDocumentStatus =
    | "UPLOADED"
    | "UNDER_REVIEW"
    | "VALIDATED"
    | "REJECTED"
    | "EXPIRED";

export interface PartnerDocument {
    id: number;
    partnerId: number;
    partnerName?: string;
    uploadedBy?: number;
    reviewedBy?: number;
    documentType: PartnerDocumentType;
    status: PartnerDocumentStatus;
    filePath: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    rejectionReason?: string;
    reviewedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
