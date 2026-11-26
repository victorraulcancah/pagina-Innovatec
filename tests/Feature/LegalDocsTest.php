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

class LegalDocsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        $token = auth('api')->login(User::factory()->create());

        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);
    }

    /** @param list<array<string, mixed>> $docs */
    private function save(array $docs)
    {
        return $this->admin()->post('/admin/empresa', [
            'texts' => ['company' => ['name' => 'PROINNOVATEC']],
            'lists' => ['legal_doc' => $docs],
        ]);
    }

    public function test_vienen_creados_los_terminos_y_la_politica_de_privacidad(): void
    {
        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->has('home.sections.legal', 2)
            ->where('home.sections.legal.0.title', 'Términos y Condiciones')
            ->where('home.sections.legal.1.title', 'Política de Privacidad')
            ->where('home.sections.legal.0.body', '')
            ->where('home.sections.legal.0.fileUrl', null));
    }

    public function test_se_guarda_el_texto_y_el_pdf_y_se_pueden_quitar_u_ocultar(): void
    {
        Storage::fake('public');
        [$terms, $privacy] = SectionItem::query()->where('section', 'legal_doc')->orderBy('sort')->get()->all();

        $this->save([
            ['id' => $terms->id, 'title' => 'Términos y Condiciones', 'body' => "Primero.\n\nSegundo.", 'file' => UploadedFile::fake()->create('terminos.pdf', 120, 'application/pdf'), 'visible' => 1],
            ['id' => $privacy->id, 'title' => 'Política de Privacidad', 'body' => 'Tus datos', 'visible' => 0],
        ])->assertSessionHasNoErrors();

        $path = $terms->fresh()->file_path;
        Storage::disk('public')->assertExists($path);

        // La oculta no sale en el sitio.
        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->has('home.sections.legal', 1)
            ->where('home.sections.legal.0.body', "Primero.\n\nSegundo.")
            ->where('home.sections.legal.0.fileUrl', Storage::disk('public')->url($path)));

        // Guardar sin tocar el archivo lo conserva; «quitar» lo borra.
        $this->save([['id' => $terms->id, 'title' => 'Términos', 'body' => 'x', 'visible' => 1]])->assertSessionHasNoErrors();
        $this->assertSame($path, $terms->fresh()->file_path);

        $this->save([['id' => $terms->id, 'title' => 'Términos', 'body' => 'x', 'remove_file' => 1, 'visible' => 1]])->assertSessionHasNoErrors();
        $this->assertNull($terms->fresh()->file_path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_solo_se_aceptan_pdf_y_el_documento_necesita_nombre(): void
    {
        Storage::fake('public');

        $this->save([['title' => '', 'file' => UploadedFile::fake()->create('virus.exe', 10, 'application/octet-stream')]])
            ->assertSessionHasErrors(['lists.legal_doc.0.title', 'lists.legal_doc.0.file']);
    }
}
