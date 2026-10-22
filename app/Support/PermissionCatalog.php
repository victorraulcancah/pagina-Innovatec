<?php

namespace App\Support;

/**
 * Todos los permisos que se pueden dar a un rol, agrupados por área del panel. Cada permiso es una acción concreta
 * (ver, editar, eliminar…), no un área entera: así un rol puede, por ejemplo, ver los mensajes sin poder borrarlos.
 *
 * Las páginas del sitio salen de `SiteSections::pages()`: al agregar una página nueva, su permiso aparece solo.
 */
class PermissionCatalog
{
    /** Quien tiene el permiso de la derecha necesita antes el de la izquierda (no se edita lo que no se puede ver). */
    private const REQUIERE = [
        'blog.write' => 'blog.view',
        'blog.delete' => 'blog.view',
        'blog.categories' => 'blog.view',
        'messages.delete' => 'messages.view',
        'users.create' => 'users.view',
        'users.edit' => 'users.view',
        'users.delete' => 'users.view',
        'roles.manage' => 'roles.view',
    ];

    /**
     * @return list<array{key: string, label: string, description: string, permissions: list<array{key: string, label: string, description: string}>}>
     */
    public static function groups(): array
    {
        $paginas = [['key' => 'pages.inicio', 'label' => 'Inicio', 'description' => 'Video, titular, botones y menú de la portada.']];
        foreach (SiteSections::pages() as $slug => $page) {
            if ($slug !== 'empresa') {
                $paginas[] = ['key' => "pages.$slug", 'label' => $page['label'], 'description' => "Editar la página «{$page['label']}»."];
            }
        }

        return [
            ['key' => 'pages', 'label' => 'Páginas del sitio', 'description' => 'Qué páginas puede editar el rol.', 'permissions' => $paginas],
            ['key' => 'company', 'label' => 'Empresa', 'description' => 'Datos que se usan en todo el sitio.', 'permissions' => [
                ['key' => 'company.edit', 'label' => 'Editar datos de la empresa', 'description' => 'Logo, favicon, redes sociales, WhatsApp y datos legales.'],
            ]],
            ['key' => 'blog', 'label' => 'Blog', 'description' => 'Publicaciones y categorías.', 'permissions' => [
                ['key' => 'blog.view', 'label' => 'Ver el blog', 'description' => 'Entrar a la lista de publicaciones y categorías.'],
                ['key' => 'blog.write', 'label' => 'Crear y editar publicaciones', 'description' => 'Escribir, editar y publicar entradas.'],
                ['key' => 'blog.delete', 'label' => 'Eliminar publicaciones', 'description' => 'Borrar entradas del blog.'],
                ['key' => 'blog.categories', 'label' => 'Gestionar categorías', 'description' => 'Crear, renombrar y eliminar categorías.'],
            ]],
            ['key' => 'messages', 'label' => 'Mensajes', 'description' => 'Consultas del formulario de contacto.', 'permissions' => [
                ['key' => 'messages.view', 'label' => 'Ver mensajes', 'description' => 'Leer y marcar como leídos los mensajes.'],
                ['key' => 'messages.delete', 'label' => 'Eliminar mensajes', 'description' => 'Borrar mensajes de la bandeja.'],
            ]],
            ['key' => 'users', 'label' => 'Usuarios', 'description' => 'Quién entra al panel.', 'permissions' => [
                ['key' => 'users.view', 'label' => 'Ver usuarios', 'description' => 'Ver la lista de usuarios y su rol.'],
                ['key' => 'users.create', 'label' => 'Crear usuarios', 'description' => 'Dar de alta a una persona nueva.'],
                ['key' => 'users.edit', 'label' => 'Editar usuarios', 'description' => 'Cambiar datos, rol y contraseña; activar o desactivar.'],
                ['key' => 'users.delete', 'label' => 'Eliminar usuarios', 'description' => 'Quitar a una persona del panel.'],
            ]],
            ['key' => 'roles', 'label' => 'Roles y permisos', 'description' => 'Qué puede hacer cada rol.', 'permissions' => [
                ['key' => 'roles.view', 'label' => 'Ver roles', 'description' => 'Ver los roles y sus permisos.'],
                ['key' => 'roles.manage', 'label' => 'Crear y editar roles', 'description' => 'Crear roles, cambiar sus permisos y eliminarlos.'],
            ]],
        ];
    }

    /** @return list<string> */
    public static function all(): array
    {
        return array_merge(...array_map(
            fn (array $g) => array_column($g['permissions'], 'key'),
            self::groups(),
        ));
    }

    /**
     * Deja solo permisos que existen y agrega los que cada uno necesita (quien puede editar el blog también lo ve).
     *
     * @param  array<int, mixed>  $claves
     * @return list<string>
     */
    public static function normalizar(array $claves): array
    {
        $validas = array_values(array_intersect(array_map('strval', $claves), self::all()));

        foreach ($validas as $clave) {
            if (isset(self::REQUIERE[$clave])) {
                $validas[] = self::REQUIERE[$clave];
            }
        }

        return array_values(array_unique($validas));
    }

    /** @return array<string, string> permiso → permiso que necesita */
    public static function requisitos(): array
    {
        return self::REQUIERE;
    }

    /** El permiso para editar una página del panel (`empresa` tiene el suyo). */
    public static function paraPagina(string $page): string
    {
        return $page === 'empresa' ? 'company.edit' : "pages.$page";
    }
}
