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
        if (auth('api')->check()) {
            return redirect()->route('admin.home');
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

        return redirect()->route('admin.home')->withCookie(
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
