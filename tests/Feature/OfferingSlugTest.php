<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** La dirección de una solución o servicio sigue a su título; la anterior redirige a la nueva. */
class OfferingSlugTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        $token = auth('api')->login(User::factory()->create());

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    private function service(string $title, string $slug): SectionItem
    {
        return SectionItem::query()->create(['section' => 'service', 'slug' => $slug, 'title' => $title, 'visible' => true]);
    }

    private function rename(SectionItem $item, string $title): void
    {
        $this->admin()->post('/admin/enterprise', [
            'texts' => ['enterprise' => ['title' => 'División Enterprise'], 'services' => ['title' => 'Servicios']],
            'lists' => ['service' => [['id' => $item->id, 'title' => $title]]],
        ])->assertSessionHasNoErrors();
    }

    public function test_renaming_a_service_changes_its_address_and_the_old_one_redirects(): void
    {
        $item = $this->service('Consultoría', 'consultoria');

        $this->rename($item, 'Ingeniería e Implementación');

        $item->refresh();
        $this->assertSame('ingenieria-e-implementacion', $item->slug);
        $this->assertSame(['consultoria'], $item->previous_slugs);
        $this->get('/servicios/ingenieria-e-implementacion')->assertOk();
        $this->get('/servicios/consultoria')->assertRedirect('/servicios/ingenieria-e-implementacion')->assertStatus(301);
    }

    public function test_saving_without_changing_the_title_keeps_the_address(): void
    {
        $item = $this->service('Help Desk', 'help-desk');

        $this->rename($item, 'Help Desk');

        $this->assertSame('help-desk', $item->refresh()->slug);
        $this->assertNull($item->previous_slugs);
    }

    public function test_links_to_the_old_address_in_the_menu_and_buttons_are_updated(): void
    {
        $item = $this->service('Consultoría', 'consultoria');
        $home = HomeSetting::current();
        $menu = $home->menu;
        $menu[1]['children'] = [['label' => 'Consultoría', 'url' => '/servicios/consultoria']];
        $home->update([
            'menu' => $menu,
            'buttons' => [['label' => 'Ver', 'url' => '/servicios/consultoria#incluye', 'variant' => 'primary']],
        ]);

        $this->rename($item, 'Ingeniería e Implementación');

        $home = HomeSetting::current();
        $this->assertSame('/servicios/ingenieria-e-implementacion', $home->menu[1]['children'][0]['url']);
        $this->assertSame('/servicios/ingenieria-e-implementacion#incluye', $home->buttons[0]['url']);
    }

    public function test_a_repeated_title_gets_a_free_address(): void
    {
        $this->service('Soporte', 'soporte');
        $item = $this->service('Help Desk', 'help-desk');

        $this->rename($item, 'Soporte');

        $this->assertSame('soporte-2', $item->refresh()->slug);
    }

    public function test_the_migration_fixes_services_renamed_before_this_change(): void
    {
        // Una que no cambia va primero: la migración no debe detenerse en ella.
        $same = $this->service('Help Desk', 'help-desk');
        $renamed = $this->service('Ingeniería e Implementación', 'consultoria');
        $other = $this->service('Soporte y Mantenimiento', 'outsourcing-tic');

        (require database_path('migrations/2026_11_26_000002_sync_offering_slugs_with_titles.php'))->up();

        $this->assertSame('ingenieria-e-implementacion', $renamed->refresh()->slug);
        $this->assertSame('help-desk', $same->refresh()->slug);
        $this->assertSame('soporte-y-mantenimiento', $other->refresh()->slug);
        $this->get('/servicios/consultoria')->assertRedirect('/servicios/ingenieria-e-implementacion');
    }

    public function test_an_unknown_address_is_still_a_404(): void
    {
        $this->get('/servicios/no-existe')->assertNotFound();
    }
}
