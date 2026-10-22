<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Uso en rutas: `->middleware('permission:blog.view')`. Sin el permiso responde 403. */
class RequirePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        abort_unless($request->user()?->hasPermission($permission), 403, 'No tienes permiso para esta sección.');

        return $next($request);
    }
}
