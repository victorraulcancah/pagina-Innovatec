<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Términos y condiciones y políticas: cada documento es un elemento de la lista «legal_doc», con su texto y un PDF
     * opcional. Se crean los dos habituales vacíos (el texto legal lo escribe la empresa en el panel).
     */
    public function up(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('image_path');
        });

        if (DB::table('section_items')->where('section', 'legal_doc')->exists()) {
            return;
        }

        foreach (['Términos y Condiciones', 'Política de Privacidad'] as $sort => $title) {
            DB::table('section_items')->insert([
                'section' => 'legal_doc',
                'title' => $title,
                'sort' => $sort,
                'visible' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('section_items')->where('section', 'legal_doc')->delete();

        Schema::table('section_items', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
};
