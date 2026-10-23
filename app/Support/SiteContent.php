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
        // Lo oculto desde el panel no sale en el sitio (ni en el menú, el pie, la portada o su propia página).
        $items = SectionItem::query()->where('visible', true)->orderBy('sort')->orderBy('id')->get()->groupBy('section');

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
                'missionImageUrl' => $home->pageImageUrl('mission'),
                'visionImageUrl' => $home->pageImageUrl('vision'),
                'objectivesImageUrl' => $home->pageImageUrl('objectives'),
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
                    'imageUrl' => $i->imageUrl(),
                    'gallery' => collect($i->galleryItems())->map(fn ($g) => ['name' => $g['name'], 'url' => $g['url']])->all(),
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
                    'description' => $i->body,
                    'logoUrl' => $i->imageUrl(),
                ]),
            ],
            'enterprise' => [...$text['enterprise'], 'imageUrl' => $home->pageImageUrl('enterprise')],
            'telcos' => [
                ...$text['telcos'],
                'imageUrl' => $home->pageImageUrl('telcos'),
                'partnerImageUrl' => $home->pageImageUrl('telcos_partner'),
                'services' => $list('telcos_service', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'title' => $i->title,
                    'summary' => $i->body,
                    'points' => collect($i->rows ?? [])->pluck('title')->all(),
                    'imageUrl' => $i->imageUrl(),
                ]),
                'blocks' => $list('telcos_block', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'title' => $i->title,
                    'body' => $i->body,
                    'points' => collect($i->rows ?? [])->pluck('title')->all(),
                    'imageUrl' => $i->imageUrl(),
                    'url' => $i->url,
                    'label' => $i->label,
                ]),
                'gallery' => $list('telcos_gallery', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'caption' => $i->title,
                    'imageUrl' => $i->imageUrl(),
                ]),
                'values' => $list('telcos_value', fn (SectionItem $i) => [
                    'id' => $i->id,
                    'title' => $i->title,
                    'body' => $i->body,
                    'imageUrl' => $i->imageUrl(),
                ]),
            ],
            'contact' => [...$text['contact'], 'imageUrl' => $home->pageImageUrl('contacto')],
            'footer' => $text['footer'],
            'company' => $text['company'],
            'social' => $text['social'],
        ];
    }
}
