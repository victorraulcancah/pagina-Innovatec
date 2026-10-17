<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthenticateAdmin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Login del panel con JWT guardado en una cookie httpOnly: el token nunca
 * queda al alcance del JavaScript de la página.
 */
class AuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (auth('api')->check() && auth('api')->user()->active) {
            return redirect(auth('api')->user()->landingPath());
        }

        return Inertia::render('admin/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $token = auth('api')->attempt($credentials);

        if (! $token) {
            throw ValidationException::withMessages([
                'email' => 'Correo o contraseña incorrectos.',
            ]);
        }

        if (! auth('api')->user()->active) {
            auth('api')->logout();

            throw ValidationException::withMessages([
                'email' => 'Tu cuenta está desactivada. Consulta con un administrador.',
            ]);
        }

        return redirect(auth('api')->user()->landingPath())->withCookie(
            cookie(
                name: AuthenticateAdmin::COOKIE,
                value: $token,
                minutes: (int) config('jwt.ttl'),
                secure: $request->isSecure(),
                httpOnly: true,
                sameSite: 'lax',
            ),
        );
    }

    public function destroy(): RedirectResponse
    {
        auth('api')->logout();

        return redirect()->route('admin.login')->withCookie(cookie()->forget(AuthenticateAdmin::COOKIE));
    }
}
