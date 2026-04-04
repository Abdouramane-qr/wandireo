import React, { useMemo, useState } from 'react';
import { AdminSectionNav, Button, Modal, useToast } from '@/components/wdr';
import {
    useCreateSupportTicketData,
    useSupportTicketsData,
    useUpdateSupportTicketData,
} from '@/hooks/useSupportData';
import { useTranslation } from '@/hooks/useTranslation';
import type {
    SupportPriority,
    SupportStatus,
    SupportTicket,
} from '@/types/support';
import './AdminSupportPage.css';

const DEFAULT_FORM = {
    subject: '',
    message: '',
    priority: 'MEDIUM' as SupportPriority,
};

export default function AdminSupportPage() {
    const { t, intlLocale } = useTranslation();
    const { success, error } = useToast();
    const [statusFilter, setStatusFilter] = useState<SupportStatus | 'all'>(
        'all',
    );
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
        null,
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState(DEFAULT_FORM);

    const { data, isLoading } = useSupportTicketsData({
        status: statusFilter === 'all' ? undefined : statusFilter,
    });
    const updateMutation = useUpdateSupportTicketData();
    const createMutation = useCreateSupportTicketData();

    const tickets = data?.data ?? [];

    const statusLabel = useMemo(
        () => ({
            OPEN: t('support.status.open'),
            IN_PROGRESS: t('support.status.in_progress'),
            RESOLVED: t('support.status.resolved'),
            CLOSED: t('support.status.closed'),
        }),
        [t],
    );

    const priorityLabel = useMemo(
        () => ({
            LOW: t('support.priority.low'),
            MEDIUM: t('support.priority.medium'),
            HIGH: t('support.priority.high'),
            URGENT: t('support.priority.urgent'),
        }),
        [t],
    );

    const formatDate = (dateStr: string): string =>
        new Intl.DateTimeFormat(intlLocale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateStr));

    const handleUpdateStatus = async (id: string, newStatus: SupportStatus) => {
        try {
            await updateMutation.mutateAsync({ id, updates: { status: newStatus } });
            success(t('support.toast.status_success'));
            if (selectedTicket?.id === id) {
                setSelectedTicket((prev) =>
                    prev ? { ...prev, status: newStatus } : null,
                );
            }
        } catch {
            error(t('support.toast.status_error'));
        }
    };

    const handleUpdatePriority = async (
        id: string,
        newPriority: SupportPriority,
    ) => {
        try {
            await updateMutation.mutateAsync({
                id,
                updates: { priority: newPriority },
            });
            success(t('support.toast.priority_success'));
            if (selectedTicket?.id === id) {
                setSelectedTicket((prev) =>
                    prev ? { ...prev, priority: newPriority } : null,
                );
            }
        } catch {
            error(t('support.toast.priority_error'));
        }
    };

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.subject.trim() || !form.message.trim()) {
            error(t('support.toast.create_error'));
            return;
        }

        try {
            await createMutation.mutateAsync({
                subject: form.subject.trim(),
                message: form.message.trim(),
                priority: form.priority,
            });
            success(t('support.toast.create_success'));
            setForm(DEFAULT_FORM);
            setIsCreateOpen(false);
        } catch {
            error(t('support.toast.create_error'));
        }
    };

    return (
        <div className="wdr-admin-support">
            <section className="wdr-admin-support__hero">
                <div className="wdr-admin-support__hero-content">
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
            </section>

            <AdminSectionNav active="support" />

            <div className="wdr-admin-support__body">
                <div className="wdr-admin-support__toolbar">
                    <div className="wdr-admin-support__filters">
                        <select
                            className="wdr-admin-support__select"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as SupportStatus | 'all',
                                )
                            }
                        >
                            <option value="all">{t('support.status.all')}</option>
                            <option value="OPEN">{t('support.status.open')}</option>
                            <option value="IN_PROGRESS">
                                {t('support.status.in_progress')}
                            </option>
                            <option value="RESOLVED">
                                {t('support.status.resolved')}
                            </option>
                            <option value="CLOSED">
                                {t('support.status.closed')}
                            </option>
                        </select>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        {t('support.new_ticket')}
                    </Button>
                </div>

                {isLoading ? (
                    <div className="wdr-admin-support__loading">
                        {t('common.loading')}
                    </div>
                ) : (
                    <div className="wdr-admin-support__table-wrapper">
                        <table className="wdr-admin-support__table">
                            <thead>
                                <tr>
                                    <th>{t('support.ticket_date')}</th>
                                    <th>{t('support.ticket_subject')}</th>
                                    <th>{t('support.ticket_user')}</th>
                                    <th>{t('support.status.all')}</th>
                                    <th>{t('support.priority.medium')}</th>
                                    <th>{t('support.ticket_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="wdr-admin-support__date">
                                            {formatDate(ticket.createdAt)}
                                        </td>
                                        <td className="wdr-admin-support__subject">
                                            {ticket.subject}
                                        </td>
                                        <td>
                                            {ticket.user ? (
                                                <div className="wdr-admin-support__author">
                                                    <span className="name">
                                                        {ticket.user.firstName}{' '}
                                                        {ticket.user.lastName}
                                                    </span>
                                                    <span className="role">
                                                        {t('support.author.client')}
                                                    </span>
                                                </div>
                                            ) : ticket.partner ? (
                                                <div className="wdr-admin-support__author">
                                                    <span className="name">
                                                        {ticket.partner.firstName}{' '}
                                                        {ticket.partner.lastName}
                                                    </span>
                                                    <span className="role">
                                                        {t('support.author.partner')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="wdr-admin-support__none">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`wdr-admin-support__status wdr-admin-support__status--${ticket.status.toLowerCase()}`}
                                            >
                                                {statusLabel[ticket.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`wdr-admin-support__priority wdr-admin-support__priority--${ticket.priority.toLowerCase()}`}
                                            >
                                                {priorityLabel[ticket.priority]}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedTicket(ticket)
                                                }
                                            >
                                                {t('common.view')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                {tickets.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="wdr-admin-support__empty"
                                        >
                                            {t('support.empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title={t('support.form.title')}
                size="lg"
            >
                <form
                    className="wdr-admin-support__ticket-detail"
                    onSubmit={(event) => void handleCreate(event)}
                >
                    <div className="wdr-admin-support__meta-item">
                        <span className="label">
                            {t('support.ticket_subject')}
                        </span>
                        <input
                            className="wdr-admin-support__select"
                            value={form.subject}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    subject: e.target.value,
                                }))
                            }
                            placeholder={t('support.form.subject_placeholder')}
                        />
                    </div>

                    <div className="wdr-admin-support__meta-item">
                        <span className="label">
                            {t('support.priority.medium')}
                        </span>
                        <select
                            className="wdr-admin-support__select"
                            value={form.priority}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    priority: e.target.value as SupportPriority,
                                }))
                            }
                        >
                            <option value="LOW">{t('support.priority.low')}</option>
                            <option value="MEDIUM">
                                {t('support.priority.medium')}
                            </option>
                            <option value="HIGH">
                                {t('support.priority.high')}
                            </option>
                            <option value="URGENT">
                                {t('support.priority.urgent')}
                            </option>
                        </select>
                    </div>

                    <div className="wdr-admin-support__message-box">
                        <h3 className="wdr-admin-support__message-title">
                            {t('support.ticket_message')}
                        </h3>
                        <textarea
                            className="wdr-admin-support__select"
                            rows={6}
                            value={form.message}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    message: e.target.value,
                                }))
                            }
                            placeholder={t('support.form.message_placeholder')}
                        />
                    </div>

                    <div className="wdr-admin-support__detail-footer">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            loading={createMutation.isPending}
                        >
                            {t('support.form.submit')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {selectedTicket && (
                <Modal
                    isOpen={!!selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    title={`Ticket : ${selectedTicket.subject}`}
                    size="lg"
                >
                    <div className="wdr-admin-support__ticket-detail">
                        <div className="wdr-admin-support__detail-meta">
                            <div className="wdr-admin-support__meta-item">
                                <span className="label">
                                    {t('support.status.all')}
                                </span>
                                <select
                                    className="wdr-admin-support__select"
                                    value={selectedTicket.status}
                                    onChange={(e) =>
                                        void handleUpdateStatus(
                                            selectedTicket.id,
                                            e.target.value as SupportStatus,
                                        )
                                    }
                                >
                                    <option value="OPEN">
                                        {t('support.status.open')}
                                    </option>
                                    <option value="IN_PROGRESS">
                                        {t('support.status.in_progress')}
                                    </option>
                                    <option value="RESOLVED">
                                        {t('support.status.resolved')}
                                    </option>
                                    <option value="CLOSED">
                                        {t('support.status.closed')}
                                    </option>
                                </select>
                            </div>

                            <div className="wdr-admin-support__meta-item">
                                <span className="label">
                                    {t('support.priority.medium')}
                                </span>
                                <select
                                    className="wdr-admin-support__select"
                                    value={selectedTicket.priority}
                                    onChange={(e) =>
                                        void handleUpdatePriority(
                                            selectedTicket.id,
                                            e.target.value as SupportPriority,
                                        )
                                    }
                                >
                                    <option value="LOW">
                                        {t('support.priority.low')}
                                    </option>
                                    <option value="MEDIUM">
                                        {t('support.priority.medium')}
                                    </option>
                                    <option value="HIGH">
                                        {t('support.priority.high')}
                                    </option>
                                    <option value="URGENT">
                                        {t('support.priority.urgent')}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="wdr-admin-support__message-box">
                            <h3 className="wdr-admin-support__message-title">
                                {t('support.ticket_initial_message')}
                            </h3>
                            <div className="wdr-admin-support__message-content">
                                {selectedTicket.message}
                            </div>
                        </div>

                        <div className="wdr-admin-support__detail-footer">
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
