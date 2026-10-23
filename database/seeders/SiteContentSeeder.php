<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\HomeSetting;
use App\Models\SectionItem;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Carga el contenido inicial tomado del brochure de PROINNOVATEC. Solo llena
 * lo que está vacío, así que nunca pisa lo que edite el administrador.
 */
class SiteContentSeeder extends Seeder
{
    /** Marcas (logos del brochure) por solución. */
    private const BRANDS = [
        'comunicaciones-unificadas' => ['audiocodes', 'yealink', 'yeastar', 'fanvil', 'poly', 'microsoft-teams', 'asterisk', 'i3-technologies', 'huawei', 'avaya'],
        'ciberseguridad' => ['fortinet', 'huawei', 'eset', 'kaspersky', 'sophos', 'cisco'],
        'networking' => ['huawei', 'cisco', 'ubiquiti', 'aruba', 'fortinet', 'ruckus'],
        'infraestructura-ti' => ['vmware', 'citrix', 'veeam', 'acronis', 'lenovo', 'hpe', 'fusion', 'dell-emc', 'prtg', 'zabbix', 'solarwinds'],
        'seguridad-electronica' => ['zkteco', 'dahua', 'hikvision', 'axis'],
    ];

    /** Logos de cliente y tecnologías por proyecto (título => [logo del cliente, tecnologías]). */
    private const CASE_LOGOS = [
        'Minera Titán' => ['clients/minera-titan', ['cisco', 'yeastar', 'yealink', 'fortinet', 'sophos']],
        'Innova ITC · Telefónica' => ['clients/innova-itc', ['one-access', 'telefonica']],
        'SENATI' => ['clients/senati', ['yeastar', 'yealink', 'audiocodes']],
        'Colegio María de los Ángeles' => ['clients/colegio-maria-de-los-angeles', ['ubiquiti']],
    ];

    /** Tecnologías que el brochure menciona en el outsourcing. */
    private const SERVICE_BRANDS = [
        'outsourcing-tic' => ['sophos', 'fortinet', 'cisco', 'yeastar'],
    ];

    public function run(): void
    {
        $this->seedList('about_card', [
            ['title' => 'Soluciones', 'url' => '/soluciones', 'image' => 'photos/server-room.jpg'],
            ['title' => 'Servicios', 'url' => '/servicios', 'image' => 'photos/data-center.jpg'],
        ]);

        $this->seedList('solution', $this->ordenar($this->solutions()));
        $this->seedList('service', $this->services());
        $this->seedList('case', $this->cases());
        $this->seedList('certification', $this->certifications());
        $this->seedList('client', $this->clients());
        $this->seedList('telcos_service', $this->telcosServices());
        $this->seedList('telcos_value', $this->telcosValues());
        $this->seedList('telcos_block', $this->telcosBlocks());

        $this->backfillOfferings();
        $this->backfillServices();
        $this->backfillCases();
        $this->backfillTelcosServices();
        $this->backfillPhotos();
        $this->migrateLegacyImages();
        $this->migrateCompanyData();
        $this->seedPageImages();
        $this->upgradeLinks();
        $this->upgradeToDivisions();
        $this->addHomeToMenu();
        $this->reorderSolutions();
        $this->seedWhatsapp();
        $this->seedBlog();
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function seedList(string $section, array $items): void
    {
        if (SectionItem::query()->where('section', $section)->exists()) {
            return;
        }

        foreach ($items as $sort => $item) {
            SectionItem::query()->create([
                'section' => $section,
                'sort' => $sort,
                'slug' => in_array($section, ['solution', 'service'], true) ? Str::slug($item['title']) : null,
                'title' => $item['title'],
                'body' => $item['body'] ?? null,
                'rows' => $item['rows'] ?? null,
                'url' => $item['url'] ?? null,
                'label' => $item['label'] ?? null,
                'image_path' => isset($item['image']) ? $this->copyAsset($item['image']) : null,
            ]);
        }
    }

    /** Completa slug, descripción y marcas en soluciones y servicios ya existentes. */
    private function backfillOfferings(): void
    {
        $descriptions = collect($this->solutions())->pluck('body', 'title');

        SectionItem::query()->whereIn('section', ['solution', 'service'])->get()->each(function (SectionItem $item) use ($descriptions) {
            $item->slug ??= Str::slug($item->title);
            $item->body ??= $descriptions[$item->title] ?? null;

            if ($item->section === 'solution' && empty($item->gallery) && isset(self::BRANDS[$item->slug])) {
                $item->gallery = collect(self::BRANDS[$item->slug])->map(fn (string $brand) => [
                    'path' => $this->copyAsset("brands/$brand.png"),
                    'name' => Str::of($brand)->replace('-', ' ')->title()->toString(),
                ])->all();
            }

            $item->save();
        });

        SectionItem::query()->where('section', 'about_card')->get()->each(function (SectionItem $card) {
            $card->url = match ($card->url) {
                '#soluciones' => '/soluciones',
                '#servicios' => '/servicios',
                default => $card->url,
            };
            $card->save();
        });
    }

    /** Completa foto, detalle y marcas en los servicios que aún no los tienen. */
    private function backfillServices(): void
    {
        $defaults = collect($this->services())->keyBy('title');

        SectionItem::query()->where('section', 'service')->get()->each(function (SectionItem $item) use ($defaults) {
            $default = $defaults[$item->title] ?? null;

            if ($default && ! $item->image_path && isset($default['image'])) {
                $item->image_path = $this->copyAsset($default['image']);
            }

            if ($default && empty($item->rows)) {
                $item->rows = $default['rows'];
            }

            if (empty($item->gallery) && isset(self::SERVICE_BRANDS[$item->slug])) {
                $item->gallery = collect(self::SERVICE_BRANDS[$item->slug])->map(fn (string $brand) => [
                    'path' => $this->copyAsset("brands/$brand.png"),
                    'name' => Str::of($brand)->replace('-', ' ')->title()->toString(),
                ])->all();
            }

            $item->save();
        });
    }

    /**
     * Fotos libres (Unsplash) acordes al texto de cada elemento. Solo rellena
     * las que están vacías: una imagen subida desde el panel nunca se reemplaza.
     */
    private function backfillPhotos(): void
    {
        $bySlug = [
            'comunicaciones-unificadas' => 'photos/comunicaciones-unificadas.jpg',
            'ciberseguridad' => 'photos/ciberseguridad.jpg',
            'networking' => 'photos/networking.jpg',
            'infraestructura-ti' => 'photos/infraestructura-ti.jpg',
            'seguridad-electronica' => 'photos/seguridad-electronica.jpg',
        ];

        $byTitle = [
            'Experiencia con operadoras' => 'photos/telcos-router.jpg',
            'Expertise certificado' => 'photos/telcos-expertise.jpg',
            'Flexibilidad y eficiencia' => 'photos/telcos-flexibilidad.jpg',
            'Confianza y compromiso' => 'photos/telcos-confianza.jpg',
        ];

        SectionItem::query()->whereNull('image_path')
            ->whereIn('section', ['solution', 'telcos_block', 'telcos_value'])
            ->get()
            ->each(function (SectionItem $item) use ($bySlug, $byTitle) {
                $asset = $item->section === 'solution' ? ($bySlug[$item->slug] ?? null) : ($byTitle[$item->title] ?? null);

                if ($asset) {
                    $item->update(['image_path' => $this->copyAsset($asset)]);
                }
            });
    }

    /** Pone la imagen por defecto a los servicios de Telcos que aún no tienen una. */
    private function backfillTelcosServices(): void
    {
        $defaults = collect($this->telcosServices())->keyBy('title');

        SectionItem::query()->where('section', 'telcos_service')->whereNull('image_path')->get()->each(function (SectionItem $item) use ($defaults) {
            $image = $defaults[$item->title]['image'] ?? null;

            if ($image) {
                $item->update(['image_path' => $this->copyAsset($image)]);
            }
        });
    }

    /** Pone logo del cliente y tecnologías a los proyectos que aún no los tienen. */
    private function backfillCases(): void
    {
        SectionItem::query()->where('section', 'case')->get()->each(function (SectionItem $case) {
            [$client, $brands] = self::CASE_LOGOS[$case->title] ?? [null, []];

            if ($client && ! $case->image_path) {
                $case->image_path = $this->copyAsset("$client.png");
            }

            if ($brands && empty($case->gallery)) {
                $case->gallery = collect($brands)->map(fn (string $brand) => [
                    'path' => $this->copyAsset("brands/$brand.png"),
                    'name' => Str::of($brand)->replace('-', ' ')->title()->toString(),
                ])->all();
            }

            $case->save();
        });
    }

    /** Categorías iniciales del blog (sin publicaciones inventadas) y su opción en el menú. */
    private function seedBlog(): void
    {
        if (! BlogCategory::query()->exists()) {
            foreach (['Eventos', 'Noticias', 'Tendencias'] as $sort => $name) {
                BlogCategory::query()->create(['name' => $name, 'slug' => Str::slug($name), 'sort' => $sort]);
            }
        }

        $home = HomeSetting::current();

        if (! collect($home->menu)->contains('url', '/blog')) {
            $home->update(['menu' => [...$home->menu, ['label' => 'Blog', 'url' => '/blog', 'children' => []]]]);
        }
    }

    /** El nombre y el logo ahora se editan en "Datos de la empresa": se copian desde la portada. */
    private function migrateCompanyData(): void
    {
        $home = HomeSetting::current();
        $sections = $home->sections ?? [];
        $images = $home->page_images ?? [];
        $changes = [];

        if (empty($sections['company']['name']) && $home->brand_name) {
            $sections['company']['name'] = $home->brand_name;
            $changes['sections'] = $sections;
        }

        if ($home->logo_path && empty($images['logo'])) {
            $images['logo'] = $home->logo_path;
            $changes['page_images'] = $images;
            $changes['logo_path'] = null;
        }

        if ($changes) {
            $home->update($changes);
        }
    }

    /** Soluciones y Servicios se reunieron en la División Enterprise: su imagen de cabecera pasa a ese lugar. */
    private function migrateLegacyImages(): void
    {
        $home = HomeSetting::current();
        $images = $home->page_images ?? [];

        if (! isset($images['soluciones']) && ! isset($images['servicios'])) {
            return;
        }

        if (isset($images['soluciones']) && ! isset($images['enterprise'])) {
            $images['enterprise'] = $images['soluciones'];
        } elseif (isset($images['soluciones'])) {
            Storage::disk('public')->delete($images['soluciones']);
        }

        if (isset($images['servicios'])) {
            Storage::disk('public')->delete($images['servicios']);
        }

        unset($images['soluciones'], $images['servicios']);
        $home->update(['page_images' => $images]);
    }

    /** El orden en que se muestran las soluciones (por nombre). */
    private const ORDEN_SOLUCIONES = ['Networking', 'Infraestructura TI', 'Ciberseguridad', 'Seguridad Electrónica', 'Comunicaciones Unificadas'];

    /**
     * @param  list<array<string, mixed>>  $soluciones
     * @return list<array<string, mixed>>
     */
    private function ordenar(array $soluciones): array
    {
        usort($soluciones, fn (array $a, array $b) => array_search($a['title'], self::ORDEN_SOLUCIONES, true) <=> array_search($b['title'], self::ORDEN_SOLUCIONES, true));

        return $soluciones;
    }

    /**
     * Una sola vez: pone las soluciones en el orden pedido (Networking, Infraestructura TI, Ciberseguridad, Seguridad
     * Electrónica y Comunicaciones Unificadas), pero solo si siguen en el orden con que se cargaron: si el administrador
     * ya las reordenó a su gusto, no se toca.
     */
    private function reorderSolutions(): void
    {
        $home = HomeSetting::current();
        $sections = $home->sections ?? [];

        if ($sections['meta']['orden_soluciones'] ?? false) {
            return;
        }

        $sections['meta']['orden_soluciones'] = true;
        $home->update(['sections' => $sections]);

        $items = SectionItem::query()->where('section', 'solution')->orderBy('sort')->orderBy('id')->get();
        $origen = ['Comunicaciones Unificadas', 'Ciberseguridad', 'Networking', 'Infraestructura TI', 'Seguridad Electrónica'];

        if ($items->pluck('title')->all() !== $origen) {
            return;
        }

        foreach ($items as $item) {
            $item->update(['sort' => array_search($item->title, self::ORDEN_SOLUCIONES, true)]);
        }
    }

    /** Número de WhatsApp de la empresa, solo si aún no hay uno cargado. */
    private function seedWhatsapp(): void
    {
        $home = HomeSetting::current();
        $sections = $home->sections ?? [];

        if (blank($sections['contact']['whatsapp'] ?? null)) {
            $sections['contact']['whatsapp'] = '+51 970 855 741';
            $home->update(['sections' => $sections]);
        }
    }

    /**
     * Una sola vez: agrega «Inicio» al principio del menú de quien ya tenía uno.
     * Queda anotado para no volver a ponerlo si el administrador lo quita después.
     */
    private function addHomeToMenu(): void
    {
        $home = HomeSetting::current();
        $sections = $home->sections ?? [];

        if ($sections['meta']['menu_inicio'] ?? false) {
            return;
        }

        $sections['meta']['menu_inicio'] = true;
        $menu = $home->menu ?? [];

        if (! collect($menu)->contains('url', '/')) {
            array_unshift($menu, ['label' => 'Inicio', 'url' => '/', 'children' => []]);
        }

        $home->update(['menu' => $menu, 'sections' => $sections]);
    }

    /** Una sola vez: menú, botones y tarjetas de la portada pasan a las dos divisiones. */
    private function upgradeToDivisions(): void
    {
        $home = HomeSetting::current();

        if (collect($home->menu)->contains('url', '/division-enterprise')) {
            return;
        }

        $buttons = collect($home->buttons)->map(fn (array $b) => [
            ...$b,
            'url' => in_array($b['url'], ['/soluciones', '/servicios'], true) ? '/division-enterprise' : $b['url'],
        ])->all();

        $home->update([
            'menu' => HomeSetting::defaults()['menu'],
            'nav_cta' => null,
            'buttons' => $buttons,
        ]);

        SectionItem::query()->where('section', 'about_card')->get()->each(function (SectionItem $card) {
            [$title, $url] = match ($card->url) {
                '/soluciones' => ['División Enterprise', '/division-enterprise'],
                '/servicios' => ['División Telcos', '/division-telcos'],
                default => [$card->title, $card->url],
            };

            $card->update(['title' => $title, 'url' => $url]);
        });
    }

    private function seedPageImages(): void
    {
        $home = HomeSetting::current();
        $images = $home->page_images ?? [];

        foreach ([
            'nosotros' => 'photos/server-room.jpg',
            'enterprise' => 'photos/data-center.jpg',
            'telcos_partner' => 'photos/data-center.jpg',
            'experiencia' => 'photos/data-center.jpg',
            'clientes' => 'photos/server-room.jpg',
            'contacto' => 'photos/data-center.jpg',
            'telcos' => 'photos/telcos-torre.jpg',
            'mission' => 'photos/telcos-flexibilidad.jpg',
            'vision' => 'photos/data-center.jpg',
            'objectives' => 'photos/telcos-confianza.jpg',
        ] as $slot => $asset) {
            $images[$slot] ??= $this->copyAsset($asset);
        }

        $home->update(['page_images' => $images]);
    }

    /** Pasa los enlaces de ancla (#soluciones...) del menú y los botones a páginas propias. */
    private function upgradeLinks(): void
    {
        $home = HomeSetting::current();
        $solutionUrls = SectionItem::query()->where('section', 'solution')->pluck('slug', 'title');
        $top = ['Soluciones' => '/soluciones', 'Nosotros' => '/nosotros', 'Experiencia' => '/experiencia', 'Clientes' => '/clientes'];
        $anchors = ['#soluciones' => '/soluciones', '#servicios' => '/servicios', '#nosotros' => '/nosotros', '#experiencia' => '/experiencia', '#clientes' => '/clientes', '#contacto' => '/contacto'];

        $menu = collect($home->menu)->map(function (array $item) use ($top, $solutionUrls) {
            if (str_starts_with($item['url'], '#') && isset($top[$item['label']])) {
                $item['url'] = $top[$item['label']];
            }

            $item['children'] = collect($item['children'] ?? [])->map(function (array $child) use ($solutionUrls) {
                if (str_starts_with($child['url'], '#')) {
                    $child['url'] = $solutionUrls->has($child['label'])
                        ? '/soluciones/'.$solutionUrls[$child['label']]
                        : ($child['label'] === 'Servicios Profesionales' ? '/servicios' : $child['url']);
                }

                return $child;
            })->all();

            return $item;
        })->all();

        $buttons = collect($home->buttons)->map(fn (array $b) => [...$b, 'url' => $anchors[$b['url']] ?? $b['url']])->all();
        $cta = $home->nav_cta ? [...$home->nav_cta, 'url' => $anchors[$home->nav_cta['url']] ?? $home->nav_cta['url']] : null;

        $home->update(['menu' => $menu, 'buttons' => $buttons, 'nav_cta' => $cta]);
    }

    private function copyAsset(string $relative): string
    {
        return Storage::disk('public')->putFile('seed', new File(database_path('seeders/assets/'.$relative)));
    }

    /** @return list<array<string, mixed>> */
    private function solutions(): array
    {
        return [
            [
                'title' => 'Comunicaciones Unificadas',
                'body' => 'Voz, video y colaboración integrados para que tu organización se comunique sin fronteras: telefonía IP, videoconferencia y pantallas interactivas.',
                'rows' => [
                    ['title' => 'Soluciones VoIP', 'description' => 'Centrales telefónicas, SBC, teléfonos IP, GW VoIP, Direct Routing.'],
                    ['title' => 'Videoconferencia', 'description' => 'Equipos de videoconferencia compatibles con Zoom, Teams y Google Meet.'],
                    ['title' => 'Pantallas interactivas', 'description' => 'Pantallas touch screen para el sector educación y otros.'],
                ],
            ],
            [
                'title' => 'Ciberseguridad',
                'body' => 'Protección de la red, de los equipos y de los datos de tu empresa, con monitoreo para detectar y responder a incidentes.',
                'rows' => [
                    ['title' => 'Firewall', 'description' => 'Equipos Firewall UTM y Next-Generation Firewall (NGFW).'],
                    ['title' => 'End point', 'description' => 'Antivirus, antimalware, EDR, DLP y cifrado de datos.'],
                    ['title' => 'Monitoreo', 'description' => 'Manager security y Security Information and Event Management (SIEM).'],
                ],
            ],
            [
                'title' => 'Networking',
                'body' => 'Redes cableadas e inalámbricas diseñadas para conectar sedes, oficinas y campus con rendimiento y continuidad.',
                'rows' => [
                    ['title' => 'Switches y routers', 'description' => 'Switches de acceso, distribución, core, TOR, FO y SAN. Routers Edge, VPN y Core.'],
                    ['title' => 'WLAN', 'description' => 'Access points, wireless controllers, mesh access points y radioenlaces PTP y PTMP.'],
                    ['title' => 'Cableado estructurado', 'description' => 'Cobre, fibra óptica y GPON.'],
                ],
            ],
            [
                'title' => 'Infraestructura TI',
                'body' => 'Servidores, almacenamiento y software de gestión para que tus aplicaciones y tus datos estén siempre disponibles.',
                'rows' => [
                    ['title' => 'Servidores y blade', 'description' => 'Equipos y servicios para aplicaciones Microsoft, APP y virtualización convergente e hiperconvergente.'],
                    ['title' => 'Storage', 'description' => 'NAS, SAN, tape storage, hyperconverged storage, software de backup y restore, disaster recovery.'],
                    ['title' => 'Software', 'description' => 'Aplicativos de infraestructura: monitoring, gestión de activos, gestión de cloud computing y licenciamiento Windows.'],
                ],
            ],
            [
                'title' => 'Seguridad Electrónica',
                'body' => 'Videovigilancia y control de acceso para proteger tus instalaciones y gestionar quién entra y cuándo.',
                'rows' => [
                    ['title' => 'CCTV', 'description' => 'Cámaras domo, PTZ, bullet y térmicas, NVR, DVR, XDR híbrido, software VMS y video wall.'],
                    ['title' => 'Cableado CCTV', 'description' => 'Coaxial, ethernet, fibra óptica y GPON.'],
                    ['title' => 'Control de acceso', 'description' => 'Equipos RFID, controladores de acceso biométricos, software ACMS y sistema de control de asistencia.'],
                ],
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function services(): array
    {
        return [
            [
                'title' => 'Consultoría',
                'image' => 'photos/data-center.jpg',
                'body' => 'Consultoría estratégica en TIC: evaluamos infraestructuras, diseñamos arquitecturas y proponemos soluciones basadas en las mejores prácticas de la industria para optimizar la eficiencia y la seguridad de las operaciones empresariales.',
                'rows' => [
                    ['title' => 'Evaluación de infraestructuras', 'description' => 'Revisamos tu infraestructura TIC actual para identificar cómo mejorar su eficiencia y su seguridad.'],
                    ['title' => 'Diseño de arquitecturas', 'description' => 'Diseñamos la arquitectura TIC que necesitan tus operaciones empresariales.'],
                    ['title' => 'Soluciones basadas en mejores prácticas', 'description' => 'Proponemos soluciones alineadas con las mejores prácticas de la industria.'],
                ],
            ],
            [
                'title' => 'Help Desk',
                'image' => 'photos/server-room.jpg',
                'body' => 'Soporte técnico a usuarios finales: resolvemos incidencias, brindamos asistencia remota o in situ y capacitamos a los usuarios para mejorar la productividad.',
                'rows' => [
                    ['title' => 'Resolución de incidencias', 'description' => 'Atendemos y resolvemos las incidencias que reportan tus usuarios finales.'],
                    ['title' => 'Asistencia remota o in situ', 'description' => 'Damos soporte a distancia o en el lugar, según lo que requiera cada caso.'],
                    ['title' => 'Capacitación de usuarios', 'description' => 'Capacitamos a tus usuarios para que mejoren su productividad con la tecnología.'],
                ],
            ],
            [
                'title' => 'Outsourcing TIC',
                'image' => 'photos/racks.jpg',
                'body' => 'Gestionamos y operamos infraestructuras TIC como centros de cómputo, networking, ciberseguridad y comunicaciones unificadas, para que las empresas se enfoquen en sus actividades principales mientras optimizamos sus recursos tecnológicos.',
                'rows' => [
                    ['title' => 'Centros de cómputo', 'description' => 'Gestionamos y operamos la infraestructura de tus centros de cómputo.'],
                    ['title' => 'Networking', 'description' => 'Operamos tu red; por ejemplo, outsourcing de networking con Cisco.'],
                    ['title' => 'Ciberseguridad', 'description' => 'Operamos tu seguridad; por ejemplo, outsourcing de ciberseguridad con Sophos y Fortinet.'],
                    ['title' => 'Comunicaciones unificadas', 'description' => 'Operamos tus comunicaciones; por ejemplo, outsourcing de comunicaciones con Yeastar.'],
                ],
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function telcosServices(): array
    {
        $points = fn (array $titles) => array_map(fn (string $t) => ['title' => $t, 'description' => null], $titles);

        return [
            [
                'title' => 'Consultoría en análisis y diseño de soluciones TIC',
                'image' => 'photos/data-center.jpg',
                'rows' => $points([
                    'Diseño de arquitecturas para redes, voz, seguridad y más',
                    'Evaluación y dimensionamiento de infraestructuras TIC',
                    'Asesoramiento técnico en mejores prácticas y tecnologías emergentes',
                ]),
            ],
            [
                'title' => 'Implementación y optimización de soluciones',
                'image' => 'photos/racks.jpg',
                'rows' => $points([
                    'Despliegue e integración de soluciones y plataformas',
                    'Migración de sistemas y homologación de equipos',
                    'Optimización y actualización de infraestructuras',
                ]),
            ],
            [
                'title' => 'Soporte técnico especializado',
                'image' => 'photos/server-room.jpg',
                'rows' => $points([
                    'Soporte técnico avanzado con personal capacitado',
                    'Resolución de incidencias con asistencia remota o in situ',
                ]),
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function telcosBlocks(): array
    {
        return [[
            'title' => 'Experiencia con operadoras',
            'body' => 'Innova ITC · Telefónica: homologación de routers ONE ACCESS para Telefónica, con validación de MPLS, OSPF, BGP, VRRP, IPSEC, QoS, Netflow e IP SLA en maquetas y pruebas de alto tráfico.',
            'url' => '/experiencia',
            'label' => 'Ver casos de éxito',
        ]];
    }

    /** @return list<array<string, mixed>> */
    private function telcosValues(): array
    {
        return [
            ['title' => 'Expertise certificado', 'body' => 'Especialistas certificados en las principales tecnologías TIC.'],
            ['title' => 'Flexibilidad y eficiencia', 'body' => 'Nos adaptamos a tus necesidades y tiempos, asegurando resultados óptimos.'],
            ['title' => 'Confianza y compromiso', 'body' => 'Trabajamos en paralelo con tu equipo para fortalecer tus operaciones.'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function cases(): array
    {
        return [
            ['title' => 'Minera Titán', 'body' => 'Estandarización de redes Cisco, comunicaciones Yeastar y Yealink, y seguridad con Fortinet y Sophos en oficinas, plantas, minas y campamentos mineros. Hoy brindamos outsourcing en ciberseguridad, networking y comunicaciones.'],
            ['title' => 'Innova ITC · Telefónica', 'body' => 'Homologación de routers ONE ACCESS para Telefónica: validación de MPLS, OSPF, BGP, VRRP, IPSEC, QoS, Netflow e IP SLA en maquetas, y pruebas de alto tráfico.'],
            ['title' => 'SENATI', 'body' => 'Plataforma de comunicaciones unificadas en más de 120 sedes con Yeastar, Yealink y Audiocodes, migrada desde una central Nortel, y un IVR a medida que enruta la llamada según el código del alumno.'],
            ['title' => 'Colegio María de los Ángeles', 'body' => 'Red Wi-Fi Ubiquiti con más de 30 puntos de acceso, switch core y firewall, como parte de una estrategia de transformación digital para aulas híbridas.'],
        ];
    }

    /** @return list<array<string, mixed>> */
    private function certifications(): array
    {
        return collect([
            'ccna' => 'Cisco CCNA',
            'hcia' => 'Huawei HCIA',
            'vmware' => 'VMware Certified Professional',
            'fortinet-nse4' => 'Fortinet Network Security Expert 4',
            'veeam' => 'Veeam Certified Engineer',
            'microsoft' => 'Microsoft Certified Fundamentals',
            'audiocodes-aca' => 'AudioCodes Certified Associate',
            'sophos' => 'Sophos Certified Architect',
        ])->map(fn ($title, $file) => ['title' => $title, 'image' => "certs/$file.png"])->values()->all();
    }

    /** @return list<array<string, mixed>> */
    private function clients(): array
    {
        return collect([
            'minera-titan' => 'Minera Titán del Perú',
            'senati' => 'SENATI',
            'uni' => 'Universidad Nacional de Ingeniería',
            'innova-itc' => 'Innova ITC',
            'minera-croacia' => 'Minera Croacia',
            'minera-shouxin' => 'Minera Shouxin Perú',
            'incalpaca' => 'Incalpaca',
            'terpel' => 'Terpel',
            'acceso' => 'Acceso Crédito Vehicular',
            'boticas-y-salud' => 'Boticas y Salud',
            'superpet' => 'SuperPet',
            'sokso' => 'Sokso',
            'saturno' => 'Saturno',
            'menorca' => 'Menorca',
            'recolecc' => 'Recolecc',
            'cens' => 'CENS',
            'ipsecc' => 'IPSecc',
            'agp-eglass' => 'AGP eGlass',
            'colegio-maria-de-los-angeles' => 'Colegio María de los Ángeles',
            'enotria' => 'Enotria',
            'panorama-bpo' => 'Panorama BPO',
        ])->map(fn ($title, $file) => ['title' => $title, 'image' => "clients/$file.png"])->values()->all();
    }
}
