<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protege el panel: toma el JWT de la cookie httpOnly y lo valida con el
 * guard `api`. Sin token válido, o con la cuenta desactivada, redirige al login.
 * El rol y los permisos se leen de la base de datos en cada petición.
 */
class AuthenticateAdmin
{
    public const COOKIE = 'admin_token';

    public function handle(Request $request, Closure $next): Response
    {
        if ($token = $request->cookie(self::COOKIE)) {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        // Una cuenta desactivada pierde el acceso en el acto, aunque su token siga vigente.
        if (! auth('api')->check() || ! auth('api')->user()->active) {
            return redirect()->route('admin.login')->withCookie(cookie()->forget(self::COOKIE));
        }

        auth()->shouldUse('api');

        return $next($request);
    }
}
