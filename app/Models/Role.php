<?php

namespace App\Models;

use App\Support\PermissionCatalog;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Un rol del panel: un nombre y la lista de permisos que da. El rol `is_super` (Administrador) lo puede todo, también
 * lo que se agregue en el futuro, y no se edita ni se elimina.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property bool $is_super
 */
#[Fillable(['name', 'description'])]
class Role extends Model
{
    /** @var list<string>|null */
    private ?array $claves = null;

    protected function casts(): array
    {
        return ['is_super' => 'boolean'];
    }

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** Los permisos del rol (todos, si es el super). */
    public function permissionKeys(): array
    {
        if ($this->is_super) {
            return PermissionCatalog::all();
        }

        // En el orden del catálogo y solo permisos que aún existen.
        return $this->claves ??= array_values(array_intersect(
            PermissionCatalog::all(),
            DB::table('role_permissions')->where('role_id', $this->id)->pluck('permission')->all(),
        ));
    }

    public function can(string $permission): bool
    {
        return $this->is_super || in_array($permission, $this->permissionKeys(), true);
    }

    /** Reemplaza los permisos del rol por estos (ya normalizados: solo válidos y con lo que cada uno necesita). */
    public function syncPermissions(array $claves): void
    {
        $claves = PermissionCatalog::normalizar($claves);

        DB::transaction(function () use ($claves) {
            DB::table('role_permissions')->where('role_id', $this->id)->delete();

            if ($claves) {
                DB::table('role_permissions')->insert(array_map(fn (string $c) => ['role_id' => $this->id, 'permission' => $c], $claves));
            }
        });

        $this->claves = null;
    }

    /** Un identificador único a partir del nombre ("Jefe de ventas" → "jefe-de-ventas"). */
    public static function slugFor(string $name): string
    {
        $base = Str::slug($name) ?: 'rol';
        $slug = $base;

        for ($i = 2; static::query()->where('slug', $slug)->exists(); $i++) {
            $slug = "$base-$i";
        }

        return $slug;
    }
}
