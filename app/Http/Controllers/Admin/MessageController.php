<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Bandeja de mensajes del formulario de contacto. */
class MessageController extends Controller
{
    public function index(): Response
    {
        $messages = ContactMessage::query()->latest()->limit(200)->get()->map(fn (ContactMessage $m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'phone' => $m->phone,
            'company' => $m->company,
            'message' => $m->message,
            'read' => $m->read_at !== null,
            'date' => $m->created_at->format('d/m/Y H:i'),
        ]);

        return Inertia::render('admin/messages', [
            'pages' => SiteSections::navigation(),
            'messages' => $messages,
        ]);
    }

    public function markRead(ContactMessage $message): RedirectResponse
    {
        $message->update(['read_at' => $message->read_at ?? now()]);

        return back();
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return back()->with('status', 'Mensaje eliminado.');
    }
}
