<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Roles creados desde el panel: cada rol es una fila con su lista de permisos. Los cuatro roles que ya existían
 * (Administrador, Editor, Redactor y Comercial) pasan a ser filas, y cada usuario queda con el que tenía.
 */
return new class extends Migration
{
    /** Las páginas editables del sitio, tal como están hoy (los permisos nuevos de páginas se crean desde el código). */
    private const PAGINAS = ['inicio', 'nosotros', 'enterprise', 'telcos', 'experiencia', 'clientes', 'contacto'];

    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
            $table->string('slug', 60)->unique();
            $table->string('description', 255)->nullable();
            // El rol con acceso a todo, incluido lo que se agregue después. No se edita ni se elimina.
            $table->boolean('is_super')->default(false);
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->string('permission', 60);
            $table->primary(['role_id', 'permission']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('password')->constrained('roles')->restrictOnDelete();
        });

        $paginas = array_map(fn (string $p) => "pages.$p", self::PAGINAS);
        $blog = ['blog.view', 'blog.write', 'blog.delete', 'blog.categories'];

        $roles = [
            ['slug' => 'admin', 'name' => 'Administrador', 'description' => 'Acceso total, incluida la gestión de usuarios y roles.', 'is_super' => true, 'permissions' => []],
            ['slug' => 'editor', 'name' => 'Editor', 'description' => 'Edita las páginas del sitio y el blog.', 'is_super' => false, 'permissions' => [...$paginas, ...$blog]],
            ['slug' => 'redactor', 'name' => 'Redactor', 'description' => 'Solo escribe y publica en el blog.', 'is_super' => false, 'permissions' => $blog],
            ['slug' => 'comercial', 'name' => 'Comercial', 'description' => 'Solo atiende los mensajes del formulario de contacto.', 'is_super' => false, 'permissions' => ['messages.view', 'messages.delete']],
        ];

        foreach ($roles as $rol) {
            $id = DB::table('roles')->insertGetId([
                'slug' => $rol['slug'], 'name' => $rol['name'], 'description' => $rol['description'],
                'is_super' => $rol['is_super'], 'created_at' => now(), 'updated_at' => now(),
            ]);

            foreach ($rol['permissions'] as $permiso) {
                DB::table('role_permissions')->insert(['role_id' => $id, 'permission' => $permiso]);
            }

            DB::table('users')->where('role', $rol['slug'])->update(['role_id' => $id]);
        }

        // Quien quedó sin rol (no debería) recibe el de menor alcance.
        DB::table('users')->whereNull('role_id')->update(['role_id' => DB::table('roles')->where('slug', 'redactor')->value('id')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('redactor')->after('password');
        });

        foreach (DB::table('users')->join('roles', 'roles.id', '=', 'users.role_id')->get(['users.id', 'roles.slug']) as $u) {
            DB::table('users')->where('id', $u->id)->update([
                'role' => in_array($u->slug, ['admin', 'editor', 'redactor', 'comercial'], true) ? $u->slug : 'redactor',
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
        });

        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('roles');
    }
};
