import React from 'react';
import { clsx } from 'clsx';
import { SupportStatus, SupportPriority } from '@/types/support';
import { useTranslation } from '@/hooks/useTranslation';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

const Badge = ({ children, className }: BadgeProps) => (
    <span className={clsx(
        "wdr-admin-support__badge",
        className
    )}>
        {children}
    </span>
);

export const StatusBadge = ({ status }: { status: SupportStatus }) => {
    const { t } = useTranslation();
    
    switch (status) {
        case 'OPEN':
            return (
                <Badge className="wdr-admin-support__badge--status-open">
                    <span className="wdr-admin-support__badge-dot" />
                    {t('support.status.open')}
                </Badge>
            );
        case 'IN_PROGRESS':
            return (
                <Badge className="wdr-admin-support__badge--status-progress">
                    <span className="wdr-admin-support__badge-dot" />
                    {t('support.status.in_progress')}
                </Badge>
            );
        case 'RESOLVED':
            return (
                <Badge className="wdr-admin-support__badge--status-resolved">
                    {t('support.status.resolved')}
                </Badge>
            );
        case 'CLOSED':
            return (
                <Badge className="wdr-admin-support__badge--status-closed">
                    {t('support.status.closed')}
                </Badge>
            );
        default:
            return null;
    }
};

export const PriorityBadge = ({ priority }: { priority: SupportPriority }) => {
    const { t } = useTranslation();
    
    switch (priority) {
        case 'URGENT':
            return (
                <Badge className="wdr-admin-support__badge--priority-urgent">
                    {t('support.priority.urgent')}
                </Badge>
            );
        case 'HIGH':
            return (
                <Badge className="wdr-admin-support__badge--priority-high">
                    {t('support.priority.high')}
                </Badge>
            );
        case 'MEDIUM':
            return (
                <Badge className="wdr-admin-support__badge--priority-medium">
                    {t('support.priority.medium')}
                </Badge>
            );
        case 'LOW':
            return (
                <Badge className="wdr-admin-support__badge--priority-low">
                    {t('support.priority.low')}
                </Badge>
            );
        default:
            return null;
    }
};
