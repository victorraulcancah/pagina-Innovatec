<?php

namespace App\Support;

/**
 * Definición única del contenido editable bajo la portada: textos por bloque,
 * listas de elementos y qué páginas del panel los muestran. De aquí salen los
 * valores por defecto, las reglas de validación y los formularios del panel.
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
                'body' => 'Un equipo con más de 10 años de experiencia, respaldado por una sólida trayectoria en ingeniería y certificaciones técnicas de los principales fabricantes del sector. La pasión por la tecnología y la búsqueda constante de soluciones eficientes nos impulsan a seguir creciendo.',
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
     * apunta a una `section` de section_items.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function pages(): array
    {
        $offeringFields = [
            ['key' => 'title', 'label' => 'Nombre', 'type' => 'text', 'max' => 80],
            ['key' => 'body', 'label' => 'Resumen', 'type' => 'textarea', 'max' => 400],
            ['key' => 'rows', 'label' => 'Soluciones incluidas', 'type' => 'pairs'],
        ];

        return [
            'nosotros' => [
                'label' => 'Nosotros',
                'description' => 'Presentación de la empresa y las dos tarjetas con imagen que llevan a Soluciones y Servicios.',
                'groups' => ['about' => 'Presentación'],
                'texts' => [
                    ['group' => 'about', 'key' => 'title', 'label' => 'Título', 'type' => 'text', 'max' => 120, 'required' => true],
                    ['group' => 'about', 'key' => 'accent', 'label' => 'Palabras en color', 'type' => 'text', 'max' => 60, 'hint' => 'Se muestran al final del título con el color de la marca.'],
                    ['group' => 'about', 'key' => 'body', 'label' => 'Texto', 'type' => 'textarea', 'max' => 600],
                ],
                'lists' => [[
                    'section' => 'about_card', 'label' => 'Tarjetas con imagen', 'itemLabel' => 'Tarjeta', 'max' => 2,
                    'fields' => [
                        ['key' => 'title', 'label' => 'Texto', 'type' => 'text', 'max' => 40],
                        ['key' => 'url', 'label' => 'Enlace', 'type' => 'url'],
                        ['key' => 'image', 'label' => 'Imagen', 'type' => 'image'],
                    ],
                ]],
            ],
            'soluciones' => [
                'label' => 'Soluciones y servicios',
                'description' => 'Las líneas de soluciones TIC y los servicios profesionales, con el detalle de cada una.',
                'groups' => ['solutions' => 'Texto de Soluciones', 'services' => 'Texto de Servicios'],
                'texts' => [
                    ['group' => 'solutions', 'key' => 'title', 'label' => 'Título de Soluciones', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'solutions', 'key' => 'intro', 'label' => 'Texto de Soluciones', 'type' => 'textarea', 'max' => 300],
                    ['group' => 'services', 'key' => 'title', 'label' => 'Título de Servicios', 'type' => 'text', 'max' => 80, 'required' => true],
                    ['group' => 'services', 'key' => 'intro', 'label' => 'Texto de Servicios', 'type' => 'textarea', 'max' => 300],
                ],
                'lists' => [
                    ['section' => 'solution', 'label' => 'Líneas de soluciones', 'itemLabel' => 'Línea', 'max' => 12, 'fields' => $offeringFields],
                    ['section' => 'service', 'label' => 'Servicios profesionales', 'itemLabel' => 'Servicio', 'max' => 12, 'fields' => $offeringFields],
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
                'image' => ['key' => 'background', 'column' => 'experience_bg_path', 'label' => 'Imagen de fondo', 'hint' => 'Se muestra en blanco y negro, oscurecida. JPG, PNG o WebP.'],
                'lists' => [
                    ['section' => 'case', 'label' => 'Proyectos', 'itemLabel' => 'Proyecto', 'max' => 8, 'fields' => [
                        ['key' => 'title', 'label' => 'Cliente', 'type' => 'text', 'max' => 80],
                        ['key' => 'body', 'label' => 'Resumen del proyecto', 'type' => 'textarea', 'max' => 400],
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
                'description' => 'Datos de contacto que aparecen al final de la página.',
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

        if (isset($config['image'])) {
            $rules[$config['image']['key']] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
            $rules['remove_'.$config['image']['key']] = ['boolean'];
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
                };
            }
        }

        return $rules;
    }
}
