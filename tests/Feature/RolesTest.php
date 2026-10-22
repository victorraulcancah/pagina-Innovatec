<?php

namespace Tests\Feature;

use App\Http\Middleware\AuthenticateAdmin;
use App\Models\ContactMessage;
use App\Models\Role;
use App\Models\User;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/** Acceso del panel según el rol: los cuatro roles de origen, los roles creados desde el panel y las cuentas. */
class RolesTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(Role|string $role, array $attributes = []): User
    {
        $user = User::factory()->role($role)->create($attributes);
        $token = auth('api')->login($user);
        $this->withUnencryptedCookies([AuthenticateAdmin::COOKIE => $token]);

        return $user;
    }

    /** Un rol nuevo con exactamente estos permisos. */
    private function rolConPermisos(array $permisos, string $name = 'Rol de prueba'): Role
    {
        $role = new Role(['name' => $name]);
        $role->slug = Role::slugFor($name);
        $role->save();
        $role->syncPermissions($permisos);

        return $role;
    }

    /** @return array<string, array{string, string, int}> */
    public static function accessMatrix(): array
    {
        $rows = [];

        // [ruta, rol => código esperado]
        $routes = [
            '/admin' => ['admin' => 200, 'editor' => 200, 'redactor' => 302, 'comercial' => 302],
            '/admin/nosotros' => ['admin' => 200, 'editor' => 200, 'redactor' => 403, 'comercial' => 403],
            '/admin/telcos' => ['admin' => 200, 'editor' => 200, 'redactor' => 403, 'comercial' => 403],
            '/admin/empresa' => ['admin' => 200, 'editor' => 403, 'redactor' => 403, 'comercial' => 403],
            '/admin/blog' => ['admin' => 200, 'editor' => 200, 'redactor' => 200, 'comercial' => 403],
            '/admin/mensajes' => ['admin' => 200, 'editor' => 403, 'redactor' => 403, 'comercial' => 200],
            '/admin/usuarios' => ['admin' => 200, 'editor' => 403, 'redactor' => 403, 'comercial' => 403],
            '/admin/roles' => ['admin' => 200, 'editor' => 403, 'redactor' => 403, 'comercial' => 403],
            '/admin/cuenta' => ['admin' => 200, 'editor' => 200, 'redactor' => 200, 'comercial' => 200],
        ];

        foreach ($routes as $url => $expected) {
            foreach ($expected as $role => $status) {
                $rows["$role en $url"] = [$role, $url, $status];
            }
        }

        return $rows;
    }

    #[DataProvider('accessMatrix')]
    public function test_each_role_only_reaches_its_areas(string $role, string $url, int $status): void
    {
        $this->actingAsRole($role);

        $this->get($url)->assertStatus($status);
    }

    public function test_writes_are_blocked_without_the_permission(): void
    {
        $message = ContactMessage::query()->create([
            'name' => 'Ana', 'email' => 'ana@empresa.pe', 'message' => 'Hola, quiero cotizar una red.',
        ]);

        $this->actingAsRole('redactor');
        $this->post('/admin/inicio', [])->assertForbidden();
        $this->post('/admin/nosotros', [])->assertForbidden();
        $this->delete("/admin/mensajes/{$message->id}")->assertForbidden();
        $this->post('/admin/usuarios', [])->assertForbidden();
        $this->post('/admin/roles', ['name' => 'X'])->assertForbidden();
        $this->assertDatabaseHas('contact_messages', ['id' => $message->id]);

        $this->actingAsRole('comercial');
        $this->post('/admin/blog/categories', ['name' => 'Nueva'])->assertForbidden();
        $this->assertDatabaseMissing('blog_categories', ['name' => 'Nueva']);

        $this->actingAsRole('editor');
        $this->post('/admin/empresa', [])->assertForbidden();
        $this->delete("/admin/mensajes/{$message->id}")->assertForbidden();
    }

    public function test_a_role_can_view_messages_without_being_able_to_delete_them(): void
    {
        $message = ContactMessage::query()->create([
            'name' => 'Ana', 'email' => 'ana@empresa.pe', 'message' => 'Hola, quiero cotizar una red.',
        ]);

        $this->actingAsRole($this->rolConPermisos(['messages.view']));

        $this->get('/admin/mensajes')->assertOk();
        $this->post("/admin/mensajes/{$message->id}/leida")->assertSessionHasNoErrors();
        $this->delete("/admin/mensajes/{$message->id}")->assertForbidden();
        $this->assertDatabaseHas('contact_messages', ['id' => $message->id]);
    }

    public function test_blog_actions_have_their_own_permissions(): void
    {
        $this->actingAsRole($this->rolConPermisos(['blog.view', 'blog.categories']));

        $this->get('/admin/blog')->assertOk();
        $this->post('/admin/blog/categories', ['name' => 'Noticias'])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('blog_categories', ['name' => 'Noticias']);
        $this->post('/admin/blog/posts', [])->assertForbidden();
    }

    public function test_a_page_permission_only_opens_that_page(): void
    {
        $this->actingAsRole($this->rolConPermisos(['pages.nosotros']));

        $this->get('/admin/nosotros')->assertOk();
        $this->get('/admin/telcos')->assertForbidden();
        $this->get('/admin/empresa')->assertForbidden();
        $this->post('/admin/telcos', [])->assertForbidden();
        $this->get('/admin')->assertRedirect('/admin/nosotros');
    }

    public function test_permissions_that_need_another_bring_it_along(): void
    {
        $role = $this->rolConPermisos(['blog.write', 'users.delete', 'roles.manage', 'inventado.x']);

        $this->assertEqualsCanonicalizing(['blog.write', 'blog.view', 'users.delete', 'users.view', 'roles.manage', 'roles.view'], $role->permissionKeys());
    }

    public function test_login_lands_on_the_first_area_of_the_role(): void
    {
        foreach ([
            ['admin', '/admin'],
            ['editor', '/admin'],
            ['redactor', '/admin/blog'],
            ['comercial', '/admin/mensajes'],
        ] as [$role, $path]) {
            User::factory()->role($role)->create(['email' => "{$role}@empresa.pe", 'password' => 'clave-segura-123']);

            $this->post('/admin/login', ['email' => "{$role}@empresa.pe", 'password' => 'clave-segura-123'])
                ->assertRedirect($path);
        }
    }

    public function test_home_redirects_users_without_the_home_permission_to_their_area(): void
    {
        $this->actingAsRole('comercial');

        $this->get('/admin')->assertRedirect('/admin/mensajes');
    }

    public function test_navigation_only_lists_what_the_role_can_open(): void
    {
        $slugs = function (Role|string $role): array {
            $this->actingAsRole($role);
            $slugs = [];

            $this->get('/admin/cuenta')->assertInertia(function (Assert $page) use (&$slugs) {
                $slugs = collect($page->toArray()['props']['pages'])->pluck('slug')->all();
            });

            return $slugs;
        };

        $admin = $slugs('admin');
        $this->assertContains('usuarios', $admin);
        $this->assertContains('roles', $admin);
        $this->assertContains('empresa', $admin);

        $editor = $slugs('editor');
        $this->assertContains('nosotros', $editor);
        $this->assertContains('blog', $editor);
        $this->assertNotContains('empresa', $editor);
        $this->assertNotContains('mensajes', $editor);
        $this->assertNotContains('usuarios', $editor);

        $this->assertSame(['blog', 'cuenta'], $slugs('redactor'));
        $this->assertSame(['mensajes', 'cuenta'], $slugs('comercial'));
        $this->assertSame(['telcos', 'cuenta'], $slugs($this->rolConPermisos(['pages.telcos'], 'Solo Telcos')));
    }

    public function test_inertia_shares_the_role_name_and_its_permissions(): void
    {
        $this->actingAsRole('comercial');

        $this->get('/admin/cuenta')->assertInertia(fn (Assert $page) => $page
            ->where('auth.role', 'Comercial')
            ->where('auth.permissions', ['messages.view', 'messages.delete']));
    }

    public function test_the_administrator_role_always_has_every_permission(): void
    {
        $admin = Role::query()->where('slug', 'admin')->firstOrFail();

        $this->assertTrue($admin->is_super);
        $this->assertEqualsCanonicalizing(PermissionCatalog::all(), $admin->permissionKeys());
    }

    public function test_an_inactive_account_cannot_log_in_nor_keep_a_session(): void
    {
        User::factory()->inactive()->create(['email' => 'baja@empresa.pe', 'password' => 'clave-segura-123']);

        $this->post('/admin/login', ['email' => 'baja@empresa.pe', 'password' => 'clave-segura-123'])
            ->assertSessionHasErrors('email');
        $this->assertGuest('api');

        // Token emitido antes de la baja: deja de servir en cuanto se desactiva la cuenta.
        $user = $this->actingAsRole('admin');
        $this->get('/admin')->assertOk();
        $user->forceFill(['active' => false])->save();
        auth('api')->forgetUser();

        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_a_role_change_takes_effect_on_the_next_request(): void
    {
        $user = $this->actingAsRole('editor');
        $this->get('/admin/nosotros')->assertOk();

        $user->role_id = Role::query()->where('slug', 'comercial')->value('id');
        $user->save();
        auth('api')->forgetUser();

        $this->get('/admin/nosotros')->assertForbidden();
    }

    public function test_changing_a_roles_permissions_takes_effect_for_its_users(): void
    {
        $role = $this->rolConPermisos(['pages.nosotros']);
        $this->actingAsRole($role);
        $this->get('/admin/nosotros')->assertOk();

        $role->syncPermissions(['pages.telcos']);
        auth('api')->forgetUser();

        $this->get('/admin/nosotros')->assertForbidden();
        $this->get('/admin/telcos')->assertOk();
    }

    public function test_the_role_cannot_be_injected_through_account_updates(): void
    {
        $user = $this->actingAsRole('redactor', ['password' => 'clave-actual-123']);

        $this->post('/admin/cuenta', [
            'name' => 'Nuevo nombre', 'email' => $user->email, 'current_password' => 'clave-actual-123',
            'role_id' => Role::query()->where('slug', 'admin')->value('id'), 'active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertSame('redactor', $user->fresh()->role->slug);
    }
}
