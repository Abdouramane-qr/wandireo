export interface AuditLogEntry {
    id: number;
    actorId?: number;
    actorName?: string;
    category: string;
    action: string;
    subjectType?: string;
    subjectId?: number;
    summary?: string;
    metadata: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
