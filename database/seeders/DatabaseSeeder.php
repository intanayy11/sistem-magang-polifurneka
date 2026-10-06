<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PlottingBimbingan;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use App\Models\HariLibur;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

     class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        PlottingBimbingan::truncate();
        Presensi::truncate();
        DB::table('izin')->truncate();
        Logbook::truncate();
        Tugas::truncate();
        DB::table('pengumpulan_tugas')->truncate();
        HariLibur::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $hariLiburData = [
            ['tanggal' => '2025-01-01', 'keterangan' => 'Tahun Baru 2025 Masehi'],
            ['tanggal' => '2025-01-27', 'keterangan' => 'Isra Mikraj Nabi Muhammad SAW'],
            ['tanggal' => '2025-01-29', 'keterangan' => 'Tahun Baru Imlek 2576 Kongzili'],
            ['tanggal' => '2025-03-29', 'keterangan' => 'Hari Suci Nyepi'],
            ['tanggal' => '2025-03-31', 'keterangan' => 'Hari Raya Idul Fitri 1446 H'],
            ['tanggal' => '2025-04-01', 'keterangan' => 'Hari Raya Idul Fitri 1446 H'],
            ['tanggal' => '2025-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2025-05-29', 'keterangan' => 'Kenaikan Yesus Kristus'],
            ['tanggal' => '2025-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2025-06-06', 'keterangan' => 'Hari Raya Idul Adha 1446 H'],
            ['tanggal' => '2025-08-17', 'keterangan' => 'HUT Kemerdekaan RI Ke-80'],
            ['tanggal' => '2025-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2026-01-01', 'keterangan' => 'Tahun Baru 2026 Masehi'],
            ['tanggal' => '2026-01-16', 'keterangan' => 'Isra Mikraj Nabi Muhammad SAW'],
            ['tanggal' => '2026-02-17', 'keterangan' => 'Tahun Baru Imlek 2577 Kongzili'],
            ['tanggal' => '2026-03-19', 'keterangan' => 'Hari Suci Nyepi'],
            ['tanggal' => '2026-03-20', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-03-21', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2026-05-14', 'keterangan' => 'Kenaikan Yesus Kristus'],
            ['tanggal' => '2026-05-27', 'keterangan' => 'Hari Raya Idul Adha 1447 H'],
            ['tanggal' => '2026-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2026-08-17', 'keterangan' => 'HUT Kemerdekaan RI Ke-81'],
            ['tanggal' => '2026-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2027-01-01', 'keterangan' => 'Tahun Baru 2027 Masehi'],
            ['tanggal' => '2027-02-06', 'keterangan' => 'Tahun Baru Imlek 2578 Kongzili'],
            ['tanggal' => '2027-03-09', 'keterangan' => 'Hari Raya Idul Fitri 1448 H'],
            ['tanggal' => '2027-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2027-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2027-08-17', 'keterangan' => 'HUT Kemerdekaan RI Ke-82'],
            ['tanggal' => '2027-12-25', 'keterangan' => 'Hari Raya Natal'],
        ];

        foreach ($hariLiburData as $libur) {
            HariLibur::create($libur);
        }

        User::create([
            'nama'         => 'Administrator Sistem',
            'email'        => 'admin@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'admin',
            'nim_nis'      => 'ADM-001',
            'jabatan'      => 'Pengelola Sistem SIMONIKA',
            'no_hp'        => '081234567890',
            'status_aktif' => true,
        ]);

        $pembimbing = User::create([
            'nama'         => 'Pembimbing Lapangan',
            'email'        => 'pembimbing@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.000000000000000001',
            'jabatan'      => 'Pembimbing Lapangan Magang',
            'no_hp'        => '082100000001',
            'status_aktif' => true,
        ]);

        $startDate = Carbon::now()->startOfMonth()->toDateString();
        $endDate   = Carbon::now()->addMonths(3)->endOfMonth()->toDateString();

        $peserta = User::create([
            'nama'                   => 'Peserta Magang',
            'email'                  => 'peserta@poltek-furnitur.ac.id',
            'password'               => Hash::make('password123'),
            'role'                   => 'peserta',
            'nim_nis'                => '000000001',
            'asal_instansi'          => '-',
            'jurusan'                => '-',
            'posisi_magang'          => '-',
            'no_hp'                  => '083100000001',
            'tanggal_mulai_magang'   => $startDate,
            'tanggal_selesai_magang' => $endDate,
            'status_aktif'           => true,
        ]);

        PlottingBimbingan::create([
            'peserta_id'    => $peserta->user_id,
            'pembimbing_id' => $pembimbing->user_id,
        ]);
    }
}

