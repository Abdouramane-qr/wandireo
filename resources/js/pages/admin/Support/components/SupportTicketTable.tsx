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
        <section className="wdr-admin-support__panel">
            <div>
                <table className="wdr-admin-support__table">
                    <thead>
                        <tr>
                            <th>
                                {t('support.ticket_date')}
                            </th>
                            <th>
                                {t('support.ticket_subject')}
                            </th>
                            <th>
                                {t('support.ticket_user')}
                            </th>
                            <th>
                                {t('support.status.all')}
                            </th>
                            <th>
                                {t('support.ticket_priority')}
                            </th>
                            <th>
                                {t('support.ticket_actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="wdr-admin-support__ticket-row"
                                onClick={() => onViewDetail(ticket)}
                            >
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.ticket_date')}
                                    </span>
                                    <div className="wdr-admin-support__ticket-date">
                                        <Calendar size={14} className="wdr-admin-support__ticket-icon" />
                                        <span>
                                            {dateFormatter.format(new Date(ticket.createdAt))}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.ticket_subject')}
                                    </span>
                                    <div>
                                        <div className="wdr-admin-support__ticket-title">
                                            <span>{ticket.subject}</span>
                                            {ticket.media ? (
                                                <ExternalLink size={14} className="wdr-admin-support__ticket-icon" aria-hidden="true" />
                                            ) : null}
                                        </div>
                                        <div className="wdr-admin-support__ticket-copy">
                                            {ticket.message}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.ticket_user')}
                                    </span>
                                    <div className="wdr-admin-support__ticket-user">
                                        <div className="wdr-admin-support__ticket-avatar">
                                            <User size={16} />
                                        </div>
                                        <div className="wdr-admin-support__ticket-user-copy">
                                            <span className="wdr-admin-support__ticket-user-name">
                                                {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : (ticket.partner ? `${ticket.partner.firstName} ${ticket.partner.lastName}` : t('support.anonymous'))}
                                            </span>
                                            <span className="wdr-admin-support__ticket-user-role">
                                                {ticket.user
                                                    ? t('support.author.client')
                                                    : ticket.partner
                                                      ? t('support.author.partner')
                                                      : t('support.author.unknown')}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.status.all')}
                                    </span>
                                    <StatusBadge status={ticket.status} />
                                </td>
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.ticket_priority')}
                                    </span>
                                    <PriorityBadge priority={ticket.priority} />
                                </td>
                                <td>
                                    <span className="wdr-admin-support__cell-label">
                                        {t('support.ticket_actions')}
                                    </span>
                                    <span className="wdr-admin-support__ticket-action">
                                        <span>{t('common.view')}</span>
                                        <ChevronRight size={14} />
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="wdr-admin-support__empty">
                                    <MessageSquare size={28} className="wdr-admin-support__empty-icon" />
                                    <div>{t('support.empty')}</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
