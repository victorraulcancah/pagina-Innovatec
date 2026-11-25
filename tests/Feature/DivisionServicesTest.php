<?php

namespace Tests\Feature;

use App\Models\HomeSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** La División Telcos ahora es División Services, en /division-services; la dirección anterior redirige. */
class DivisionServicesTest extends TestCase
{
    use RefreshDatabase;

    private function migrate(): void
    {
        (require database_path('migrations/2026_11_27_000001_rename_telcos_division_to_services.php'))->up();
    }

    public function test_the_old_address_redirects_to_the_new_one(): void
    {
        $this->get('/division-services')->assertOk();
        $this->get('/division-telcos')->assertRedirect('/division-services')->assertStatus(301);
    }

    public function test_the_migration_renames_the_menu_option_and_updates_links(): void
    {
        $home = HomeSetting::current();
        $menu = array_map(fn (array $i) => $i['url'] === '/division-services'
            ? ['label' => 'División Telcos', 'url' => '/division-telcos', 'children' => []]
            : $i, $home->menu);
        $home->update([
            'menu' => $menu,
            'buttons' => [['label' => 'Ver', 'url' => '/division-telcos', 'variant' => 'primary']],
        ]);

        $this->migrate();

        $home = HomeSetting::current();
        $option = collect($home->menu)->firstWhere('url', '/division-services');
        $this->assertSame('División Services', $option['label']);
        $this->assertNotContains('/division-telcos', array_column($home->menu, 'url'));
        $this->assertSame('/division-services', $home->buttons[0]['url']);
    }

    public function test_the_migration_keeps_a_custom_label(): void
    {
        $home = HomeSetting::current();
        $home->update(['menu' => array_map(fn (array $i) => $i['url'] === '/division-services'
            ? [...$i, 'label' => 'DIVISIÓN SERVICES']
            : $i, $home->menu)]);

        $this->migrate();

        $this->assertSame('DIVISIÓN SERVICES', collect(HomeSetting::current()->menu)->firstWhere('url', '/division-services')['label']);
    }

    public function test_the_migration_adds_the_option_after_enterprise_when_missing(): void
    {
        $home = HomeSetting::current();
        $home->update(['menu' => array_values(array_filter($home->menu, fn (array $i) => $i['url'] !== '/division-services'))]);

        $this->migrate();
        $this->migrate();

        $urls = array_column(HomeSetting::current()->menu, 'url');
        $this->assertSame('/division-services', $urls[array_search('/division-enterprise', $urls, true) + 1]);
        $this->assertCount(1, array_keys($urls, '/division-services', true));
    }
}
