<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Activar y desactivar la verificación en dos pasos desde Mi cuenta. Cada cambio pide la contraseña actual. */
class TwoFactorSettingsController extends Controller
{
    public const NEW_CODES = 'two_factor_new_codes';

    public function __construct(private TwoFactor $twoFactor) {}

    /** Prepara el secreto y muestra el QR. Aún no protege nada: falta confirmar con un código de la app. */
    public function start(Request $request): RedirectResponse
    {
        $this->requirePassword($request);
        $user = $request->user();

        if ($user->hasTwoFactor()) {
            throw ValidationException::withMessages(['current_password' => 'La verificación en dos pasos ya está activa.']);
        }

        $user->two_factor_secret = $this->twoFactor->newSecret();
        $user->two_factor_last_step = null;
        $user->save();

        return back();
    }

    public function confirm(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $user = $request->user();

        if ($user->hasTwoFactor() || ! $user->two_factor_secret) {
            return back();
        }

        if (! $this->twoFactor->consumeCode($user, $data['code'])) {
            throw ValidationException::withMessages(['code' => 'El código no es correcto. Revisa que la hora de tu celular sea automática.']);
        }

        $user->refresh();
        $user->two_factor_confirmed_at = now();
        $user->save();

        return $this->withNewCodes($request);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasTwoFactor()) {
            $user->clearTwoFactor();
        }

        return back();
    }

    public function regenerateCodes(Request $request): RedirectResponse
    {
        $this->requirePassword($request);

        return $request->user()->hasTwoFactor() ? $this->withNewCodes($request) : back();
    }

    public function disable(Request $request): RedirectResponse
    {
        $this->requirePassword($request);
        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $user = $request->user();

        if (! $user->hasTwoFactor()) {
            return back();
        }

        if (! $this->twoFactor->consume($user, $data['code'])) {
            throw ValidationException::withMessages(['code' => 'El código no es correcto.']);
        }

        $user->refresh();
        $user->clearTwoFactor();

        return back()->with('status', 'Verificación en dos pasos desactivada.');
    }

    /** Los códigos en claro se muestran una sola vez y viajan cifrados en la sesión hasta la siguiente pantalla. */
    private function withNewCodes(Request $request): RedirectResponse
    {
        return back()->with(self::NEW_CODES, encrypt($this->twoFactor->newRecoveryCodes($request->user())));
    }

    private function requirePassword(Request $request): void
    {
        $request->validate(
            ['current_password' => ['required', 'current_password:api']],
            ['current_password.current_password' => 'La contraseña actual no es correcta.'],
        );
    }
}
