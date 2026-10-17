<?php

namespace Tests\Feature;

use App\Enums\Permission;
use App\Enums\Role;
use App\Http\Middleware\AuthenticateAdmin;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RolesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(Role $role, array $attributes = []): User
    {
        $user = User::factory()->role($role)->create($attributes);
        $token = auth('api')->login($user);
        $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);

        return $user;
    }

    /** @return array<string, array{Role, string, int}> */
    public static function accessMatrix(): array
    {
        $rows = [];

        // [ruta, rol => código esperado]
        $routes = [
            '/admin' => [Role::Admin->value => 200, Role::Editor->value => 200, Role::Redactor->value => 302, Role::Comercial->value => 302],
            '/admin/nosotros' => [Role::Admin->value => 200, Role::Editor->value => 200, Role::Redactor->value => 403, Role::Comercial->value => 403],
            '/admin/telcos' => [Role::Admin->value => 200, Role::Editor->value => 200, Role::Redactor->value => 403, Role::Comercial->value => 403],
            '/admin/empresa' => [Role::Admin->value => 200, Role::Editor->value => 403, Role::Redactor->value => 403, Role::Comercial->value => 403],
            '/admin/blog' => [Role::Admin->value => 200, Role::Editor->value => 200, Role::Redactor->value => 200, Role::Comercial->value => 403],
            '/admin/mensajes' => [Role::Admin->value => 200, Role::Editor->value => 403, Role::Redactor->value => 403, Role::Comercial->value => 200],
            '/admin/usuarios' => [Role::Admin->value => 200, Role::Editor->value => 403, Role::Redactor->value => 403, Role::Comercial->value => 403],
            '/admin/cuenta' => [Role::Admin->value => 200, Role::Editor->value => 200, Role::Redactor->value => 200, Role::Comercial->value => 200],
        ];

        foreach ($routes as $url => $expected) {
            foreach ($expected as $role => $status) {
                $rows["$role en $url"] = [Role::from($role), $url, $status];
            }
        }

        return $rows;
    }

    #[DataProvider('accessMatrix')]
    public function test_each_role_only_reaches_its_areas(Role $role, string $url, int $status): void
    {
        $this->actingAsRole($role);

        $this->get($url)->assertStatus($status);
    }

    public function test_writes_are_blocked_without_the_permission(): void
    {
        $message = ContactMessage::query()->create([
            'name' => 'Ana', 'email' => 'ana@empresa.pe', 'message' => 'Hola, quiero cotizar una red.',
        ]);

        $this->actingAsRole(Role::Redactor);
        $this->post('/admin/inicio', [])->assertForbidden();
        $this->post('/admin/nosotros', [])->assertForbidden();
        $this->delete("/admin/mensajes/{$message->id}")->assertForbidden();
        $this->post('/admin/usuarios', [])->assertForbidden();
        $this->assertDatabaseHas('contact_messages', ['id' => $message->id]);

        $this->actingAsRole(Role::Comercial);
        $this->post('/admin/blog/categories', ['name' => 'Nueva'])->assertForbidden();
        $this->assertDatabaseMissing('blog_categories', ['name' => 'Nueva']);

        $this->actingAsRole(Role::Editor);
        $this->post('/admin/empresa', [])->assertForbidden();
        $this->delete("/admin/mensajes/{$message->id}")->assertForbidden();
    }

    public function test_login_lands_on_the_first_area_of_the_role(): void
    {
        foreach ([
            [Role::Admin, '/admin'],
            [Role::Editor, '/admin'],
            [Role::Redactor, '/admin/blog'],
            [Role::Comercial, '/admin/mensajes'],
        ] as [$role, $path]) {
            User::factory()->role($role)->create(['email' => "{$role->value}@empresa.pe", 'password' => 'clave-segura-123']);

            $this->post('/admin/login', ['email' => "{$role->value}@empresa.pe", 'password' => 'clave-segura-123'])
                ->assertRedirect($path);
        }
    }

    public function test_home_redirects_users_without_content_permission_to_their_area(): void
    {
        $this->actingAsRole(Role::Comercial);

        $this->get('/admin')->assertRedirect('/admin/mensajes');
    }

    public function test_navigation_only_lists_what_the_role_can_open(): void
    {
        $slugs = function (Role $role): array {
            $this->actingAsRole($role);
            $slugs = [];

            $this->get('/admin/cuenta')->assertInertia(function (Assert $page) use (&$slugs) {
                $slugs = collect($page->toArray()['props']['pages'])->pluck('slug')->all();
            });

            return $slugs;
        };

        $admin = $slugs(Role::Admin);
        $this->assertContains('usuarios', $admin);
        $this->assertContains('empresa', $admin);

        $editor = $slugs(Role::Editor);
        $this->assertContains('nosotros', $editor);
        $this->assertContains('blog', $editor);
        $this->assertNotContains('empresa', $editor);
        $this->assertNotContains('mensajes', $editor);
        $this->assertNotContains('usuarios', $editor);

        $this->assertSame(['blog', 'cuenta'], $slugs(Role::Redactor));
        $this->assertSame(['mensajes', 'cuenta'], $slugs(Role::Comercial));
    }

    public function test_inertia_shares_the_role_and_its_permissions(): void
    {
        $this->actingAsRole(Role::Editor);

        $this->get('/admin/cuenta')->assertInertia(fn (Assert $page) => $page
            ->where('auth.role', 'Editor')
            ->where('auth.permissions', ['content', 'blog']));
    }

    public function test_an_inactive_account_cannot_log_in_nor_keep_a_session(): void
    {
        User::factory()->inactive()->create(['email' => 'baja@empresa.pe', 'password' => 'clave-segura-123']);

        $this->post('/admin/login', ['email' => 'baja@empresa.pe', 'password' => 'clave-segura-123'])
            ->assertSessionHasErrors('email');
        $this->assertGuest('api');

        // Token emitido antes de la baja: deja de servir en cuanto se desactiva la cuenta.
        $user = $this->actingAsRole(Role::Admin);
        $this->get('/admin')->assertOk();
        $user->forceFill(['active' => false])->save();
        auth('api')->forgetUser();

        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_a_role_change_takes_effect_on_the_next_request(): void
    {
        $user = $this->actingAsRole(Role::Editor);
        $this->get('/admin/nosotros')->assertOk();

        $user->role = Role::Comercial;
        $user->save();
        auth('api')->forgetUser();

        $this->get('/admin/nosotros')->assertForbidden();
    }

    public function test_every_permission_belongs_to_at_least_one_role_and_only_admin_manages_users(): void
    {
        foreach (Permission::cases() as $permission) {
            $this->assertTrue(Role::Admin->can($permission));
        }

        foreach ([Role::Editor, Role::Redactor, Role::Comercial] as $role) {
            $this->assertFalse($role->can(Permission::Users));
            $this->assertFalse($role->can(Permission::Company));
        }
    }

    public function test_admin_creates_a_user_with_a_role(): void
    {
        $this->actingAsRole(Role::Admin);

        $this->post('/admin/usuarios', [
            'name' => 'Rosa Quispe',
            'email' => 'rosa@empresa.pe',
            'role' => 'redactor',
            'password' => 'clave-segura-123',
            'password_confirmation' => 'clave-segura-123',
        ])->assertSessionHasNoErrors();

        $created = User::query()->where('email', 'rosa@empresa.pe')->firstOrFail();
        $this->assertSame(Role::Redactor, $created->role);
        $this->assertTrue($created->active);
    }

    public function test_creating_a_user_validates_role_password_and_unique_email(): void
    {
        $existing = User::factory()->create();
        $this->actingAsRole(Role::Admin);

        $this->post('/admin/usuarios', [
            'name' => 'X', 'email' => $existing->email, 'role' => 'superusuario',
            'password' => 'corta', 'password_confirmation' => 'otra',
        ])->assertSessionHasErrors(['email', 'role', 'password']);
    }

    public function test_the_role_cannot_be_injected_through_account_updates(): void
    {
        $user = $this->actingAsRole(Role::Redactor, ['password' => 'clave-actual-123']);

        $this->post('/admin/cuenta', [
            'name' => 'Nuevo nombre', 'email' => $user->email, 'current_password' => 'clave-actual-123',
            'role' => 'admin', 'active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertSame(Role::Redactor, $user->fresh()->role);
    }

    public function test_admin_changes_another_users_role_and_deactivates_them(): void
    {
        $other = User::factory()->role(Role::Comercial)->create();
        $this->actingAsRole(Role::Admin);

        $this->post("/admin/usuarios/{$other->id}", [
            'name' => $other->name, 'email' => $other->email, 'role' => 'editor', 'active' => false,
        ])->assertSessionHasNoErrors();

        $other->refresh();
        $this->assertSame(Role::Editor, $other->role);
        $this->assertFalse($other->active);
    }

    public function test_admin_cannot_demote_deactivate_or_delete_themselves(): void
    {
        $me = $this->actingAsRole(Role::Admin);

        $this->post("/admin/usuarios/{$me->id}", [
            'name' => $me->name, 'email' => $me->email, 'role' => 'editor', 'active' => true,
        ])->assertSessionHasErrors('role');

        $this->post("/admin/usuarios/{$me->id}", [
            'name' => $me->name, 'email' => $me->email, 'role' => 'admin', 'active' => false,
        ])->assertSessionHasErrors('active');

        $this->delete("/admin/usuarios/{$me->id}")->assertSessionHasErrors('user');

        $me->refresh();
        $this->assertSame(Role::Admin, $me->role);
        $this->assertTrue($me->active);
        $this->assertDatabaseHas('users', ['id' => $me->id]);
    }

    public function test_admin_deletes_another_user(): void
    {
        $other = User::factory()->role(Role::Redactor)->create();
        $this->actingAsRole(Role::Admin);

        $this->delete("/admin/usuarios/{$other->id}")->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('users', ['id' => $other->id]);
    }

    public function test_the_users_page_lists_roles_and_the_permission_matrix(): void
    {
        User::factory()->role(Role::Comercial)->create(['name' => 'Luis Comercial']);
        $this->actingAsRole(Role::Admin);

        $this->get('/admin/usuarios')->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users', 2)
            ->has('roles', 4)
            ->has('permissions', 5)
            ->where('roles.0.value', 'admin'));
    }
}
