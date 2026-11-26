<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\SectionItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Si el sitio publica Términos y Condiciones o políticas, el formulario de Contacto pide aceptarlos. */
class ContactTermsTest extends TestCase
{
    use RefreshDatabase;

    private function valid(array $overrides = []): array
    {
        return [
            'name' => 'Ana Pérez',
            'email' => 'ana@empresa.pe',
            'interest' => 'Networking',
            'message' => 'Necesitamos cotizar una red Wi-Fi para tres sedes.',
            ...$overrides,
        ];
    }

    private function legalDoc(bool $visible = true): void
    {
        SectionItem::query()->create(['section' => 'legal_doc', 'title' => 'Términos y Condiciones', 'body' => 'Texto', 'visible' => $visible]);
    }

    public function test_the_terms_must_be_accepted_when_the_site_has_them(): void
    {
        $this->legalDoc();

        $this->post('/contacto', $this->valid())->assertSessionHasErrors('terms');
        $this->post('/contacto', $this->valid(['terms' => false]))->assertSessionHasErrors('terms');
        $this->assertSame(0, ContactMessage::query()->count());

        $this->post('/contacto', $this->valid(['terms' => true]))->assertSessionHasNoErrors();
        $this->assertSame(1, ContactMessage::query()->count());
    }

    public function test_without_published_terms_nothing_has_to_be_accepted(): void
    {
        SectionItem::query()->where('section', 'legal_doc')->update(['visible' => false]);
        $this->legalDoc(visible: false);

        $this->post('/contacto', $this->valid())->assertSessionHasNoErrors();
        $this->assertSame(1, ContactMessage::query()->count());
    }

    public function test_the_contact_page_gets_the_documents_to_open_them(): void
    {
        $this->legalDoc();

        $this->get('/contacto')->assertInertia(fn (Assert $p) => $p
            ->where('home.sections.legal.0.title', 'Términos y Condiciones'));
    }
}
