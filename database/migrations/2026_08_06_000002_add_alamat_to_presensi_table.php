<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->text('alamat_masuk')->nullable()->after('longitude_masuk');
            $table->text('alamat_pulang')->nullable()->after('longitude_pulang');
        });
    }

    public function down(): void
    {
        Schema::table('presensi', function (Blueprint $table) {
            $table->dropColumn(['alamat_masuk', 'alamat_pulang']);
        });
    }
};
