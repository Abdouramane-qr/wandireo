export type CalendarSyncProvider = 'ICAL' | 'FAREHARBOR';

export type CalendarSyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';

export interface ServiceCalendarSync {
    id: string;
    serviceId: string;
    provider: CalendarSyncProvider;
    importUrl?: string;
    lastSyncedAt?: Date;
    lastStatus: CalendarSyncStatus;
    importedEventsCount: number;
    lastError?: string;
    exportUrl: string;
    isSupported: boolean;
}
