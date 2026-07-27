<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plotting_bimbingan', function (Blueprint $table) {
            $table->id('plotting_id');
            $table->foreignId('peserta_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->foreignId('pembimbing_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plotting_bimbingan');
    }
};
