<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Las certificaciones pasan de «Casos de éxito» a «Panel de aliados»: quien las editaba las sigue editando. */
    public function up(): void
    {
        DB::table('role_permissions')->where('permission', 'pages.experiencia')->pluck('role_id')->each(
            fn (int $roleId) => DB::table('role_permissions')->insertOrIgnore(['role_id' => $roleId, 'permission' => 'pages.aliados']),
        );
    }

    public function down(): void
    {
        DB::table('role_permissions')->where('permission', 'pages.aliados')->delete();
    }
};
