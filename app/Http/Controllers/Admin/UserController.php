<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Permission;
use App\Enums\Role;
use App\Http\Controllers\Controller;
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
 * Usuarios del panel y su rol. Solo lo ve quien tiene el permiso "users".
 * Reglas de seguridad: nadie puede quitarse a sí mismo el rol, desactivarse
 * ni eliminarse, así que siempre queda al menos un administrador activo.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();

        return Inertia::render('admin/users', [
            'pages' => SiteSections::navigation(),
            'users' => User::query()->orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->value,
                'roleLabel' => $u->role->label(),
                'active' => $u->active,
                'isSelf' => $u->is($me),
                'created' => $u->created_at?->format('d/m/Y'),
            ])->all(),
            'roles' => array_map(fn (Role $r) => [
                'value' => $r->value,
                'label' => $r->label(),
                'description' => $r->description(),
                'permissions' => array_map(fn (Permission $p) => $p->value, $r->permissions()),
            ], Role::cases()),
            'permissions' => array_map(fn (Permission $p) => [
                'value' => $p->value,
                'label' => $p->label(),
                'description' => $p->description(),
            ], Permission::cases()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'role' => ['required', Rule::enum(Role::class)],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
        $user->role = Role::from($data['role']);
        $user->active = true;
        $user->save();

        return back()->with('status', 'Usuario creado.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::enum(Role::class)],
            'active' => ['required', 'boolean'],
            'password' => ['nullable', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);

        $role = Role::from($data['role']);

        if ($user->is($request->user())) {
            if ($role !== $user->role) {
                throw ValidationException::withMessages(['role' => 'No puedes cambiar tu propio rol.']);
            }

            if (! $data['active']) {
                throw ValidationException::withMessages(['active' => 'No puedes desactivar tu propia cuenta.']);
            }
        }

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $role;
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

        $user->delete();

        return back()->with('status', 'Usuario eliminado.');
    }
}
