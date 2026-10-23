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

/** La sección de clientes: nombre, texto breve por cliente, texto informativo y mostrar u ocultar. */
class ClientsSectionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    public function test_the_informative_text_has_a_default_and_is_editable(): void
    {
        $this->get('/clientes')->assertInertia(fn (Assert $p) => $p
            ->component('clients')
            ->where('home.sections.clients.intro', fn ($t) => is_string($t) && strlen($t) > 40));

        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes', 'accent' => 'felices', 'intro' => 'Gracias por confiar en nosotros.']],
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.clients.intro', 'Gracias por confiar en nosotros.'));
    }

    public function test_each_client_has_a_name_and_an_optional_short_text(): void
    {
        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes']],
            'lists' => ['client' => [
                ['title' => 'Minera Titán', 'body' => 'Redes y comunicaciones en sus campamentos.'],
                ['title' => 'SENATI'],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/clientes')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.clients.items.0.name', 'Minera Titán')
            ->where('home.sections.clients.items.0.description', 'Redes y comunicaciones en sus campamentos.')
            ->where('home.sections.clients.items.1.description', null));
    }

    public function test_the_short_text_has_a_length_limit(): void
    {
        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes']],
            'lists' => ['client' => [['title' => 'Cliente', 'body' => str_repeat('a', 161)]]],
        ])->assertSessionHasErrors('lists.client.0.body');
    }

    public function test_a_hidden_client_does_not_appear_on_the_site(): void
    {
        $a = SectionItem::query()->create(['section' => 'client', 'title' => 'Uno', 'sort' => 0]);
        $b = SectionItem::query()->create(['section' => 'client', 'title' => 'Dos', 'sort' => 1]);

        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes']],
            'lists' => ['client' => [
                ['id' => $a->id, 'title' => 'Uno', 'visible' => true],
                ['id' => $b->id, 'title' => 'Dos', 'visible' => false],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/clientes')->assertInertia(fn (Assert $p) => $p->has('home.sections.clients.items', 1)->where('home.sections.clients.items.0.name', 'Uno'));
        $this->assertDatabaseHas('section_items', ['title' => 'Dos', 'visible' => false]);
    }

    public function test_the_seeder_gives_a_short_text_to_clients_with_a_project_but_never_overwrites_one(): void
    {
        Storage::fake('public');
        $this->seed(SiteContentSeeder::class);

        $senati = SectionItem::query()->where('section', 'client')->where('title', 'SENATI')->firstOrFail();
        $this->assertStringContainsString('120 sedes', (string) $senati->body);
        $this->assertNull(SectionItem::query()->where('section', 'client')->where('title', 'Terpel')->value('body'));

        $senati->update(['body' => 'Texto escrito por el administrador.']);
        $this->seed(SiteContentSeeder::class);

        $this->assertSame('Texto escrito por el administrador.', $senati->fresh()->body);
        $this->assertNotEmpty(HomeSetting::current()->content()['clients']['intro']);
    }
}
