<?php

namespace App\Support;

use App\Models\ContactMessage;
use App\Models\User;

/**
 * Definición única del contenido editable del sitio: textos por bloque,
 * listas de elementos e imágenes de cabecera, y qué páginas del panel los
 * muestran. De aquí salen los valores por defecto, las reglas de validación
 * y los formularios del panel.
 */
class SiteSections
{
    /** Enlaces permitidos: ruta interna, ancla, http(s), mailto o tel. */
    public const URL_PATTERN = '/^(\/|#|https?:\/\/|mailto:|tel:)\S*$/i';

    /**
     * Textos por defecto, tomados del brochure.
     *
     * @return array<string, array<string, string>>
     */
    public static function defaults(): array
    {
        return [
            'about' => [
                'title' => 'Referentes en la integración de soluciones',
                'accent' => 'TIC',
                'body' => 'Un equipo con más de 10 años de experiencia, respaldado por una sólida trayectoria en ingeniería y certificaciones técnicas de los principales fabricantes del sector.',
                'more_label' => 'Conoce más sobre nosotros',
                'mission' => '',
                'vision' => '',
                'objectives' => '',
                'story' => 'PROINNOVATEC se destaca como un referente en la integración de soluciones de Tecnologías de la Información y Comunicaciones. Nuestro compromiso con la excelencia y la innovación se refleja en cada proyecto que emprendemos. Contamos con un equipo altamente capacitado con más de 10 años de experiencia, respaldado por una sólida trayectoria en ingeniería y certificaciones técnicas de los principales fabricantes del sector. La pasión por la tecnología y la búsqueda constante de soluciones eficientes nos impulsan a seguir creciendo y superando expectativas en el ámbito de las TIC.',
            ],
            'solutions' => [
                'title' => 'Soluciones',
                'intro' => 'Transformando la tecnología en soluciones para tu organización.',
            ],
            'services' => [
                'title' => 'Servicios profesionales',
                'intro' => 'Acompañamos tu operación TIC de principio a fin, con ingenieros certificados.',
            ],
            'experience' => [
                'title' => 'Casos de éxito',
                'intro' => 'Contamos con ingenieros especializados y certificados por los principales fabricantes. Estos son algunos de nuestros proyectos.',
            ],
            'clients' => [
                'title' => 'Clientes que nos',
                'accent' => 'respaldan',
            ],
            'company' => [
                'name' => 'PROINNOVATEC',
                'legal_name' => '',
                'tax_id' => '',
            ],
            'social' => [
                'facebook' => '',
                'linkedin' => '',
                'instagram' => '',
                'youtube' => '',
                'tiktok' => '',
            ],
            'contact' => [
                'title' => 'Contáctanos',
                'body' => 'No dudes en escribirnos si tienes alguna pregunta.',
                'email' => 'ventas@proinnovatec.com',
                'phone' => '+511 748-3615',
                'address' => 'Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro',
                'website' => 'www.proinnovatec.com',
                'whatsapp' => '',
                'hours' => '',
            ],
            'enterprise' => [
                'title' => 'División Enterprise',
                'subtitle' => 'Soluciones TIC integrales para empresas',
                'intro' => 'Impulsamos tu negocio con soluciones avanzadas en Comunicaciones Unificadas, Ciberseguridad, Networking, Infraestructura TI y Seguridad Electrónica.',
                'cta_title' => '¿Interesado en optimizar la tecnología de tu empresa?',
                'cta_label' => 'Contáctanos',
                'cta_url' => '/contacto',
            ],
            'telcos' => [
                'title' => 'División Telcos',
                'subtitle' => 'Aliado técnico de operadoras y proveedores de telecomunicaciones',
                'intro' => 'Potenciamos a las operadoras con servicios especializados y soporte técnico, para soluciones TIC eficientes y confiables.',
                'partner_title' => 'Tu partner técnico para el éxito en TIC',
                'partner_text' => 'En PROINNOVATEC by Grupo CAME no competimos con las operadoras: nos convertimos en su aliado técnico. Con la experiencia de nuestro equipo certificado y altamente capacitado, ayudamos a los proveedores a implementar soluciones TIC avanzadas y a optimizar sus redes y servicios.',
                'values_title' => 'Potenciamos tu red y servicios',
                'values_intro' => 'Nos convertimos en una extensión de tu equipo, aportando experiencia y tecnología sin competir en tu mercado.',
                'cta_title' => '¿Buscas potenciar tu red y maximizar tus resultados?',
                'home_button_label' => 'Conoce la división',
            ],
            'footer' => [
                'tagline' => 'Integración de soluciones de Tecnologías de la Información y Comunicaciones.',
                'copyright' => '',
            ],
        ];
    }

    /**
     * Páginas del panel. Cada campo de texto es "grupo.clave"; cada lista
     * apunta a una `section` de section_items; cada imagen a un `slot` de
     * home_settings.page_images.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function pages(): array
    {
        $rows = ['key' => 'rows', 'label' => 'Soluciones incluidas', 'type' => 'pairs'];
        $cover = ['key' => 'image', 'label' => 'Imagen de portada (opcional)', 'type' => 'image'];

        return [
            'nosotros' => [
                'label' => 'Nosotros',
                'description' => 'Presentación de la empresa: texto breve para la portada, historia completa para la página Nosotros y las tarjetas con imagen.',
                'groups' => ['about' => 'Presentación'],
                'texts' => [
                    ['group' => 'about', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 120, 'required' => true],
                    ['group' => 'about', 'key' => 'accent', 'label' => 'Palabras en color', 'type' => 'text', 'max' => 60, 'hint' => 'Se muestran al final del título con el color de la marca.'],
                    ['group' => 'about', 'key' => 'body', 'label' => 'Texto breve (portada)', 'type' => 'textarea', 'max' => 400],
                    ['group' => 'about', 'key' => 'more_label', 'label' => 'Texto del botón hacia Nosotros (portada)', 'type' => 'text', 'max' => 60],
                    ['group' => 'about', 'key' => 'story', 'label' => 'Quiénes somos (página Nosotros)', 'type' => 'textarea', 'max' => 1500],
                    ['group' => 'about', 'key' => 'mission', 'label' => 'Misión (página Nosotros)', 'type' => 'textarea', 'max' => 800, 'hint' => 'Si dejas Misión, Visión y Objetivos vacíos, esa sección no se muestra.'],
                    ['group' => 'about', 'key' => 'vision', 'label' => 'Visión (página Nosotros)', 'type' => 'textarea', 'max' => 800],
                    ['group' => 'about', 'key' => 'objectives', 'label' => 'Objetivos (página Nosotros)', 'type' => 'textarea', 'max' => 1200, 'hint' => 'Escribe un objetivo por línea: se muestran como una lista.'],
                ],
                'images' => [
                    ['key' => 'image_nosotros', 'slot' => 'nosotros', 'label' => 'Imagen de la página Nosotros', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera y junto al texto.'],
                    ['key' => 'image_mission', 'slot' => 'mission', 'label' => 'Imagen de la Misión', 'hint' => 'Horizontal (4:3). Aparece junto al texto de la Misión.'],
                    ['key' => 'image_vision', 'slot' => 'vision', 'label' => 'Imagen de la Visión', 'hint' => 'Horizontal (4:3). Aparece junto al texto de la Visión.'],
                    ['key' => 'image_objectives', 'slot' => 'objectives', 'label' => 'Imagen de los Objetivos', 'hint' => 'Horizontal (4:3). Aparece junto a la lista de Objetivos.'],
                ],
                'lists' => [[
                    'section' => 'about_card', 'label' => 'Tarjetas con imagen (portada)', 'itemLabel' => 'Tarjeta', 'max' => 2,
                    'fields' => [
                        ['key' => 'title', 'label' => 'Texto', 'type' => 'text', 'max' => 40],
                        ['key' => 'url', 'label' => 'Enlace', 'type' => 'url'],
                        ['key' => 'image', 'label' => 'Imagen', 'type' => 'image'],
                    ],
                ]],
            ],
            'enterprise' => [
                'label' => 'División Enterprise',
                'description' => 'Página de la división para empresas: cabecera, soluciones (cada una con su página de detalle) y servicios profesionales.',
                'groups' => ['enterprise' => 'Cabecera y cierre', 'services' => 'Bloque de servicios profesionales'],
                'texts' => [
                    ['group' => 'enterprise', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'enterprise', 'key' => 'subtitle', 'label' => 'Subtítulo', 'type' => 'text', 'max' => 120],
                    ['group' => 'enterprise', 'key' => 'intro', 'label' => 'Texto de presentación', 'type' => 'textarea', 'max' => 400],
                    ['group' => 'enterprise', 'key' => 'cta_label', 'label' => 'Texto del botón de la cabecera', 'type' => 'text', 'max' => 40],
                    ['group' => 'enterprise', 'key' => 'cta_url', 'label' => 'Enlace del botón de la cabecera', 'type' => 'url', 'max' => 255],
                    ['group' => 'enterprise', 'key' => 'cta_title', 'label' => 'Frase del cierre', 'type' => 'text', 'max' => 120],
                    ['group' => 'services', 'key' => 'title', 'label' => 'Título de servicios', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'services', 'key' => 'intro', 'label' => 'Texto de servicios', 'type' => 'textarea', 'max' => 300],
                ],
                'images' => [
                    ['key' => 'image_enterprise', 'slot' => 'enterprise', 'label' => 'Imagen de cabecera', 'hint' => 'JPG, PNG o WebP. Se muestra en blanco y negro, oscurecida.'],
                ],
                'lists' => [
                    ['section' => 'solution', 'label' => 'Soluciones', 'itemLabel' => 'Solución', 'max' => 12, 'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 80],
                        ['key' => 'body', 'label' => 'Descripción', 'type' => 'textarea', 'max' => 600],
                        $rows,
                        $cover,
                        ['key' => 'gallery', 'label' => 'Marcas con las que trabajas (logos)', 'type' => 'gallery'],
                    ]],
                    ['section' => 'service', 'label' => 'Servicios profesionales', 'itemLabel' => 'Servicio', 'max' => 12, 'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 80],
                        ['key' => 'body', 'label' => 'Descripción', 'type' => 'textarea', 'max' => 1200],
                        $rows,
                        $cover,
                        ['key' => 'gallery', 'label' => 'Marcas o tecnologías (logos)', 'type' => 'gallery'],
                    ]],
                ],
            ],
            'telcos' => [
                'label' => 'División Telcos',
                'description' => 'Página de la división para operadoras y proveedores de telecomunicaciones.',
                'groups' => ['telcos' => 'Textos de la página'],
                'texts' => [
                    ['group' => 'telcos', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'telcos', 'key' => 'subtitle', 'label' => 'Subtítulo', 'type' => 'text', 'max' => 140],
                    ['group' => 'telcos', 'key' => 'intro', 'label' => 'Texto de presentación', 'type' => 'textarea', 'max' => 400],
                    ['group' => 'telcos', 'key' => 'partner_title', 'label' => 'Título del bloque "partner"', 'type' => 'text', 'max' => 100],
                    ['group' => 'telcos', 'key' => 'partner_text', 'label' => 'Texto del bloque "partner"', 'type' => 'textarea', 'max' => 700],
                    ['group' => 'telcos', 'key' => 'values_title', 'label' => 'Título de los valores', 'type' => 'text', 'max' => 100],
                    ['group' => 'telcos', 'key' => 'values_intro', 'label' => 'Texto de los valores', 'type' => 'textarea', 'max' => 300],
                    ['group' => 'telcos', 'key' => 'home_button_label', 'label' => 'Texto del botón en la portada', 'type' => 'text', 'max' => 40],
                    ['group' => 'telcos', 'key' => 'cta_title', 'label' => 'Frase del cierre', 'type' => 'text', 'max' => 120],
                ],
                'images' => [
                    ['key' => 'image_telcos', 'slot' => 'telcos', 'label' => 'Imagen de cabecera', 'hint' => 'JPG, PNG o WebP. Sin imagen se muestra la malla animada.'],
                    ['key' => 'image_telcos_partner', 'slot' => 'telcos_partner', 'label' => 'Foto junto al bloque "partner"', 'hint' => 'JPG, PNG o WebP.'],
                ],
                'lists' => [
                    ['section' => 'telcos_service', 'label' => 'Servicios para operadoras', 'itemLabel' => 'Servicio', 'max' => 6, 'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 100],
                        ['key' => 'body', 'label' => 'Descripción (opcional)', 'type' => 'textarea', 'max' => 400],
                        ['key' => 'rows', 'label' => 'Puntos que incluye', 'type' => 'pairs'],
                        ['key' => 'image', 'label' => 'Imagen del servicio (opcional)', 'type' => 'image'],
                    ]],
                    ['section' => 'telcos_block', 'label' => 'Bloques de información con imagen', 'itemLabel' => 'Bloque', 'max' => 10, 'fields' => [
                        ['key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 120],
                        ['key' => 'body', 'label' => 'Texto', 'type' => 'textarea', 'max' => 1500],
                        ['key' => 'rows', 'label' => 'Puntos destacados (opcional)', 'type' => 'pairs'],
                        ['key' => 'image', 'label' => 'Imagen', 'type' => 'image'],
                        ['key' => 'url', 'label' => 'Enlace del botón (opcional)', 'type' => 'url'],
                        ['key' => 'label', 'label' => 'Texto del botón (opcional)', 'type' => 'text', 'max' => 40, 'optional' => true],
                    ]],
                    ['section' => 'telcos_value', 'label' => 'Valores', 'itemLabel' => 'Valor', 'max' => 6, 'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 60],
                        ['key' => 'body', 'label' => 'Descripción', 'type' => 'textarea', 'max' => 300],
                        ['key' => 'image', 'label' => 'Imagen o ícono (opcional)', 'type' => 'image'],
                    ]],
                    ['section' => 'telcos_gallery', 'label' => 'Galería de imágenes', 'itemLabel' => 'Imagen', 'max' => 12, 'fields' => [
                        ['key' => 'title', 'label' => 'Pie de foto', 'type' => 'text', 'max' => 120],
                        ['key' => 'image', 'label' => 'Imagen', 'type' => 'image'],
                    ]],
                ],
            ],
            'experiencia' => [
                'label' => 'Casos de éxito',
                'description' => 'Proyectos realizados, certificaciones del equipo y clientes.',
                'groups' => ['experience' => 'Texto'],
                'texts' => [
                    ['group' => 'experience', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'experience', 'key' => 'intro', 'label' => 'Texto', 'type' => 'textarea', 'max' => 400],
                ],
                'images' => [
                    ['key' => 'image_experiencia', 'slot' => 'experiencia', 'label' => 'Imagen de fondo', 'hint' => 'Se muestra en blanco y negro, oscurecida. JPG, PNG o WebP.'],
                ],
                'lists' => [
                    ['section' => 'case', 'label' => 'Proyectos', 'itemLabel' => 'Proyecto', 'max' => 8, 'fields' => [
                        ['key' => 'title', 'label' => 'Cliente', 'type' => 'text', 'max' => 80],
                        ['key' => 'body', 'label' => 'Resumen del proyecto', 'type' => 'textarea', 'max' => 600],
                        ['key' => 'image', 'label' => 'Logo del cliente o foto del proyecto', 'type' => 'image'],
                        ['key' => 'gallery', 'label' => 'Tecnologías usadas (logos)', 'type' => 'gallery'],
                    ]],
                    ['section' => 'certification', 'label' => 'Certificaciones', 'itemLabel' => 'Certificación', 'max' => 16, 'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 80],
                        ['key' => 'image', 'label' => 'Insignia', 'type' => 'image'],
                    ]],
                ],
            ],
            'clientes' => [
                'label' => 'Clientes',
                'description' => 'Logos de las empresas que confían en PROINNOVATEC.',
                'groups' => ['clients' => 'Título'],
                'texts' => [
                    ['group' => 'clients', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'clients', 'key' => 'accent', 'label' => 'Palabras en color', 'type' => 'text', 'max' => 60],
                ],
                'images' => [
                    ['key' => 'image_clientes', 'slot' => 'clientes', 'label' => 'Imagen de la página Clientes', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera.'],
                ],
                'lists' => [[
                    'section' => 'client', 'label' => 'Logos', 'itemLabel' => 'Cliente', 'max' => 60,
                    'fields' => [
                        ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 80],
                        ['key' => 'image', 'label' => 'Logo', 'type' => 'image'],
                    ],
                ]],
            ],
            'contacto' => [
                'label' => 'Contacto',
                'description' => 'Textos e imagen de la página Contacto. Los datos (correo, teléfono, dirección...) se editan en "Datos de la empresa".',
                'groups' => ['contact' => 'Textos de la página'],
                'texts' => [
                    ['group' => 'contact', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'contact', 'key' => 'body', 'label' => 'Texto', 'type' => 'textarea', 'max' => 300],
                ],
                'images' => [
                    ['key' => 'image_contacto', 'slot' => 'contacto', 'label' => 'Imagen de la página Contacto', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera.'],
                ],
                'lists' => [],
            ],
            'empresa' => [
                'label' => 'Datos de la empresa',
                'description' => 'Logo, nombre, datos de contacto, redes sociales y pie de página. Se usan en todo el sitio.',
                'groups' => [
                    'company' => 'Identidad',
                    'contact' => 'Contacto',
                    'social' => 'Redes sociales',
                    'footer' => 'Pie de página',
                ],
                'texts' => [
                    ['group' => 'company', 'key' => 'name', 'label' => 'Nombre comercial', 'type' => 'text', 'max' => 80, 'required' => true, 'hint' => 'Se usa en el logo (texto alternativo), el pie de página y el título de las pestañas.'],
                    ['group' => 'company', 'key' => 'legal_name', 'label' => 'Razón social', 'type' => 'text', 'max' => 160],
                    ['group' => 'company', 'key' => 'tax_id', 'label' => 'RUC', 'type' => 'text', 'max' => 30],
                    ['group' => 'contact', 'key' => 'email', 'label' => 'Correo', 'type' => 'email', 'max' => 120, 'hint' => 'También recibe el aviso de los mensajes del formulario.'],
                    ['group' => 'contact', 'key' => 'phone', 'label' => 'Teléfono', 'type' => 'text', 'max' => 40],
                    ['group' => 'contact', 'key' => 'whatsapp', 'label' => 'WhatsApp', 'type' => 'text', 'max' => 30, 'hint' => 'Puedes escribir solo los 9 dígitos (970 855 741): se agrega el +51. Si lo completas, aparece un botón flotante de WhatsApp y un enlace que abre el chat con un mensaje ya escrito.'],
                    ['group' => 'contact', 'key' => 'address', 'label' => 'Dirección', 'type' => 'text', 'max' => 160],
                    ['group' => 'contact', 'key' => 'hours', 'label' => 'Horario de atención', 'type' => 'text', 'max' => 120],
                    ['group' => 'contact', 'key' => 'website', 'label' => 'Sitio web', 'type' => 'text', 'max' => 120],
                    ['group' => 'social', 'key' => 'facebook', 'label' => 'Facebook', 'type' => 'url', 'max' => 255],
                    ['group' => 'social', 'key' => 'linkedin', 'label' => 'LinkedIn', 'type' => 'url', 'max' => 255],
                    ['group' => 'social', 'key' => 'instagram', 'label' => 'Instagram', 'type' => 'url', 'max' => 255],
                    ['group' => 'social', 'key' => 'youtube', 'label' => 'YouTube', 'type' => 'url', 'max' => 255],
                    ['group' => 'social', 'key' => 'tiktok', 'label' => 'TikTok', 'type' => 'url', 'max' => 255],
                    ['group' => 'footer', 'key' => 'tagline', 'label' => 'Frase bajo el logo', 'type' => 'textarea', 'max' => 200],
                    ['group' => 'footer', 'key' => 'copyright', 'label' => 'Texto de derechos', 'type' => 'text', 'max' => 160, 'hint' => 'Déjalo vacío para usar "© año Nombre. Todos los derechos reservados."'],
                ],
                'images' => [
                    ['key' => 'image_logo', 'slot' => 'logo', 'label' => 'Logo', 'hint' => 'PNG, WebP o JPG con fondo transparente y letras claras (se ve sobre fondo oscuro). Sin logo se usa el de PROINNOVATEC.'],
                    ['key' => 'image_favicon', 'slot' => 'favicon', 'label' => 'Favicon (ícono de la pestaña)', 'hint' => 'Imagen cuadrada, PNG o WebP, de al menos 64 × 64 px.'],
                    ['key' => 'image_og', 'slot' => 'og', 'label' => 'Imagen al compartir en redes', 'hint' => 'Se ve al compartir el sitio por WhatsApp, Facebook o LinkedIn. Recomendado: 1200 × 630 px.'],
                ],
                'lists' => [],
            ],
        ];
    }

    /**
     * Pestañas del panel: Inicio (portada) y una por cada página editable.
     *
     * @return list<array{slug: string, label: string, badge?: int}>
     */
    public static function navigation(?User $user = null): array
    {
        $user ??= auth()->user();
        $allowed = fn (string $permission) => $user?->hasPermission($permission) ?? false;

        $pages = collect(static::pages())
            ->filter(fn ($p, $slug) => $allowed(static::permission($slug)))
            ->map(fn ($p, $slug) => ['slug' => $slug, 'label' => $p['label']])
            ->values()->all();

        return array_values(array_filter([
            $allowed('pages.inicio') ? ['slug' => '', 'label' => 'Inicio'] : null,
            ...$pages,
            $allowed('blog.view') ? ['slug' => 'blog', 'label' => 'Blog'] : null,
            $allowed('messages.view')
                ? ['slug' => 'mensajes', 'label' => 'Mensajes', 'badge' => ContactMessage::query()->whereNull('read_at')->count()]
                : null,
            $allowed('users.view') ? ['slug' => 'usuarios', 'label' => 'Usuarios'] : null,
            $allowed('roles.view') ? ['slug' => 'roles', 'label' => 'Roles y permisos'] : null,
            ['slug' => 'cuenta', 'label' => 'Mi cuenta'],
        ]));
    }

    /** Permiso necesario para editar una página del panel. */
    public static function permission(string $page): string
    {
        return PermissionCatalog::paraPagina($page);
    }

    /**
     * Reglas de validación de una página del panel, derivadas de su definición.
     *
     * @return array<string, mixed>
     */
    public static function rules(string $page): array
    {
        $config = static::pages()[$page];
        $rules = [];

        foreach ($config['texts'] as $t) {
            $rules["texts.{$t['group']}.{$t['key']}"] = [
                ($t['required'] ?? false) ? 'required' : 'nullable',
                'string',
                ...($t['type'] === 'email' ? ['email'] : []),
                ...($t['type'] === 'url' ? ['regex:'.self::URL_PATTERN] : []),
                'max:'.$t['max'],
            ];
        }

        foreach ($config['images'] ?? [] as $img) {
            $rules[$img['key']] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
            $rules['remove_'.$img['key']] = ['boolean'];
        }

        foreach ($config['lists'] as $list) {
            $base = "lists.{$list['section']}";
            $rules[$base] = ['nullable', 'array', 'max:'.$list['max']];
            $rules["$base.*.id"] = ['nullable', 'integer'];

            foreach ($list['fields'] as $f) {
                $key = "$base.*.{$f['key']}";

                match ($f['type']) {
                    'text' => $rules[$key] = [($f['optional'] ?? false) ? 'nullable' : 'required', 'string', 'max:'.$f['max']],
                    'textarea' => $rules[$key] = ['nullable', 'string', 'max:'.$f['max']],
                    'url' => $rules[$key] = ['nullable', 'string', 'max:255', 'regex:'.self::URL_PATTERN],
                    'image' => [
                        $rules[$key] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
                        $rules["$base.*.remove_{$f['key']}"] = ['boolean'],
                    ],
                    'pairs' => [
                        $rules[$key] = ['nullable', 'array', 'max:12'],
                        $rules["$key.*.title"] = ['required', 'string', 'max:80'],
                        $rules["$key.*.description"] = ['nullable', 'string', 'max:300'],
                    ],
                    'gallery' => [
                        $rules["$base.*.gallery_keep"] = ['nullable', 'array', 'max:30'],
                        $rules["$base.*.gallery_keep.*"] = ['string', 'max:255'],
                        $rules["$base.*.gallery_files"] = ['nullable', 'array', 'max:30'],
                        $rules["$base.*.gallery_files.*"] = ['image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
                    ],
                };
            }
        }

        return $rules;
    }
}
