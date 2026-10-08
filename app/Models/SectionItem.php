<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Elemento de una lista editable (tarjeta, solución, cliente...). El tipo de
 * lista lo da `section`; ver App\Support\SiteSections.
 *
 * @property int $id
 * @property string $section
 * @property string|null $slug
 * @property string $title
 * @property string|null $body
 * @property list<array{title: string, description: string|null}>|null $rows
 * @property string|null $url
 * @property string|null $image_path
 * @property list<array{path: string, name: string}>|null $gallery
 * @property int $sort
 */
#[Fillable(['section', 'slug', 'title', 'body', 'rows', 'url', 'image_path', 'gallery', 'sort'])]
class SectionItem extends Model
{
    protected function casts(): array
    {
        return ['rows' => 'array', 'gallery' => 'array'];
    }

    public function imageUrl(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }

    /**
     * @return list<array{path: string, name: string, url: string}>
     */
    public function galleryItems(): array
    {
        return collect($this->gallery ?? [])->map(fn (array $g) => [
            'path' => $g['path'],
            'name' => $g['name'],
            'url' => Storage::disk('public')->url($g['path']),
        ])->values()->all();
    }
}
