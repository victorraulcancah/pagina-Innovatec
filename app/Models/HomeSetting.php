<?php

namespace App\Models;

use App\Support\SiteContent;
use App\Support\SiteSections;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Contenido editable de la página de inicio (una sola fila).
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
 * @property string|null $experience_bg_path
 */
#[Fillable([
    'brand_name', 'logo_path', 'video_path', 'poster_path',
    'title', 'subtitle', 'buttons', 'menu', 'nav_cta',
    'sections', 'experience_bg_path',
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
                ['label' => 'Nuestras soluciones', 'url' => '#soluciones', 'variant' => 'primary'],
                ['label' => 'Contáctanos', 'url' => '#contacto', 'variant' => 'outline'],
            ],
            'menu' => [
                ['label' => 'Inicio', 'url' => '/', 'children' => []],
                ['label' => 'Soluciones', 'url' => '#soluciones', 'children' => [
                    ['label' => 'Comunicaciones Unificadas', 'url' => '#soluciones'],
                    ['label' => 'Ciberseguridad', 'url' => '#soluciones'],
                    ['label' => 'Networking', 'url' => '#soluciones'],
                    ['label' => 'Infraestructura TI', 'url' => '#soluciones'],
                    ['label' => 'Seguridad Electrónica', 'url' => '#soluciones'],
                    ['label' => 'Servicios Profesionales', 'url' => '#servicios'],
                ]],
                ['label' => 'Nosotros', 'url' => '#nosotros', 'children' => []],
                ['label' => 'Experiencia', 'url' => '#experiencia', 'children' => []],
                ['label' => 'Clientes', 'url' => '#clientes', 'children' => []],
            ],
            'nav_cta' => ['label' => 'Contáctanos', 'url' => '#contacto'],
        ];
    }

    /**
     * Textos de los bloques bajo la portada: lo guardado sobre los valores por defecto.
     *
     * @return array<string, array<string, string>>
     */
    public function content(): array
    {
        return array_replace_recursive(SiteSections::defaults(), $this->sections ?? []);
    }

    /**
     * Datos listos para la página pública (URLs de archivos ya resueltas).
     *
     * @return array<string, mixed>
     */
    public function toPageData(): array
    {
        return [
            'brandName' => $this->brand_name,
            'logoUrl' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : self::DEFAULT_LOGO,
            'videoUrl' => $this->video_path ? Storage::disk('public')->url($this->video_path) : null,
            'posterUrl' => $this->poster_path ? Storage::disk('public')->url($this->poster_path) : null,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'buttons' => $this->buttons ?? [],
            'menu' => $this->menu ?? [],
            'navCta' => $this->nav_cta,
            'sections' => SiteContent::forPage($this),
        ];
    }
}
