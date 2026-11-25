<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** El menú solo enlaza a páginas que existen, y los botones no pueden apuntar a una página interna inexistente. */
class MenuLinksTest extends TestCase
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

    private function menuWith(array $option): array
    {
        return [...HomeSetting::current()->menu, ['children' => [], ...$option]];
    }

    public function test_the_panel_receives_the_list_of_existing_pages(): void
    {
        SectionItem::query()->create(['section' => 'solution', 'slug' => 'networking', 'title' => 'Networking', 'visible' => true]);

        $this->admin()->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->where('links', fn ($links) => collect($links)->contains('url', '/contacto')
                && collect($links)->contains('url', '/soluciones/networking')));
    }

    public function test_the_default_menu_still_saves(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload())->assertSessionHasNoErrors();
    }

    public function test_a_menu_option_to_a_page_that_does_not_exist_is_rejected(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $this->menuWith(['label' => 'Prueba', 'url' => '/prueba'])]))
            ->assertSessionHasErrors('menu.8.url');
    }

    public function test_a_menu_option_cannot_be_an_external_link_or_a_section(): void
    {
        foreach (['https://example.com', '#contacto'] as $url) {
            $this->admin()->post('/admin/inicio', $this->payload(['menu' => $this->menuWith(['label' => 'Otro', 'url' => $url])]))
                ->assertSessionHasErrors('menu.8.url');
        }
    }

    public function test_a_menu_option_to_an_existing_solution_is_accepted(): void
    {
        SectionItem::query()->create(['section' => 'solution', 'slug' => 'networking', 'title' => 'Networking', 'visible' => true]);

        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $this->menuWith(['label' => 'Redes', 'url' => '/soluciones/networking'])]))
            ->assertSessionHasNoErrors();
    }

    public function test_a_custom_submenu_entry_must_exist_too(): void
    {
        $menu = HomeSetting::current()->menu;
        $i = collect($menu)->search(fn ($m) => $m['url'] === '/nosotros');
        $menu[$i]['children'] = [['label' => 'Prueba', 'url' => '/prueba']];

        $this->admin()->post('/admin/inicio', $this->payload(['menu' => $menu]))
            ->assertSessionHasErrors("menu.{$i}.children.0.url");
    }

    public function test_a_button_to_a_missing_page_is_rejected_but_sections_and_external_links_are_not(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['buttons' => [['label' => 'Ver', 'url' => '/prueba', 'variant' => 'primary']]]))
            ->assertSessionHasErrors('buttons.0.url');

        $this->admin()->post('/admin/inicio', $this->payload(['buttons' => [
            ['label' => 'Contacto', 'url' => '#contacto', 'variant' => 'primary'],
            ['label' => 'WhatsApp', 'url' => 'https://wa.me/51970855741', 'variant' => 'outline'],
            ['label' => 'Nosotros', 'url' => '/nosotros#mision', 'variant' => 'outline'],
        ]]))->assertSessionHasNoErrors();
    }

    public function test_the_navbar_button_to_a_missing_page_is_rejected(): void
    {
        $this->admin()->post('/admin/inicio', $this->payload(['nav_cta' => ['label' => 'Ir', 'url' => '/division-services']]))
            ->assertSessionHasErrors('nav_cta.url');
    }
}
