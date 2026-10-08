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
 * @property array<string, array<string, string>>|null $sections
 * @property array<string, string>|null $page_images
 */
#[Fillable([
    'brand_name', 'logo_path', 'video_path', 'poster_path',
    'title', 'subtitle', 'buttons', 'menu', 'nav_cta',
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
                ['label' => 'Nuestras soluciones', 'url' => '/soluciones', 'variant' => 'primary'],
                ['label' => 'Contáctanos', 'url' => '/contacto', 'variant' => 'outline'],
            ],
            'menu' => [
                ['label' => 'Inicio', 'url' => '/', 'children' => []],
                ['label' => 'Soluciones', 'url' => '/soluciones', 'children' => [
                    ['label' => 'Comunicaciones Unificadas', 'url' => '/soluciones/comunicaciones-unificadas'],
                    ['label' => 'Ciberseguridad', 'url' => '/soluciones/ciberseguridad'],
                    ['label' => 'Networking', 'url' => '/soluciones/networking'],
                    ['label' => 'Infraestructura TI', 'url' => '/soluciones/infraestructura-ti'],
                    ['label' => 'Seguridad Electrónica', 'url' => '/soluciones/seguridad-electronica'],
                ]],
                ['label' => 'Servicios', 'url' => '/servicios', 'children' => [
                    ['label' => 'Consultoría', 'url' => '/servicios/consultoria'],
                    ['label' => 'Help Desk', 'url' => '/servicios/help-desk'],
                    ['label' => 'Outsourcing TIC', 'url' => '/servicios/outsourcing-tic'],
                ]],
                ['label' => 'Nosotros', 'url' => '/nosotros', 'children' => []],
                ['label' => 'Experiencia', 'url' => '/experiencia', 'children' => []],
                ['label' => 'Clientes', 'url' => '/clientes', 'children' => []],
                ['label' => 'Blog', 'url' => '/blog', 'children' => []],
            ],
            'nav_cta' => ['label' => 'Contáctanos', 'url' => '/contacto'],
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

    public function pageImageUrl(string $slot): ?string
    {
        $path = $this->page_images[$slot] ?? null;

        return $path ? Storage::disk('public')->url($path) : null;
    }

    /**
     * Datos listos para las páginas públicas (URLs de archivos ya resueltas).
     *
     * @return array<string, mixed>
     */
    public function toPageData(): array
    {
        $sections = SiteContent::forPage($this);

        return [
            'brandName' => $this->brand_name,
            'logoUrl' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : self::DEFAULT_LOGO,
            'videoUrl' => $this->video_path ? Storage::disk('public')->url($this->video_path) : null,
            'posterUrl' => $this->poster_path ? Storage::disk('public')->url($this->poster_path) : null,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'buttons' => $this->buttons ?? [],
            'menu' => $this->menuWithOfferings($sections),
            'navCta' => $this->nav_cta,
            'sections' => $sections,
        ];
    }

    /**
     * Los desplegables de Soluciones y Servicios siempre listan las páginas
     * que existen, así el menú nunca queda desactualizado.
     *
     * @param  array<string, mixed>  $sections
     * @return list<array<string, mixed>>
     */
    private function menuWithOfferings(array $sections): array
    {
        $children = fn (string $block) => collect($sections[$block]['items'])
            ->map(fn (array $i) => ['label' => $i['title'], 'url' => $i['url']])->all();

        return collect($this->menu ?? [])->map(fn (array $item) => match ($item['url']) {
            '/soluciones' => [...$item, 'children' => $children('solutions')],
            '/servicios' => [...$item, 'children' => $children('services')],
            '/blog' => [...$item, 'children' => BlogCategory::query()->orderBy('sort')->orderBy('id')->get()
                ->map(fn (BlogCategory $c) => ['label' => $c->name, 'url' => "/blog/{$c->slug}"])->all()],
            default => $item,
        })->all();
    }
}
