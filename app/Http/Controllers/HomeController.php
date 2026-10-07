<?php

namespace App\Http\Controllers;

use App\Models\HomeSetting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('home', [
            'home' => HomeSetting::current()->toPageData(),
        ]);
    }
}
