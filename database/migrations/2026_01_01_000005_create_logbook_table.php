<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbook', function (Blueprint $table) {
            $table->id('logbook_id');
            $table->foreignId('peserta_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('judul_kegiatan');
            $table->text('deskripsi');
            $table->text('kendala')->nullable();
            $table->string('foto_bukti')->nullable();
            $table->enum('status', ['Menunggu', 'Approve', 'Revisi'])->default('Menunggu');
            $table->text('catatan_pembimbing')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbook');
    }
};
