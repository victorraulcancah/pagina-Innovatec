<?php

namespace Database\Seeders;

use App\Models\HomeSetting;
use App\Models\SectionItem;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

/**
 * Carga el contenido inicial tomado del brochure de PROINNOVATEC. Solo llena
 * las listas que están vacías, así que nunca pisa lo que edite el administrador.
 */
class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedList('about_card', [
            ['title' => 'Soluciones', 'url' => '#soluciones', 'image' => 'photos/server-room.jpg'],
            ['title' => 'Servicios', 'url' => '#servicios', 'image' => 'photos/data-center.jpg'],
        ]);

        $this->seedList('solution', $this->solutions());
        $this->seedList('service', $this->services());
        $this->seedList('case', $this->cases());
        $this->seedList('certification', $this->certifications());
        $this->seedList('client', $this->clients());

        $home = HomeSetting::current();

        if (! $home->experience_bg_path) {
            $home->update(['experience_bg_path' => $this->copyAsset('photos/data-center.jpg')]);
        }
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
                'title' => $item['title'],
                'body' => $item['body'] ?? null,
                'rows' => $item['rows'] ?? null,
                'url' => $item['url'] ?? null,
                'image_path' => isset($item['image']) ? $this->copyAsset($item['image']) : null,
            ]);
        }
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
                'rows' => [
                    ['title' => 'Soluciones VoIP', 'description' => 'Centrales telefónicas, SBC, teléfonos IP, GW VoIP, Direct Routing.'],
                    ['title' => 'Videoconferencia', 'description' => 'Equipos de videoconferencia compatibles con Zoom, Teams y Google Meet.'],
                    ['title' => 'Pantallas interactivas', 'description' => 'Pantallas touch screen para el sector educación y otros.'],
                ],
            ],
            [
                'title' => 'Ciberseguridad',
                'rows' => [
                    ['title' => 'Firewall', 'description' => 'Equipos Firewall UTM y Next-Generation Firewall (NGFW).'],
                    ['title' => 'End point', 'description' => 'Antivirus, antimalware, EDR, DLP y cifrado de datos.'],
                    ['title' => 'Monitoreo', 'description' => 'Manager security y Security Information and Event Management (SIEM).'],
                ],
            ],
            [
                'title' => 'Networking',
                'rows' => [
                    ['title' => 'Switches y routers', 'description' => 'Switches de acceso, distribución, core, TOR, FO y SAN. Routers Edge, VPN y Core.'],
                    ['title' => 'WLAN', 'description' => 'Access points, wireless controllers, mesh access points y radioenlaces PTP y PTMP.'],
                    ['title' => 'Cableado estructurado', 'description' => 'Cobre, fibra óptica y GPON.'],
                ],
            ],
            [
                'title' => 'Infraestructura TI',
                'rows' => [
                    ['title' => 'Servidores y blade', 'description' => 'Equipos y servicios para aplicaciones Microsoft, APP y virtualización convergente e hiperconvergente.'],
                    ['title' => 'Storage', 'description' => 'NAS, SAN, tape storage, hyperconverged storage, software de backup y restore, disaster recovery.'],
                    ['title' => 'Software', 'description' => 'Aplicativos de infraestructura: monitoring, gestión de activos, gestión de cloud computing y licenciamiento Windows.'],
                ],
            ],
            [
                'title' => 'Seguridad Electrónica',
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
            ['title' => 'Consultoría', 'body' => 'Consultoría estratégica en TIC: evaluamos infraestructuras, diseñamos arquitecturas y proponemos soluciones basadas en las mejores prácticas de la industria para optimizar la eficiencia y la seguridad de las operaciones empresariales.'],
            ['title' => 'Help Desk', 'body' => 'Soporte técnico a usuarios finales: resolvemos incidencias, brindamos asistencia remota o in situ y capacitamos a los usuarios para mejorar la productividad.'],
            ['title' => 'Outsourcing TIC', 'body' => 'Gestionamos y operamos infraestructuras TIC como centros de cómputo, networking, ciberseguridad y comunicaciones unificadas, para que las empresas se enfoquen en sus actividades principales.'],
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
