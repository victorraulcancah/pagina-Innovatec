<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateHomeSettingRequest;
use App\Models\HomeSetting;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomeSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/home-editor', [
            'home' => HomeSetting::current()->toPageData(),
            'pages' => SiteSections::navigation(),
        ]);
    }

    public function update(UpdateHomeSettingRequest $request): RedirectResponse
    {
        $home = HomeSetting::current();
        $data = $request->safe()->except([
            'logo', 'remove_logo', 'video', 'remove_video', 'poster', 'remove_poster',
        ]);

        foreach (['logo' => 'brand', 'video' => 'hero', 'poster' => 'hero'] as $field => $folder) {
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
        $data['menu'] = array_values(array_map(
            fn (array $item) => [...$item, 'children' => array_values($item['children'] ?? [])],
            $data['menu'] ?? [],
        ));
        $data['nav_cta'] = filled($data['nav_cta']['label'] ?? null) ? $data['nav_cta'] : null;

        $home->update($data);

        return back()->with('status', 'Cambios guardados.');
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
