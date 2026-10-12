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

        // ---- MASTER DATA: HARI LIBUR NASIONAL ----
        $hariLiburData = [
            ['tanggal' => '2025-01-01', 'keterangan' => 'Tahun Baru 2025 Masehi'],
            ['tanggal' => '2025-03-31', 'keterangan' => 'Hari Raya Idul Fitri 1446 H'],
            ['tanggal' => '2025-04-01', 'keterangan' => 'Hari Raya Idul Fitri 1446 H'],
            ['tanggal' => '2025-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2025-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2025-08-17', 'keterangan' => 'HUT Kemerdekaan RI Ke-80'],
            ['tanggal' => '2025-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2026-01-01', 'keterangan' => 'Tahun Baru 2026 Masehi'],
            ['tanggal' => '2026-03-20', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-03-21', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2026-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2026-08-17', 'keterangan' => 'HUT Kemerdekaan RI Ke-81'],
            ['tanggal' => '2026-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2027-01-01', 'keterangan' => 'Tahun Baru 2027 Masehi'],
        ];
        foreach ($hariLiburData as $libur) {
            HariLibur::create($libur);
        }

        // ==========================================
        // 3 AKUN DEFAULT UTAMA (README CREDENTIALS)
        // ==========================================

        // 1. ADMIN INSTANSI
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

        // 2. PEMBIMBING LAPANGAN
        $pembimbing = User::create([
            'nama'         => 'Pembimbing Lapangan',
            'email'        => 'pembimbing@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.198501012010011001',
            'jabatan'      => 'Pembimbing Lapangan Magang',
            'no_hp'        => '082100000001',
            'status_aktif' => true,
        ]);

        // 3. PESERTA MAGANG
        $now = Carbon::now();
        $sd  = $now->copy()->startOfMonth()->toDateString();
        $ed  = $now->copy()->addMonths(6)->endOfMonth()->toDateString();

        $peserta = User::create([
            'nama'                   => 'Peserta Magang',
            'email'                  => 'peserta@poltek-furnitur.ac.id',
            'password'               => Hash::make('password123'),
            'role'                   => 'peserta',
            'nim_nis'                => '2310101001',
            'asal_instansi'          => 'Politeknik Industri Furnitur dan Pengolahan Kayu',
            'jurusan'                => 'Teknik Furnitur',
            'posisi_magang'          => 'Divisi Teknologi Informasi',
            'no_hp'                  => '089511111001',
            'tanggal_mulai_magang'   => $sd,
            'tanggal_selesai_magang' => $ed,
            'status_aktif'           => true,
        ]);

        // PLOTTING BIMBINGAN
        PlottingBimbingan::create([
            'peserta_id'    => $peserta->user_id,
            'pembimbing_id' => $pembimbing->user_id,
        ]);

        // ==========================================
        // DATA DUMMY SIMULASI UNTUK BUKU PETUNJUK
        // ==========================================

        // A. PRESENSI MAHASISWA (Dalam Radius Kampus Polifurneka Kendal)
        $lat = config('presensi.polifurneka_lat', -6.929428);
        $lon = config('presensi.polifurneka_lng', 110.256226);
        $alamatKampus = 'Jl. Wanamarta Raya No. 20, Kawasan Industri Kendal, Jawa Tengah';
        $rowsPresensi = [];

        // Rekaman 6 hari kerja ke belakang
        for ($i = 5; $i >= 1; $i--) {
            $d = $now->copy()->subDays($i);
            if (in_array($d->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY])) {
                continue;
            }
            $tgl = $d->toDateString();
            $isTerlambat = ($i === 2); // variasi status Hadir & Terlambat
            $jamIn  = $isTerlambat ? '08:15:00' : '07:50:00';
            $jamOut = '16:05:00';
            $statusPresensi = $isTerlambat ? 'Terlambat' : 'Hadir';

            // Variasi titik GPS realistis 10-25 meter di dalam kawasan kampus
            $latVar = $lat + (($i % 2 === 0) ? 0.00008 : -0.00006);
            $lonVar = $lon + (($i % 3 === 0) ? 0.00007 : -0.00005);

            $rowsPresensi[] = [
                'peserta_id'       => $peserta->user_id,
                'tanggal'          => $tgl,
                'jam_masuk'        => $jamIn,
                'jam_pulang'       => $jamOut,
                'latitude_masuk'   => $latVar,
                'longitude_masuk'  => $lonVar,
                'latitude_pulang'  => $lat,
                'longitude_pulang' => $lon,
                'alamat_masuk'     => $alamatKampus,
                'alamat_pulang'    => $alamatKampus,
                'status'           => $statusPresensi,
                'lokasi_tipe'      => 'instansi',
                'keterangan_luar'  => null,
                'created_at'       => $tgl . ' ' . $jamIn,
                'updated_at'       => $tgl . ' ' . $jamOut,
            ];
        }

        // Presensi Hari Ini (Sudah Masuk / Check-In, belum pulang)
        $todayStr = $now->toDateString();
        $rowsPresensi[] = [
            'peserta_id'       => $peserta->user_id,
            'tanggal'          => $todayStr,
            'jam_masuk'        => '07:48:00',
            'jam_pulang'       => null,
            'latitude_masuk'   => $lat + 0.00005,
            'longitude_masuk'  => $lon + 0.00004,
            'latitude_pulang'  => null,
            'longitude_pulang' => null,
            'alamat_masuk'     => $alamatKampus,
            'alamat_pulang'    => null,
            'status'           => 'Hadir',
            'lokasi_tipe'      => 'instansi',
            'keterangan_luar'  => null,
            'created_at'       => $todayStr . ' 07:48:00',
            'updated_at'       => $todayStr . ' 07:48:00',
        ];

        DB::table('presensi')->insert($rowsPresensi);

        // B. LOGBOOK KEGIATAN (Variasi status: Menunggu, Approve, Revisi)
        $logs = [
            [
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $now->copy()->subDays(4)->toDateString(),
                'judul_kegiatan'     => 'Orientasi Kerja dan Observasi Divisi TI',
                'deskripsi'          => 'Mengikuti pengenalan divisi Teknologi Informasi di Polifurneka, mempelajari struktur infrastruktur jaringan dan server instansi.',
                'kendala'            => 'Penyesuaian dengan konfigurasi local network kampus.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Aktivitas pengenalan sudah tepat. Lanjutkan ke pemahaman sistem kerja harian.',
                'created_at'         => $now->copy()->subDays(4)->setTime(16, 0),
                'updated_at'         => $now->copy()->subDays(4)->setTime(17, 30),
            ],
            [
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $now->copy()->subDays(3)->toDateString(),
                'judul_kegiatan'     => 'Analisis Alur Geofencing dan Presensi GPS',
                'deskripsi'          => 'Melakukan pengujian pengambilan koordinat GPS pada device mobile untuk keperluan batas radius 500 meter di area Polifurneka.',
                'kendala'            => 'Akurasi GPS terkadang fluktuatif di dalam gedung berlantai tinggi.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Analisis bagus. Pastikan penanganan akurasi geolocation menggunakan fallback yang aman.',
                'created_at'         => $now->copy()->subDays(3)->setTime(16, 15),
                'updated_at'         => $now->copy()->subDays(3)->setTime(18, 0),
            ],
            [
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $now->copy()->subDays(2)->toDateString(),
                'judul_kegiatan'     => 'Perancangan Antarmuka Modul Kelola Tugas',
                'deskripsi'          => 'Merancang komponen tabel dan modal peninjauan tugas untuk pembimbing dan peserta magang.',
                'kendala'            => 'Belum melengkapi alur pengunduhan lampiran file hasil tugas.',
                'status'             => 'Revisi',
                'catatan_pembimbing' => 'Tolong tambahkan tombol aksi detail revisi serta preview nama file pengumpulan agar mudah diverifikasi.',
                'created_at'         => $now->copy()->subDays(2)->setTime(16, 20),
                'updated_at'         => $now->copy()->subDays(2)->setTime(17, 45),
            ],
            [
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $now->copy()->subDays(1)->toDateString(),
                'judul_kegiatan'     => 'Penyusunan Dokumentasi Pengujian Sistem SIMONIKA',
                'deskripsi'          => 'Menyusun skenario pengujian fungsional modul presensi, logbook, dan laporan program magang.',
                'kendala'            => 'Menunggu verifikasi kasus uji validasi radius dari pembimbing.',
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
                'created_at'         => $now->copy()->subDays(1)->setTime(16, 30),
                'updated_at'         => $now->copy()->subDays(1)->setTime(16, 30),
            ],
            [
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $todayStr,
                'judul_kegiatan'     => 'Implementasi Final Desain dan Dokumentasi User Manual',
                'deskripsi'          => 'Melakukan penyesuaian tata letak antarmuka aplikasi dan menyiapkan screenshoot untuk panduan penggunaan SIMONIKA.',
                'kendala'            => 'Tidak ada kendala yang berarti.',
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
                'created_at'         => $now->copy()->setTime(11, 0),
                'updated_at'         => $now->copy()->setTime(11, 0),
            ],
        ];
        DB::table('logbook')->insert($logs);

        // C. PENGAJUAN IZIN & SAKIT (Variasi status: Disetujui, Menunggu)
        DB::table('izin')->insert([
            [
                'peserta_id'       => $peserta->user_id,
                'pembimbing_id'    => $pembimbing->user_id,
                'jenis'            => 'Sakit',
                'tanggal_mulai'    => $now->copy()->subDays(8)->toDateString(),
                'tanggal_selesai'  => $now->copy()->subDays(8)->toDateString(),
                'keterangan'       => 'Demam dan radang tenggorokan, telah memeriksakan diri ke dokter klinik dan beristirahat satu hari.',
                'file_bukti'       => 'uploads/izin/surat-dokter-contoh.pdf',
                'status'           => 'Disetujui',
                'created_at'       => $now->copy()->subDays(8)->setTime(8, 0),
                'updated_at'       => $now->copy()->subDays(8)->setTime(9, 30),
            ],
            [
                'peserta_id'       => $peserta->user_id,
                'pembimbing_id'    => $pembimbing->user_id,
                'jenis'            => 'Izin',
                'tanggal_mulai'    => $now->copy()->addDays(3)->toDateString(),
                'tanggal_selesai'  => $now->copy()->addDays(3)->toDateString(),
                'keterangan'       => 'Menghadiri agenda akademik yudisium/seminar proposal di kampus utama Polifurneka Kendal.',
                'file_bukti'       => null,
                'status'           => 'Menunggu',
                'created_at'       => $now->copy()->setTime(9, 0),
                'updated_at'       => $now->copy()->setTime(9, 0),
            ],
        ]);

        // D. KELOLA TUGAS (Variasi status: Selesai, Menunggu Review, Perlu Revisi, Belum Dikerjakan)
        $t1 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Dokumentasi Spesifikasi Kebutuhan Sistem (SRS SIMONIKA)',
            'deskripsi'     => 'Susun dokumen spesifikasi kebutuhan perangkat lunak SIMONIKA yang mencakup use case diagram, fitur geofencing GPS, dan matriks hak akses pengguna.',
            'deadline'      => $now->copy()->subDays(3)->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
            'file_lampiran' => null,
            'status'        => 'Selesai',
            'created_at'    => $now->copy()->subDays(7),
            'updated_at'    => $now->copy()->subDays(2),
        ]);

        $t2 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Desain Prototipe Antarmuka Dashboard Pembimbing',
            'deskripsi'     => 'Buat rancangan mockup UI/UX halaman dashboard pembimbing yang menampilkan grafik presensi, daftar review logbook, dan pintasan verifikasi izin.',
            'deadline'      => $now->copy()->addDays(2)->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
            'file_lampiran' => null,
            'status'        => 'Menunggu Review',
            'created_at'    => $now->copy()->subDays(4),
            'updated_at'    => $now->copy()->subDays(1),
        ]);

        $t3 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Pengujian Geofencing Radius Kampus Polifurneka (500m)',
            'deskripsi'     => 'Lakukan pengujian presensi masuk dan pulang pada batas perimeter radius 500 meter dari titik pusat gedung Polifurneka Kendal.',
            'deadline'      => $now->copy()->addDays(4)->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
            'file_lampiran' => null,
            'status'        => 'Perlu Revisi',
            'created_at'    => $now->copy()->subDays(2),
            'updated_at'    => $now->copy()->subDays(1),
        ]);

        $t4 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Penyusunan Draft Bab IV dan V Laporan Akhir Magang',
            'deskripsi'     => 'Selesaikan draft Bab IV (Implementasi dan Pembahasan) serta Bab V (Kesimpulan dan Saran) untuk penyerahan berkas akhir magang.',
            'deadline'      => $now->copy()->addDays(7)->setTime(23, 59, 59)->format('Y-m-d H:i:s'),
            'file_lampiran' => null,
            'status'        => 'Belum Dikerjakan',
            'created_at'    => $now->copy()->subDays(1),
            'updated_at'    => $now->copy()->subDays(1),
        ]);

        // E. PENGUMPULAN TUGAS (Untuk tugas yang sudah diserahkan peserta)
        DB::table('pengumpulan_tugas')->insert([
            [
                'tugas_id'       => $t1->tugas_id,
                'file_hasil'     => 'uploads/tugas/srs-simonika-v1.pdf',
                'versi_ke'       => 1,
                'catatan_revisi' => 'Dokumen SRS telah disetujui tanpa catatan.',
                'tanggal_submit' => $now->copy()->subDays(4)->setTime(14, 20)->format('Y-m-d H:i:s'),
                'created_at'     => $now->copy()->subDays(4)->setTime(14, 20),
                'updated_at'     => $now->copy()->subDays(2)->setTime(10, 0),
            ],
            [
                'tugas_id'       => $t2->tugas_id,
                'file_hasil'     => 'uploads/tugas/mockup-dashboard-pembimbing.pdf',
                'versi_ke'       => 1,
                'catatan_revisi' => null,
                'tanggal_submit' => $now->copy()->subDays(1)->setTime(16, 45)->format('Y-m-d H:i:s'),
                'created_at'     => $now->copy()->subDays(1)->setTime(16, 45),
                'updated_at'     => $now->copy()->subDays(1)->setTime(16, 45),
            ],
            [
                'tugas_id'       => $t3->tugas_id,
                'file_hasil'     => 'uploads/tugas/laporan-pengujian-geofence-v1.pdf',
                'versi_ke'       => 1,
                'catatan_revisi' => 'Mohon sertakan tangkapan layar peta GPS pada saat pengujian posisi berada tepat di tepi lingkaran 500 meter.',
                'tanggal_submit' => $now->copy()->subDays(1)->setTime(11, 10)->format('Y-m-d H:i:s'),
                'created_at'     => $now->copy()->subDays(1)->setTime(11, 10),
                'updated_at'     => $now->copy()->subDays(1)->setTime(15, 30),
            ],
        ]);
    }
}
