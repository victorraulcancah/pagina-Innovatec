<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateHomeSettingRequest;
use App\Models\HomeSetting;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomeSettingController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->hasPermission('pages.inicio')) {
            return redirect($request->user()->landingPath());
        }

        return Inertia::render('admin/home-editor', [
            'home' => HomeSetting::current()->toPageData(paraPanel: true),
            'pages' => SiteSections::navigation(),
        ]);
    }

    public function update(UpdateHomeSettingRequest $request): RedirectResponse
    {
        $home = HomeSetting::current();
        $data = $request->safe()->except([
            'video', 'remove_video', 'poster', 'remove_poster',
        ]);

        foreach (['video' => 'hero', 'poster' => 'hero'] as $field => $folder) {
            $column = $field.'_path';

            if ($request->hasFile($field)) {
                $this->deleteFile($home->{$column});
                $data[$column] = $this->storeFile($request->file($field), $folder);
            } elseif ($request->boolean('remove_'.$field)) {
                $this->deleteFile($home->{$column});
                $data[$column] = null;
            }
        }

        $data['buttons'] = array_values($data['buttons'] ?? []);
        $data['menu'] = array_values(array_map(function (array $item) {
            $subopciones = collect($item['children'] ?? []);

            return [
                'label' => $item['label'],
                'url' => $item['url'],
                'visible' => $this->flag($item['visible'] ?? true),
                'show_children' => $this->flag($item['show_children'] ?? true),
                // Las subopciones ocultas se guardan por enlace: vale igual para las que se generan solas.
                'hidden_children' => $subopciones->filter(fn (array $c) => ! $this->flag($c['visible'] ?? true))->pluck('url')->values()->all(),
                'children' => $subopciones->map(fn (array $c) => ['label' => $c['label'], 'url' => $c['url']])->values()->all(),
            ];
        }, $data['menu'] ?? []));
        $data['nav_cta'] = filled($data['nav_cta']['label'] ?? null) ? $data['nav_cta'] : null;

        $home->update($data);

        return back()->with('status', 'Cambios guardados.');
    }

    /** Un interruptor del panel: llega como true/false o como "1"/"0". */
    private function flag(mixed $valor): bool
    {
        return filter_var($valor, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;
    }

    private function storeFile(UploadedFile $file, string $folder): string
    {
        return $file->storeAs(
            $folder,
            bin2hex(random_bytes(8)).'.'.$file->guessExtension(),
            'public',
        );
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
