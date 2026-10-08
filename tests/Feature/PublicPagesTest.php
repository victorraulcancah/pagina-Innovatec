<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        $token = auth('api')->login(User::factory()->create());

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    public function test_every_public_page_renders(): void
    {
        foreach (['/', '/nosotros', '/experiencia', '/clientes', '/contacto', '/soluciones', '/servicios'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_each_solution_has_its_own_page_and_unknown_slugs_404(): void
    {
        SectionItem::query()->create(['section' => 'solution', 'slug' => 'redes', 'title' => 'Redes', 'sort' => 0]);

        $this->get('/soluciones/redes')->assertInertia(fn (Assert $p) => $p
            ->component('offering')->where('slug', 'redes')->where('kind', 'soluciones')
            ->where('home.sections.solutions.items.0.url', '/soluciones/redes'));

        $this->get('/soluciones/no-existe')->assertNotFound();
        $this->get('/servicios/redes')->assertNotFound();
        $this->get('/otra-cosa')->assertNotFound();
    }

    public function test_new_solution_gets_a_unique_slug_and_brand_logos(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $payload = fn (array $items) => [
            'texts' => ['solutions' => ['title' => 'Soluciones'], 'services' => ['title' => 'Servicios']],
            'lists' => ['solution' => $items],
        ];

        $admin->post('/admin/soluciones', $payload([
            ['title' => 'Redes', 'gallery_files' => [UploadedFile::fake()->image('cisco.png'), UploadedFile::fake()->image('ubiquiti.png')]],
            ['title' => 'Redes'],
        ]))->assertSessionHasNoErrors();

        $items = SectionItem::query()->where('section', 'solution')->orderBy('sort')->get();
        $this->assertSame(['redes', 'redes-2'], $items->pluck('slug')->all());
        $this->assertCount(2, $items[0]->gallery);
        Storage::disk('public')->assertExists($items[0]->gallery[0]['path']);

        // Quitar un logo y renombrar no cambia el slug.
        $keep = $items[0]->gallery[0]['path'];
        $removed = $items[0]->gallery[1]['path'];

        $this->admin()->post('/admin/soluciones', $payload([
            ['id' => $items[0]->id, 'title' => 'Redes y wifi', 'gallery_keep' => [$keep]],
            ['id' => $items[1]->id, 'title' => 'Redes'],
        ]))->assertSessionHasNoErrors();

        $fresh = $items[0]->fresh();
        $this->assertSame('redes', $fresh->slug);
        $this->assertCount(1, $fresh->gallery);
        Storage::disk('public')->assertMissing($removed);
    }

    public function test_page_header_images_are_uploaded_per_page(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Experiencia']],
            'image_experiencia' => UploadedFile::fake()->image('fondo.jpg'),
        ])->assertSessionHasNoErrors();

        $path = HomeSetting::current()->page_images['experiencia'];
        Storage::disk('public')->assertExists($path);

        $this->get('/experiencia')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.experience.bgUrl', Storage::disk('public')->url($path)));

        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Experiencia']],
            'remove_image_experiencia' => 1,
        ])->assertSessionHasNoErrors();

        $this->assertArrayNotHasKey('experiencia', HomeSetting::current()->page_images);
        Storage::disk('public')->assertMissing($path);
    }
}
