import React from 'react';
import { Calendar, User, ChevronRight } from 'lucide-react';
import { SupportTicket } from '@/types/support';
import { StatusBadge, PriorityBadge } from './SupportBadges';

interface Props {
    tickets: SupportTicket[];
    onViewDetail: (ticket: SupportTicket) => void;
}

const supportDateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export const SupportTicketTable = ({ tickets, onViewDetail }: Props) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                Date
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                Sujet
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                Utilisateur
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                                Statut
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                                Priorité
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="group hover:bg-sky-50/30 transition-all duration-200 cursor-pointer"
                                onClick={() => onViewDetail(ticket)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="w-4 h-4 opacity-50" />
                                        <span className="text-xs font-medium">
                                            {supportDateFormatter.format(new Date(ticket.createdAt || (ticket as any).created_at))}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col max-w-xs md:max-w-md">
                                        <span className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
                                            {ticket.subject}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                            {ticket.message}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200 group-hover:border-sky-200 group-hover:bg-sky-50 transition-colors">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : (ticket.partner ? `${ticket.partner.firstName} ${ticket.partner.lastName}` : 'Anonyme')}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {ticket.user ? 'Client' : 'Partenaire'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge status={ticket.status} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <PriorityBadge priority={ticket.priority} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                                        <span>Détails</span>
                                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <span className="text-sm italic">Aucun ticket trouvé.</span>
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
