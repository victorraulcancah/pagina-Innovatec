<?php

namespace App\Models;

use App\Support\SiteContent;
use App\Support\SiteSections;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Contenido editable del sitio (una sola fila): portada, menú y textos.
 *
 * @property int $id
 * @property string $brand_name
 * @property string|null $logo_path
 * @property string|null $video_path
 * @property string|null $poster_path
 * @property string $title
 * @property string|null $subtitle
 * @property list<array{label: string, url: string, variant: string}> $buttons
 * @property list<array{label: string, url: string, children: list<array{label: string, url: string}>}> $menu
 * @property array{label: string, url: string}|null $nav_cta
 * @property bool $show_panel_link
 * @property array<string, array<string, string>>|null $sections
 * @property array<string, string>|null $page_images
 */
#[Fillable([
    'brand_name', 'logo_path', 'video_path', 'poster_path',
    'title', 'subtitle', 'buttons', 'menu', 'nav_cta', 'show_panel_link',
    'sections', 'page_images',
])]
class HomeSetting extends Model
{
    public const DEFAULT_LOGO = '/brand/logo-light.png';

    protected function casts(): array
    {
        return [
            'buttons' => 'array',
            'menu' => 'array',
            'nav_cta' => 'array',
            'show_panel_link' => 'boolean',
            'sections' => 'array',
            'page_images' => 'array',
        ];
    }

    /**
     * La fila única de configuración; se crea con los valores por defecto si falta.
     */
    public static function current(): self
    {
        return static::query()->first() ?? static::query()->create(static::defaults());
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'brand_name' => 'PROINNOVATEC',
            'title' => 'Transformando la tecnología en soluciones',
            'subtitle' => 'Integración de soluciones TIC con más de 10 años de experiencia y certificaciones de los principales fabricantes.',
            'buttons' => [
                ['label' => 'Nuestras soluciones', 'url' => '/division-enterprise', 'variant' => 'primary'],
                ['label' => 'Contáctanos', 'url' => '/contacto', 'variant' => 'outline'],
            ],
            'menu' => [
                ['label' => 'Inicio', 'url' => '/', 'children' => []],
                ['label' => 'Nosotros', 'url' => '/nosotros', 'children' => []],
                ['label' => 'División Enterprise', 'url' => '/division-enterprise', 'children' => [
                    ['label' => 'Comunicaciones Unificadas', 'url' => '/soluciones/comunicaciones-unificadas'],
                    ['label' => 'Ciberseguridad', 'url' => '/soluciones/ciberseguridad'],
                    ['label' => 'Networking', 'url' => '/soluciones/networking'],
                    ['label' => 'Infraestructura TI', 'url' => '/soluciones/infraestructura-ti'],
                    ['label' => 'Seguridad Electrónica', 'url' => '/soluciones/seguridad-electronica'],
                ]],
                ['label' => 'División Telcos', 'url' => '/division-telcos', 'children' => []],
                ['label' => 'Casos de Éxito', 'url' => '/experiencia', 'children' => []],
                ['label' => 'Blog', 'url' => '/blog', 'children' => []],
                ['label' => 'Contacto', 'url' => '/contacto', 'children' => []],
            ],
            'nav_cta' => null,
            'show_panel_link' => true,
        ];
    }

    /**
     * Textos de los bloques: lo guardado sobre los valores por defecto.
     *
     * @return array<string, array<string, string>>
     */
    public function content(): array
    {
        return array_replace_recursive(SiteSections::defaults(), $this->sections ?? []);
    }

    /** Nombre comercial: el de "Datos de la empresa" y, si falta, el guardado en la portada. */
    public function brandName(): string
    {
        return trim((string) ($this->content()['company']['name'] ?? '')) ?: $this->brand_name;
    }

    public function logoUrl(): string
    {
        return $this->pageImageUrl('logo')
            ?? ($this->logo_path ? Storage::disk('public')->url($this->logo_path) : self::DEFAULT_LOGO);
    }

    /**
     * Datos que necesita el <head> del documento (favicon e imagen para compartir).
     *
     * @return array{siteName: string, favicon: string|null, ogImage: string|null}
     */
    public function headBranding(): array
    {
        return [
            'siteName' => $this->brandName(),
            'favicon' => $this->pageImageUrl('favicon'),
            'ogImage' => $this->pageImageUrl('og'),
        ];
    }

    public function pageImageUrl(string $slot): ?string
    {
        $path = $this->page_images[$slot] ?? null;

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /**
     * Datos listos para las páginas públicas (URLs de archivos ya resueltas). Las opciones de menú ocultas no salen;
     * el panel pide `$paraPanel` para verlas y poder volver a mostrarlas.
     *
     * @return array<string, mixed>
     */
    public function toPageData(bool $paraPanel = false): array
    {
        $sections = SiteContent::forPage($this);

        return [
            'brandName' => $this->brandName(),
            'logoUrl' => $this->logoUrl(),
            'videoUrl' => $this->video_path ? Storage::disk('public')->url($this->video_path) : null,
            'posterUrl' => $this->poster_path ? Storage::disk('public')->url($this->poster_path) : null,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'buttons' => $this->buttons ?? [],
            'menu' => $this->menuWithOfferings($sections, $paraPanel),
            'navCta' => $this->nav_cta,
            'showPanelLink' => (bool) $this->show_panel_link,
            'sections' => $sections,
        ];
    }

    /**
     * Los desplegables de Soluciones y Servicios siempre listan las páginas
     * que existen, así el menú nunca queda desactualizado.
     *
     * Cada opción puede ocultarse sola (`visible`), ocultar todo su submenú (`show_children`) o ocultar solo algunas
     * de sus subopciones (`hidden_children`, por enlace: sirve igual para las que se generan solas). El panel recibe
     * todo con su estado para poder volver a mostrarlo; las páginas públicas, solo lo visible.
     *
     * @param  array<string, mixed>  $sections
     * @return list<array<string, mixed>>
     */
    private function menuWithOfferings(array $sections, bool $incluirOcultas = false): array
    {
        $children = fn (string $block) => collect($sections[$block]['items'])
            ->map(fn (array $i) => ['label' => $i['title'], 'url' => $i['url']])->all();

        return collect($this->menu ?? [])
            // Una opción sin las marcas se muestra (el menú de antes no las tenía).
            ->filter(fn (array $item) => $incluirOcultas || ($item['visible'] ?? true))
            ->map(function (array $item) use ($children, $incluirOcultas) {
                $subopciones = match ($item['url']) {
                    '/division-enterprise' => $children('solutions'),
                    '/blog' => BlogCategory::query()->orderBy('sort')->orderBy('id')->get()
                        ->map(fn (BlogCategory $c) => ['label' => $c->name, 'url' => "/blog/{$c->slug}"])->all(),
                    default => $item['children'] ?? [],
                };

                $ocultas = $item['hidden_children'] ?? [];
                $subopciones = collect($subopciones)
                    ->map(fn (array $c) => [...$c, 'visible' => ! in_array($c['url'], $ocultas, true)]);
                $mostrarSubmenu = (bool) ($item['show_children'] ?? true);

                if (! $incluirOcultas) {
                    $subopciones = $mostrarSubmenu ? $subopciones->filter(fn (array $c) => $c['visible']) : collect();
                }

                return [
                    ...collect($item)->except('hidden_children')->all(),
                    'visible' => (bool) ($item['visible'] ?? true),
                    'show_children' => $mostrarSubmenu,
                    'children' => $subopciones->values()->all(),
                ];
            })
            ->values()
            ->all();
    }
}
