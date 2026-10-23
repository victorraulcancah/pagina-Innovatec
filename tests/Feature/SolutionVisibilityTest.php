<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Models\User;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Mostrar u ocultar soluciones y servicios desde el panel, y el orden en que salen. */
class SolutionVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    /** @return list<SectionItem> */
    private function soluciones(array $titulos = ['Redes', 'Seguridad', 'Telefonía']): array
    {
        return array_map(fn (string $t, int $i) => SectionItem::query()->create([
            'section' => 'solution', 'slug' => strtolower($t), 'title' => $t, 'sort' => $i,
        ]), $titulos, array_keys($titulos));
    }

    /** El envío del panel para Enterprise: las soluciones tal cual, con las visibles que se indiquen. */
    private function envio(array $items, array $visibles): array
    {
        return [
            'texts' => ['enterprise' => ['title' => 'División Enterprise'], 'services' => ['title' => 'Servicios profesionales']],
            'lists' => ['solution' => array_map(fn (SectionItem $i) => [
                'id' => $i->id, 'title' => $i->title, 'visible' => in_array($i->title, $visibles, true),
            ], $items)],
        ];
    }

    private function titulosPublicos(): array
    {
        return array_column(HomeSetting::current()->toPageData()['sections']['solutions']['items'], 'title');
    }

    public function test_every_solution_is_visible_by_default(): void
    {
        $this->soluciones();

        $this->assertSame(['Redes', 'Seguridad', 'Telefonía'], $this->titulosPublicos());
    }

    public function test_a_hidden_solution_disappears_everywhere_in_the_site_but_is_not_deleted(): void
    {
        $items = $this->soluciones();

        $this->admin()->post('/admin/enterprise', $this->envio($items, ['Redes', 'Telefonía']))->assertSessionHasNoErrors();

        $this->assertSame(['Redes', 'Telefonía'], $this->titulosPublicos());
        $this->assertDatabaseHas('section_items', ['title' => 'Seguridad', 'visible' => false]);

        // El submenú de Enterprise (se arma solo) tampoco la lista.
        $menu = HomeSetting::current()->toPageData()['menu'];
        $enterprise = collect($menu)->firstWhere('url', '/division-enterprise');
        $this->assertSame(['/soluciones/redes', '/soluciones/telefonía'], array_column($enterprise['children'], 'url'));

        // Su página de detalle deja de existir mientras esté oculta.
        $this->get('/soluciones/seguridad')->assertNotFound();
        $this->get('/soluciones/redes')->assertOk();

        // La página Enterprise y el panel: Enterprise no la lista; el panel la sigue viendo (oculta).
        $this->get('/division-enterprise')->assertInertia(fn (Assert $p) => $p->has('home.sections.solutions.items', 2));
        $this->admin()->get('/admin/enterprise')->assertInertia(fn (Assert $p) => $p
            ->where('lists.solution', fn ($l) => count($l) === 3 && collect($l)->firstWhere('title', 'Seguridad')['visible'] === false));
    }

    public function test_a_hidden_solution_can_be_shown_again(): void
    {
        $items = $this->soluciones();
        $this->admin()->post('/admin/enterprise', $this->envio($items, ['Redes']))->assertSessionHasNoErrors();
        $this->assertSame(['Redes'], $this->titulosPublicos());

        $this->admin()->post('/admin/enterprise', $this->envio($items, ['Redes', 'Seguridad', 'Telefonía']))->assertSessionHasNoErrors();

        $this->assertSame(['Redes', 'Seguridad', 'Telefonía'], $this->titulosPublicos());
        $this->get('/soluciones/seguridad')->assertOk();
    }

    public function test_solutions_keep_the_order_chosen_in_the_panel(): void
    {
        $items = $this->soluciones();
        $reordenado = array_reverse($items);

        $this->admin()->post('/admin/enterprise', $this->envio($reordenado, ['Redes', 'Seguridad', 'Telefonía']))->assertSessionHasNoErrors();

        $this->assertSame(['Telefonía', 'Seguridad', 'Redes'], $this->titulosPublicos());
    }

    public function test_a_hidden_service_is_not_listed(): void
    {
        $servicio = SectionItem::query()->create(['section' => 'service', 'slug' => 'consultoria', 'title' => 'Consultoría', 'sort' => 0]);

        $this->admin()->post('/admin/enterprise', [
            'texts' => ['enterprise' => ['title' => 'División Enterprise'], 'services' => ['title' => 'Servicios profesionales']],
            'lists' => ['service' => [['id' => $servicio->id, 'title' => 'Consultoría', 'visible' => false]]],
        ])->assertSessionHasNoErrors();

        $this->assertSame([], HomeSetting::current()->toPageData()['sections']['services']['items']);
        $this->get('/servicios/consultoria')->assertNotFound();
    }

    public function test_a_fresh_install_lists_solutions_in_the_requested_order(): void
    {
        Storage::fake('public');
        $this->seed(SiteContentSeeder::class);

        $this->assertSame(
            ['Networking', 'Infraestructura TI', 'Ciberseguridad', 'Seguridad Electrónica', 'Comunicaciones Unificadas'],
            $this->titulosPublicos(),
        );
    }

    public function test_an_existing_install_in_the_original_order_is_reordered_once(): void
    {
        $this->soluciones(['Comunicaciones Unificadas', 'Ciberseguridad', 'Networking', 'Infraestructura TI', 'Seguridad Electrónica']);
        Storage::fake('public');

        $this->seed(SiteContentSeeder::class);

        $this->assertSame(
            ['Networking', 'Infraestructura TI', 'Ciberseguridad', 'Seguridad Electrónica', 'Comunicaciones Unificadas'],
            $this->titulosPublicos(),
        );

        // El administrador lo cambia a su gusto: volver a sembrar no lo pisa.
        $items = SectionItem::query()->where('section', 'solution')->orderBy('sort')->get()->all();
        $this->admin()->post('/admin/enterprise', $this->envio(array_reverse($items), array_column($items, 'title')))->assertSessionHasNoErrors();
        $this->seed(SiteContentSeeder::class);

        $this->assertSame(
            ['Comunicaciones Unificadas', 'Seguridad Electrónica', 'Ciberseguridad', 'Infraestructura TI', 'Networking'],
            $this->titulosPublicos(),
        );
    }

    public function test_a_customized_order_is_never_touched_by_the_seeder(): void
    {
        $this->soluciones(['Seguridad Electrónica', 'Networking', 'Ciberseguridad', 'Infraestructura TI', 'Comunicaciones Unificadas']);
        Storage::fake('public');

        $this->seed(SiteContentSeeder::class);

        $this->assertSame(
            ['Seguridad Electrónica', 'Networking', 'Ciberseguridad', 'Infraestructura TI', 'Comunicaciones Unificadas'],
            $this->titulosPublicos(),
        );
    }
}
