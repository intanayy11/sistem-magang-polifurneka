<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->enum('lokasi_tipe', ['instansi', 'luar'])->default('instansi')->after('status');
            $table->text('keterangan_luar')->nullable()->after('lokasi_tipe');
        });
    }

    public function down(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->dropColumn(['lokasi_tipe', 'keterangan_luar']);
        });
    }
};
