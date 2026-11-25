<?php

use App\Support\SiteLinks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Opciones cuyo submenú se arma solo con datos del sitio: sus subopciones guardadas no se usan. */
    private const AUTO_SUBMENUS = ['/division-enterprise', '/blog'];

    /**
     * Antes el menú aceptaba cualquier enlace escrito a mano y quedaron opciones que dan 404 (como /prueba). Ahora solo
     * se pueden elegir páginas que existen: esto quita del menú guardado las opciones y subopciones que no llevan a
     * ninguna página.
     */
    public function up(): void
    {
        $known = array_column(SiteLinks::options(), 'url');
        $exists = fn (mixed $url) => is_string($url) && str_starts_with($url, '/') && SiteLinks::exists($url, $known);

        DB::table('home_settings')->get()->each(function (object $home) use ($exists) {
            $menu = json_decode((string) $home->menu, true) ?: [];

            $clean = collect($menu)
                ->filter(fn (array $item) => $exists($item['url'] ?? null))
                ->map(function (array $item) use ($exists) {
                    if (! in_array($item['url'], self::AUTO_SUBMENUS, true)) {
                        $item['children'] = collect($item['children'] ?? [])
                            ->filter(fn (array $child) => $exists($child['url'] ?? null))
                            ->values()->all();
                    }

                    return $item;
                })
                ->values()->all();

            if ($clean !== $menu) {
                DB::table('home_settings')->where('id', $home->id)->update(['menu' => json_encode($clean)]);
            }
        });
    }

    /** Lo borrado eran enlaces rotos: no se restauran. */
    public function down(): void {}
};
