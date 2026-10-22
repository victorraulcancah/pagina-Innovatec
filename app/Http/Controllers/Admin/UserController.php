<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Support\SiteSections;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Usuarios del panel y su rol. Reglas de seguridad:
 * - Nadie puede quitarse a sí mismo el rol, desactivarse ni eliminarse, así que siempre queda un administrador activo.
 * - Solo se asignan roles que no den más permisos de los que tiene quien asigna, y no se modifica a quien tiene más
 *   permisos que uno (un editor de usuarios no puede tocar a un administrador).
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();

        return Inertia::render('admin/users', [
            'pages' => SiteSections::navigation(),
            'users' => User::query()->with('role:id,name,is_super')->orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role_id' => $u->role_id,
                'roleName' => $u->role?->name ?? '—',
                'roleSuper' => (bool) $u->role?->is_super,
                'active' => $u->active,
                'isSelf' => $u->is($me),
                // Si quien mira puede modificar a esta persona (no tiene más permisos que él).
                'editable' => $u->is($me) || $this->dentroDeMisPermisos($me, $u->role),
                'created' => $u->created_at?->format('d/m/Y'),
            ])->all(),
            'roles' => Role::query()->orderByDesc('is_super')->orderBy('name')->get()->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'description' => $r->description,
                'assignable' => $this->dentroDeMisPermisos($me, $r),
            ])->all(),
            'can' => [
                'create' => $me->hasPermission('users.create'),
                'edit' => $me->hasPermission('users.edit'),
                'delete' => $me->hasPermission('users.delete'),
                'roles' => $me->hasPermission('roles.view'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $role = Role::findOrFail($data['role_id']);
        $this->exigirRolAsignable($request, $role);

        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
        $user->role_id = $role->id;
        $user->active = true;
        $user->save();

        return back()->with('status', 'Usuario creado.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'active' => ['required', 'boolean'],
            'password' => ['nullable', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $role = Role::findOrFail($data['role_id']);

        if ($user->is($request->user())) {
            if ($role->id !== $user->role_id) {
                throw ValidationException::withMessages(['role_id' => 'No puedes cambiar tu propio rol.']);
            }

            if (! $data['active']) {
                throw ValidationException::withMessages(['active' => 'No puedes desactivar tu propia cuenta.']);
            }
        } else {
            $this->exigirUsuarioModificable($request, $user);
        }

        if ($role->id !== $user->role_id) {
            $this->exigirRolAsignable($request, $role);
        }

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role_id = $role->id;
        $user->active = $data['active'];

        if (filled($data['password'] ?? null)) {
            $user->password = $data['password'];
        }

        $user->save();

        return back()->with('status', 'Usuario actualizado.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->withErrors(['user' => 'No puedes eliminar tu propia cuenta.']);
        }

        $this->exigirUsuarioModificable($request, $user);

        $user->delete();

        return back()->with('status', 'Usuario eliminado.');
    }

    /** Un rol (o usuario con ese rol) está al alcance de quien mira si no da permisos que él no tiene. */
    private function dentroDeMisPermisos(User $me, ?Role $role): bool
    {
        return ! $role || array_diff($role->permissionKeys(), $me->permissionNames()) === [];
    }

    private function exigirRolAsignable(Request $request, Role $role): void
    {
        if (! $this->dentroDeMisPermisos($request->user(), $role)) {
            throw ValidationException::withMessages(['role_id' => 'No puedes asignar un rol con más permisos que los tuyos.']);
        }
    }

    private function exigirUsuarioModificable(Request $request, User $user): void
    {
        if (! $this->dentroDeMisPermisos($request->user(), $user->role)) {
            throw ValidationException::withMessages(['user' => 'No puedes modificar a un usuario con más permisos que tú.']);
        }
    }
}
