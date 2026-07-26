<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id('tugas_id');
            $table->foreignId('pembimbing_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('peserta_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->dateTime('deadline');
            $table->string('file_lampiran')->nullable();
            $table->enum('status', ['Belum Dikerjakan', 'Menunggu Review', 'Perlu Revisi', 'Selesai'])->default('Belum Dikerjakan');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
