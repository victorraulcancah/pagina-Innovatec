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

class SectionAdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        $token = auth('api')->login(User::factory()->create());

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    public function test_every_section_page_requires_login_and_renders_for_admin(): void
    {
        foreach (['nosotros', 'soluciones', 'servicios', 'experiencia', 'clientes', 'contacto'] as $page) {
            $this->get("/admin/$page")->assertRedirect('/admin/login');
        }

        foreach (['nosotros', 'soluciones', 'servicios', 'experiencia', 'clientes', 'contacto'] as $page) {
            $this->admin()->get("/admin/$page")->assertInertia(fn (Assert $p) => $p
                ->component('admin/section-editor')->where('page', $page));
        }

        $this->admin()->get('/admin/otra-cosa')->assertNotFound();
    }

    public function test_texts_are_saved_and_shown_on_the_public_home(): void
    {
        $this->admin()->post('/admin/contacto', [
            'texts' => ['contact' => ['title' => 'Hablemos', 'email' => 'hola@ejemplo.com'], 'footer' => ['tagline' => 'Frase']],
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.contact.title', 'Hablemos')
            ->where('home.sections.contact.email', 'hola@ejemplo.com')
            ->where('home.sections.footer.tagline', 'Frase'));
    }

    public function test_list_items_are_created_reordered_and_deleted(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes', 'accent' => 'felices']],
            'lists' => ['client' => [
                ['title' => 'Uno', 'image' => UploadedFile::fake()->image('uno.png')],
                ['title' => 'Dos'],
            ]],
        ])->assertSessionHasNoErrors();

        $items = SectionItem::query()->where('section', 'client')->orderBy('sort')->get();
        $this->assertSame(['Uno', 'Dos'], $items->pluck('title')->all());
        Storage::disk('public')->assertExists($items[0]->image_path);
        $path = $items[0]->image_path;

        // Reordena: Dos primero; Uno se elimina.
        $this->admin()->post('/admin/clientes', [
            'texts' => ['clients' => ['title' => 'Clientes']],
            'lists' => ['client' => [['id' => $items[1]->id, 'title' => 'Dos renombrado']]],
        ])->assertSessionHasNoErrors();

        $this->assertSame(['Dos renombrado'], SectionItem::query()->where('section', 'client')->pluck('title')->all());
        Storage::disk('public')->assertMissing($path);
    }

    public function test_offering_rows_are_saved(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/soluciones', [
            'texts' => ['solutions' => ['title' => 'Soluciones'], 'services' => ['title' => 'Servicios']],
            'lists' => ['solution' => [[
                'title' => 'Redes',
                'body' => 'Resumen',
                'rows' => [['title' => 'WLAN', 'description' => 'Access points']],
            ]]],
        ])->assertSessionHasNoErrors();

        $this->assertSame('WLAN', SectionItem::query()->where('section', 'solution')->first()->rows[0]['title']);

        $this->assertTrue(true);
    }

    public function test_invalid_links_and_missing_titles_are_rejected(): void
    {
        $this->admin()->post('/admin/nosotros', [
            'texts' => ['about' => ['title' => '']],
            'lists' => ['about_card' => [['title' => 'X', 'url' => 'javascript:alert(1)']]],
        ])->assertSessionHasErrors(['texts.about.title', 'lists.about_card.0.url']);
    }
}
