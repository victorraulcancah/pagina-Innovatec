<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\SectionItem;
use App\Models\User;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Certificaciones: nombre, descripción opcional y mostrar u ocultar, editables desde «Panel de aliados». */
class CertificationsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    public function test_each_certification_has_a_name_and_an_optional_description(): void
    {
        $this->admin()->post('/admin/aliados', [
            'texts' => ['allies' => ['title' => 'Panel de aliados']],
            'lists' => ['certification' => [
                ['title' => 'Cisco CCNA', 'body' => 'Fundamentos de redes.'],
                ['title' => 'Huawei HCIA'],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/experiencia')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.allies.items.0.name', 'Cisco CCNA')
            ->where('home.sections.allies.items.0.description', 'Fundamentos de redes.')
            ->where('home.sections.allies.items.1.description', null));
    }

    public function test_the_description_has_a_length_limit(): void
    {
        $this->admin()->post('/admin/aliados', [
            'texts' => ['allies' => ['title' => 'Panel de aliados']],
            'lists' => ['certification' => [['title' => 'X', 'body' => str_repeat('a', 161)]]],
        ])->assertSessionHasErrors('lists.certification.0.body');
    }

    public function test_a_hidden_certification_does_not_appear_on_the_site(): void
    {
        $a = SectionItem::query()->create(['section' => 'certification', 'title' => 'Una', 'sort' => 0]);
        $b = SectionItem::query()->create(['section' => 'certification', 'title' => 'Otra', 'sort' => 1]);

        $this->admin()->post('/admin/aliados', [
            'texts' => ['allies' => ['title' => 'Panel de aliados']],
            'lists' => ['certification' => [
                ['id' => $a->id, 'title' => 'Una', 'visible' => true],
                ['id' => $b->id, 'title' => 'Otra', 'visible' => false],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/nosotros')->assertInertia(fn (Assert $p) => $p
            ->has('home.sections.allies.items', 1)
            ->where('home.sections.allies.items.0.name', 'Una'));
    }

    public function test_the_allies_carousel_has_defaults_and_is_configurable(): void
    {
        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.allies.carousel', [
                'rows' => 1,
                'perView' => 4,
                'autoplay' => true,
                'intervalMs' => 2000,
                'showDescriptions' => true,
            ]));

        $this->admin()->post('/admin/aliados', [
            'texts' => [
                'allies' => ['title' => 'Aliados', 'intro' => 'Con quienes trabajamos.'],
                'allies_carousel' => ['rows' => '2', 'per_view' => '3', 'autoplay' => '0', 'speed' => '6', 'descriptions' => '0'],
            ],
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.allies.title', 'Aliados')
            ->where('home.sections.allies.carousel', [
                'rows' => 2,
                'perView' => 3,
                'autoplay' => false,
                'intervalMs' => 6000,
                'showDescriptions' => false,
            ]));

        // El panel muestra lo guardado, con sus opciones para elegir.
        $this->admin()->get('/admin/aliados')->assertInertia(fn (Assert $p) => $p
            ->where('texts.allies_carousel.rows', '2')
            ->where('config.texts', fn ($texts) => count(collect($texts)->firstWhere('key', 'rows')['options']) === 2));
    }

    public function test_the_allies_carousel_only_accepts_its_options(): void
    {
        foreach (['rows' => '3', 'per_view' => '9', 'autoplay' => '5', 'speed' => '3', 'descriptions' => '7'] as $key => $value) {
            $this->admin()->post('/admin/aliados', [
                'texts' => ['allies' => ['title' => 'Aliados'], 'allies_carousel' => [$key => $value]],
            ])->assertSessionHasErrors("texts.allies_carousel.$key");
        }
    }

    public function test_the_allies_panel_is_separate_from_the_success_cases(): void
    {
        $cert = SectionItem::query()->create(['section' => 'certification', 'title' => 'Cisco CCNA', 'sort' => 0]);

        // Guardar «Casos de éxito» ya no toca las certificaciones.
        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Casos de éxito']],
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('section_items', ['id' => $cert->id]);

        $this->admin()->post('/admin/aliados', [
            'texts' => ['allies' => ['title' => 'Nuestros aliados', 'intro' => 'Con quienes trabajamos.']],
            'lists' => ['certification' => [['id' => $cert->id, 'title' => 'Cisco CCNA']]],
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.allies.title', 'Nuestros aliados')
            ->where('home.sections.allies.intro', 'Con quienes trabajamos.')
            ->where('home.sections.allies.items.0.name', 'Cisco CCNA')
            ->where('home.sections.experience.title', 'Casos de éxito')
            ->missing('home.sections.experience.certifications'));
    }

    public function test_the_seeder_describes_the_known_certifications_without_overwriting_edits(): void
    {
        Storage::fake('public');
        $this->seed(SiteContentSeeder::class);

        $ccna = SectionItem::query()->where('section', 'certification')->where('title', 'Cisco CCNA')->firstOrFail();
        $this->assertStringContainsString('Cisco Certified Network Associate', (string) $ccna->body);

        $ccna->update(['body' => 'Mi texto.']);
        $this->seed(SiteContentSeeder::class);

        $this->assertSame('Mi texto.', $ccna->fresh()->body);
        $this->assertSame(0, SectionItem::query()->where('section', 'certification')->whereNull('body')->count());
    }
}
