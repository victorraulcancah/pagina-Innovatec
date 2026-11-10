<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mfa:quitar {email}', function (string $email) {
    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error("No existe un usuario con el correo $email.");

        return 1;
    }

    if (! $this->confirm("¿Quitar la verificación en dos pasos de $email?")) {
        return 0;
    }

    $user->clearTwoFactor();
    $this->info('Listo: esa cuenta vuelve a entrar solo con su contraseña.');

    return 0;
})->purpose('Quita la verificación en dos pasos de una cuenta que perdió el celular y sus códigos de respaldo');
