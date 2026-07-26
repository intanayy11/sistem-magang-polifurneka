<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PlottingBimbingan;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin
        $admin = User::create([
            'nama' => 'Administrator Sistem',
            'email' => 'admin@polifurneka.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'nim_nis' => 'ADM-001',
            'no_hp' => '081234567890',
            'status_aktif' => true,
        ]);

        // 2. Pembimbing Lapangan
        $pembimbing = User::create([
            'nama' => 'Budi Santoso, S.T., M.Eng.',
            'email' => 'pembimbing@polifurneka.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'pembimbing',
            'nim_nis' => 'NIP.198503152010121001',
            'no_hp' => '082198765432',
            'status_aktif' => true,
        ]);

        // 3. Peserta Magang
        $peserta = User::create([
            'nama' => 'Ahmad Rizky (Unsoed Informatika)',
            'email' => 'peserta@polifurneka.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'peserta',
            'nim_nis' => 'H1D022045',
            'no_hp' => '085712345678',
            'status_aktif' => true,
        ]);

        // 4. Plotting Bimbingan
        PlottingBimbingan::create([
            'peserta_id' => $peserta->user_id,
            'pembimbing_id' => $pembimbing->user_id,
            'tanggal_mulai' => Carbon::now()->subMonth()->toDateString(),
            'tanggal_selesai' => Carbon::now()->addMonths(2)->toDateString(),
        ]);
    }
}
