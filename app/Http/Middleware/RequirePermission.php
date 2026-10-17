<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Uso en rutas: `->middleware('permission:blog')`. Sin el permiso responde 403. */
class RequirePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        abort_unless($request->user()?->hasPermission(Permission::from($permission)), 403, 'No tienes permiso para esta sección.');

        return $next($request);
    }
}
