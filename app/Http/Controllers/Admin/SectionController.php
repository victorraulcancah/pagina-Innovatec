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
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Editor genérico de las páginas del panel definidas en SiteSections::pages().
 */
class SectionController extends Controller
{
    /** Listas cuyos elementos tienen página propia (necesitan slug). */
    private const WITH_SLUG = ['solution', 'service'];

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
                    'gallery' => $i->galleryItems(),
                ])->all();
        }

        $images = [];
        foreach ($config['images'] ?? [] as $img) {
            $images[$img['key']] = $home->pageImageUrl($img['slot']);
        }

        return Inertia::render('admin/section-editor', [
            'page' => $page,
            'config' => $config,
            'pages' => SiteSections::navigation(),
            'texts' => $texts,
            'lists' => $lists,
            'images' => $images,
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

            $pageImages = $home->page_images ?? [];
            foreach ($config['images'] ?? [] as $img) {
                $slot = $img['slot'];

                if ($request->hasFile($img['key'])) {
                    $this->deleteFile($pageImages[$slot] ?? null);
                    $pageImages[$slot] = $this->storeFile($request->file($img['key']), 'pages');
                } elseif ($request->boolean('remove_'.$img['key'])) {
                    $this->deleteFile($pageImages[$slot] ?? null);
                    unset($pageImages[$slot]);
                }
            }
            $attributes['page_images'] = $pageImages;

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
        $keys = collect($list['fields'])->pluck('key');
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

            if (in_array($section, self::WITH_SLUG, true) && ! $item->slug) {
                $item->slug = $this->uniqueSlug($section, $item->title, $item->id);
            }

            if ($keys->contains('image')) {
                $file = $request->file("lists.$section.$index.image");

                if ($file instanceof UploadedFile) {
                    $this->deleteFile($item->image_path);
                    $item->image_path = $this->storeFile($file, $section);
                } elseif ($request->boolean("lists.$section.$index.remove_image")) {
                    $this->deleteFile($item->image_path);
                    $item->image_path = null;
                }
            }

            if ($keys->contains('gallery')) {
                $item->gallery = $this->syncGallery($request, $item, "lists.$section.$index", $row);
            }

            $item->save();
            $keep[] = $item->id;
        }

        $existing->except($keep)->each(function (SectionItem $item) {
            $this->deleteFile($item->image_path);
            foreach ($item->gallery ?? [] as $g) {
                $this->deleteFile($g['path']);
            }
            $item->delete();
        });
    }

    /**
     * Conserva solo los logos que el elemento ya tenía y el administrador no
     * quitó, y suma los nuevos. Una ruta ajena nunca se acepta.
     *
     * @param  array<string, mixed>  $row
     * @return list<array{path: string, name: string}>|null
     */
    private function syncGallery(Request $request, SectionItem $item, string $prefix, array $row): ?array
    {
        $current = collect($item->gallery ?? []);
        $keepPaths = collect($row['gallery_keep'] ?? []);

        $kept = $current->filter(fn ($g) => $keepPaths->contains($g['path']))->values();
        $current->reject(fn ($g) => $keepPaths->contains($g['path']))
            ->each(fn ($g) => $this->deleteFile($g['path']));

        $added = collect($request->file("$prefix.gallery_files", []))
            ->filter(fn ($f) => $f instanceof UploadedFile)
            ->map(fn (UploadedFile $f) => [
                'path' => $this->storeFile($f, 'brands'),
                'name' => Str::of($f->getClientOriginalName())->beforeLast('.')->limit(60, '')->toString(),
            ]);

        return $kept->concat($added)->values()->all() ?: null;
    }

    private function uniqueSlug(string $section, string $title, ?int $ignoreId): string
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
