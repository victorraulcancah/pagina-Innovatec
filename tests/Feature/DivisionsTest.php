<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_telcos_accepts_images_in_services_blocks_values_and_gallery(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/telcos', [
            'texts' => ['telcos' => ['title' => 'División Telcos']],
            'image_telcos' => UploadedFile::fake()->image('cabecera.jpg'),
            'lists' => [
                'telcos_service' => [['title' => 'Implementación', 'image' => UploadedFile::fake()->image('servicio.jpg')]],
                'telcos_block' => [[
                    'title' => 'Operación 24x7',
                    'body' => 'Texto del bloque.',
                    'rows' => [['title' => 'Punto uno']],
                    'image' => UploadedFile::fake()->image('bloque.jpg'),
                    'url' => '/contacto',
                    'label' => 'Hablemos',
                ]],
                'telcos_value' => [['title' => 'Confianza', 'image' => UploadedFile::fake()->image('valor.png')]],
                'telcos_gallery' => [['title' => 'Torre en campo', 'image' => UploadedFile::fake()->image('galeria.jpg')]],
            ],
        ])->assertSessionHasNoErrors();

        $this->get('/division-telcos')->assertInertia(function (Assert $p) {
            $p->component('telcos')
                ->whereNot('home.sections.telcos.imageUrl', null)
                ->whereNot('home.sections.telcos.services.0.imageUrl', null)
                ->where('home.sections.telcos.blocks.0.title', 'Operación 24x7')
                ->where('home.sections.telcos.blocks.0.points', ['Punto uno'])
                ->whereNot('home.sections.telcos.blocks.0.imageUrl', null)
                ->where('home.sections.telcos.blocks.0.url', '/contacto')
                ->where('home.sections.telcos.blocks.0.label', 'Hablemos')
                ->whereNot('home.sections.telcos.values.0.imageUrl', null)
                ->where('home.sections.telcos.gallery.0.caption', 'Torre en campo')
                ->whereNot('home.sections.telcos.gallery.0.imageUrl', null);
        });
    }

    public function test_button_texts_and_links_are_editable_and_links_are_validated(): void
    {
        $this->admin()->post('/admin/enterprise', [
            'texts' => [
                'enterprise' => [
                    'title' => 'División Enterprise',
                    'cta_label' => 'Solicita una propuesta',
                    'cta_url' => '/contacto',
                ],
                'services' => ['title' => 'Servicios'],
            ],
        ])->assertSessionHasNoErrors();

        $this->get('/division-enterprise')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.enterprise.cta_label', 'Solicita una propuesta')
            ->where('home.sections.enterprise.cta_url', '/contacto'));

        $this->admin()->post('/admin/enterprise', [
            'texts' => [
                'enterprise' => ['title' => 'División Enterprise', 'cta_url' => 'javascript:alert(1)'],
                'services' => ['title' => 'Servicios'],
            ],
        ])->assertSessionHasErrors('texts.enterprise.cta_url');

        $this->admin()->post('/admin/telcos', [
            'texts' => ['telcos' => ['title' => 'División Telcos', 'home_button_label' => 'Ver Telcos']],
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.telcos.home_button_label', 'Ver Telcos'));
    }
}
