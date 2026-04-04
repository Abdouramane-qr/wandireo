import type { BaseUser } from './wdr-user';

export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
    id: string;
    userId?: string;
    partnerId?: string;
    user?: BaseUser;
    partner?: BaseUser;
    subject: string;
    message: string;
    status: SupportStatus;
    priority: SupportPriority;
    createdAt: string;
    updatedAt: string;
}

export interface SupportParams {
    status?: SupportStatus;
    priority?: SupportPriority;
    page?: number;
}
