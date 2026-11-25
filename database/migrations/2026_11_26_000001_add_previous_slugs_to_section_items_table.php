<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Direcciones anteriores de una solución o servicio: redirigen a la actual cuando cambia el título. */
    public function up(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->json('previous_slugs')->nullable()->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->dropColumn('previous_slugs');
        });
    }
};
