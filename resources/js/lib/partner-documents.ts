import type {
    PartnerDocumentStatus,
    PartnerDocumentType,
} from "@/types/partner-document";

export const PARTNER_DOCUMENT_TYPES: PartnerDocumentType[] = [
    "BUSINESS_REGISTRATION",
    "TAX_CERTIFICATE",
    "INSURANCE",
    "IDENTITY",
    "OTHER",
];

export const PARTNER_DOCUMENT_STATUSES: PartnerDocumentStatus[] = [
    "UPLOADED",
    "UNDER_REVIEW",
    "VALIDATED",
    "REJECTED",
    "EXPIRED",
];

export function getPartnerDocumentTypeLabel(
    type: PartnerDocumentType,
    t: (key: string) => string,
): string {
    return t(`partner.documents.type.${type.toLowerCase()}`);
}

export function getPartnerDocumentStatusLabel(
    status: PartnerDocumentStatus,
    t: (key: string) => string,
): string {
    return t(`partner.documents.status.${status.toLowerCase()}`);
}

export function getPartnerDocumentStatusClass(
    status: PartnerDocumentStatus,
): string {
    return status.toLowerCase().replaceAll("_", "-");
}

export function formatPartnerDocumentSize(sizeBytes?: number): string {
    if (!sizeBytes || sizeBytes <= 0) {
        return "-";
    }

    if (sizeBytes < 1024 * 1024) {
        return `${Math.round(sizeBytes / 1024)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
