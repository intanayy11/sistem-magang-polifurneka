<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('jurusan')->nullable()->after('asal_instansi');
            $table->string('posisi_magang')->nullable()->after('jurusan');
            $table->string('jabatan')->nullable()->after('posisi_magang');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['jurusan', 'posisi_magang', 'jabatan']);
        });
    }
};
