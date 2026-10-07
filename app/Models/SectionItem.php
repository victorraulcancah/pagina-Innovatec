<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Elemento de una lista editable de la página (tarjeta, solución, cliente...).
 * El tipo de lista lo da `section`; ver App\Support\SiteSections.
 *
 * @property int $id
 * @property string $section
 * @property string $title
 * @property string|null $body
 * @property list<array{title: string, description: string|null}>|null $rows
 * @property string|null $url
 * @property string|null $image_path
 * @property int $sort
 */
#[Fillable(['section', 'title', 'body', 'rows', 'url', 'image_path', 'sort'])]
class SectionItem extends Model
{
    protected function casts(): array
    {
        return ['rows' => 'array'];
    }

    public function imageUrl(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
