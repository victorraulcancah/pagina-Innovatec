<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Editor genérico de las páginas del panel definidas en SiteSections::pages().
 */
class SectionController extends Controller
{
    public function edit(string $page): Response
    {
        $config = $this->config($page);
        $home = HomeSetting::current();
        $content = $home->content();

        $texts = [];
        foreach ($config['texts'] as $t) {
            $texts[$t['group']][$t['key']] = $content[$t['group']][$t['key']] ?? '';
        }

        $lists = [];
        foreach ($config['lists'] as $list) {
            $lists[$list['section']] = SectionItem::query()
                ->where('section', $list['section'])
                ->orderBy('sort')->orderBy('id')->get()
                ->map(fn (SectionItem $i) => [
                    'id' => $i->id,
                    'title' => $i->title,
                    'body' => $i->body ?? '',
                    'url' => $i->url ?? '',
                    'rows' => $i->rows ?? [],
                    'imageUrl' => $i->imageUrl(),
                ])->all();
        }

        $imageUrl = null;
        if (isset($config['image']) && $home->{$config['image']['column']}) {
            $imageUrl = Storage::disk('public')->url($home->{$config['image']['column']});
        }

        return Inertia::render('admin/section-editor', [
            'page' => $page,
            'config' => $config,
            'pages' => SiteSections::navigation(),
            'texts' => $texts,
            'lists' => $lists,
            'imageUrl' => $imageUrl,
        ]);
    }

    public function update(Request $request, string $page): RedirectResponse
    {
        $config = $this->config($page);
        $data = $request->validate(SiteSections::rules($page));

        DB::transaction(function () use ($request, $config, $data) {
            $home = HomeSetting::current();

            $sections = $home->sections ?? [];
            foreach ($data['texts'] ?? [] as $group => $values) {
                $sections[$group] = array_merge($sections[$group] ?? [], array_map(fn ($v) => (string) $v, $values));
            }
            $attributes = ['sections' => $sections];

            if (isset($config['image'])) {
                $key = $config['image']['key'];
                $column = $config['image']['column'];

                if ($request->hasFile($key)) {
                    $this->deleteFile($home->{$column});
                    $attributes[$column] = $this->storeFile($request->file($key), 'sections');
                } elseif ($request->boolean('remove_'.$key)) {
                    $this->deleteFile($home->{$column});
                    $attributes[$column] = null;
                }
            }

            $home->update($attributes);

            foreach ($config['lists'] as $list) {
                $this->syncList($request, $list, $data['lists'][$list['section']] ?? []);
            }
        });

        return back()->with('status', 'Cambios guardados.');
    }

    /**
     * Deja la lista en BD igual a la enviada: crea, actualiza, reordena y borra.
     *
     * @param  array<string, mixed>  $list
     * @param  list<array<string, mixed>>  $incoming
     */
    private function syncList(Request $request, array $list, array $incoming): void
    {
        $section = $list['section'];
        $existing = SectionItem::query()->where('section', $section)->get()->keyBy('id');
        $keep = [];

        foreach (array_values($incoming) as $index => $row) {
            $item = isset($row['id']) ? $existing->get((int) $row['id']) : null;
            $item ??= new SectionItem(['section' => $section]);

            $item->sort = $index;
            $item->title = (string) ($row['title'] ?? $item->title);
            $item->body = $row['body'] ?? null;
            $item->url = $row['url'] ?? null;
            $item->rows = array_values($row['rows'] ?? []) ?: null;

            if (collect($list['fields'])->contains('key', 'image')) {
                $file = $request->file("lists.$section.$index.image");

                if ($file instanceof UploadedFile) {
                    $this->deleteFile($item->image_path);
                    $item->image_path = $this->storeFile($file, $section);
                } elseif ($request->boolean("lists.$section.$index.remove_image")) {
                    $this->deleteFile($item->image_path);
                    $item->image_path = null;
                }
            }

            $item->save();
            $keep[] = $item->id;
        }

        $existing->except($keep)->each(function (SectionItem $item) {
            $this->deleteFile($item->image_path);
            $item->delete();
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function config(string $page): array
    {
        return SiteSections::pages()[$page] ?? abort(404);
    }

    private function storeFile(UploadedFile $file, string $folder): string
    {
        return $file->storeAs($folder, bin2hex(random_bytes(8)).'.'.$file->guessExtension(), 'public');
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
