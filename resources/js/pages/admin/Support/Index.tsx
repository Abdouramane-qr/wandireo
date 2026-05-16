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
import './Support.css';

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
        <div className="wdr-admin-support">
            <Head title={t('support.title')} />

            <section className="wdr-admin-support__hero">
                <div className="wdr-admin-support__hero-content">
                    <div className="wdr-admin-support__hero-copy">
                        <p className="wdr-admin-support__hero-badge">
                            {t('nav.admin')}
                        </p>
                        <h1 className="wdr-admin-support__hero-title">
                            {t('support.title')}
                        </h1>
                        <p className="wdr-admin-support__hero-subtitle">
                            {t('support.subtitle')}
                        </p>
                    </div>
                    <div className="wdr-admin-support__hero-actions">
                        <Button
                            variant="primary"
                            className="wdr-admin-support__cta"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus size={18} />
                            {t('support.new_ticket')}
                        </Button>
                    </div>
                </div>
            </section>

            <AdminSectionNav active="support" />

            <div className="wdr-admin-support__body">
                <section className="wdr-admin-support__toolbar">
                    <div className="wdr-admin-support__search">
                        <div className="wdr-admin-support__search-icon">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('support.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="wdr-admin-support__search-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="wdr-admin-support__search-clear"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="wdr-admin-support__filter-group">
                        <label className="wdr-admin-support__filter">
                            <Filter size={15} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="wdr-admin-support__filter-select"
                            >
                                <option value="all">{t('support.status.all')}</option>
                                <option value="OPEN">{t('support.status.open')}</option>
                                <option value="IN_PROGRESS">{t('support.status.in_progress')}</option>
                                <option value="RESOLVED">{t('support.status.resolved')}</option>
                                <option value="CLOSED">{t('support.status.closed')}</option>
                            </select>
                        </label>

                        <label className="wdr-admin-support__filter">
                            <HelpCircle size={15} />
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value as any)}
                                className="wdr-admin-support__filter-select"
                            >
                                <option value="all">{t('support.priority.all')}</option>
                                <option value="URGENT">{t('support.priority.urgent')}</option>
                                <option value="HIGH">{t('support.priority.high')}</option>
                                <option value="MEDIUM">{t('support.priority.medium')}</option>
                                <option value="LOW">{t('support.priority.low')}</option>
                            </select>
                        </label>
                    </div>
                </section>

                <SupportTicketTable
                    tickets={filteredTickets}
                    onViewDetail={(ticket) => setSelectedTicket(ticket)}
                />

                <div className="wdr-admin-support__results">
                    <p className="wdr-admin-support__results-count">
                        {(filteredTickets.length > 1
                            ? t('support.results_other')
                            : t('support.results_one')
                        ).replace('{count}', String(filteredTickets.length))}
                    </p>
                </div>
            </div>

            {isFormOpen && (
                <SupportTicketForm onClose={() => setIsFormOpen(false)} />
            )}

            {selectedTicket && (
                <Modal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    title={t('support.ticket_detail_title').replace('{subject}', selectedTicket.subject)}
                    size="lg"
                >
                    <div className="wdr-admin-support__detail">
                        <div className="wdr-admin-support__detail-grid">
                            <article className="wdr-admin-support__detail-card">
                                <span className="wdr-admin-support__detail-label">
                                    {t('support.ticket_user')}
                                </span>
                                <div className="wdr-admin-support__detail-meta-value">
                                    <div className="wdr-admin-support__detail-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="wdr-admin-support__detail-user-copy">
                                        <span className="wdr-admin-support__detail-user-name">
                                            {selectedTicket.user
                                                ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`
                                                : selectedTicket.partner
                                                  ? `${selectedTicket.partner.firstName} ${selectedTicket.partner.lastName}`
                                                  : t('support.anonymous')}
                                        </span>
                                        <span className="wdr-admin-support__detail-user-role">
                                            {selectedTicket.user ? t('support.author.client') : t('support.author.partner')}
                                        </span>
                                    </div>
                                </div>
                            </article>

                            <article className="wdr-admin-support__detail-card">
                                <span className="wdr-admin-support__detail-label">
                                    {t('support.ticket_date')}
                                </span>
                                <div className="wdr-admin-support__detail-meta-value">
                                    <Calendar size={18} className="wdr-admin-support__detail-icon" />
                                    <span>
                                        {dateFormatter.format(new Date(selectedTicket.createdAt))}
                                    </span>
                                </div>
                            </article>

                            <article className="wdr-admin-support__detail-card">
                                <span className="wdr-admin-support__detail-label">
                                    {t('support.ticket_media')}
                                </span>
                                {selectedTicket.media ? (
                                    <a
                                        href={selectedTicket.media}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="wdr-admin-support__detail-media-link"
                                    >
                                        <ExternalLink size={18} className="wdr-admin-support__detail-icon" />
                                        <span>{t('support.view_media')}</span>
                                    </a>
                                ) : (
                                    <span className="wdr-admin-support__detail-media-empty">
                                        {t('support.no_media')}
                                    </span>
                                )}
                            </article>
                        </div>

                        <div className="wdr-admin-support__detail-controls">
                            <section className="wdr-admin-support__detail-control">
                                <span className="wdr-admin-support__detail-label">
                                    {t('support.status.all')}
                                </span>
                                <div className="wdr-admin-support__detail-control-options">
                                    {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as SupportStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => void handleUpdateStatus(selectedTicket.id, status)}
                                            className={clsx(
                                                "wdr-admin-support__detail-option",
                                                selectedTicket.status === status
                                                    ? "wdr-admin-support__detail-option--active"
                                                    : ""
                                            )}
                                        >
                                            {t(`support.status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="wdr-admin-support__detail-control">
                                <span className="wdr-admin-support__detail-label">
                                    {t('support.ticket_priority')}
                                </span>
                                <div className="wdr-admin-support__detail-control-options">
                                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as SupportPriority[]).map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => void handleUpdatePriority(selectedTicket.id, priority)}
                                            className={clsx(
                                                "wdr-admin-support__detail-option",
                                                selectedTicket.priority === priority
                                                    ? "wdr-admin-support__detail-option--priority-active"
                                                    : ""
                                            )}
                                        >
                                            {t(`support.priority.${priority.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <section className="wdr-admin-support__detail-message">
                            <div className="wdr-admin-support__detail-message-head">
                                <MessageSquare size={16} />
                                <h3 className="wdr-admin-support__detail-message-title">
                                    {t('support.ticket_initial_message')}
                                </h3>
                            </div>
                            <div className="wdr-admin-support__detail-message-body">
                                {selectedTicket.message.split('\n').map((line, i) => (
                                    <p key={i}>{line || '\u00A0'}</p>
                                ))}
                            </div>
                        </section>

                        <div className="wdr-admin-support__detail-actions">
                            <Button
                                variant="ghost"
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
