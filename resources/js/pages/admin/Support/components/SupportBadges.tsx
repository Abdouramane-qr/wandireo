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
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 uppercase tracking-wider",
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
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-600/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    {t('support.status.open')}
                </Badge>
            );
        case 'IN_PROGRESS':
            return (
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-600/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                    {t('support.status.in_progress')}
                </Badge>
            );
        case 'RESOLVED':
            return (
                <Badge className="bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-600/10">
                    {t('support.status.resolved')}
                </Badge>
            );
        case 'CLOSED':
            return (
                <Badge className="bg-slate-50 text-slate-500 border-slate-200">
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
                <Badge className="bg-red-50 text-red-700 border-red-100 shadow-sm shadow-red-100">
                    <span className="mr-1">🔥</span>
                    {t('support.priority.urgent')}
                </Badge>
            );
        case 'HIGH':
            return (
                <Badge className="bg-orange-50 text-orange-700 border-orange-100">
                    {t('support.priority.high')}
                </Badge>
            );
        case 'MEDIUM':
            return (
                <Badge className="bg-sky-50 text-sky-700 border-sky-100">
                    {t('support.priority.medium')}
                </Badge>
            );
        case 'LOW':
            return (
                <Badge className="bg-slate-50 text-slate-500 border-slate-100">
                    {t('support.priority.low')}
                </Badge>
            );
        default:
            return null;
    }
};
