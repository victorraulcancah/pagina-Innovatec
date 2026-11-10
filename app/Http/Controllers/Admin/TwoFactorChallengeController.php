<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Segundo paso del login: la contraseña ya se validó y falta el código. Hasta aquí no existe ningún token: solo una
 * marca en la sesión que caduca a los pocos minutos.
 */
class TwoFactorChallengeController extends Controller
{
    public const PENDING = 'two_factor_pending';

    public const PENDING_MINUTES = 5;

    private const MAX_ATTEMPTS = 5;

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $this->pendingUser($request)) {
            return redirect()->route('admin.login');
        }

        return Inertia::render('admin/two-factor');
    }

    public function store(Request $request, TwoFactor $twoFactor, AuthController $auth): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('admin.login');
        }

        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);

        // Por usuario, no por dirección IP: quien ya sabe la contraseña no puede seguir probando códigos desde otra red.
        $key = "two-factor:{$user->id}";

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'code' => 'Demasiados intentos. Espera '.max(1, (int) ceil(RateLimiter::availableIn($key) / 60)).' minutos y vuelve a probar.',
            ]);
        }

        if (! $twoFactor->consume($user, $data['code'])) {
            RateLimiter::hit($key, 300);

            throw ValidationException::withMessages(['code' => 'El código no es correcto.']);
        }

        RateLimiter::clear($key);
        $request->session()->forget(self::PENDING);
        $request->session()->regenerate();

        return $auth->signIn($request, $user);
    }

    private function pendingUser(Request $request): ?User
    {
        $pending = $request->session()->get(self::PENDING);

        if (! $pending || $pending['expires'] < now()->timestamp) {
            return null;
        }

        $user = User::query()->find($pending['user']);

        return $user?->active && $user->hasTwoFactor() ? $user : null;
    }
}
