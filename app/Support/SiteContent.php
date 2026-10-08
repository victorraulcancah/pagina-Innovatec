<?php

namespace App\Support;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Illuminate\Support\Collection;

/** Arma los datos de todas las páginas públicas a partir del contenido editable. */
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

        $offering = fn (string $prefix) => fn (SectionItem $i): array => [
            'id' => $i->id,
            'slug' => $i->slug,
            'url' => $i->slug ? "/$prefix/{$i->slug}" : "/$prefix",
            'title' => $i->title,
            'summary' => $i->body,
            'rows' => $i->rows ?? [],
            'imageUrl' => $i->imageUrl(),
            'gallery' => collect($i->galleryItems())->map(fn ($g) => ['name' => $g['name'], 'url' => $g['url']])->all(),
        ];

        return [
            'about' => [
                ...$text['about'],
                'imageUrl' => $home->pageImageUrl('nosotros'),
                'cards' => $list('about_card', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'label' => $i->title,
                    'url' => $i->url ?: '#',
                    'imageUrl' => $i->imageUrl(),
                ]),
            ],
            'solutions' => [
                ...$text['solutions'],
                'imageUrl' => $home->pageImageUrl('soluciones'),
                'items' => $list('solution', $offering('soluciones')),
            ],
            'services' => [
                ...$text['services'],
                'imageUrl' => $home->pageImageUrl('servicios'),
                'items' => $list('service', $offering('servicios')),
            ],
            'experience' => [
                ...$text['experience'],
                'bgUrl' => $home->pageImageUrl('experiencia'),
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
                'imageUrl' => $home->pageImageUrl('clientes'),
                'items' => $list('client', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'name' => $i->title,
                    'logoUrl' => $i->imageUrl(),
                ]),
            ],
            'contact' => [...$text['contact'], 'imageUrl' => $home->pageImageUrl('contacto')],
            'footer' => $text['footer'],
        ];
    }
}
