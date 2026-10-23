<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_settings', function (Blueprint $table) {
            // El enlace «Panel» de la barra de menú del sitio: hoy se ve, así que sigue visible hasta que se oculte.
            $table->boolean('show_panel_link')->default(true)->after('nav_cta');
        });
    }

    public function down(): void
    {
        Schema::table('home_settings', function (Blueprint $table) {
            $table->dropColumn('show_panel_link');
        });
    }
};
