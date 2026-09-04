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
        // 1. Index pada tabel logbook
        Schema::table('logbook', function (Blueprint $table) {
            $table->index(['peserta_id', 'tanggal'], 'idx_logbook_peserta_tanggal');
            $table->index('status', 'idx_logbook_status');
        });

        // 2. Index pada tabel izin
        Schema::table('izin', function (Blueprint $table) {
            $table->index(['peserta_id', 'status'], 'idx_izin_peserta_status');
            $table->index(['tanggal_mulai', 'tanggal_selesai'], 'idx_izin_rentang_tanggal');
        });

        // 3. Index pada tabel tugas
        Schema::table('tugas', function (Blueprint $table) {
            $table->index(['peserta_id', 'deadline'], 'idx_tugas_peserta_deadline');
            $table->index('pembimbing_id', 'idx_tugas_pembimbing');
        });

        // 4. Index pada tabel plotting_bimbingan
        Schema::table('plotting_bimbingan', function (Blueprint $table) {
            $table->index(['pembimbing_id', 'peserta_id'], 'idx_plotting_pembimbing_peserta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logbook', function (Blueprint $table) {
            $table->dropIndex('idx_logbook_peserta_tanggal');
            $table->dropIndex('idx_logbook_status');
        });

        Schema::table('izin', function (Blueprint $table) {
            $table->dropIndex('idx_izin_peserta_status');
            $table->dropIndex('idx_izin_rentang_tanggal');
        });

        Schema::table('tugas', function (Blueprint $table) {
            $table->dropIndex('idx_tugas_peserta_deadline');
            $table->dropIndex('idx_tugas_pembimbing');
        });

        Schema::table('plotting_bimbingan', function (Blueprint $table) {
            $table->dropIndex('idx_plotting_pembimbing_peserta');
        });
    }
};
