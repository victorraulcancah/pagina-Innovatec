<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** Los mensajes de Contacto también llegan a Zoho CRM como Leads; en la página solo está nuestro formulario. */
class ZohoCrmTest extends TestCase
{
    use RefreshDatabase;

    private function valid(array $overrides = []): array
    {
        return [
            'name' => 'Ana Pérez',
            'email' => 'ana@empresa.pe',
            'phone' => '999 888 777',
            'company' => 'Empresa SAC',
            'interest' => 'Ciberseguridad',
            'terms' => true,
            'message' => 'Necesitamos cotizar una red Wi-Fi para tres sedes.',
            ...$overrides,
        ];
    }

    private function enable(): void
    {
        config(['services.zoho_crm.xnqsjsdp' => 'token-a', 'services.zoho_crm.xmiwtld' => 'token-b']);
    }

    public function test_the_message_is_saved_and_sent_to_zoho_as_a_lead(): void
    {
        $this->enable();
        Http::fake(['crm.zoho.com/*' => Http::response('ok')]);

        $this->withoutDefer()->post('/contacto', $this->valid())->assertSessionHasNoErrors();

        $this->assertSame('Ciberseguridad', ContactMessage::query()->sole()->interest);
        Http::assertSent(fn (Request $r) => $r->url() === 'https://crm.zoho.com/crm/WebToLeadForm'
            && $r['xnQsjsdp'] === 'token-a'
            && $r['xmIwtLD'] === 'token-b'
            && $r['actionType'] === 'TGVhZHM='
            && $r['Last Name'] === 'Ana Pérez'
            && $r['Company'] === 'Empresa SAC'
            && $r['Phone'] === '999 888 777'
            && $r['Email'] === 'ana@empresa.pe'
            && $r['LEADCF1'] === 'Ciberseguridad'
            && $r['Description'] === 'Necesitamos cotizar una red Wi-Fi para tres sedes.'
            && $r['aG9uZXlwb3Q'] === '');
    }

    public function test_zoho_gets_a_company_even_if_the_person_left_it_empty(): void
    {
        $this->enable();
        Http::fake();

        $this->withoutDefer()->post('/contacto', $this->valid(['company' => '']))->assertSessionHasNoErrors();

        Http::assertSent(fn (Request $r) => $r['Company'] === 'No indicada');
    }

    public function test_nothing_is_sent_without_the_zoho_settings(): void
    {
        Http::fake();

        $this->withoutDefer()->post('/contacto', $this->valid())->assertSessionHasNoErrors();

        Http::assertNothingSent();
        $this->assertSame(1, ContactMessage::query()->count());
    }

    public function test_if_zoho_fails_the_message_is_still_saved(): void
    {
        $this->enable();
        Http::fake(['*' => Http::response('error', 500)]);

        $this->withoutDefer()->post('/contacto', $this->valid())->assertSessionHasNoErrors()->assertSessionHas('status', 'sent');

        $this->assertSame(1, ContactMessage::query()->count());
    }

    public function test_interest_must_be_one_of_the_zoho_options(): void
    {
        $this->post('/contacto', $this->valid(['interest' => '']))->assertSessionHasErrors('interest');
        $this->post('/contacto', $this->valid(['interest' => 'Otra cosa']))->assertSessionHasErrors('interest');
    }

    public function test_spam_is_not_sent_to_zoho(): void
    {
        $this->enable();
        Http::fake();

        $this->withoutDefer()->post('/contacto', $this->valid(['company_site' => 'http://spam.example']));

        Http::assertNothingSent();
    }
}
