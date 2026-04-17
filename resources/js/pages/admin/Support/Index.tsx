import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, LifeBuoy, Filter, Search } from 'lucide-react';
import { AdminSectionNav } from '@/components/wdr';
import { SupportTicket } from '@/types/support';
import { SupportTicketTable } from './components/SupportTicketTable';
import { SupportTicketForm } from './components/SupportTicketForm';

interface Props {
    tickets: SupportTicket[];
}

export default function SupportIndex({ tickets }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <Head title="Centre de Support" />

            {/* Header section with gradient background */}
            <div className="bg-slate-900 text-white pt-16 pb-32 px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-sky-300">
                                <LifeBuoy className="w-3 h-3" />
                                Administration
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight">
                                Centre de <span className="text-sky-400">Support</span>
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed">
                                Pilotez l'assistance utilisateur, suivez les incidents et maintenez 
                                la qualité de service Wandireo depuis cette interface centralisée.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="group flex items-center justify-center gap-3 bg-white hover:bg-sky-50 text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-white/5 active:scale-95"
                        >
                            <div className="p-1 bg-slate-900 text-white rounded-lg group-hover:bg-sky-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span>Créer un ticket</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation between admin sections */}
            <div className="-mt-12 relative z-20">
                <AdminSectionNav active="support" />
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-8">
                {/* Search and Filters Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un ticket par sujet ou message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                            <Filter className="w-3.5 h-3.5" />
                            Filtrer
                        </div>
                        <select className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-sky-500 transition-all cursor-pointer">
                            <option>Tous les statuts</option>
                            <option>Ouverts</option>
                            <option>En cours</option>
                            <option>Résolus</option>
                        </select>
                        <select className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-sky-500 transition-all cursor-pointer">
                            <option>Toutes les priorités</option>
                            <option>Urgentes</option>
                            <option>Hautes</option>
                            <option>Moyennes</option>
                            <option>Basses</option>
                        </select>
                    </div>
                </div>

                {/* Main Table component */}
                <SupportTicketTable 
                    tickets={filteredTickets} 
                    onViewDetail={(ticket) => {
                        // Logic to view detail can be added here
                        console.log('View ticket:', ticket);
                    }}
                />

                {/* Result count */}
                <div className="mt-6 flex items-center justify-between text-slate-400">
                    <p className="text-xs font-medium">
                        Affichage de {filteredTickets.length} ticket(s) sur {tickets.length} au total
                    </p>
                </div>
            </main>

            {/* Conditional Form Rendering with Animation handles inside the component */}
            {isFormOpen && (
                <SupportTicketForm onClose={() => setIsFormOpen(false)} />
            )}
        </div>
    );
}
