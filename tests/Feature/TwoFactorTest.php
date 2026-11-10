<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\TwoFactorChallengeController;
use App\Http\Middleware\AuthenticateAdmin;
use App\Models\Role;
use App\Models\User;
use App\Support\TwoFactor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/** Verificación en dos pasos del panel: opcional, sin atajos para entrar y con salida si se pierde el celular. */
class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'secret-pass-123';

    private function user(array $attributes = []): User
    {
        return User::factory()->create(['password' => self::PASSWORD, ...$attributes]);
    }

    private function withTwoFactor(User $user): string
    {
        $secret = (new Google2FA)->generateSecretKey(32);
        $user->two_factor_secret = $secret;
        $user->two_factor_confirmed_at = now();
        $user->save();

        return $secret;
    }

    private function otp(string $secret): string
    {
        return (new Google2FA)->getCurrentOtp($secret);
    }

    /** Sesión ya iniciada en el panel, como la de quien está en Mi cuenta. */
    private function signedIn(User $user): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login($user)]);
    }

    private function passwordStep(User $user)
    {
        return $this->post('/admin/login', ['email' => $user->email, 'password' => self::PASSWORD]);
    }

    public function test_login_without_two_factor_works_as_always(): void
    {
        $response = $this->passwordStep($this->user());

        $response->assertRedirect();
        $this->assertNotNull($response->getCookie(AuthenticateAdmin::COOKIE, false));
    }

    public function test_the_password_alone_does_not_give_access_when_two_factor_is_active(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);

        $response = $this->passwordStep($user);

        $response->assertRedirect('/admin/login/codigo');
        $this->assertNull($response->getCookie(AuthenticateAdmin::COOKIE, false));
        $this->get('/admin/cuenta')->assertRedirect('/admin/login');
    }

    public function test_a_wrong_password_never_reaches_the_code_step(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'incorrecta'])->assertSessionHasErrors('email');

        $this->get('/admin/login/codigo')->assertRedirect('/admin/login');
    }

    public function test_the_code_page_requires_the_password_step_first(): void
    {
        $this->get('/admin/login/codigo')->assertRedirect('/admin/login');
        $this->post('/admin/login/codigo', ['code' => '123456'])->assertRedirect('/admin/login');
    }

    public function test_the_right_code_signs_in_and_a_wrong_one_does_not(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        $this->passwordStep($user);

        $this->get('/admin/login/codigo')->assertInertia(fn (Assert $p) => $p->component('admin/two-factor'));

        $wrong = $this->post('/admin/login/codigo', ['code' => '000000']);
        $wrong->assertSessionHasErrors('code');
        $this->assertNull($wrong->getCookie(AuthenticateAdmin::COOKIE, false));

        $right = $this->post('/admin/login/codigo', ['code' => $this->otp($secret)]);
        $right->assertRedirect();
        $this->assertTrue($right->getCookie(AuthenticateAdmin::COOKIE, false)->isHttpOnly());

        // La marca del paso intermedio ya no sirve.
        $this->get('/admin/login/codigo')->assertRedirect('/admin/login');
    }

    public function test_the_same_code_cannot_be_used_twice(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        $code = $this->otp($secret);

        $this->passwordStep($user);
        $this->assertNotNull($this->post('/admin/login/codigo', ['code' => $code])->getCookie(AuthenticateAdmin::COOKIE, false));
        $this->assertGreaterThan(1000, $user->fresh()->two_factor_last_step);

        $this->passwordStep($user);
        $this->get('/admin/login/codigo')->assertOk();
        $again = $this->post('/admin/login/codigo', ['code' => $code]);
        $again->assertSessionHasErrors('code');
        $this->assertNull($again->getCookie(AuthenticateAdmin::COOKIE, false));
    }

    public function test_the_pending_step_expires(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        $this->passwordStep($user);
        $this->get('/admin/login/codigo')->assertOk();

        Carbon::setTestNow(now()->addMinutes(TwoFactorChallengeController::PENDING_MINUTES + 1));

        $this->post('/admin/login/codigo', ['code' => $this->otp($secret)])->assertRedirect('/admin/login');

        Carbon::setTestNow();
    }

    public function test_too_many_wrong_codes_block_even_the_right_one(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        // También hay un límite por dirección IP: aquí se comprueba el de la cuenta.
        $this->withoutMiddleware(ThrottleRequests::class);
        $this->passwordStep($user);

        foreach (range(1, 5) as $intento) {
            $this->post('/admin/login/codigo', ['code' => '000000'])->assertSessionHasErrors(['code' => 'El código no es correcto.']);
        }

        $blocked = $this->post('/admin/login/codigo', ['code' => $this->otp($secret)]);
        $blocked->assertSessionHasErrors(['code' => 'Demasiados intentos. Espera 5 minutos y vuelve a probar.']);
        $this->assertNull($blocked->getCookie(AuthenticateAdmin::COOKIE, false));
    }

    public function test_activating_and_signing_in_right_away_does_not_hit_a_shared_limit(): void
    {
        $user = $this->user();
        $this->signedIn($user)->post('/admin/cuenta/mfa/iniciar', ['current_password' => self::PASSWORD]);
        $secret = $user->fresh()->two_factor_secret;

        foreach (range(1, 3) as $intento) {
            $this->signedIn($user)->post('/admin/cuenta/mfa/confirmar', ['code' => '000000'])->assertSessionHasErrors('code');
        }

        $this->signedIn($user)->post('/admin/cuenta/mfa/confirmar', ['code' => $this->otp($secret)])->assertSessionHasNoErrors();

        // El código de activación no se puede repetir: se simula que ya pasó su intervalo de 30 segundos.
        $user->refresh();
        $user->two_factor_last_step = 0;
        $user->save();

        $this->passwordStep($user);
        $this->post('/admin/login/codigo', ['code' => '000000'])->assertSessionHasErrors('code');

        $response = $this->post('/admin/login/codigo', ['code' => $this->otp($secret)]);

        $this->assertNotSame(429, $response->status());
        $this->assertNotNull($response->getCookie(AuthenticateAdmin::COOKIE, false));
    }

    public function test_the_code_step_is_limited_per_address(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);
        $this->passwordStep($user);

        foreach (range(1, 6) as $intento) {
            $this->post('/admin/login/codigo', ['code' => '000000']);
        }

        $this->post('/admin/login/codigo', ['code' => '000000'])->assertTooManyRequests();
    }

    public function test_a_recovery_code_works_only_once(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);
        $codes = app(TwoFactor::class)->newRecoveryCodes($user);

        $this->passwordStep($user);
        $this->assertNotNull($this->post('/admin/login/codigo', ['code' => strtolower($codes[0])])->getCookie(AuthenticateAdmin::COOKIE, false));
        $this->assertCount(7, $user->fresh()->two_factor_recovery_codes);

        $this->passwordStep($user);
        $this->assertNull($this->post('/admin/login/codigo', ['code' => $codes[0]])->getCookie(AuthenticateAdmin::COOKIE, false));
    }

    public function test_a_deactivated_account_cannot_finish_the_code_step(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        $this->passwordStep($user);
        $this->get('/admin/login/codigo')->assertOk();

        $user->active = false;
        $user->save();

        $this->post('/admin/login/codigo', ['code' => $this->otp($secret)])->assertRedirect('/admin/login');
    }

    public function test_the_api_login_cannot_skip_the_second_step(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => self::PASSWORD])
            ->assertForbidden()
            ->assertJsonMissingPath('access_token');

        $sinMfa = $this->user();
        $this->postJson('/api/auth/login', ['email' => $sinMfa->email, 'password' => self::PASSWORD])
            ->assertOk()
            ->assertJsonStructure(['access_token']);
    }

    public function test_the_secret_and_codes_are_encrypted_and_never_reach_the_browser(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);
        app(TwoFactor::class)->newRecoveryCodes($user);

        $raw = $user->newQuery()->toBase()->where('id', $user->id)->first();
        $this->assertNotSame($secret, $raw->two_factor_secret);

        $this->signedIn($user)->get('/admin/cuenta')->assertInertia(fn (Assert $p) => $p
            ->missing('auth.user.two_factor_secret')
            ->missing('auth.user.two_factor_recovery_codes')
            ->where('twoFactor.enabled', true)
            ->where('twoFactor.setup', null)
            ->where('twoFactor.recoveryLeft', 8));
    }

    public function test_activating_needs_the_password_and_a_valid_code(): void
    {
        $user = $this->user();

        $this->signedIn($user)->post('/admin/cuenta/mfa/iniciar', ['current_password' => 'incorrecta'])
            ->assertSessionHasErrors('current_password');
        $this->assertNull($user->fresh()->two_factor_secret);

        $this->signedIn($user)->post('/admin/cuenta/mfa/iniciar', ['current_password' => self::PASSWORD])->assertSessionHasNoErrors();
        $secret = $user->fresh()->two_factor_secret;
        $this->assertNotNull($secret);
        $this->assertFalse($user->fresh()->hasTwoFactor());

        // Sin confirmar todavía no protege: se sigue entrando solo con la contraseña.
        $this->signedIn($user)->get('/admin/cuenta')->assertInertia(fn (Assert $p) => $p
            ->where('twoFactor.enabled', false)
            ->where('twoFactor.setup.secret', $secret)
            ->where('twoFactor.setup.qr', fn ($qr) => str_starts_with($qr, 'data:image/svg+xml;base64,')));
        $this->assertNotNull($this->passwordStep($user)->getCookie(AuthenticateAdmin::COOKIE, false));

        $this->signedIn($user)->post('/admin/cuenta/mfa/confirmar', ['code' => '000000'])->assertSessionHasErrors('code');
        $this->assertFalse($user->fresh()->hasTwoFactor());

        $this->signedIn($user)->post('/admin/cuenta/mfa/confirmar', ['code' => $this->otp($secret)])->assertSessionHasNoErrors();
        $this->assertTrue($user->fresh()->hasTwoFactor());

        // Los códigos de respaldo se ven esta vez y no la siguiente.
        $this->signedIn($user)->get('/admin/cuenta')->assertInertia(fn (Assert $p) => $p->has('twoFactor.newCodes', 8));
        $this->signedIn($user)->get('/admin/cuenta')->assertInertia(fn (Assert $p) => $p->where('twoFactor.newCodes', null));
    }

    public function test_a_pending_activation_can_be_cancelled(): void
    {
        $user = $this->user();
        $this->signedIn($user)->post('/admin/cuenta/mfa/iniciar', ['current_password' => self::PASSWORD]);

        $this->signedIn($user)->post('/admin/cuenta/mfa/cancelar')->assertRedirect();

        $this->assertNull($user->fresh()->two_factor_secret);
    }

    public function test_cancel_does_not_turn_off_an_active_two_factor(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);

        $this->signedIn($user)->post('/admin/cuenta/mfa/cancelar');

        $this->assertTrue($user->fresh()->hasTwoFactor());
    }

    public function test_disabling_needs_both_the_password_and_a_code(): void
    {
        $user = $this->user();
        $secret = $this->withTwoFactor($user);

        $this->signedIn($user)->post('/admin/cuenta/mfa/desactivar', ['current_password' => 'incorrecta', 'code' => $this->otp($secret)])
            ->assertSessionHasErrors('current_password');
        $this->signedIn($user)->post('/admin/cuenta/mfa/desactivar', ['current_password' => self::PASSWORD, 'code' => '000000'])
            ->assertSessionHasErrors('code');
        $this->assertTrue($user->fresh()->hasTwoFactor());

        $this->signedIn($user)->post('/admin/cuenta/mfa/desactivar', ['current_password' => self::PASSWORD, 'code' => $this->otp($secret)])
            ->assertSessionHasNoErrors();
        $this->assertFalse($user->fresh()->hasTwoFactor());
        $this->assertNull($user->fresh()->two_factor_secret);
    }

    public function test_new_recovery_codes_replace_the_old_ones(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);
        $old = app(TwoFactor::class)->newRecoveryCodes($user);

        $this->signedIn($user)->post('/admin/cuenta/mfa/codigos', ['current_password' => self::PASSWORD])->assertSessionHasNoErrors();

        $this->assertFalse(app(TwoFactor::class)->consume($user->fresh(), $old[0]));
        $this->assertCount(8, $user->fresh()->two_factor_recovery_codes);
    }

    private function roleWith(array $permissions, bool $super = false): Role
    {
        $name = 'Rol '.uniqid();
        $role = new Role(['name' => $name]);
        $role->slug = Role::slugFor($name);
        $role->is_super = $super;
        $role->save();
        $role->syncPermissions($permissions);

        return $role;
    }

    private function userWithRole(Role $role): User
    {
        $user = $this->user();
        $user->role_id = $role->id;
        $user->save();

        return $user;
    }

    public function test_an_administrator_can_remove_it_from_someone_who_lost_the_phone(): void
    {
        $admin = $this->userWithRole($this->roleWith([], super: true));
        $other = $this->userWithRole($this->roleWith(['users.view']));
        $this->withTwoFactor($other);

        $this->signedIn($admin)->post("/admin/usuarios/{$other->id}/mfa", ['current_password' => 'incorrecta'])
            ->assertSessionHasErrors('current_password');
        $this->assertTrue($other->fresh()->hasTwoFactor());

        $this->signedIn($admin)->post("/admin/usuarios/{$other->id}/mfa", ['current_password' => self::PASSWORD])
            ->assertSessionHasNoErrors();
        $this->assertFalse($other->fresh()->hasTwoFactor());
    }

    public function test_nobody_can_remove_it_from_someone_with_more_permissions_or_from_themselves(): void
    {
        $editor = $this->userWithRole($this->roleWith(['users.view', 'users.edit']));
        $this->withTwoFactor($editor);
        $boss = $this->userWithRole($this->roleWith([], super: true));
        $this->withTwoFactor($boss);

        $this->signedIn($editor)->post("/admin/usuarios/{$boss->id}/mfa", ['current_password' => self::PASSWORD])
            ->assertSessionHasErrors('user');
        $this->assertTrue($boss->fresh()->hasTwoFactor());

        $this->signedIn($editor)->post("/admin/usuarios/{$editor->id}/mfa", ['current_password' => self::PASSWORD])
            ->assertSessionHasErrors('user');
        $this->assertTrue($editor->fresh()->hasTwoFactor());
    }

    public function test_someone_without_the_permission_cannot_remove_it(): void
    {
        $viewer = $this->userWithRole($this->roleWith(['users.view']));
        $other = $this->userWithRole($this->roleWith([]));
        $this->withTwoFactor($other);

        $this->signedIn($viewer)->post("/admin/usuarios/{$other->id}/mfa", ['current_password' => self::PASSWORD])
            ->assertForbidden();
    }

    public function test_the_console_command_rescues_a_locked_out_account(): void
    {
        $user = $this->user();
        $this->withTwoFactor($user);

        $this->artisan('mfa:quitar', ['email' => $user->email])
            ->expectsConfirmation("¿Quitar la verificación en dos pasos de {$user->email}?", 'yes')
            ->assertSuccessful();

        $this->assertFalse($user->fresh()->hasTwoFactor());
        $this->artisan('mfa:quitar', ['email' => 'nadie@example.com'])->assertFailed();
    }
}
