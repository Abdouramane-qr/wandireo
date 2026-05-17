import api from "./client";
import type { AuditLogEntry } from "@/types/audit-log";

export interface AuditLogParams {
    category?: string;
    action?: string;
    actorId?: number;
    subjectType?: string;
    subjectId?: number;
    page?: number;
    limit?: number;
}

function normalizeAuditLogEntry(data: Record<string, unknown>): AuditLogEntry {
    return {
        id: Number(data.id),
        actorId: data.actorId ? Number(data.actorId) : undefined,
        actorName: data.actorName ? String(data.actorName) : undefined,
        category: String(data.category ?? ""),
        action: String(data.action ?? ""),
        subjectType: data.subjectType ? String(data.subjectType) : undefined,
        subjectId: data.subjectId ? Number(data.subjectId) : undefined,
        summary: data.summary ? String(data.summary) : undefined,
        metadata:
            data.metadata &&
            typeof data.metadata === "object" &&
            !Array.isArray(data.metadata)
                ? (data.metadata as Record<string, unknown>)
                : {},
        ipAddress: data.ipAddress ? String(data.ipAddress) : undefined,
        userAgent: data.userAgent ? String(data.userAgent) : undefined,
        createdAt: new Date(String(data.createdAt)),
    };
}

export const auditLogApi = {
    adminList: (params?: AuditLogParams) =>
        api
            .get<{
                data: Record<string, unknown>[];
                total: number;
            }>("/admin/audit-log", { params })
            .then((response) => ({
                ...response.data,
                data: response.data.data.map(normalizeAuditLogEntry),
            })),
};
