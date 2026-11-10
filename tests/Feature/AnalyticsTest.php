<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_without_an_id_nothing_is_loaded(): void
    {
        config(['services.google_analytics.id' => '']);

        $this->get('/nosotros')->assertOk()->assertDontSee('googletagmanager.com', false);
    }

    public function test_with_an_id_public_pages_load_google_analytics(): void
    {
        config(['services.google_analytics.id' => 'G-F1QBJPGQW2']);

        foreach (['/', '/nosotros', '/contacto'] as $url) {
            $this->get($url)->assertOk()
                ->assertSee('googletagmanager.com/gtag/js', false)
                ->assertSee('G-F1QBJPGQW2', false);
        }
    }

    public function test_an_invalid_id_is_ignored(): void
    {
        config(['services.google_analytics.id' => 'UA-12345-1"></script><script>alert(1)</script>']);

        $this->get('/nosotros')->assertOk()->assertDontSee('googletagmanager.com', false)->assertDontSee('alert(1)', false);
    }

    public function test_the_admin_panel_and_a_logged_in_admin_are_not_measured(): void
    {
        config(['services.google_analytics.id' => 'G-F1QBJPGQW2']);

        // El panel de administración (también su pantalla de ingreso) no se mide.
        $this->get('/admin/login')->assertOk()->assertDontSee('googletagmanager.com', false);

        // Quien tiene la cookie de sesión de administrador no cuenta en las páginas públicas.
        $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => 'x'])
            ->get('/nosotros')->assertOk()->assertDontSee('googletagmanager.com', false);
    }
}
