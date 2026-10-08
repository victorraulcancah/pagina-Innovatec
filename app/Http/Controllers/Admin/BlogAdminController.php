<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Gestión del blog en el panel: categorías y publicaciones. */
class BlogAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/blog', [
            'pages' => SiteSections::navigation(),
            'categories' => BlogCategory::query()->withCount('posts')->orderBy('sort')->orderBy('id')->get()
                ->map(fn (BlogCategory $c) => ['id' => $c->id, 'name' => $c->name, 'posts' => $c->posts_count]),
            'posts' => BlogPost::query()->with('category')->latest('published_at')->latest('id')->get()
                ->map(fn (BlogPost $p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'category_id' => $p->blog_category_id,
                    'category' => $p->category->name,
                    'excerpt' => $p->excerpt ?? '',
                    'body' => $p->body,
                    'coverUrl' => $p->coverUrl(),
                    'published' => $p->published_at !== null,
                    'published_at' => $p->published_at?->format('Y-m-d\TH:i'),
                    'date' => $p->published_at?->format('d/m/Y'),
                    'scheduled' => $p->published_at?->isFuture() ?? false,
                ]),
        ]);
    }

    public function storePost(Request $request): RedirectResponse
    {
        $this->savePost($request, new BlogPost);

        return back()->with('status', 'Publicación guardada.');
    }

    public function updatePost(Request $request, BlogPost $post): RedirectResponse
    {
        $this->savePost($request, $post);

        return back()->with('status', 'Publicación guardada.');
    }

    public function destroyPost(BlogPost $post): RedirectResponse
    {
        $this->deleteFile($post->cover_path);
        $post->delete();

        return back()->with('status', 'Publicación eliminada.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:60']]);

        BlogCategory::query()->create([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug(BlogCategory::class, $data['name']),
            'sort' => (int) BlogCategory::query()->max('sort') + 1,
        ]);

        return back();
    }

    public function updateCategory(Request $request, BlogCategory $category): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:60']]);

        $category->update(['name' => $data['name']]);

        return back();
    }

    public function destroyCategory(BlogCategory $category): RedirectResponse
    {
        if ($category->posts()->exists()) {
            return back()->withErrors(['category' => 'La categoría tiene publicaciones. Muévelas a otra categoría antes de eliminarla.']);
        }

        $category->delete();

        return back();
    }

    private function savePost(Request $request, BlogPost $post): void
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'blog_category_id' => ['required', 'exists:blog_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['required', 'string', 'max:20000'],
            'status' => ['required', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_cover' => ['boolean'],
        ]);

        $publishedAt = $data['status'] === 'published'
            ? ($data['published_at'] ?? null ? Carbon::parse($data['published_at']) : ($post->published_at ?? now()))
            : null;

        $attributes = [
            'title' => $data['title'],
            'blog_category_id' => $data['blog_category_id'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => preg_replace('/\r\n?/', "\n", $data['body']),
            'published_at' => $publishedAt,
        ];

        if (! $post->exists) {
            $attributes['slug'] = $this->uniqueSlug(BlogPost::class, $data['title']);
        }

        if ($request->hasFile('cover')) {
            $this->deleteFile($post->cover_path);
            $attributes['cover_path'] = $this->storeFile($request->file('cover'));
        } elseif ($request->boolean('remove_cover')) {
            $this->deleteFile($post->cover_path);
            $attributes['cover_path'] = null;
        }

        $post->fill($attributes)->save();
    }

    /**
     * @param  class-string<BlogPost|BlogCategory>  $model
     */
    private function uniqueSlug(string $model, string $title): string
    {
        $base = Str::slug($title) ?: 'entrada';
        $slug = $base;
        $n = 2;

        while ($model::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }

    private function storeFile(UploadedFile $file): string
    {
        return $file->storeAs('blog', bin2hex(random_bytes(8)).'.'.$file->guessExtension(), 'public');
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
