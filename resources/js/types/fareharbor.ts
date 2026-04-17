export interface FareHarborCompany {
    id: string;
    displayName: string;
    companySlug: string;
    partnerId?: string;
    partnerName?: string;
    partnerEmail?: string;
    isEnabled: boolean;
    syncItemsEnabled: boolean;
    syncDetailsEnabled: boolean;
    lastSyncedAt?: Date;
    lastStatus: string;
    lastImportedItemsCount: number;
    lastError?: string;
}
