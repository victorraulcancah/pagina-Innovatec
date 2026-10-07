<?php

namespace App\Support;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/** Arma los datos de los bloques bajo la portada para la página pública. */
class SiteContent
{
    /**
     * @return array<string, mixed>
     */
    public static function forPage(HomeSetting $home): array
    {
        $text = $home->content();
        $items = SectionItem::query()->orderBy('sort')->orderBy('id')->get()->groupBy('section');

        $list = fn (string $section, callable $map): array => ($items[$section] ?? new Collection)
            ->map($map)->values()->all();

        $offering = fn (SectionItem $i): array => [
            'id' => $i->id,
            'title' => $i->title,
            'summary' => $i->body,
            'rows' => $i->rows ?? [],
        ];

        return [
            'about' => [
                ...$text['about'],
                'cards' => $list('about_card', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'label' => $i->title,
                    'url' => $i->url ?: '#',
                    'imageUrl' => $i->imageUrl(),
                ]),
            ],
            'solutions' => [...$text['solutions'], 'items' => $list('solution', $offering)],
            'services' => [...$text['services'], 'items' => $list('service', $offering)],
            'experience' => [
                ...$text['experience'],
                'bgUrl' => $home->experience_bg_path
                    ? Storage::disk('public')->url($home->experience_bg_path)
                    : null,
                'cases' => $list('case', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'client' => $i->title,
                    'summary' => $i->body,
                ]),
                'certifications' => $list('certification', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'name' => $i->title,
                    'imageUrl' => $i->imageUrl(),
                ]),
            ],
            'clients' => [
                ...$text['clients'],
                'items' => $list('client', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'name' => $i->title,
                    'logoUrl' => $i->imageUrl(),
                ]),
            ],
            'contact' => $text['contact'],
            'footer' => $text['footer'],
        ];
    }
}
