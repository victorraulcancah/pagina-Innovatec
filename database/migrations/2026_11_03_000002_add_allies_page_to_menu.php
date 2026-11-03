<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** El Panel de aliados pasa a tener página propia: su opción del menú va justo después de Casos de éxito. */
    public function up(): void
    {
        DB::table('home_settings')->get()->each(function (object $home) {
            $menu = json_decode((string) $home->menu, true) ?: [];

            if (in_array('/aliados', array_column($menu, 'url'), true)) {
                return;
            }

            $after = array_search('/experiencia', array_column($menu, 'url'), true);
            $position = $after === false ? count($menu) : $after + 1;

            array_splice($menu, $position, 0, [[
                'label' => 'Panel de Aliados',
                'url' => '/aliados',
                'visible' => true,
                'show_children' => true,
                'hidden_children' => [],
                'children' => [],
            ]]);

            DB::table('home_settings')->where('id', $home->id)->update(['menu' => json_encode($menu)]);
        });
    }

    public function down(): void
    {
        DB::table('home_settings')->get()->each(function (object $home) {
            $menu = array_filter(json_decode((string) $home->menu, true) ?: [], fn (array $item) => $item['url'] !== '/aliados');

            DB::table('home_settings')->where('id', $home->id)->update(['menu' => json_encode(array_values($menu))]);
        });
    }
};
