<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\SectionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** El nombre que se ve bajo cada logo de marca se edita desde el panel. */
class GalleryNamesTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    private function solucion(): SectionItem
    {
        return SectionItem::query()->create([
            'section' => 'solution', 'slug' => 'infra', 'title' => 'Infraestructura', 'sort' => 0,
            'gallery' => [['path' => 'brands/hpe.png', 'name' => 'Hpe'], ['path' => 'brands/dell.png', 'name' => 'Dell Emc']],
        ]);
    }

    private function envio(SectionItem $item, array $extra): array
    {
        return [
            'texts' => ['enterprise' => ['title' => 'División Enterprise'], 'services' => ['title' => 'Servicios']],
            'lists' => ['solution' => [['id' => $item->id, 'title' => $item->title, ...$extra]]],
        ];
    }

    public function test_the_name_under_a_saved_logo_can_be_changed(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/hpe.png', 'brands/dell.png'],
            'gallery_keep_names' => ['HPE', 'Dell EMC'],
        ]))->assertSessionHasNoErrors();

        $this->assertSame(['HPE', 'Dell EMC'], array_column($item->fresh()->gallery, 'name'));
        $this->assertSame(['brands/hpe.png', 'brands/dell.png'], array_column($item->fresh()->gallery, 'path'));
    }

    public function test_an_empty_name_keeps_the_previous_one(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/hpe.png', 'brands/dell.png'],
            'gallery_keep_names' => ['', 'Dell EMC'],
        ]))->assertSessionHasNoErrors();

        $this->assertSame(['Hpe', 'Dell EMC'], array_column($item->fresh()->gallery, 'name'));
    }

    public function test_new_logos_take_the_name_written_in_the_panel_or_their_file_name(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/hpe.png', 'brands/dell.png'],
            'gallery_keep_names' => ['Hpe', 'Dell Emc'],
            'gallery_files' => [UploadedFile::fake()->image('vmware.png'), UploadedFile::fake()->image('citrix-logo.png')],
            'gallery_new_names' => ['VMware', ''],
        ]))->assertSessionHasNoErrors();

        $this->assertSame(['Hpe', 'Dell Emc', 'VMware', 'citrix-logo'], array_column($item->fresh()->gallery, 'name'));
    }

    public function test_removing_a_logo_does_not_shift_the_names_of_the_others(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        // Se quita el primero: el nombre que se escribe para el segundo sigue siendo suyo.
        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/dell.png'],
            'gallery_keep_names' => ['Dell Technologies'],
        ]))->assertSessionHasNoErrors();

        $this->assertSame([['path' => 'brands/dell.png', 'name' => 'Dell Technologies']], $item->fresh()->gallery);
    }

    public function test_the_edited_name_reaches_the_public_page(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/hpe.png'],
            'gallery_keep_names' => ['HPE Aruba'],
        ]))->assertSessionHasNoErrors();

        $this->get('/division-enterprise')->assertInertia(fn ($page) => $page
            ->where('home.sections.solutions.items.0.gallery.0.name', 'HPE Aruba'));
    }

    public function test_a_name_longer_than_sixty_characters_is_rejected(): void
    {
        Storage::fake('public');
        $item = $this->solucion();

        $this->admin()->post('/admin/enterprise', $this->envio($item, [
            'gallery_keep' => ['brands/hpe.png'],
            'gallery_keep_names' => [str_repeat('A', 61)],
        ]))->assertSessionHasErrors('lists.solution.0.gallery_keep_names.0');
    }
}
