<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('section');
            $table->json('gallery')->nullable();
        });

        Schema::table('home_settings', function (Blueprint $table) {
            $table->json('page_images')->nullable();
        });

        // La imagen de fondo de Experiencia pasa al mapa de imágenes por página.
        DB::table('home_settings')->whereNotNull('experience_bg_path')->get()->each(function ($row) {
            DB::table('home_settings')->where('id', $row->id)->update([
                'page_images' => json_encode(['experiencia' => $row->experience_bg_path]),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('section_items', function (Blueprint $table) {
            $table->dropColumn(['slug', 'gallery']);
        });

        Schema::table('home_settings', function (Blueprint $table) {
            $table->dropColumn('page_images');
        });
    }
};
