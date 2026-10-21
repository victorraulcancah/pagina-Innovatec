<?php

namespace Tests\Feature;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeederPhotosTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_gives_every_solution_and_telcos_block_a_photo(): void
    {
        Storage::fake('public');

        $this->seed(SiteContentSeeder::class);

        $this->assertSame(0, SectionItem::query()->whereIn('section', ['solution', 'telcos_block', 'telcos_value'])->whereNull('image_path')->count());
        $this->assertNotEmpty(HomeSetting::current()->page_images['telcos'] ?? null);

        foreach (SectionItem::query()->whereIn('section', ['solution', 'telcos_value'])->get() as $item) {
            Storage::disk('public')->assertExists($item->image_path);
        }
    }

    public function test_seeder_never_replaces_a_photo_uploaded_from_the_panel(): void
    {
        Storage::fake('public');
        $this->seed(SiteContentSeeder::class);

        $item = SectionItem::query()->where('section', 'solution')->where('slug', 'networking')->firstOrFail();
        $item->update(['image_path' => 'seed/subida-por-el-admin.jpg']);

        $this->seed(SiteContentSeeder::class);

        $this->assertSame('seed/subida-por-el-admin.jpg', $item->fresh()->image_path);
    }

    public function test_menu_starts_with_inicio_and_the_seeder_does_not_bring_it_back_once_removed(): void
    {
        Storage::fake('public');

        $this->assertSame('Inicio', HomeSetting::current()->menu[0]['label']);

        // Instalación previa sin «Inicio»: el seeder lo agrega una sola vez.
        $home = HomeSetting::current();
        $home->update(['menu' => array_slice($home->menu, 1), 'sections' => []]);
        $this->seed(SiteContentSeeder::class);
        $this->assertSame('Inicio', HomeSetting::current()->menu[0]['label']);

        // El administrador lo quita: no vuelve a aparecer.
        $home = HomeSetting::current();
        $home->update(['menu' => array_slice($home->menu, 1)]);
        $this->seed(SiteContentSeeder::class);
        $this->assertNotContains('Inicio', array_column(HomeSetting::current()->menu, 'label'));
    }
}
