<?php

namespace App\Enums;

/** Áreas del panel a las que se puede dar o quitar acceso. */
enum Permission: string
{
    case Content = 'content';
    case Company = 'company';
    case Blog = 'blog';
    case Messages = 'messages';
    case Users = 'users';

    public function label(): string
    {
        return match ($this) {
            self::Content => 'Contenido del sitio',
            self::Company => 'Datos de la empresa',
            self::Blog => 'Blog',
            self::Messages => 'Mensajes',
            self::Users => 'Usuarios y roles',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Content => 'Inicio, Nosotros, Enterprise, Telcos, Casos de éxito, Clientes y Contacto.',
            self::Company => 'Logo, favicon, redes sociales, WhatsApp y datos legales.',
            self::Blog => 'Crear, editar y eliminar publicaciones y categorías.',
            self::Messages => 'Leer, responder y eliminar los mensajes del formulario.',
            self::Users => 'Crear usuarios, cambiar su rol, desactivarlos o eliminarlos.',
        };
    }
}
