<?php

namespace App\Support;

use App\Models\ContactMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envía cada mensaje del formulario de Contacto también a Zoho CRM, como un cliente potencial (Lead), a través del
 * formulario web que la empresa tiene en Zoho. En la página solo se ve nuestro formulario.
 *
 * Se activa con ZOHO_CRM_XNQSJSDP y ZOHO_CRM_XMIWTLD en el .env: son los dos campos ocultos del código del formulario
 * web de Zoho. Ese formulario debe tener el captcha desactivado; con captcha, Zoho rechaza los datos.
 */
class ZohoCrm
{
    /** Las opciones del campo «Interés» del formulario de Zoho: deben ser exactamente las mismas que allá. */
    public const INTERESTS = ['Networking', 'Ciberseguridad', 'Outsourcing TIC', 'Wi-Fi gestionado', 'Telcos', 'Otros'];

    public static function enabled(): bool
    {
        return filled(config('services.zoho_crm.xnqsjsdp')) && filled(config('services.zoho_crm.xmiwtld'));
    }

    /** Zoho es secundario: si falla, el mensaje ya quedó guardado en el panel. */
    public static function sendLead(ContactMessage $message): void
    {
        if (! self::enabled()) {
            return;
        }

        try {
            $response = Http::asForm()->timeout(15)->post(config('services.zoho_crm.url'), [
                'xnQsjsdp' => config('services.zoho_crm.xnqsjsdp'),
                'xmIwtLD' => config('services.zoho_crm.xmiwtld'),
                'zc_gad' => '',
                'actionType' => 'TGVhZHM=', // «Leads» en base64, como lo manda el formulario de Zoho.
                'returnURL' => 'null',
                'Last Name' => $message->name,
                // Zoho exige empresa en los Leads; en nuestro formulario es opcional.
                'Company' => $message->company ?: 'No indicada',
                'Phone' => $message->phone ?: '',
                'Email' => $message->email,
                'LEADCF1' => $message->interest ?: 'Otros',
                'Description' => $message->message,
                'aG9uZXlwb3Q' => '', // Campo trampa de Zoho: debe ir vacío.
            ]);

            if ($response->failed()) {
                Log::warning("Zoho CRM no aceptó el mensaje de contacto {$message->id}: HTTP {$response->status()}");
            }
        } catch (\Throwable $e) {
            Log::warning("No se pudo enviar el mensaje de contacto {$message->id} a Zoho CRM: {$e->getMessage()}");
        }
    }
}
