<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Crea el administrador a partir de ADMIN_EMAIL / ADMIN_PASSWORD del .env.
 * Si faltan, no crea nada (nunca hay una contraseña por defecto).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command?->warn('Define ADMIN_EMAIL y ADMIN_PASSWORD en .env para crear el administrador.');

            return;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            ['name' => env('ADMIN_NAME', 'Administrador'), 'password' => $password],
        );
    }
}
