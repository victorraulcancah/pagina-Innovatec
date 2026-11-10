<?php

namespace App\Support;

use App\Models\HomeSetting;
use Illuminate\Validation\ValidationException;

/**
 * ID de medición de Google Analytics 4 del sitio. Se escribe en "Datos de la empresa" (Analítica) y, si ese campo
 * queda vacío, se usa el de GA_MEASUREMENT_ID en el .env.
 */
class Analytics
{
    private const ID = '/\bG-[A-Z0-9]{4,14}\b/i';

    /** Deja solo el ID («G-XXXXXXXXXX», en mayúsculas), aunque se haya pegado dentro del código que entrega Google. */
    public static function normalize(string $input): string
    {
        return preg_match(self::ID, $input, $found) ? strtoupper($found[0]) : '';
    }

    /** Igual que normalize, pero un texto sin ID válido es un error del formulario (vacío sí vale: quita la medición). */
    public static function normalizeOrFail(string $input): string
    {
        $input = trim($input);
        $id = self::normalize($input);

        if ($input !== '' && $id === '') {
            throw ValidationException::withMessages([
                'texts.analytics.ga_id' => 'No encuentro un ID de medición. Debe verse como G-XXXXXXXXXX (lo ves en Analytics: Administrar → Flujos de datos).',
            ]);
        }

        return $id;
    }

    /** El ID con el que se mide el sitio: el del panel o, si falta, el del .env. Vacío = no se mide. */
    public static function measurementId(): string
    {
        try {
            $fromPanel = (string) (HomeSetting::query()->first()?->content()['analytics']['ga_id'] ?? '');
        } catch (\Throwable) {
            $fromPanel = '';
        }

        return self::normalize($fromPanel) ?: self::normalize((string) config('services.google_analytics.id'));
    }
}
