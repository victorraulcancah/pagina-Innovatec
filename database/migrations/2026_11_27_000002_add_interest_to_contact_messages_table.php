<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Qué le interesa a quien escribe (Networking, Ciberseguridad...): el mismo dato que pide el formulario de Zoho CRM. */
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->string('interest', 60)->nullable()->after('company');
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn('interest');
        });
    }
};
