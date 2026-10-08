<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\HomeSetting;
use Inertia\Inertia;
use Inertia\Response;

/** Blog público: listado, categorías (Eventos, Noticias...) y cada publicación. */
class BlogController extends Controller
{
    public function index(?string $category = null): Response
    {
        $current = $category ? BlogCategory::query()->where('slug', $category)->firstOrFail() : null;

        $posts = BlogPost::query()->published()->with('category')
            ->when($current, fn ($q) => $q->where('blog_category_id', $current->id))
            ->latest('published_at')->paginate(9)->withQueryString();

        return Inertia::render('blog', [
            'home' => HomeSetting::current()->toPageData(),
            'categories' => BlogCategory::query()->orderBy('sort')->orderBy('id')->get()
                ->map(fn (BlogCategory $c) => ['name' => $c->name, 'url' => "/blog/{$c->slug}", 'slug' => $c->slug]),
            'current' => $current?->only(['name', 'slug']),
            'posts' => $posts->through(fn (BlogPost $p) => $p->toCard()),
        ]);
    }

    public function show(string $category, string $slug): Response
    {
        $post = BlogPost::query()->published()->with('category')->where('slug', $slug)
            ->whereHas('category', fn ($q) => $q->where('slug', $category))->firstOrFail();

        $related = BlogPost::query()->published()->with('category')
            ->where('id', '!=', $post->id)->latest('published_at')->limit(3)->get()
            ->map(fn (BlogPost $p) => $p->toCard());

        return Inertia::render('blog-post', [
            'home' => HomeSetting::current()->toPageData(),
            'post' => [...$post->toCard(), 'body' => $post->body],
            'related' => $related,
        ]);
    }
}
