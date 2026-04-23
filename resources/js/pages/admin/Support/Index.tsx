import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import clsx from 'clsx';
import { Plus, Search, HelpCircle, Filter, X, MessageSquare, User, Calendar, ExternalLink } from 'lucide-react';
import { AdminSectionNav, Button, Modal } from '@/components/wdr';
import { SupportTicket, SupportStatus, SupportPriority } from '@/types/support';
import { SupportTicketTable } from './components/SupportTicketTable';
import { SupportTicketForm } from './components/SupportTicketForm';
import { StatusBadge, PriorityBadge } from './components/SupportBadges';
import { useTranslation } from '@/hooks/useTranslation';
import { useUpdateSupportTicketData } from '@/hooks/useSupportData';
import '../../wdr-pages/AdminDashboardPage/AdminDashboardPage.css';

interface Props {
    tickets: SupportTicket[];
}

export default function SupportIndex({ tickets }: Props) {
    const { t, intlLocale } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<SupportStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<SupportPriority | 'all'>('all');

    const updateMutation = useUpdateSupportTicketData();

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const dateFormatter = new Intl.DateTimeFormat(intlLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleUpdateStatus = async (id: string, status: SupportStatus) => {
        await updateMutation.mutateAsync({ id, updates: { status } });
        if (selectedTicket?.id === id) {
            setSelectedTicket(prev => prev ? { ...prev, status } : null);
        }
    };

    const handleUpdatePriority = async (id: string, priority: SupportPriority) => {
        await updateMutation.mutateAsync({ id, updates: { priority } });
        if (selectedTicket?.id === id) {
            setSelectedTicket(prev => prev ? { ...prev, priority } : null);
        }
    };

    return (
        <div className="wdr-admin-dash">
            <Head title={t('support.title')} />

            {/* ---- Hero ---- */}
            <section className="wdr-admin-dash__hero">
                <div className="wdr-admin-dash__hero-content">
                    <div className="wdr-admin-dash__hero-text">
                        <p className="wdr-admin-dash__hero-badge">
                            {t('nav.admin')}
                        </p>
                        <h1 className="wdr-admin-dash__hero-title">
                            {t('support.title').split(' ').slice(0, -1).join(' ')} <span>{t('support.title').split(' ').pop()}</span>
                        </h1>
                        <p className="wdr-admin-dash__hero-subtitle">
                            {t('support.subtitle')}
                        </p>
                    </div>
                    <div className="wdr-admin-dash__hero-right">
                        <Button
                            variant="primary"
                            className="bg-sky-500 hover:bg-sky-600 text-white border-none shadow-lg shadow-sky-500/20 px-8 py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {t('support.new_ticket')}
                        </Button>
                    </div>
                </div>
            </section>

            {/* ---- Navigation admin ---- */}
            <AdminSectionNav active="support" />

            {/* ---- Corps ---- */}
            <div className="wdr-admin-dash__body px-4 md:px-0">
                {/* Search and Filters Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative flex-1 max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('support.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm font-medium"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none cursor-pointer pr-8"
                            >
                                <option value="all">{t('support.status.all')}</option>
                                <option value="OPEN">{t('support.status.open')}</option>
                                <option value="IN_PROGRESS">{t('support.status.in_progress')}</option>
                                <option value="RESOLVED">{t('support.status.resolved')}</option>
                                <option value="CLOSED">{t('support.status.closed')}</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <select 
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value as any)}
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none cursor-pointer pr-8"
                            >
                                <option value="all">{t('support.priority.all')}</option>
                                <option value="URGENT">{t('support.priority.urgent')}</option>
                                <option value="HIGH">{t('support.priority.high')}</option>
                                <option value="MEDIUM">{t('support.priority.medium')}</option>
                                <option value="LOW">{t('support.priority.low')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Table component */}
                <SupportTicketTable 
                    tickets={filteredTickets} 
                    onViewDetail={(ticket) => setSelectedTicket(ticket)}
                />

                {/* Result count */}
                <div className="mt-6 flex items-center justify-between px-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {(filteredTickets.length > 1
                            ? t('support.results_other')
                            : t('support.results_one')
                        ).replace('{count}', String(filteredTickets.length))}
                    </p>
                </div>
            </div>

            {/* Create Form Modal */}
            {isFormOpen && (
                <SupportTicketForm onClose={() => setIsFormOpen(false)} />
            )}

            {/* Detail Modal */}
            {selectedTicket && (
                <Modal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    title={selectedTicket.subject}
                    size="lg"
                >
                    <div className="space-y-8 py-4">
                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    {t('support.ticket_user')}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">
                                            {selectedTicket.user
                                                ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`
                                                : selectedTicket.partner
                                                  ? `${selectedTicket.partner.firstName} ${selectedTicket.partner.lastName}`
                                                  : t('support.anonymous')}
                                        </span>
                                        <span className="text-[10px] font-bold text-sky-500 uppercase">
                                            {selectedTicket.user ? t('support.author.client') : t('support.author.partner')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    {t('support.ticket_date')}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {dateFormatter.format(new Date(selectedTicket.createdAt))}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    {t('support.ticket_media')}
                                </p>
                                {selectedTicket.media ? (
                                    <a 
                                        href={selectedTicket.media} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:border-sky-200 transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold underline underline-offset-4">
                                            {t('support.view_media')}
                                        </span>
                                    </a>
                                ) : (
                                    <span className="text-sm font-bold text-slate-300 italic">
                                        {t('support.no_media')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50">
                            <div className="flex-1 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    {t('support.status.all')}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as SupportStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => void handleUpdateStatus(selectedTicket.id, status)}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                                                selectedTicket.status === status
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            {t(`support.status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-px bg-slate-100 hidden md:block" />

                            <div className="flex-1 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    {t('support.ticket_priority')}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as SupportPriority[]).map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => void handleUpdatePriority(selectedTicket.id, priority)}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                                                selectedTicket.priority === priority
                                                    ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/10"
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            {t(`support.priority.${priority.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Initial Message */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <MessageSquare className="w-4 h-4 text-sky-500" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                    {t('support.ticket_initial_message')}
                                </h3>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-slate-900 text-slate-200 text-sm leading-relaxed shadow-2xl shadow-slate-900/10 border border-slate-800">
                                {selectedTicket.message.split('\n').map((line, i) => (
                                    <p key={i} className={line ? 'mb-4 last:mb-0' : 'mb-2 h-2'}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                variant="ghost"
                                className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
                                onClick={() => setSelectedTicket(null)}
                            >
                                {t('common.close')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
