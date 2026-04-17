import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, Send, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { SupportPriority } from '@/types/support';

interface Props {
    onClose: () => void;
}

declare const route: (name: string, params?: unknown) => string;

export const SupportTicketForm = ({ onClose }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        priority: 'MEDIUM' as SupportPriority,
        media: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/support/tickets', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold tracking-widest uppercase">
                            Nouveau Ticket
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 font-heading">
                        Comment pouvons-nous <span className="text-sky-500">aider ?</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Remplissez les détails ci-dessous pour créer une demande d'assistance.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Sujet <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="Ex: Problème d'accès ou erreur technique"
                            className={clsx(
                                "w-full px-5 py-3.5 rounded-2xl border transition-all outline-none text-sm",
                                errors.subject 
                                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                                    : "border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                            )}
                        />
                        {errors.subject && (
                            <div className="flex items-center gap-1.5 text-red-500 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <p className="text-[11px] font-bold">{errors.subject}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Media */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Média <span className="text-slate-300 font-normal italic lowercase">(optionnel)</span>
                            </label>
                            <input
                                type="text"
                                value={data.media}
                                onChange={(e) => setData('media', e.target.value)}
                                placeholder="Lien vers une image ou vidéo"
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm"
                            />
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Priorité
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value as SupportPriority)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm appearance-none"
                            >
                                <option value="LOW">Basse</option>
                                <option value="MEDIUM">Moyenne</option>
                                <option value="HIGH">Haute</option>
                                <option value="URGENT">Urgente</option>
                            </select>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Décrivez votre demande en quelques lignes..."
                            className={clsx(
                                "w-full px-5 py-3.5 rounded-2xl border transition-all outline-none text-sm resize-none",
                                errors.message 
                                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                                    : "border-slate-100 bg-slate-50/50 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                            )}
                        />
                        {errors.message && (
                            <div className="flex items-center gap-1.5 text-red-500 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <p className="text-[11px] font-bold">{errors.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>Créer le ticket</span>
                        </button>
                    </div>
                </form>

                {/* Bottom Tip */}
                <div className="bg-slate-50 px-8 py-4 flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Info className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                        Les tickets sont généralement traités sous 24 à 48 heures ouvrées par notre équipe d'administration.
                    </p>
                </div>
            </div>
        </div>
    );
};
