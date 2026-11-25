<?php

use App\Models\SectionItem;
use App\Support\OfferingSlugs;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Antes la dirección de una solución o servicio no cambiaba al renombrarla (por ejemplo, «Ingeniería e
     * Implementación» seguía en /servicios/consultoria). Esto pone a cada una la dirección de su título actual;
     * la anterior queda redirigiendo a la nueva.
     */
    public function up(): void
    {
        $items = SectionItem::query()->whereIn('section', array_keys(OfferingSlugs::PREFIXES))->orderBy('id')->get();

        // Con foreach y no each(): syncWithTitle devuelve false cuando no hay cambio, y each() se detendría ahí.
        foreach ($items as $item) {
            OfferingSlugs::syncWithTitle($item);
        }
    }

    /** Las direcciones viejas siguen funcionando (redirigen): no hace falta deshacerlo. */
    public function down(): void {}
};
