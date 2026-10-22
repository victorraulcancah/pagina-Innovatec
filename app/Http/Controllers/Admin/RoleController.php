<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Support\PermissionCatalog;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Roles y permisos: crear roles, elegir qué puede hacer cada uno y eliminarlos. Reglas de seguridad:
 * - El rol Administrador (super) no se edita ni se elimina.
 * - Nadie edita su propio rol: se quedaría sin acceso o se daría más.
 * - Solo se pueden dar permisos que quien edita ya tiene (no se escala privilegio).
 * - Un rol con usuarios no se elimina.
 */
class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();

        return Inertia::render('admin/roles', [
            'pages' => SiteSections::navigation(),
            'roles' => Role::query()->withCount('users')->orderByDesc('is_super')->orderBy('name')->get()->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'description' => $r->description,
                'is_super' => $r->is_super,
                'users_count' => $r->users_count,
                'permissions' => $r->permissionKeys(),
                'is_mine' => $r->id === $me->role_id,
            ])->all(),
            'groups' => PermissionCatalog::groups(),
            'requires' => PermissionCatalog::requisitos(),
            // Lo que puede dar quien mira: solo lo que ya tiene.
            'grantable' => $me->permissionNames(),
            'can_manage' => $me->hasPermission('roles.manage'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validar($request);
        $this->exigirPermisosPropios($request, $data['permissions'], []);

        $role = new Role(['name' => $data['name'], 'description' => $data['description'] ?? null]);
        $role->slug = Role::slugFor($data['name']);
        $role->save();
        $role->syncPermissions($data['permissions']);

        return back()->with('status', 'Rol creado.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->exigirEditable($request, $role);

        $data = $this->validar($request, $role);
        $this->exigirPermisosPropios($request, $data['permissions'], $role->permissionKeys());

        $role->fill(['name' => $data['name'], 'description' => $data['description'] ?? null])->save();
        $role->syncPermissions($data['permissions']);

        return back()->with('status', 'Rol actualizado.');
    }

    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $this->exigirEditable($request, $role);

        if ($role->users()->exists()) {
            return back()->withErrors(['role' => 'Hay usuarios con este rol: cámbiales el rol antes de eliminarlo.']);
        }

        $role->delete();

        return back()->with('status', 'Rol eliminado.');
    }

    /** @return array{name: string, description: ?string, permissions: list<string>} */
    private function validar(Request $request, ?Role $role = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60', Rule::unique('roles', 'name')->ignore($role?->id)],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(PermissionCatalog::all())],
        ], [
            'name.unique' => 'Ya existe un rol con ese nombre.',
        ]);

        $data['permissions'] = PermissionCatalog::normalizar($data['permissions'] ?? []);

        return $data;
    }

    private function exigirEditable(Request $request, Role $role): void
    {
        if ($role->is_super) {
            throw ValidationException::withMessages(['role' => 'El rol Administrador no se puede modificar ni eliminar.']);
        }

        if ($role->id === $request->user()->role_id) {
            throw ValidationException::withMessages(['role' => 'No puedes modificar tu propio rol.']);
        }
    }

    /**
     * @param  list<string>  $nuevos  los permisos que quedarán
     * @param  list<string>  $actuales  los que ya tenía el rol
     */
    private function exigirPermisosPropios(Request $request, array $nuevos, array $actuales): void
    {
        $ajenos = array_values(array_filter(
            array_diff($nuevos, $actuales),
            fn (string $p) => ! $request->user()->hasPermission($p),
        ));

        if ($ajenos) {
            throw ValidationException::withMessages(['permissions' => 'No puedes dar permisos que tú no tienes.']);
        }
    }
}
