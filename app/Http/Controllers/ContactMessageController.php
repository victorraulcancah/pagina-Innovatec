<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\HomeSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/** Recibe el formulario de la página Contacto. */
class ContactMessageController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
            // Trampa para robots: una persona nunca llena este campo oculto.
            'company_site' => ['nullable', 'string', 'max:255'],
        ]);

        if (filled($data['company_site'] ?? null)) {
            return back()->with('status', 'sent');
        }

        $message = ContactMessage::query()->create([
            ...collect($data)->except('company_site')->all(),
            'ip' => $request->ip(),
        ]);

        $this->notify($message);

        return back()->with('status', 'sent');
    }

    /** El aviso por correo es secundario: si falla, el mensaje ya quedó guardado en el panel. */
    private function notify(ContactMessage $message): void
    {
        $to = HomeSetting::current()->content()['contact']['email'] ?? null;

        if (! $to) {
            return;
        }

        try {
            Mail::raw(
                "Nuevo mensaje desde el sitio web\n\n"
                ."Nombre: {$message->name}\n"
                ."Correo: {$message->email}\n"
                .'Teléfono: '.($message->phone ?: '-')."\n"
                .'Empresa: '.($message->company ?: '-')."\n\n"
                .$message->message,
                fn ($mail) => $mail->to($to)->replyTo($message->email, $message->name)
                    ->subject("Contacto web: {$message->name}"),
            );
        } catch (\Throwable $e) {
            Log::warning('No se pudo enviar el aviso de contacto: '.$e->getMessage());
        }
    }
}
