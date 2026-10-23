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

/** Certificaciones: nombre, descripción opcional y mostrar u ocultar, editables desde «Casos de éxito». */
class CertificationsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    public function test_each_certification_has_a_name_and_an_optional_description(): void
    {
        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Casos de éxito']],
            'lists' => ['certification' => [
                ['title' => 'Cisco CCNA', 'body' => 'Fundamentos de redes.'],
                ['title' => 'Huawei HCIA'],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/experiencia')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.experience.certifications.0.name', 'Cisco CCNA')
            ->where('home.sections.experience.certifications.0.description', 'Fundamentos de redes.')
            ->where('home.sections.experience.certifications.1.description', null));
    }

    public function test_the_description_has_a_length_limit(): void
    {
        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Casos de éxito']],
            'lists' => ['certification' => [['title' => 'X', 'body' => str_repeat('a', 161)]]],
        ])->assertSessionHasErrors('lists.certification.0.body');
    }

    public function test_a_hidden_certification_does_not_appear_on_the_site(): void
    {
        $a = SectionItem::query()->create(['section' => 'certification', 'title' => 'Una', 'sort' => 0]);
        $b = SectionItem::query()->create(['section' => 'certification', 'title' => 'Otra', 'sort' => 1]);

        $this->admin()->post('/admin/experiencia', [
            'texts' => ['experience' => ['title' => 'Casos de éxito']],
            'lists' => ['certification' => [
                ['id' => $a->id, 'title' => 'Una', 'visible' => true],
                ['id' => $b->id, 'title' => 'Otra', 'visible' => false],
            ]],
        ])->assertSessionHasNoErrors();

        $this->get('/nosotros')->assertInertia(fn (Assert $p) => $p
            ->has('home.sections.experience.certifications', 1)
            ->where('home.sections.experience.certifications.0.name', 'Una'));
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
