<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthenticateAdmin;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Login del panel con JWT guardado en una cookie httpOnly: el token nunca
 * queda al alcance del JavaScript de la página. Si la cuenta usa verificación
 * en dos pasos, el token no se crea hasta validar también el código.
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

        if (! auth('api')->attempt($credentials, false)) {
            throw ValidationException::withMessages([
                'email' => 'Correo o contraseña incorrectos.',
            ]);
        }

        /** @var User $user */
        $user = auth('api')->getLastAttempted();

        if (! $user->active) {
            throw ValidationException::withMessages([
                'email' => 'Tu cuenta está desactivada. Consulta con un administrador.',
            ]);
        }

        if ($user->hasTwoFactor()) {
            $request->session()->regenerate();
            $request->session()->put(TwoFactorChallengeController::PENDING, [
                'user' => $user->id,
                'expires' => now()->addMinutes(TwoFactorChallengeController::PENDING_MINUTES)->timestamp,
            ]);

            return redirect()->route('admin.login.code');
        }

        return $this->signIn($request, $user);
    }

    /** Crea el token y entra al panel: solo se llega aquí con todos los pasos del login cumplidos. */
    public function signIn(Request $request, User $user): RedirectResponse
    {
        $token = auth('api')->login($user);

        return redirect($user->landingPath())->withCookie(
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
