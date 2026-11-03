<?php

namespace App\Http\Middleware;

use App\Models\HomeSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Uso en rutas: `->middleware('page.visible:/experiencia')`. Si su opción del menú está oculta, la página no existe (404). */
class EnsurePageVisible
{
    public function handle(Request $request, Closure $next, string $page): Response
    {
        abort_if(in_array($page, HomeSetting::current()->hiddenPages(), true), 404);

        return $next($request);
    }
}
