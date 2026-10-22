<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Gestión de usuarios y su rol, con las reglas para no perder el acceso ni escalar privilegios. */
class UserAdminTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(Role|string $role): User
    {
        $user = User::factory()->role($role)->create();
        $token = auth('api')->login($user);
        $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);

        return $user;
    }

    private function roleId(string $slug): int
    {
        return (int) Role::query()->where('slug', $slug)->value('id');
    }

    private function rol(string $name, array $permisos): Role
    {
        $role = new Role(['name' => $name]);
        $role->slug = Role::slugFor($name);
        $role->save();
        $role->syncPermissions($permisos);

        return $role;
    }

    public function test_admin_creates_a_user_with_a_role(): void
    {
        $this->actingAsRole('admin');

        $this->post('/admin/usuarios', [
            'name' => 'Rosa Quispe', 'email' => 'rosa@empresa.pe', 'role_id' => $this->roleId('redactor'),
            'password' => 'clave-segura-123', 'password_confirmation' => 'clave-segura-123',
        ])->assertSessionHasNoErrors();

        $created = User::query()->where('email', 'rosa@empresa.pe')->firstOrFail();
        $this->assertSame('redactor', $created->role->slug);
        $this->assertTrue($created->active);
    }

    public function test_creating_a_user_validates_role_password_and_unique_email(): void
    {
        $existing = User::factory()->create();
        $this->actingAsRole('admin');

        $this->post('/admin/usuarios', [
            'name' => 'X', 'email' => $existing->email, 'role_id' => 9999,
            'password' => 'corta', 'password_confirmation' => 'otra',
        ])->assertSessionHasErrors(['email', 'role_id', 'password']);
    }

    public function test_admin_changes_another_users_role_and_deactivates_them(): void
    {
        $other = User::factory()->role('comercial')->create();
        $this->actingAsRole('admin');

        $this->post("/admin/usuarios/{$other->id}", [
            'name' => $other->name, 'email' => $other->email, 'role_id' => $this->roleId('editor'), 'active' => false,
        ])->assertSessionHasNoErrors();

        $other->refresh();
        $this->assertSame('editor', $other->role->slug);
        $this->assertFalse($other->active);
    }

    public function test_admin_cannot_demote_deactivate_or_delete_themselves(): void
    {
        $me = $this->actingAsRole('admin');

        $this->post("/admin/usuarios/{$me->id}", [
            'name' => $me->name, 'email' => $me->email, 'role_id' => $this->roleId('editor'), 'active' => true,
        ])->assertSessionHasErrors('role_id');

        $this->post("/admin/usuarios/{$me->id}", [
            'name' => $me->name, 'email' => $me->email, 'role_id' => $this->roleId('admin'), 'active' => false,
        ])->assertSessionHasErrors('active');

        $this->delete("/admin/usuarios/{$me->id}")->assertSessionHasErrors('user');

        $me->refresh();
        $this->assertSame('admin', $me->role->slug);
        $this->assertTrue($me->active);
        $this->assertDatabaseHas('users', ['id' => $me->id]);
    }

    public function test_admin_deletes_another_user(): void
    {
        $other = User::factory()->role('redactor')->create();
        $this->actingAsRole('admin');

        $this->delete("/admin/usuarios/{$other->id}")->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('users', ['id' => $other->id]);
    }

    public function test_the_users_page_lists_users_roles_and_what_the_viewer_can_do(): void
    {
        User::factory()->role('comercial')->create(['name' => 'Luis Comercial']);
        $this->actingAsRole('admin');

        $this->get('/admin/usuarios')->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users', 2)
            ->has('roles', 4)
            ->where('can.create', true)
            ->where('can.delete', true));
    }

    public function test_a_user_manager_cannot_assign_a_role_with_more_permissions_than_their_own(): void
    {
        $this->actingAsRole($this->rol('Gestor de usuarios', ['users.view', 'users.create', 'users.edit', 'users.delete', 'blog.view']));

        // Admin y Editor dan permisos que este gestor no tiene.
        foreach (['admin', 'editor'] as $slug) {
            $this->post('/admin/usuarios', [
                'name' => 'Intruso', 'email' => "{$slug}@empresa.pe", 'role_id' => $this->roleId($slug),
                'password' => 'clave-segura-123', 'password_confirmation' => 'clave-segura-123',
            ])->assertSessionHasErrors('role_id');
        }

        $this->assertDatabaseCount('users', 1);

        // Un rol dentro de sus permisos sí.
        $lector = $this->rol('Lector del blog', ['blog.view']);
        $this->post('/admin/usuarios', [
            'name' => 'Rosa', 'email' => 'rosa@empresa.pe', 'role_id' => $lector->id,
            'password' => 'clave-segura-123', 'password_confirmation' => 'clave-segura-123',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['email' => 'rosa@empresa.pe']);

        $this->get('/admin/usuarios')->assertInertia(fn (Assert $page) => $page
            ->where('roles', fn ($roles) => collect($roles)->firstWhere('name', 'Administrador')['assignable'] === false)
            ->where('users', fn ($users) => collect($users)->firstWhere('email', 'rosa@empresa.pe')['editable'] === true));
    }

    public function test_a_user_manager_cannot_modify_or_delete_a_user_with_more_permissions(): void
    {
        $admin = User::factory()->role('admin')->create();
        $this->actingAsRole($this->rol('Gestor de usuarios', ['users.view', 'users.edit', 'users.delete']));

        $this->post("/admin/usuarios/{$admin->id}", [
            'name' => 'Hackeado', 'email' => $admin->email, 'role_id' => $this->roleId('admin'), 'active' => false,
            'password' => 'otra-clave-12345', 'password_confirmation' => 'otra-clave-12345',
        ])->assertSessionHasErrors('user');
        $this->delete("/admin/usuarios/{$admin->id}")->assertSessionHasErrors('user');

        $admin->refresh();
        $this->assertTrue($admin->active);
        $this->assertNotSame('Hackeado', $admin->name);
    }

    public function test_viewing_users_does_not_allow_creating_editing_or_deleting_them(): void
    {
        $other = User::factory()->role('redactor')->create();
        $this->actingAsRole($this->rol('Solo ver usuarios', ['users.view']));

        $this->get('/admin/usuarios')->assertOk();
        $this->post('/admin/usuarios', [])->assertForbidden();
        $this->post("/admin/usuarios/{$other->id}", [])->assertForbidden();
        $this->delete("/admin/usuarios/{$other->id}")->assertForbidden();
    }
}
