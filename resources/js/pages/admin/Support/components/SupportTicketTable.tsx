import React from 'react';
import { Calendar, User, ChevronRight, MessageSquare, ExternalLink } from 'lucide-react';
import { SupportTicket } from '@/types/support';
import { StatusBadge, PriorityBadge } from './SupportBadges';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    tickets: SupportTicket[];
    onViewDetail: (ticket: SupportTicket) => void;
}

export const SupportTicketTable = ({ tickets, onViewDetail }: Props) => {
    const { t, intlLocale } = useTranslation();
    
    const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead className="hidden sm:table-header-group">
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                {t('support.ticket_date')}
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                {t('support.ticket_subject')}
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                {t('support.ticket_user')}
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                                {t('support.status.all')}
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                                {t('support.ticket_priority')}
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                                {t('support.ticket_actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="group block cursor-pointer border-b border-slate-100 p-4 transition-all duration-200 last:border-b-0 hover:bg-sky-50/30 sm:table-row sm:p-0"
                                onClick={() => onViewDetail(ticket)}
                            >
                                <td className="block px-0 py-2 sm:table-cell sm:px-6 sm:py-4 sm:whitespace-nowrap">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.ticket_date')}
                                    </span>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                        <span className="text-xs font-medium">
                                            {dateFormatter.format(new Date(ticket.createdAt))}
                                        </span>
                                    </div>
                                </td>
                                <td className="block px-0 py-2 sm:table-cell sm:px-6 sm:py-4">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.ticket_subject')}
                                    </span>
                                    <div className="flex flex-col max-w-xs md:max-w-md">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
                                                {ticket.subject}
                                            </span>
                                            {ticket.media && (
                                                <span title={t('support.media_present')}>
                                                    <ExternalLink className="w-3 h-3 text-sky-400 flex-shrink-0" aria-hidden="true" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="mt-1 text-xs text-slate-400 sm:truncate sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                                            {ticket.message}
                                        </span>
                                    </div>
                                </td>
                                <td className="block px-0 py-2 sm:table-cell sm:px-6 sm:py-4">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.ticket_user')}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 group-hover:border-sky-200 group-hover:bg-sky-50 transition-colors">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : (ticket.partner ? `${ticket.partner.firstName} ${ticket.partner.lastName}` : t('support.anonymous'))}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {ticket.user
                                                    ? t('support.author.client')
                                                    : ticket.partner
                                                      ? t('support.author.partner')
                                                      : t('support.author.unknown')}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="block px-0 py-2 text-left sm:table-cell sm:px-6 sm:py-4 sm:text-center">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.status.all')}
                                    </span>
                                    <StatusBadge status={ticket.status} />
                                </td>
                                <td className="block px-0 py-2 text-left sm:table-cell sm:px-6 sm:py-4 sm:text-center">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.ticket_priority')}
                                    </span>
                                    <PriorityBadge priority={ticket.priority} />
                                </td>
                                <td className="block px-0 py-2 text-left sm:table-cell sm:px-6 sm:py-4 sm:text-right">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                        {t('support.ticket_actions')}
                                    </span>
                                    <button className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                                        <span>{t('common.view')}</span>
                                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                            <MessageSquare className="w-6 h-6 text-slate-200" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-400">{t('support.empty')}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
