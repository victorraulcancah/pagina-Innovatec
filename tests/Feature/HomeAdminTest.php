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

class HomeAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminCookie(): array
    {
        $token = auth('api')->login(User::factory()->create());

        return [AuthenticateAdmin::COOKIE => $token];
    }

    /** @return array<string, mixed> */
    private function payload(array $overrides = []): array
    {
        $home = HomeSetting::current();

        return [
            'brand_name' => $home->brand_name,
            'title' => $home->title,
            'subtitle' => $home->subtitle,
            'buttons' => $home->buttons,
            'menu' => $home->menu,
            'nav_cta' => $home->nav_cta,
            ...$overrides,
        ];
    }

    public function test_home_renders_default_content(): void
    {
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('home.title', HomeSetting::defaults()['title'])
            ->where('home.videoUrl', null));
    }

    public function test_admin_requires_a_token(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->post('/admin/inicio', $this->payload())->assertRedirect('/admin/login');
    }

    public function test_login_sets_httponly_jwt_cookie(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $response = $this->post('/admin/login', ['email' => $user->email, 'password' => 'secret-pass-123']);

        $response->assertRedirect('/admin');
        $cookie = $response->getCookie(AuthenticateAdmin::COOKIE, false);
        $this->assertTrue($cookie->isHttpOnly());

        $this->post('/admin/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertSessionHasErrors('email');
    }

    public function test_admin_can_update_texts_menu_and_buttons(): void
    {
        $response = $this->withUnencryptedCookies($this->adminCookie())->post('/admin/inicio', $this->payload([
            'title' => 'Nuevo título',
            'buttons' => [['label' => 'Ir', 'url' => '/contacto', 'variant' => 'primary']],
            'menu' => [['label' => 'Inicio', 'url' => '/', 'children' => []]],
            'nav_cta' => ['label' => '', 'url' => ''],
        ]));

        $response->assertSessionHasNoErrors();
        $home = HomeSetting::current();
        $this->assertSame('Nuevo título', $home->title);
        $this->assertCount(1, $home->buttons);
        $this->assertNull($home->nav_cta);
    }

    public function test_javascript_urls_are_rejected(): void
    {
        $this->withUnencryptedCookies($this->adminCookie())->post('/admin/inicio', $this->payload([
            'buttons' => [['label' => 'X', 'url' => 'javascript:alert(1)', 'variant' => 'primary']],
        ]))->assertSessionHasErrors('buttons.0.url');
    }

    public function test_admin_can_upload_and_remove_video_and_poster(): void
    {
        Storage::fake('public');
        $cookies = $this->adminCookie();

        $this->withUnencryptedCookies($cookies)->post('/admin/inicio', $this->payload([
            'video' => UploadedFile::fake()->create('fondo.mp4', 500, 'video/mp4'),
            'poster' => UploadedFile::fake()->image('poster.jpg'),
        ]))->assertSessionHasNoErrors();

        $home = HomeSetting::current();
        Storage::disk('public')->assertExists($home->video_path);
        Storage::disk('public')->assertExists($home->poster_path);
        $oldVideo = $home->video_path;

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('home.videoUrl', Storage::disk('public')->url($oldVideo)));

        $this->withUnencryptedCookies($cookies)->post('/admin/inicio', $this->payload([
            'remove_video' => true,
        ]))->assertSessionHasNoErrors();

        $this->assertNull(HomeSetting::current()->video_path);
        Storage::disk('public')->assertMissing($oldVideo);
    }

    public function test_jwt_api_login_and_me(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-pass-123'])
            ->assertOk()->json('access_token');

        $this->withToken($token)->getJson('/api/auth/me')->assertOk()->assertJsonPath('email', $user->email);
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'x'])->assertUnauthorized();
    }
}
