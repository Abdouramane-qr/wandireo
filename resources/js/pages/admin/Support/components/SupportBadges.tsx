import React from 'react';
import { clsx } from 'clsx';
import { SupportStatus, SupportPriority } from '@/types/support';

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

const Badge = ({ children, className }: BadgeProps) => (
    <span className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300",
        className
    )}>
        {children}
    </span>
);

export const StatusBadge = ({ status }: { status: SupportStatus }) => {
    switch (status) {
        case 'OPEN':
            return (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-600/10">
                    Ouvert
                </Badge>
            );
        case 'IN_PROGRESS':
            return (
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-600/10">
                    En cours
                </Badge>
            );
        case 'RESOLVED':
            return (
                <Badge className="bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-600/10">
                    Résolu
                </Badge>
            );
        case 'CLOSED':
            return (
                <Badge className="bg-slate-50 text-slate-600 border-slate-100 ring-1 ring-slate-600/10">
                    Fermé
                </Badge>
            );
        default:
            return null;
    }
};

export const PriorityBadge = ({ priority }: { priority: SupportPriority }) => {
    switch (priority) {
        case 'URGENT':
            return (
                <Badge className="bg-red-50 text-red-700 border-red-100 shadow-sm animate-pulse">
                    Urgente
                </Badge>
            );
        case 'HIGH':
            return (
                <Badge className="bg-orange-50 text-orange-700 border-orange-100">
                    Haute
                </Badge>
            );
        case 'MEDIUM':
            return (
                <Badge className="bg-sky-50 text-sky-700 border-sky-100">
                    Moyenne
                </Badge>
            );
        case 'LOW':
            return (
                <Badge className="bg-slate-50 text-slate-600 border-slate-100">
                    Basse
                </Badge>
            );
        default:
            return null;
    }
};
