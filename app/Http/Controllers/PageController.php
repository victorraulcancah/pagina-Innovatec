<?php

namespace App\Http\Controllers;

use App\Models\HomeSetting;
use Inertia\Inertia;
use Inertia\Response;

/** Páginas públicas de contenido: Nosotros, Experiencia, Clientes y Contacto. */
class PageController extends Controller
{
    public function about(): Response
    {
        return $this->render('about');
    }

    public function experience(): Response
    {
        return $this->render('experience');
    }

    public function clients(): Response
    {
        return $this->render('clients');
    }

    public function contact(): Response
    {
        return $this->render('contact');
    }

    private function render(string $component): Response
    {
        return Inertia::render($component, ['home' => HomeSetting::current()->toPageData()]);
    }
}
