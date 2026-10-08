<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContactAndAccountTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private function admin(): static
    {
        $this->admin ??= User::factory()->create(['password' => 'clave-actual-123']);
        $token = auth('api')->login($this->admin);

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    private function valid(array $overrides = []): array
    {
        return [
            'name' => 'Ana Pérez',
            'email' => 'ana@empresa.pe',
            'phone' => '999 888 777',
            'company' => 'Empresa SAC',
            'message' => 'Necesitamos cotizar una red Wi-Fi para tres sedes.',
            ...$overrides,
        ];
    }

    public function test_contact_form_stores_the_message_and_emails_the_sales_address(): void
    {
        config(['mail.default' => 'array']);

        $this->post('/contacto', $this->valid())->assertSessionHasNoErrors()->assertSessionHas('status', 'sent');

        $this->assertDatabaseHas('contact_messages', ['email' => 'ana@empresa.pe', 'read_at' => null]);

        $sent = app('mail.manager')->mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(1, $sent);

        $email = $sent[0]->getOriginalMessage();
        $this->assertSame('ventas@proinnovatec.com', $email->getTo()[0]->getAddress());
        $this->assertSame('ana@empresa.pe', $email->getReplyTo()[0]->getAddress());
    }

    public function test_mail_failures_do_not_lose_the_message(): void
    {
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => '127.0.0.1', 'mail.mailers.smtp.port' => 1]);

        $this->post('/contacto', $this->valid())->assertSessionHasNoErrors();

        $this->assertDatabaseCount('contact_messages', 1);
    }

    public function test_contact_form_validates_and_blocks_bots(): void
    {
        $this->post('/contacto', $this->valid(['email' => 'no-es-correo', 'message' => 'corto']))
            ->assertSessionHasErrors(['email', 'message']);

        $this->post('/contacto', $this->valid(['company_site' => 'http://spam.example']))->assertSessionHasNoErrors();

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        foreach (range(1, 5) as $_) {
            $this->post('/contacto', $this->valid());
        }

        $this->post('/contacto', $this->valid())->assertStatus(429);
    }

    public function test_admin_inbox_requires_login_lists_marks_read_and_deletes(): void
    {
        $message = ContactMessage::query()->create($this->valid());

        $this->get('/admin/mensajes')->assertRedirect('/admin/login');

        $this->admin()->get('/admin/mensajes')->assertInertia(fn (Assert $p) => $p
            ->component('admin/messages')
            ->where('messages.0.name', 'Ana Pérez')
            ->where('messages.0.read', false)
            ->where('pages.6.badge', 1));

        $this->admin()->post("/admin/mensajes/{$message->id}/leida")->assertRedirect();
        $this->assertNotNull($message->fresh()->read_at);

        $this->admin()->delete("/admin/mensajes/{$message->id}")->assertRedirect();
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_account_requires_the_current_password_and_enforces_a_strong_new_one(): void
    {
        $this->admin()->post('/admin/cuenta', [
            'name' => 'Admin', 'email' => $this->admin->email, 'current_password' => 'incorrecta',
        ])->assertSessionHasErrors('current_password');

        $this->admin()->post('/admin/cuenta', [
            'name' => 'Admin', 'email' => $this->admin->email, 'current_password' => 'clave-actual-123',
            'password' => 'corta', 'password_confirmation' => 'corta',
        ])->assertSessionHasErrors('password');

        $this->admin()->post('/admin/cuenta', [
            'name' => 'Nuevo Nombre', 'email' => 'nuevo@proinnovatec.com', 'current_password' => 'clave-actual-123',
            'password' => 'otra-clave-segura-99', 'password_confirmation' => 'otra-clave-segura-99',
        ])->assertSessionHasNoErrors();

        $fresh = $this->admin->fresh();
        $this->assertSame('nuevo@proinnovatec.com', $fresh->email);
        $this->assertTrue(Hash::check('otra-clave-segura-99', $fresh->password));
    }
}
