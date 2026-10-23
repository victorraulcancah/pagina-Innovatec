<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Mostrar u ocultar opciones de la barra de menú y el enlace «Panel» desde el panel. */
class MenuVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        $token = auth('api')->login(User::factory()->create());

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    /** @return array<string, mixed> */
    private function payload(array $overrides = []): array
    {
        $home = HomeSetting::current();

        return [
            'title' => $home->title,
            'subtitle' => $home->subtitle,
            'buttons' => $home->buttons,
            'menu' => $home->menu,
            'nav_cta' => $home->nav_cta,
            ...$overrides,
        ];
    }

    private function ocultar(string $url): array
    {
        return array_map(fn (array $m) => [...$m, 'visible' => $m['url'] !== $url], HomeSetting::current()->menu);
    }

    public function test_every_menu_option_is_visible_by_default(): void
    {
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('home.menu', 7)
            ->where('home.menu.0.visible', true)
            ->where('home.showPanelLink', true));
    }

    public function test_a_hidden_option_disappears_from_the_public_menu_but_stays_in_the_panel(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $this->ocultar('/blog')]))->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('home.menu', 6)
            ->where('home.menu', fn ($menu) => ! collect($menu)->contains('url', '/blog')));

        // El panel la sigue viendo (oculta) para poder volver a mostrarla.
        $this->admin()->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->has('home.menu', 7)
            ->where('home.menu', fn ($menu) => collect($menu)->firstWhere('url', '/blog')['visible'] === false));
    }

    public function test_a_hidden_option_can_be_shown_again(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $this->ocultar('/nosotros')]))->assertSessionHasNoErrors();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('home.menu', 6));

        $mostrar = array_map(fn (array $m) => [...$m, 'visible' => true], HomeSetting::current()->menu);
        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $mostrar]))->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('home.menu', 7)
            ->where('home.menu', fn ($menu) => collect($menu)->contains('url', '/nosotros')));
    }

    public function test_a_menu_saved_before_the_visibility_flag_existed_still_shows_everything(): void
    {
        $antes = array_map(fn (array $m) => collect($m)->except('visible')->all(), HomeSetting::current()->menu);
        HomeSetting::current()->update(['menu' => $antes]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('home.menu', 7)->where('home.menu.2.visible', true));
    }

    public function test_the_panel_link_can_be_hidden_and_shown(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['show_panel_link' => false]))->assertSessionHasNoErrors();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('home.showPanelLink', false));

        $this->admin()->post('/admin/inicio', $this->payload(['show_panel_link' => true]))->assertSessionHasNoErrors();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('home.showPanelLink', true));
    }

    public function test_hiding_the_panel_link_does_not_block_the_admin_address(): void
    {
        HomeSetting::current()->update(['show_panel_link' => false]);

        $this->get('/admin/login')->assertOk();
    }

    /** Las soluciones de Enterprise (su submenú se arma solo) y el menú actual con ese submenú marcado como se pida. */
    private function conSoluciones(): void
    {
        foreach (['redes' => 'Redes', 'seguridad' => 'Seguridad', 'telefonia' => 'Telefonía'] as $slug => $title) {
            SectionItem::query()->create(['section' => 'solution', 'slug' => $slug, 'title' => $title, 'sort' => 0]);
        }
    }

    /** @return array<string, mixed> el payload con la opción Enterprise ajustada */
    private function enterprise(array $cambios, array $ocultarHijos = []): array
    {
        $menu = array_map(function (array $m) use ($cambios, $ocultarHijos) {
            if ($m['url'] !== '/division-enterprise') {
                return $m;
            }

            $hijos = array_map(fn (array $c) => [...$c, 'visible' => ! in_array($c['url'], $ocultarHijos, true)], $m['children']);

            return [...$m, ...$cambios, 'children' => $hijos];
        }, HomeSetting::current()->toPageData(paraPanel: true)['menu']);

        return $this->payload(['menu' => $menu]);
    }

    private function hijosPublicos(): array
    {
        $menu = HomeSetting::current()->toPageData()['menu'];

        return collect($menu)->firstWhere('url', '/division-enterprise')['children'] ?? [];
    }

    public function test_one_submenu_option_can_be_hidden_without_hiding_the_rest_or_the_parent(): void
    {
        $this->conSoluciones();
        $this->assertCount(3, $this->hijosPublicos());

        $this->admin()->post('/admin/inicio', $this->enterprise([], ['/soluciones/seguridad']))->assertSessionHasNoErrors();

        $urls = array_column($this->hijosPublicos(), 'url');
        $this->assertSame(['/soluciones/redes', '/soluciones/telefonia'], $urls);
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('home.menu', fn ($menu) => collect($menu)->contains('url', '/division-enterprise')));

        // El panel sigue viendo las tres, con la oculta marcada.
        $this->admin()->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->where('home.menu', function ($menu) {
                $hijos = collect(collect($menu)->firstWhere('url', '/division-enterprise')['children']);

                return $hijos->count() === 3 && $hijos->firstWhere('url', '/soluciones/seguridad')['visible'] === false;
            }));
    }

    public function test_a_hidden_submenu_option_can_be_shown_again(): void
    {
        $this->conSoluciones();
        $this->admin()->post('/admin/inicio', $this->enterprise([], ['/soluciones/redes']))->assertSessionHasNoErrors();
        $this->assertCount(2, $this->hijosPublicos());

        $this->admin()->post('/admin/inicio', $this->enterprise([], []))->assertSessionHasNoErrors();
        $this->assertCount(3, $this->hijosPublicos());
    }

    public function test_the_whole_dropdown_can_be_hidden_while_the_main_option_stays(): void
    {
        $this->conSoluciones();

        $this->admin()->post('/admin/inicio', $this->enterprise(['show_children' => false]))->assertSessionHasNoErrors();

        $this->assertSame([], $this->hijosPublicos());
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('home.menu', fn ($menu) => collect($menu)->contains('url', '/division-enterprise')));

        // Las subopciones no se perdieron: al volver a mostrar el desplegable están todas.
        $this->admin()->post('/admin/inicio', $this->enterprise(['show_children' => true]))->assertSessionHasNoErrors();
        $this->assertCount(3, $this->hijosPublicos());
    }

    public function test_hiding_every_submenu_option_leaves_a_plain_link(): void
    {
        $this->conSoluciones();

        $this->admin()->post('/admin/inicio', $this->enterprise([], ['/soluciones/redes', '/soluciones/seguridad', '/soluciones/telefonia']))->assertSessionHasNoErrors();

        $this->assertSame([], $this->hijosPublicos());
    }

    public function test_a_manual_submenu_option_can_be_hidden(): void
    {
        $menu = array_map(fn (array $m) => $m['url'] === '/contacto'
            ? [...$m, 'children' => [['label' => 'Ventas', 'url' => '/contacto#ventas', 'visible' => true], ['label' => 'Soporte', 'url' => '/contacto#soporte', 'visible' => false]]]
            : $m, HomeSetting::current()->menu);

        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $menu]))->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('home.menu', fn ($m) => array_column(collect($m)->firstWhere('url', '/contacto')['children'], 'url') === ['/contacto#ventas']));
    }
}
