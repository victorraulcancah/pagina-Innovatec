<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\HomeSetting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('home', [
            'home' => HomeSetting::current()->toPageData(),
            'latestPosts' => BlogPost::query()->published()->with('category')->latest('published_at')->limit(3)->get()
                ->map(fn (BlogPost $p) => $p->toCard()),
        ]);
    }
}
