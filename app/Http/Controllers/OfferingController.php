<?php

namespace App\Http\Controllers;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Support\OfferingSlugs;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Listado y detalle de soluciones (/soluciones) y servicios (/servicios). */
class OfferingController extends Controller
{
    /** Prefijo de URL => sección de section_items. */
    private const KINDS = ['soluciones' => 'solution', 'servicios' => 'service'];

    public function show(string $kind, string $slug): Response|RedirectResponse
    {
        $section = self::KINDS[$kind] ?? abort(404);

        if (! SectionItem::query()->where('section', $section)->where('slug', $slug)->where('visible', true)->exists()) {
            // Una dirección anterior (la página se renombró): lleva a la actual sin perder enlaces compartidos.
            $renamed = OfferingSlugs::findByPrevious($section, $slug);
            abort_unless($renamed?->visible, 404);

            return redirect("/{$kind}/{$renamed->slug}", 301);
        }

        return Inertia::render('offering', [
            'home' => HomeSetting::current()->toPageData(),
            'kind' => $kind,
            'slug' => $slug,
        ]);
    }
}
