<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DivisionsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    public function test_default_menu_has_the_two_divisions_and_the_enterprise_dropdown_lists_solutions(): void
    {
        SectionItem::query()->create(['section' => 'solution', 'slug' => 'redes', 'title' => 'Redes', 'sort' => 0]);

        $this->get('/division-enterprise')->assertInertia(fn (Assert $p) => $p
            ->component('enterprise')
            ->where('home.menu.0.label', 'Nosotros')
            ->where('home.menu.1.label', 'División Enterprise')
            ->where('home.menu.1.children.0.url', '/soluciones/redes')
            ->where('home.menu.2.label', 'División Telcos')
            ->where('home.menu.3.url', '/experiencia'));
    }

    public function test_admin_manages_the_telcos_page_content(): void
    {
        $this->admin()->post('/admin/telcos', [
            'texts' => ['telcos' => ['title' => 'División Telcos', 'subtitle' => 'Aliado técnico', 'cta_title' => '¿Hablamos?']],
            'lists' => [
                'telcos_service' => [[
                    'title' => 'Consultoría',
                    'rows' => [['title' => 'Diseño de arquitecturas'], ['title' => 'Evaluación de infraestructuras']],
                ]],
                'telcos_value' => [['title' => 'Confianza', 'body' => 'Trabajamos contigo.']],
            ],
        ])->assertSessionHasNoErrors();

        $this->get('/division-telcos')->assertInertia(fn (Assert $p) => $p
            ->component('telcos')
            ->where('home.sections.telcos.subtitle', 'Aliado técnico')
            ->where('home.sections.telcos.services.0.title', 'Consultoría')
            ->where('home.sections.telcos.services.0.points', ['Diseño de arquitecturas', 'Evaluación de infraestructuras'])
            ->where('home.sections.telcos.values.0.title', 'Confianza'));
    }

    public function test_enterprise_admin_page_edits_solutions(): void
    {
        $this->admin()->get('/admin/enterprise')->assertInertia(fn (Assert $p) => $p
            ->component('admin/section-editor')->where('page', 'enterprise'));

        $this->admin()->get('/admin/soluciones')->assertNotFound();
    }
}
