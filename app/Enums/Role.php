<?php

namespace App\Enums;

/**
 * Roles del panel. Cada rol agrupa permisos; todos pueden editar su propia
 * cuenta ("Mi cuenta"), que no depende de ningún permiso.
 */
enum Role: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Redactor = 'redactor';
    case Comercial = 'comercial';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Editor => 'Editor',
            self::Redactor => 'Redactor',
            self::Comercial => 'Comercial',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Admin => 'Acceso total, incluida la gestión de usuarios.',
            self::Editor => 'Edita las páginas del sitio y el blog.',
            self::Redactor => 'Solo escribe y publica en el blog.',
            self::Comercial => 'Solo atiende los mensajes del formulario de contacto.',
        };
    }

    /** @return list<Permission> */
    public function permissions(): array
    {
        return match ($this) {
            self::Admin => Permission::cases(),
            self::Editor => [Permission::Content, Permission::Blog],
            self::Redactor => [Permission::Blog],
            self::Comercial => [Permission::Messages],
        };
    }

    public function can(Permission $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }
}
