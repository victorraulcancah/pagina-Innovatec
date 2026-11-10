<?php

namespace App\Support;

use App\Models\HomeSetting;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\DB;
use PragmaRX\Google2FA\Google2FA;

/**
 * Verificación en dos pasos con una app de autenticación (Google Authenticator y similares).
 * Todo ocurre en este servidor: ni el secreto ni el código QR pasan por servicios externos.
 */
class TwoFactor
{
    private const RECOVERY_CODES = 8;

    public function __construct(private Google2FA $google2fa = new Google2FA) {}

    public function newSecret(): string
    {
        return $this->google2fa->generateSecretKey(32);
    }

    /** El código QR para escanear con la app, como imagen lista para usar en un <img>. */
    public function qrCode(User $user, string $secret): string
    {
        $url = $this->google2fa->getQRCodeUrl(HomeSetting::current()->brandName(), $user->email, $secret);
        $svg = (new Writer(new ImageRenderer(new RendererStyle(220, 1), new SvgImageBackEnd)))->writeString($url);

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }

    /** Valida lo escrito al entrar o al desactivar: un código de la app o, si no, uno de respaldo. */
    public function consume(User $user, string $input): bool
    {
        return $this->consumeCode($user, $input) || $this->consumeRecoveryCode($user, $input);
    }

    /** Un código de la app vale una sola vez: quien lo vea o lo intercepte ya no puede reutilizarlo. */
    public function consumeCode(User $user, string $code): bool
    {
        $code = preg_replace('/\s+/', '', $code);

        if (! preg_match('/^\d{6}$/', (string) $code)) {
            return false;
        }

        return DB::transaction(function () use ($user, $code) {
            $fresh = User::query()->lockForUpdate()->findOrFail($user->id);

            if (! $fresh->two_factor_secret) {
                return false;
            }

            // Con null la librería responde `true` en vez del intervalo usado y el código se podría repetir: siempre un número.
            $step = $this->google2fa->verifyKeyNewer($fresh->two_factor_secret, $code, $fresh->two_factor_last_step ?? 0);

            if ($step === false) {
                return false;
            }

            $fresh->two_factor_last_step = $step;
            $fresh->save();

            return true;
        });
    }

    /**
     * Crea códigos de respaldo nuevos e invalida los anteriores. Solo se guarda su huella: los códigos en claro se
     * muestran esta única vez.
     *
     * @return list<string>
     */
    public function newRecoveryCodes(User $user): array
    {
        $codes = array_map(
            fn () => strtoupper(bin2hex(random_bytes(3)).'-'.bin2hex(random_bytes(3))),
            range(1, self::RECOVERY_CODES),
        );

        $user->two_factor_recovery_codes = array_map($this->fingerprint(...), $codes);
        $user->save();

        return $codes;
    }

    /** Cada código de respaldo sirve una sola vez. */
    private function consumeRecoveryCode(User $user, string $code): bool
    {
        return DB::transaction(function () use ($user, $code) {
            $fresh = User::query()->lockForUpdate()->findOrFail($user->id);
            $fingerprint = $this->fingerprint($code);
            $remaining = $fresh->two_factor_recovery_codes ?? [];

            foreach ($remaining as $i => $stored) {
                if (hash_equals($stored, $fingerprint)) {
                    unset($remaining[$i]);
                    $fresh->two_factor_recovery_codes = array_values($remaining);
                    $fresh->save();

                    return true;
                }
            }

            return false;
        });
    }

    private function fingerprint(string $code): string
    {
        return hash_hmac('sha256', strtoupper((string) preg_replace('/\s+/', '', $code)), (string) config('app.key'));
    }
}
