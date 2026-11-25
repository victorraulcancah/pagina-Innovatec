<?php

namespace App\Support;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Illuminate\Support\Str;

/**
 * La dirección de cada solución (/soluciones/...) y servicio (/servicios/...) sale de su título. Si el título cambia,
 * la dirección cambia con él; la anterior se guarda para redirigir a la nueva y los enlaces del sitio que la usaban
 * se actualizan.
 */
class OfferingSlugs
{
    /** Sección de section_items => prefijo de su dirección. */
    public const PREFIXES = ['solution' => 'soluciones', 'service' => 'servicios'];

    /** Si la dirección todavía corresponde al título (el título, o el título con -2, -3... si estaba repetido). */
    public static function matchesTitle(SectionItem $item): bool
    {
        $base = Str::slug($item->title) ?: 'item';

        return (bool) preg_match('/^'.preg_quote($base, '/').'(-\d+)?$/', (string) $item->slug);
    }

    /** Una dirección libre para el título dentro de su sección. */
    public static function unique(string $section, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'item';
        $slug = $base;
        $n = 2;

        while (SectionItem::query()->where('section', $section)->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$n++;
        }

        return $slug;
    }

    /**
     * Pone al elemento (ya guardado) la dirección de su título actual. Devuelve false si no hacía falta cambiarla.
     */
    public static function syncWithTitle(SectionItem $item): bool
    {
        if (! isset(self::PREFIXES[$item->section]) || ! $item->slug || self::matchesTitle($item)) {
            return false;
        }

        $old = $item->slug;
        $new = self::unique($item->section, $item->title, $item->id);

        $item->slug = $new;
        $item->previous_slugs = collect($item->previous_slugs ?? [])->push($old)
            ->reject(fn (string $s) => $s === $new)->unique()->values()->all();
        $item->save();

        $prefix = self::PREFIXES[$item->section];
        self::replaceLinks("/{$prefix}/{$old}", "/{$prefix}/{$new}");

        return true;
    }

    /** El elemento cuya dirección anterior era esta: para redirigir a la actual. */
    public static function findByPrevious(string $section, string $slug): ?SectionItem
    {
        return SectionItem::query()->where('section', $section)->whereNotNull('previous_slugs')->get()
            ->first(fn (SectionItem $i) => in_array($slug, $i->previous_slugs ?? [], true));
    }

    /** Cambia un enlace interno por otro donde el sitio lo guarda: menú, botones, textos y listas. */
    public static function replaceLinks(string $from, string $to): void
    {
        $swap = fn (mixed $value) => is_string($value) && self::samePage($value, $from)
            ? $to.substr($value, strlen($from))
            : $value;
        $walk = function (mixed $data) use (&$walk, $swap) {
            return is_array($data) ? array_map($walk, $data) : $swap($data);
        };

        HomeSetting::query()->get()->each(function (HomeSetting $home) use ($walk) {
            foreach (['menu', 'buttons', 'nav_cta', 'sections'] as $column) {
                if (is_array($home->{$column})) {
                    $home->{$column} = $walk($home->{$column});
                }
            }

            if ($home->isDirty()) {
                $home->save();
            }
        });

        SectionItem::query()->whereNotNull('url')->get()
            ->filter(fn (SectionItem $i) => self::samePage($i->url, $from))
            ->each(fn (SectionItem $i) => $i->update(['url' => $swap($i->url)]));
    }

    /** "/servicios/consultoria", "/servicios/consultoria#x" o "...?y" apuntan a la misma página; "...-2" no. */
    private static function samePage(string $value, string $page): bool
    {
        return $value === $page || str_starts_with($value, $page.'#') || str_starts_with($value, $page.'?');
    }
}
