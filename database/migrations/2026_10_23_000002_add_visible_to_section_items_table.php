<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            // Mostrar u ocultar un elemento sin borrarlo (hoy lo usan Soluciones y Servicios profesionales).
            $table->boolean('visible')->default(true)->after('sort');
        });
    }

    public function down(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->dropColumn('visible');
        });
    }
};
