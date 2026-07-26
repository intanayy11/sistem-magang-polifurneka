<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengumpulan_tugas', function (Blueprint $table) {
            $table->id('pengumpulan_id');
            $table->foreignId('tugas_id')->constrained('tugas', 'tugas_id')->onDelete('cascade');
            $table->text('file_hasil');
            $table->integer('versi_ke')->default(1);
            $table->text('catatan_revisi')->nullable();
            $table->dateTime('tanggal_submit');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengumpulan_tugas');
    }
};
