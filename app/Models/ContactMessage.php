<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Mensaje enviado desde el formulario de contacto.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $company
 * @property string $message
 * @property string|null $ip
 * @property Carbon|null $read_at
 * @property Carbon $created_at
 */
#[Fillable(['name', 'email', 'phone', 'company', 'message', 'ip', 'read_at'])]
class ContactMessage extends Model
{
    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }
}
