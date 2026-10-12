<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\HomeSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CompanyTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    public function test_company_page_edits_identity_contact_social_footer_and_images(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/empresa', [
            'texts' => [
                'company' => ['name' => 'PROINNOVATEC SAC', 'legal_name' => 'Pro Innovatec S.A.C.', 'tax_id' => '20123456789'],
                'contact' => [
                    'email' => 'ventas@ejemplo.com',
                    'phone' => '+511 748-3615',
                    'whatsapp' => '+51 970 855 741',
                    'address' => 'Av. Javier Prado Este 1166',
                    'hours' => 'Lunes a viernes, 9:00 a 18:00',
                    'website' => 'www.ejemplo.com',
                ],
                'social' => ['facebook' => 'https://facebook.com/proinnovatec', 'linkedin' => 'https://linkedin.com/company/proinnovatec'],
                'footer' => ['tagline' => 'Integradores TIC', 'copyright' => '© 2026 PROINNOVATEC. Todos los derechos.'],
            ],
            'image_logo' => UploadedFile::fake()->image('logo.png'),
            'image_favicon' => UploadedFile::fake()->image('favicon.png', 64, 64),
            'image_og' => UploadedFile::fake()->image('compartir.jpg', 1200, 630),
        ])->assertSessionHasNoErrors();

        $logo = HomeSetting::current()->page_images['logo'];
        Storage::disk('public')->assertExists($logo);

        $this->get('/')->assertInertia(fn (Assert $p) => $p
            ->where('home.brandName', 'PROINNOVATEC SAC')
            ->where('home.logoUrl', Storage::disk('public')->url($logo))
            ->where('home.sections.company.tax_id', '20123456789')
            ->where('home.sections.contact.whatsapp', '+51 970 855 741')
            ->where('home.sections.contact.hours', 'Lunes a viernes, 9:00 a 18:00')
            ->where('home.sections.social.facebook', 'https://facebook.com/proinnovatec')
            ->where('home.sections.footer.copyright', '© 2026 PROINNOVATEC. Todos los derechos.'));

        // El <head> usa el favicon y la imagen para compartir subidos.
        $html = $this->get('/')->getContent();
        $this->assertStringContainsString('rel="icon" href="'.Storage::disk('public')->url(HomeSetting::current()->page_images['favicon']).'"', $html);
        $this->assertStringContainsString('property="og:image"', $html);
        $this->assertStringContainsString('content="PROINNOVATEC SAC"', $html);
    }

    public function test_invalid_company_data_is_rejected(): void
    {
        $this->admin()->post('/admin/empresa', [
            'texts' => [
                'company' => ['name' => ''],
                'contact' => ['email' => 'no-es-correo'],
                'social' => ['facebook' => 'javascript:alert(1)'],
            ],
        ])->assertSessionHasErrors(['texts.company.name', 'texts.contact.email', 'texts.social.facebook']);
    }

    public function test_the_home_editor_no_longer_requires_a_brand_name(): void
    {
        $home = HomeSetting::current();

        $this->admin()->post('/admin/inicio', [
            'title' => 'Nuevo título',
            'subtitle' => $home->subtitle,
            'buttons' => $home->buttons,
            'menu' => $home->menu,
            'nav_cta' => $home->nav_cta,
        ])->assertSessionHasNoErrors();

        $this->assertSame('Nuevo título', HomeSetting::current()->title);
    }

    public function test_logo_removed_from_company_page_falls_back_to_the_default(): void
    {
        Storage::fake('public');

        $this->admin()->post('/admin/empresa', [
            'texts' => ['company' => ['name' => 'PROINNOVATEC']],
            'image_logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertSessionHasNoErrors();

        $this->admin()->post('/admin/empresa', [
            'texts' => ['company' => ['name' => 'PROINNOVATEC']],
            'remove_image_logo' => 1,
        ])->assertSessionHasNoErrors();

        $this->get('/')->assertInertia(fn (Assert $p) => $p->where('home.logoUrl', HomeSetting::DEFAULT_LOGO));
    }
}
