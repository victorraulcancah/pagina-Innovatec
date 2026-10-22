<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Crear, editar y eliminar roles desde el panel, y sus reglas de seguridad. */
class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(Role|string $role): User
    {
        $user = User::factory()->role($role)->create();
        $token = auth('api')->login($user);
        $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);

        return $user;
    }

    private function rol(string $name, array $permisos): Role
    {
        $role = new Role(['name' => $name]);
        $role->slug = Role::slugFor($name);
        $role->save();
        $role->syncPermissions($permisos);

        return $role;
    }

    public function test_the_roles_page_lists_roles_with_their_permissions_and_the_catalog(): void
    {
        $this->actingAsRole('admin');

        $this->get('/admin/roles')->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles')
            ->has('roles', 4)
            ->where('roles.0.name', 'Administrador')
            ->where('roles.0.is_super', true)
            ->has('groups', 6)
            ->where('can_manage', true));
    }

    public function test_admin_creates_a_role_with_chosen_permissions(): void
    {
        $this->actingAsRole('admin');

        $this->post('/admin/roles', [
            'name' => 'Jefe de ventas',
            'description' => 'Atiende mensajes y edita Contacto.',
            'permissions' => ['messages.view', 'messages.delete', 'pages.contacto'],
        ])->assertSessionHasNoErrors();

        $role = Role::query()->where('name', 'Jefe de ventas')->firstOrFail();
        $this->assertSame('jefe-de-ventas', $role->slug);
        $this->assertEqualsCanonicalizing(['messages.view', 'messages.delete', 'pages.contacto'], $role->permissionKeys());
        $this->assertFalse($role->is_super);
    }

    public function test_a_custom_role_can_be_assigned_to_a_user_who_then_gets_exactly_those_permissions(): void
    {
        $this->actingAsRole('admin');
        $role = $this->rol('Solo Telcos', ['pages.telcos']);

        $this->post('/admin/usuarios', [
            'name' => 'Luis', 'email' => 'luis@empresa.pe', 'role_id' => $role->id,
            'password' => 'clave-segura-123', 'password_confirmation' => 'clave-segura-123',
        ])->assertSessionHasNoErrors();

        $this->post('/admin/logout');
        auth('api')->forgetUser();
        $this->post('/admin/login', ['email' => 'luis@empresa.pe', 'password' => 'clave-segura-123'])->assertRedirect('/admin/telcos');
    }

    public function test_invalid_input_is_rejected(): void
    {
        $this->actingAsRole('admin');
        $this->rol('Existente', []);

        $this->post('/admin/roles', ['name' => ''])->assertSessionHasErrors('name');
        $this->post('/admin/roles', ['name' => 'Existente'])->assertSessionHasErrors('name');
        $this->post('/admin/roles', ['name' => 'Raro', 'permissions' => ['inventado.todo']])->assertSessionHasErrors('permissions.0');
        $this->assertDatabaseMissing('roles', ['name' => 'Raro']);
    }

    public function test_admin_edits_a_role_and_its_permissions(): void
    {
        $this->actingAsRole('admin');
        $role = $this->rol('Redacción', ['blog.view']);

        $this->post("/admin/roles/{$role->id}", [
            'name' => 'Redacción web', 'description' => 'Blog completo.',
            'permissions' => ['blog.write', 'blog.delete'],
        ])->assertSessionHasNoErrors();

        $role->refresh();
        $this->assertSame('Redacción web', $role->name);
        $this->assertEqualsCanonicalizing(['blog.write', 'blog.delete', 'blog.view'], $role->permissionKeys());
    }

    public function test_the_administrator_role_cannot_be_edited_or_deleted(): void
    {
        $this->actingAsRole('admin');
        $admin = Role::query()->where('slug', 'admin')->firstOrFail();

        $this->post("/admin/roles/{$admin->id}", ['name' => 'Otro nombre', 'permissions' => []])->assertSessionHasErrors('role');
        $this->delete("/admin/roles/{$admin->id}")->assertSessionHasErrors('role');

        $this->assertSame('Administrador', $admin->fresh()->name);
        $this->assertTrue($admin->fresh()->is_super);
    }

    public function test_a_role_with_users_cannot_be_deleted_but_an_empty_one_can(): void
    {
        $this->actingAsRole('admin');
        $conUsuarios = $this->rol('Con gente', ['blog.view']);
        User::factory()->role($conUsuarios)->create();
        $vacio = $this->rol('Vacío', []);

        $this->delete("/admin/roles/{$conUsuarios->id}")->assertSessionHasErrors('role');
        $this->assertDatabaseHas('roles', ['id' => $conUsuarios->id]);

        $this->delete("/admin/roles/{$vacio->id}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('roles', ['id' => $vacio->id]);
    }

    public function test_nobody_can_edit_or_delete_their_own_role(): void
    {
        $gestor = $this->rol('Gestor de roles', ['roles.manage', 'pages.nosotros']);
        $this->actingAsRole($gestor);

        $this->post("/admin/roles/{$gestor->id}", ['name' => 'Gestor', 'permissions' => ['roles.manage']])->assertSessionHasErrors('role');
        $this->delete("/admin/roles/{$gestor->id}")->assertSessionHasErrors('role');

        $this->assertContains('pages.nosotros', $gestor->fresh()->permissionKeys());
    }

    public function test_a_role_manager_cannot_grant_permissions_they_do_not_have(): void
    {
        // Gestiona roles, pero no tiene «Empresa» ni «Usuarios».
        $gestor = $this->rol('Gestor de roles', ['roles.manage', 'pages.nosotros']);
        $this->actingAsRole($gestor);

        $this->post('/admin/roles', ['name' => 'Escalada', 'permissions' => ['company.edit']])->assertSessionHasErrors('permissions');
        $this->assertDatabaseMissing('roles', ['name' => 'Escalada']);

        $this->post('/admin/roles', ['name' => 'Permitido', 'permissions' => ['pages.nosotros']])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('roles', ['name' => 'Permitido']);

        // Un rol que ya tenía permisos que el gestor no posee puede conservarlos, pero no se le suman otros ajenos.
        $ajeno = $this->rol('Con empresa', ['company.edit']);
        $this->post("/admin/roles/{$ajeno->id}", ['name' => 'Con empresa', 'permissions' => ['company.edit', 'users.view']])->assertSessionHasErrors('permissions');
    }

    public function test_viewing_roles_does_not_allow_managing_them(): void
    {
        $this->actingAsRole($this->rol('Solo ver roles', ['roles.view']));

        $this->get('/admin/roles')->assertInertia(fn (Assert $page) => $page->where('can_manage', false));
        $this->post('/admin/roles', ['name' => 'Nuevo'])->assertForbidden();
    }

    public function test_the_catalog_covers_every_editable_page_and_every_permission_is_unique(): void
    {
        $todas = PermissionCatalog::all();

        $this->assertSame(count($todas), count(array_unique($todas)));
        $this->assertContains('pages.inicio', $todas);
        $this->assertContains('pages.telcos', $todas);
        $this->assertContains('company.edit', $todas);
        $this->assertNotContains('pages.empresa', $todas);
    }
}
