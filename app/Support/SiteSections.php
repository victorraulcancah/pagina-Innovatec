<?php

namespace App\Support;

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
                'title' => 'Experiencia certificada',
                'intro' => 'Contamos con ingenieros especializados y certificados por los principales fabricantes. Estos son algunos de nuestros proyectos.',
            ],
            'clients' => [
                'title' => 'Clientes que nos',
                'accent' => 'respaldan',
            ],
            'contact' => [
                'title' => 'Contáctanos',
                'body' => 'No dudes en escribirnos si tienes alguna pregunta.',
                'email' => 'ventas@proinnovatec.com',
                'phone' => '+511 748-3615',
                'address' => 'Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro',
                'website' => 'www.proinnovatec.com',
            ],
            'footer' => [
                'tagline' => 'Integración de soluciones de Tecnologías de la Información y Comunicaciones.',
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
                    ['group' => 'about', 'key' => 'story', 'label' => 'Quiénes somos (página Nosotros)', 'type' => 'textarea', 'max' => 1500],
                ],
                'images' => [
                    ['key' => 'image_nosotros', 'slot' => 'nosotros', 'label' => 'Imagen de la página Nosotros', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera y junto al texto.'],
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
            'soluciones' => [
                'label' => 'Soluciones y servicios',
                'description' => 'Cada solución y cada servicio tiene su propia página. Aquí editas sus textos, imágenes, el detalle de lo que incluyen y las marcas con las que trabajas.',
                'groups' => ['solutions' => 'Texto de Soluciones', 'services' => 'Texto de Servicios'],
                'texts' => [
                    ['group' => 'solutions', 'key' => 'title', 'label' => 'Título de Soluciones', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'solutions', 'key' => 'intro', 'label' => 'Texto de Soluciones', 'type' => 'textarea', 'max' => 300],
                    ['group' => 'services', 'key' => 'title', 'label' => 'Título de Servicios', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'services', 'key' => 'intro', 'label' => 'Texto de Servicios', 'type' => 'textarea', 'max' => 300],
                ],
                'images' => [
                    ['key' => 'image_soluciones', 'slot' => 'soluciones', 'label' => 'Imagen de la página Soluciones', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera.'],
                    ['key' => 'image_servicios', 'slot' => 'servicios', 'label' => 'Imagen de la página Servicios', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera.'],
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
                    ]],
                ],
            ],
            'experiencia' => [
                'label' => 'Experiencia',
                'description' => 'Proyectos realizados y certificaciones del equipo.',
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
                'description' => 'Datos de contacto de la página Contacto y del pie de página.',
                'groups' => ['contact' => 'Datos de contacto', 'footer' => 'Pie de página'],
                'texts' => [
                    ['group' => 'contact', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'contact', 'key' => 'body', 'label' => 'Texto', 'type' => 'textarea', 'max' => 300],
                    ['group' => 'contact', 'key' => 'email', 'label' => 'Correo', 'type' => 'email', 'max' => 120],
                    ['group' => 'contact', 'key' => 'phone', 'label' => 'Teléfono', 'type' => 'text', 'max' => 40],
                    ['group' => 'contact', 'key' => 'address', 'label' => 'Dirección', 'type' => 'text', 'max' => 160],
                    ['group' => 'contact', 'key' => 'website', 'label' => 'Sitio web', 'type' => 'text', 'max' => 120],
                    ['group' => 'footer', 'key' => 'tagline', 'label' => 'Frase bajo el logo', 'type' => 'textarea', 'max' => 200],
                ],
                'images' => [
                    ['key' => 'image_contacto', 'slot' => 'contacto', 'label' => 'Imagen de la página Contacto', 'hint' => 'JPG, PNG o WebP. Se muestra en la cabecera.'],
                ],
                'lists' => [],
            ],
        ];
    }

    /**
     * Pestañas del panel: Inicio (portada) y una por cada página editable.
     *
     * @return list<array{slug: string, label: string}>
     */
    public static function navigation(): array
    {
        return [
            ['slug' => '', 'label' => 'Inicio'],
            ...collect(static::pages())->map(fn ($p, $slug) => ['slug' => $slug, 'label' => $p['label']])->values()->all(),
        ];
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
                    'text' => $rules[$key] = ['required', 'string', 'max:'.$f['max']],
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
