<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('home_settings', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name')->default('PROINNOVATEC');
            $table->string('logo_path')->nullable();
            $table->string('video_path')->nullable();
            $table->string('poster_path')->nullable();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->json('buttons');
            $table->json('menu');
            $table->json('nav_cta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_settings');
    }
};
