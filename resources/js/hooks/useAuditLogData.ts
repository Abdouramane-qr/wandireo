import { useQuery } from "@tanstack/react-query";
import { auditLogApi, type AuditLogParams } from "@/api/audit-log";
import type { AuditLogEntry } from "@/types/audit-log";

export function useAdminAuditLogData(params?: AuditLogParams): {
    entries: AuditLogEntry[];
    total: number;
    isLoading: boolean;
} {
    const query = useQuery({
        queryKey: ["audit-log", "admin", params ?? {}],
        queryFn: async () => auditLogApi.adminList(params),
        staleTime: 30_000,
        retry: 1,
    });

    return {
        entries: query.data?.data ?? [],
        total: query.data?.total ?? 0,
        isLoading: query.isLoading,
    };
}
