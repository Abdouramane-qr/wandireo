import api from "./client";
import type { FareHarborCompany } from "@/types/fareharbor";

function normalizeFareHarborCompany(
    raw: Record<string, unknown>,
): FareHarborCompany {
    const partner =
        raw.partner && typeof raw.partner === "object"
            ? (raw.partner as Record<string, unknown>)
            : null;

    return {
        id: String(raw.id ?? ""),
        displayName: String(raw.display_name ?? raw.displayName ?? ""),
        companySlug: String(raw.company_slug ?? raw.companySlug ?? ""),
        partnerId:
            String(
                raw.partner_id ??
                    raw.partnerId ??
                    partner?.id ??
                    "",
            ) || undefined,
        partnerName:
            String(
                partner?.company_name ??
                    partner?.companyName ??
                    partner?.name ??
                    "",
            ) || undefined,
        partnerEmail: String(partner?.email ?? "") || undefined,
        isEnabled: Boolean(raw.is_enabled ?? raw.isEnabled),
        syncItemsEnabled: Boolean(
            raw.sync_items_enabled ?? raw.syncItemsEnabled,
        ),
        syncDetailsEnabled: Boolean(
            raw.sync_details_enabled ?? raw.syncDetailsEnabled,
        ),
        lastSyncedAt:
            raw.last_synced_at || raw.lastSyncedAt
                ? new Date(String(raw.last_synced_at ?? raw.lastSyncedAt))
                : undefined,
        lastStatus: String(raw.last_status ?? raw.lastStatus ?? "IDLE"),
        lastImportedItemsCount: Number(
            raw.last_imported_items_count ?? raw.lastImportedItemsCount ?? 0,
        ),
        lastError:
            String(raw.last_error ?? raw.lastError ?? "") || undefined,
    };
}

export interface FareHarborCompanyPayload {
    display_name: string;
    company_slug: string;
    partner_id?: string;
    is_enabled: boolean;
    sync_items_enabled: boolean;
    sync_details_enabled: boolean;
    create_partner_account?: boolean;
}

export interface FareHarborPartnerCredentials {
    email: string;
    temporaryPassword: string;
}

export const fareHarborApi = {
    list: () =>
        api
            .get<{ data: Record<string, unknown>[] }>("/fareharbor/companies")
            .then((response) =>
                response.data.data.map(normalizeFareHarborCompany),
            ),

    create: (payload: FareHarborCompanyPayload) =>
        api
            .post<Record<string, unknown>>("/fareharbor/companies", payload)
            .then((response) => ({
                company: normalizeFareHarborCompany(
                    (response.data.company as Record<string, unknown>) ??
                        response.data,
                ),
                partnerCredentials:
                    response.data.partner_credentials &&
                    typeof response.data.partner_credentials === "object"
                        ? {
                              email: String(
                                  (
                                      response.data.partner_credentials as Record<
                                          string,
                                          unknown
                                      >
                                  ).email ?? "",
                              ),
                              temporaryPassword: String(
                                  (
                                      response.data.partner_credentials as Record<
                                          string,
                                          unknown
                                      >
                                  ).temporary_password ?? "",
                              ),
                          }
                        : undefined,
            })),

    update: (id: string, payload: Partial<FareHarborCompanyPayload>) =>
        api
            .patch<Record<string, unknown>>(`/fareharbor/companies/${id}`, payload)
            .then((response) => normalizeFareHarborCompany(response.data)),

    syncCompany: (id: string) =>
        api
            .post<{ company: Record<string, unknown> }>(
                `/fareharbor/companies/${id}/sync`,
            )
            .then((response) =>
                normalizeFareHarborCompany(response.data.company),
            ),

    createPartnerAccount: (id: string) =>
        api
            .post<{
                company: Record<string, unknown>;
                partner_credentials: Record<string, unknown>;
            }>(`/fareharbor/companies/${id}/partner-account`)
            .then((response) => ({
                company: normalizeFareHarborCompany(response.data.company),
                partnerCredentials: {
                    email: String(
                        response.data.partner_credentials.email ?? "",
                    ),
                    temporaryPassword: String(
                        response.data.partner_credentials.temporary_password ??
                            "",
                    ),
                },
            })),

    syncAll: () => api.post("/fareharbor/companies/sync-all").then((r) => r.data),
};
