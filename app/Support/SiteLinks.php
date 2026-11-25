<?php

namespace App\Support;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\SectionItem;

/**
 * Las páginas públicas que existen. El menú solo puede enlazar a estas, y los botones no pueden apuntar a una
 * dirección interna que no esté aquí: así el panel nunca deja un enlace que dé 404.
 */
class SiteLinks
{
    /** Páginas fijas del sitio (cada una tiene su ruta en routes/web.php). */
    private const PAGES = [
        '/' => 'Inicio',
        '/nosotros' => 'Nosotros',
        '/division-enterprise' => 'División Enterprise',
        '/division-telcos' => 'División Telcos',
        '/experiencia' => 'Casos de éxito',
        '/aliados' => 'Panel de aliados',
        '/clientes' => 'Clientes',
        '/blog' => 'Blog',
        '/contacto' => 'Contacto',
    ];

    /** Direcciones antiguas que redirigen a una página que existe: valen, pero no se ofrecen en la lista. */
    private const REDIRECTS = ['/soluciones', '/servicios'];

    /**
     * Las páginas para elegir en el panel, agrupadas.
     *
     * @return list<array{group: string, label: string, url: string}>
     */
    public static function options(): array
    {
        $offerings = fn (string $section, string $prefix, string $group) => SectionItem::query()
            ->where('section', $section)->where('visible', true)->whereNotNull('slug')
            ->orderBy('sort')->orderBy('id')->get(['title', 'slug'])
            ->map(fn (SectionItem $i) => ['group' => $group, 'label' => $i->title, 'url' => "/{$prefix}/{$i->slug}"]);

        return collect(self::PAGES)
            ->map(fn (string $label, string $url) => ['group' => 'Páginas', 'label' => $label, 'url' => $url])
            ->values()
            ->concat($offerings('solution', 'soluciones', 'Soluciones'))
            ->concat($offerings('service', 'servicios', 'Servicios'))
            ->concat(BlogCategory::query()->orderBy('sort')->orderBy('id')->get(['name', 'slug'])
                ->map(fn (BlogCategory $c) => ['group' => 'Blog', 'label' => $c->name, 'url' => "/blog/{$c->slug}"]))
            ->values()
            ->all();
    }

    /**
     * Si una dirección interna (/algo, con o sin #sección o ?consulta) lleva a una página que existe.
     *
     * @param  list<string>|null  $known  Las direcciones de options(), si ya se tienen (al validar muchos enlaces).
     */
    public static function exists(string $url, ?array $known = null): bool
    {
        $path = '/'.trim((string) strtok($url, '?#'), '/');
        $known ??= array_column(self::options(), 'url');

        if (in_array($path, self::REDIRECTS, true) || in_array($path, $known, true)) {
            return true;
        }

        // Dirección anterior de una solución o servicio renombrado: redirige a la actual.
        if (preg_match('#^/(soluciones|servicios)/([^/]+)$#', $path, $m)) {
            $section = array_search($m[1], OfferingSlugs::PREFIXES, true);

            return OfferingSlugs::findByPrevious($section, $m[2])?->visible ?? false;
        }

        // Una entrada concreta del blog: /blog/{categoría}/{entrada}.
        if (preg_match('#^/blog/([^/]+)/([^/]+)$#', $path, $m)) {
            return BlogPost::query()->published()->where('slug', $m[2])
                ->whereHas('category', fn ($q) => $q->where('slug', $m[1]))->exists();
        }

        return false;
    }
}
