import { normalizeUser } from '@/lib/api-normalizers';
import type {
    SupportParams,
    SupportPriority,
    SupportStatus,
    SupportTicket,
} from '@/types/support';
import api from './client';

type UnknownRecord = Record<string, unknown>;

interface SupportListResponse {
    data: SupportTicket[];
    currentPage: number;
    totalPages: number;
    total: number;
}

function asRecord(value: unknown): UnknownRecord {
    return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return fallback;
}

function normalizeSupportTicket(rawInput: unknown): SupportTicket {
    const raw = asRecord(rawInput);

    return {
        id: asString(raw.id),
        userId: asString(raw.user_id ?? raw.userId) || undefined,
        partnerId: asString(raw.partner_id ?? raw.partnerId) || undefined,
        user: raw.user ? normalizeUser(raw.user) : undefined,
        partner: raw.partner ? normalizeUser(raw.partner) : undefined,
        subject: asString(raw.subject),
        message: asString(raw.message),
        status: asString(raw.status, 'OPEN') as SupportStatus,
        priority: asString(raw.priority, 'MEDIUM') as SupportPriority,
        createdAt: asString(raw.created_at ?? raw.createdAt),
        updatedAt: asString(raw.updated_at ?? raw.updatedAt),
    };
}

export const supportApi = {
    list: async (params: SupportParams = {}): Promise<SupportListResponse> => {
        const response = await api.get<{
            data: unknown[];
            current_page: number;
            last_page: number;
            total: number;
        }>('/support/tickets', { params });

        return {
            data: response.data.data.map(normalizeSupportTicket),
            currentPage: response.data.current_page,
            totalPages: response.data.last_page,
            total: response.data.total,
        };
    },

    create: async (payload: {
        subject: string;
        message: string;
        status?: SupportStatus;
        priority?: SupportPriority;
    }): Promise<SupportTicket> => {
        const response = await api.post<unknown>('/support/tickets', payload);

        return normalizeSupportTicket(response.data);
    },

    update: async (
        id: string,
        updates: { status?: SupportStatus; priority?: SupportPriority },
    ): Promise<SupportTicket> => {
        const response = await api.patch<unknown>(
            `/support/tickets/${id}`,
            updates,
        );

        return normalizeSupportTicket(response.data);
    },

    delete: async (id: string) => {
        const response = await api.delete(`/support/tickets/${id}`);
        return response.data;
    },
};
