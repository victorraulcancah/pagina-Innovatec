<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protege el panel: toma el JWT de la cookie httpOnly y lo valida con el
 * guard `api`. Sin token válido, redirige al login.
 */
class AuthenticateAdmin
{
    public const COOKIE = 'admin_token';

    public function handle(Request $request, Closure $next): Response
    {
        if ($token = $request->cookie(self::COOKIE)) {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        if (! auth('api')->check()) {
            return redirect()->route('admin.login')->withCookie(cookie()->forget(self::COOKIE));
        }

        auth()->shouldUse('api');

        return $next($request);
    }
}
