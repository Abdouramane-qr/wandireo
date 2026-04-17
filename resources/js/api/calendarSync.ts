import api from './client';
import type { ServiceCalendarSync } from '@/types/calendar-sync';

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return '';
}

function asDate(value: unknown): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parsed = new Date(asString(value));

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeCalendarSync(rawInput: unknown): ServiceCalendarSync {
    const raw = asRecord(rawInput);
    const provider =
        asString(raw.provider).toUpperCase() === 'FAREHARBOR'
            ? 'FAREHARBOR'
            : 'ICAL';

    return {
        id: asString(raw.id),
        serviceId: asString(raw.service_id ?? raw.serviceId),
        provider,
        importUrl:
            provider === 'ICAL'
                ? asString(raw.import_url ?? raw.importUrl) || undefined
                : undefined,
        lastSyncedAt: asDate(raw.last_synced_at ?? raw.lastSyncedAt),
        lastStatus:
            (asString(raw.last_status ?? raw.lastStatus) as ServiceCalendarSync['lastStatus']) ||
            'IDLE',
        importedEventsCount: Number(raw.imported_events_count ?? raw.importedEventsCount ?? 0) || 0,
        lastError: asString(raw.last_error ?? raw.lastError) || undefined,
        exportUrl: asString(raw.export_url ?? raw.exportUrl),
        isSupported: Boolean(raw.is_supported ?? raw.isSupported),
    };
}

export const calendarSyncApi = {
    get: (serviceId: string) =>
        api
            .get<unknown>(`/services/${serviceId}/calendar-sync`)
            .then((response) => normalizeCalendarSync(response.data)),

    save: (serviceId: string, payload: { importUrl?: string }) =>
        api
            .put<unknown>(`/services/${serviceId}/calendar-sync`, payload)
            .then((response) => normalizeCalendarSync(response.data)),

    sync: (serviceId: string) =>
        api
            .post<unknown>(`/services/${serviceId}/calendar-sync/sync`)
            .then((response) => normalizeCalendarSync(response.data)),
};
