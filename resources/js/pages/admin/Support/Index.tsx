import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, LifeBuoy, Filter, Search, PlusCircle } from 'lucide-react';
import { AdminSectionNav, Button } from '@/components/wdr';
import { SupportTicket } from '@/types/support';
import { SupportTicketTable } from './components/SupportTicketTable';
import { SupportTicketForm } from './components/SupportTicketForm';
import '../../wdr-pages/AdminDashboardPage/AdminDashboardPage.css';

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

    const adminInitials = "AD"; // Fallback or could be passed from props

    return (
        <div className="wdr-admin-dash">
            <Head title="Centre de Support" />

            {/* ---- Hero ---- */}
            <section className="wdr-admin-dash__hero">
                <div className="wdr-admin-dash__hero-content">
                    <div className="wdr-admin-dash__hero-text">
                        <p className="wdr-admin-dash__hero-badge">
                            Administration
                        </p>
                        <h1 className="wdr-admin-dash__hero-title">
                            Centre de <span>Support</span>
                        </h1>
                        <p className="wdr-admin-dash__hero-subtitle">
                            Pilotez l'assistance utilisateur et suivez les incidents Wandireo.
                        </p>
                    </div>
                    <div className="wdr-admin-dash__hero-right">
                        <Button
                            variant="primary"
                            className="bg-sky-500 hover:bg-sky-600 text-white border-none shadow-lg shadow-sky-500/20"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Créer un ticket
                        </Button>
                    </div>
                </div>
            </section>

            {/* ---- Navigation admin ---- */}
            <AdminSectionNav active="support" />

            {/* ---- Corps ---- */}
            <div className="wdr-admin-dash__body px-4 md:px-0">
                {/* Search and Filters Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un ticket..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-sm shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 outline-none focus:border-sky-500 transition-all cursor-pointer">
                            <option>Tous les statuts</option>
                            <option>Ouverts</option>
                            <option>En cours</option>
                            <option>Résolus</option>
                        </select>
                        <select className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 outline-none focus:border-sky-500 transition-all cursor-pointer">
                            <option>Toutes les priorités</option>
                            <option>Urgentes</option>
                            <option>Hautes</option>
                        </select>
                    </div>
                </div>

                {/* Main Table component */}
                <SupportTicketTable 
                    tickets={filteredTickets} 
                    onViewDetail={(ticket) => {
                        console.log('View ticket:', ticket);
                    }}
                />

                {/* Result count */}
                <div className="mt-4 flex items-center justify-between text-slate-400">
                    <p className="text-xs font-medium">
                        Affichage de {filteredTickets.length} ticket(s) sur {tickets.length}
                    </p>
                </div>
            </div>

            {/* Conditional Form Rendering */}
            {isFormOpen && (
                <SupportTicketForm onClose={() => setIsFormOpen(false)} />
            )}
        </div>
    );
}
