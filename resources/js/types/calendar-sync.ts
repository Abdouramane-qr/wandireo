export type CalendarSyncStatus = 'IDLE' | 'SUCCESS' | 'FAILED';

export interface ServiceCalendarSync {
    id: string;
    serviceId: string;
    provider: 'ICAL';
    importUrl?: string;
    lastSyncedAt?: Date;
    lastStatus: CalendarSyncStatus;
    importedEventsCount: number;
    lastError?: string;
    exportUrl: string;
    isSupported: boolean;
}
