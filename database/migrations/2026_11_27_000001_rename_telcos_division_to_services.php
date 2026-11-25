<?php

use App\Models\HomeSetting;
use App\Support\OfferingSlugs;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * La División Telcos pasa a llamarse División Services y su dirección es /division-services (la anterior redirige).
     * Los enlaces guardados se actualizan, y si el menú no tiene la opción se agrega después de División Enterprise.
     */
    public function up(): void
    {
        OfferingSlugs::replaceLinks('/division-telcos', '/division-services');

        HomeSetting::query()->get()->each(function (HomeSetting $home) {
            $menu = $home->menu ?? [];

            if (in_array('/division-services', array_column($menu, 'url'), true)) {
                $menu = array_map(fn (array $item) => $item['url'] === '/division-services' && $item['label'] === 'División Telcos'
                    ? [...$item, 'label' => 'División Services']
                    : $item, $menu);
            } else {
                $after = array_search('/division-enterprise', array_column($menu, 'url'), true);

                array_splice($menu, $after === false ? count($menu) : $after + 1, 0, [[
                    'label' => 'División Services',
                    'url' => '/division-services',
                    'visible' => true,
                    'show_children' => true,
                    'hidden_children' => [],
                    'children' => [],
                ]]);
            }

            $sections = $home->sections ?? [];
            if (($sections['telcos']['title'] ?? null) === 'División Telcos') {
                $sections['telcos']['title'] = 'División Services';
            }

            $home->menu = $menu;
            $home->sections = $sections;

            if ($home->isDirty()) {
                $home->save();
            }
        });
    }

    /** La dirección anterior sigue redirigiendo: no hace falta deshacerlo. */
    public function down(): void {}
};
