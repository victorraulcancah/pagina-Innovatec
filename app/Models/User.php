<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Support\PermissionCatalog;
use App\Support\SiteSections;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property int|null $role_id
 * @property Role|null $role
 * @property bool $active
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** Una cuenta desactivada no tiene ningún permiso, aunque su rol los tenga. */
    public function hasPermission(string $permission): bool
    {
        return $this->active && $this->role?->can($permission) === true;
    }

    /** @return list<string> */
    public function permissionNames(): array
    {
        return $this->active && $this->role ? $this->role->permissionKeys() : [];
    }

    /** Primera pantalla del panel a la que este usuario tiene acceso. */
    public function landingPath(): string
    {
        $destinos = ['pages.inicio' => '/admin'];

        foreach (SiteSections::pages() as $slug => $page) {
            $destinos[PermissionCatalog::paraPagina($slug)] = "/admin/$slug";
        }

        $destinos += [
            'blog.view' => '/admin/blog',
            'messages.view' => '/admin/mensajes',
            'users.view' => '/admin/usuarios',
            'roles.view' => '/admin/roles',
        ];

        foreach ($destinos as $permiso => $ruta) {
            if ($this->hasPermission($permiso)) {
                return $ruta;
            }
        }

        return '/admin/cuenta';
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
