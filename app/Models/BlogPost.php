<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $blog_category_id
 * @property string $title
 * @property string $slug
 * @property string|null $excerpt
 * @property string $body
 * @property string|null $cover_path
 * @property Carbon|null $published_at
 * @property-read BlogCategory $category
 */
#[Fillable(['blog_category_id', 'title', 'slug', 'excerpt', 'body', 'cover_path', 'published_at'])]
class BlogPost extends Model
{
    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    /** @return BelongsTo<BlogCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    /** Publicadas: con fecha ya cumplida. Las demás son borradores o están programadas. */
    public function scopePublished(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function coverUrl(): ?string
    {
        return $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'url' => "/blog/{$this->category->slug}/{$this->slug}",
            'coverUrl' => $this->coverUrl(),
            'category' => ['name' => $this->category->name, 'url' => "/blog/{$this->category->slug}"],
            'date' => $this->published_at?->locale('es')->translatedFormat('j \d\e F, Y'),
        ];
    }
}
