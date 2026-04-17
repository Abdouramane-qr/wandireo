<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SupportTicketController extends Controller
{
    /**
     * Display the support center dashboard.
     */
    public function index(Request $request): Response
    {
        $tickets = SupportTicket::with(['user', 'partner'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($ticket) => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'message' => $ticket->message,
                'media' => $ticket->media,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'createdAt' => $ticket->created_at,
                'updatedAt' => $ticket->updated_at,
                'user' => $ticket->user ? [
                    'id' => (string) $ticket->user->id,
                    'firstName' => explode(' ', $ticket->user->name)[0] ?? '',
                    'lastName' => explode(' ', $ticket->user->name)[1] ?? '',
                ] : null,
                'partner' => $ticket->partner ? [
                    'id' => (string) $ticket->partner->id,
                    'firstName' => explode(' ', $ticket->partner->name)[0] ?? '',
                    'lastName' => explode(' ', $ticket->partner->name)[1] ?? '',
                ] : null,
            ]);

        return Inertia::render('admin/Support/Index', [
            'tickets' => $tickets,
            'statusOptions' => ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
            'priorityOptions' => ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        ]);
    }

    /**
     * Store a newly created support ticket.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'media' => 'nullable|string|max:255',
        ]);

        $ticket = new SupportTicket($validated);
        $ticket->user_id = $request->user()->id;
        $ticket->status = 'OPEN';
        $ticket->save();

        return back()->with('success', 'Le ticket a été créé avec succès.');
    }

    /**
     * Update the status or priority of a ticket.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED',
            'priority' => 'sometimes|in:LOW,MEDIUM,HIGH,URGENT',
        ]);

        $ticket->update($validated);

        return back()->with('success', 'Le ticket a été mis à jour.');
    }
}
