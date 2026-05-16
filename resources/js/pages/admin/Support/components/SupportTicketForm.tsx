import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, Send, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { SupportPriority } from '@/types/support';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    onClose: () => void;
}

export const SupportTicketForm = ({ onClose }: Props) => {
    const { t, locale } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        priority: 'MEDIUM' as SupportPriority,
        media: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${locale}/admin/support/tickets`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 md:items-center md:p-4">
            <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 md:max-h-[90vh] md:rounded-[2.5rem]">
                <div className="relative shrink-0 px-5 pb-4 pt-6 md:px-8 md:pt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600">
                            {t('support.new_ticket')}
                        </div>
                        <button
                            onClick={onClose}
                            className="group rounded-full p-2 transition-all hover:bg-slate-100"
                            aria-label={t('common.close')}
                            type="button"
                        >
                            <X className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:rotate-90 group-hover:text-slate-600" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black leading-tight text-slate-900">
                        {t('support.form.title').split('?')[0]} <span className="text-sky-500">?</span>
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate-400">
                        {t('support.form.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 pb-5 md:px-8 md:pb-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {t('support.ticket_subject')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                placeholder={t('support.form.subject_placeholder')}
                                className={clsx(
                                    "w-full rounded-2xl border px-6 py-4 text-sm font-medium outline-none transition-all",
                                    errors.subject
                                        ? "border-red-200 bg-red-50/50 focus:border-red-400"
                                        : "border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-sky-500/5",
                                )}
                            />
                            {errors.subject && (
                                <div className="mt-1.5 flex items-center gap-1.5 px-1 text-red-500">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <p className="text-[11px] font-bold">{errors.subject}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('support.ticket_media')}
                                </label>
                                <div className="group relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                                        <ImageIcon className="h-4 w-4 text-slate-300 transition-colors group-focus-within:text-sky-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.media}
                                        onChange={(e) => setData('media', e.target.value)}
                                        placeholder={t('support.form.media_placeholder')}
                                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-4 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {t('support.ticket_priority')}
                                </label>
                                <select
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value as SupportPriority)}
                                    className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                                >
                                    <option value="LOW">{t('support.priority.low')}</option>
                                    <option value="MEDIUM">{t('support.priority.medium')}</option>
                                    <option value="HIGH">{t('support.priority.high')}</option>
                                    <option value="URGENT">{t('support.priority.urgent')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {t('support.ticket_message')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder={t('support.form.message_placeholder')}
                                className={clsx(
                                    "w-full resize-none rounded-2xl border px-6 py-4 text-sm font-medium outline-none transition-all",
                                    errors.message
                                        ? "border-red-200 bg-red-50/50 focus:border-red-400"
                                        : "border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5",
                                )}
                            />
                            {errors.message && (
                                <div className="mt-1.5 flex items-center gap-1.5 px-1 text-red-500">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <p className="text-[11px] font-bold">{errors.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 pt-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-2xl px-8 py-4 text-sm font-bold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 sm:w-auto"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-10 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] hover:shadow-slate-900/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                            >
                                {t('support.form.submit')}
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
