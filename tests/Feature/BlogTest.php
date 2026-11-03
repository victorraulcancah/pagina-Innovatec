<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BlogTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): static
    {
        return $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => auth('api')->login(User::factory()->create())]);
    }

    private function category(string $name = 'Noticias'): BlogCategory
    {
        return BlogCategory::query()->create(['name' => $name, 'slug' => str($name)->slug(), 'sort' => 0]);
    }

    private function makePost(BlogCategory $category, array $overrides = []): BlogPost
    {
        return BlogPost::query()->create([
            'blog_category_id' => $category->id,
            'title' => 'Nueva era de redes',
            'slug' => 'nueva-era-de-redes',
            'body' => "Primer párrafo.\n\nSegundo párrafo.",
            'published_at' => now()->subDay(),
            ...$overrides,
        ]);
    }

    public function test_only_published_posts_are_public_and_menu_lists_categories(): void
    {
        $news = $this->category();
        $this->makePost($news);
        $this->makePost($news, ['title' => 'Borrador', 'slug' => 'borrador', 'published_at' => null]);
        $this->makePost($news, ['title' => 'Futura', 'slug' => 'futura', 'published_at' => now()->addWeek()]);

        $this->get('/blog')->assertInertia(fn (Assert $p) => $p
            ->component('blog')
            ->has('posts.data', 1)
            ->where('posts.data.0.url', '/blog/noticias/nueva-era-de-redes')
            ->where('home.menu.6.label', 'Blog')
            ->where('home.menu.6.children.0.url', '/blog/noticias'));

        $this->get('/blog/noticias')->assertOk();
        $this->get('/blog/noticias/nueva-era-de-redes')->assertInertia(fn (Assert $p) => $p->component('blog-post'));
        $this->get('/blog/noticias/borrador')->assertNotFound();
        $this->get('/blog/noticias/futura')->assertNotFound();
        $this->get('/blog/otra/nueva-era-de-redes')->assertNotFound();
        $this->get('/blog/inexistente')->assertNotFound();
    }

    public function test_home_shows_the_latest_published_posts(): void
    {
        $this->makePost($this->category());

        $this->get('/')->assertInertia(fn (Assert $p) => $p->has('latestPosts', 1));
    }

    public function test_admin_creates_edits_and_deletes_posts_with_cover(): void
    {
        Storage::fake('public');
        $news = $this->category();

        $this->admin()->post('/admin/blog/posts', [
            'title' => 'Evento TIC 2026', 'blog_category_id' => $news->id, 'body' => 'Texto del evento.',
            'status' => 'published', 'cover' => UploadedFile::fake()->image('portada.jpg'),
        ])->assertSessionHasNoErrors();

        $post = BlogPost::query()->firstOrFail();
        $this->assertSame('evento-tic-2026', $post->slug);
        $this->assertNotNull($post->published_at);
        Storage::disk('public')->assertExists($post->cover_path);
        $cover = $post->cover_path;

        // Editar: pasa a borrador, cambia el título y quita la portada; el slug no cambia.
        $this->admin()->post("/admin/blog/posts/{$post->id}", [
            'title' => 'Evento TIC 2026 (actualizado)', 'blog_category_id' => $news->id, 'body' => 'Texto nuevo.',
            'status' => 'draft', 'remove_cover' => 1,
        ])->assertSessionHasNoErrors();

        $fresh = $post->fresh();
        $this->assertSame('evento-tic-2026', $fresh->slug);
        $this->assertNull($fresh->published_at);
        $this->assertNull($fresh->cover_path);
        Storage::disk('public')->assertMissing($cover);

        $this->admin()->delete("/admin/blog/posts/{$post->id}")->assertRedirect();
        $this->assertDatabaseCount('blog_posts', 0);
    }

    public function test_admin_blog_requires_login_and_validates(): void
    {
        $this->get('/admin/blog')->assertRedirect('/admin/login');
        $this->post('/admin/blog/posts', [])->assertRedirect('/admin/login');

        $this->admin()->post('/admin/blog/posts', ['title' => '', 'status' => 'raro'])
            ->assertSessionHasErrors(['title', 'blog_category_id', 'body', 'status']);
    }

    public function test_categories_are_managed_and_protected_when_in_use(): void
    {
        $this->admin()->post('/admin/blog/categories', ['name' => 'Eventos'])->assertSessionHasNoErrors();
        $category = BlogCategory::query()->firstOrFail();
        $this->assertSame('eventos', $category->slug);

        $this->admin()->post("/admin/blog/categories/{$category->id}", ['name' => 'Eventos TIC'])->assertSessionHasNoErrors();
        $this->assertSame('Eventos TIC', $category->fresh()->name);
        $this->assertSame('eventos', $category->fresh()->slug);

        $this->makePost($category);
        $this->admin()->delete("/admin/blog/categories/{$category->id}")->assertSessionHasErrors('category');
        $this->assertDatabaseCount('blog_categories', 1);

        BlogPost::query()->delete();
        $this->admin()->delete("/admin/blog/categories/{$category->id}")->assertSessionHasNoErrors();
        $this->assertDatabaseCount('blog_categories', 0);
    }
}
