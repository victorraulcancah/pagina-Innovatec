<?php

namespace App\Http\Controllers;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Inertia\Inertia;
use Inertia\Response;

/** Listado y detalle de soluciones (/soluciones) y servicios (/servicios). */
class OfferingController extends Controller
{
    /** Prefijo de URL => sección de section_items. */
    private const KINDS = ['soluciones' => 'solution', 'servicios' => 'service'];

    public function index(string $kind): Response
    {
        abort_unless(isset(self::KINDS[$kind]), 404);

        return Inertia::render('offerings', [
            'home' => HomeSetting::current()->toPageData(),
            'kind' => $kind,
        ]);
    }

    public function show(string $kind, string $slug): Response
    {
        $section = self::KINDS[$kind] ?? abort(404);

        abort_unless(
            SectionItem::query()->where('section', $section)->where('slug', $slug)->exists(),
            404,
        );

        return Inertia::render('offering', [
            'home' => HomeSetting::current()->toPageData(),
            'kind' => $kind,
            'slug' => $slug,
        ]);
    }
}
