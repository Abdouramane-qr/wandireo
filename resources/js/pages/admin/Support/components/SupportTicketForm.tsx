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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="relative px-8 pt-10 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black tracking-widest uppercase border border-sky-100">
                            {t('support.new_ticket')}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-all group"
                        >
                            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                        {t('support.form.title').split('?')[0]} <span className="text-sky-500">?</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        {t('support.form.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t('support.ticket_subject')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder={t('support.form.subject_placeholder')}
                            className={clsx(
                                "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-sm font-medium",
                                errors.subject 
                                    ? "border-red-200 bg-red-50/50 focus:border-red-400" 
                                    : "border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                            )}
                        />
                        {errors.subject && (
                            <div className="flex items-center gap-1.5 text-red-500 mt-1.5 px-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <p className="text-[11px] font-bold">{errors.subject}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Media */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t('support.ticket_media')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <ImageIcon className="w-4 h-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={data.media}
                                    onChange={(e) => setData('media', e.target.value)}
                                    placeholder={t('support.form.media_placeholder')}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t('support.ticket_priority')}
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value as SupportPriority)}
                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                            >
                                <option value="LOW">{t('support.priority.low')}</option>
                                <option value="MEDIUM">{t('support.priority.medium')}</option>
                                <option value="HIGH">{t('support.priority.high')}</option>
                                <option value="URGENT">{t('support.priority.urgent')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t('support.ticket_message')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder={t('support.form.message_placeholder')}
                            className={clsx(
                                "w-full px-6 py-4 rounded-2xl border transition-all outline-none text-sm font-medium resize-none",
                                errors.message 
                                    ? "border-red-200 bg-red-50/50 focus:border-red-400" 
                                    : "border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                            )}
                        />
                        {errors.message && (
                            <div className="flex items-center gap-1.5 text-red-500 mt-1.5 px-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <p className="text-[11px] font-bold">{errors.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end pt-4 gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {t('support.form.submit')}
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
