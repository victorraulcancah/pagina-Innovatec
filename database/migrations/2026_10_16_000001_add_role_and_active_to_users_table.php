<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Por defecto el rol de menor alcance: un usuario nuevo nunca nace con acceso total.
            $table->string('role', 20)->default('redactor')->after('password');
            $table->boolean('active')->default(true)->after('role');
        });

        // Quienes ya administraban el sitio antes de existir los roles conservan el acceso total.
        DB::table('users')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'active']);
        });
    }
};
