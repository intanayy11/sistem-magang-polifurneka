<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PlottingBimbingan;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with comprehensive dummy data
     * covering all features: presensi, izin, logbook, tugas, pengumpulan.
     */
    public function run(): void
    {
        // ── 1. ADMIN ──────────────────────────────────────────────────────
        $admin = User::create([
            'nama'          => 'Administrator Sistem',
            'email'         => 'admin@polifurneka.ac.id',
            'password'      => Hash::make('password123'),
            'role'          => 'admin',
            'nim_nis'       => 'ADM-001',
            'no_hp'         => '081234567890',
            'status_aktif'  => true,
        ]);

        // ── 2. PEMBIMBING LAPANGAN ─────────────────────────────────────────
        $pembimbing = User::create([
            'nama'         => 'Budi Santoso, S.T., M.Eng.',
            'email'        => 'pembimbing@polifurneka.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.198503152010121001',
            'no_hp'        => '082198765432',
            'status_aktif' => true,
        ]);

        // ── 3. PESERTA MAGANG ──────────────────────────────────────────────
        $peserta = User::create([
            'nama'                    => 'Ahmad Rizky',
            'email'                   => 'peserta@polifurneka.ac.id',
            'password'                => Hash::make('password123'),
            'role'                    => 'peserta',
            'nim_nis'                 => 'H1D022045',
            'asal_instansi'           => 'Universitas Jenderal Soedirman',
            'no_hp'                   => '085712345678',
            'tanggal_mulai_magang'    => Carbon::now()->subMonths(2)->toDateString(),
            'tanggal_selesai_magang'  => Carbon::now()->addMonth()->toDateString(),
            'status_aktif'            => true,
        ]);

        // ── 4. PLOTTING BIMBINGAN ──────────────────────────────────────────
        PlottingBimbingan::create([
            'peserta_id'   => $peserta->user_id,
            'pembimbing_id' => $pembimbing->user_id,
        ]);

        // ── 5. PRESENSI (5 minggu ke belakang, Senin–Jumat) ───────────────
        // Kita buat presensi untuk 25 hari kerja (5 minggu x 5 hari)
        // dengan variasi status: Hadir, Terlambat, Pulang Cepat
        $presensiData = [
            // Minggu ke-5 lalu
            ['minus_days' => 32, 'masuk' => '07:25:00', 'pulang' => '16:05:00', 'status' => 'Hadir'],
            ['minus_days' => 31, 'masuk' => '07:20:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 30, 'masuk' => '07:55:00', 'pulang' => '16:00:00', 'status' => 'Terlambat'],
            ['minus_days' => 29, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 28, 'masuk' => '07:28:00', 'pulang' => '16:35:00', 'status' => 'Hadir'],
            // Minggu ke-4 lalu
            ['minus_days' => 25, 'masuk' => '07:45:00', 'pulang' => '16:00:00', 'status' => 'Terlambat'],
            ['minus_days' => 24, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 23, 'masuk' => '07:29:00', 'pulang' => '15:45:00', 'status' => 'Pulang Cepat'],
            ['minus_days' => 22, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 21, 'masuk' => '07:30:00', 'pulang' => '16:31:00', 'status' => 'Hadir'],
            // Minggu ke-3 lalu
            ['minus_days' => 18, 'masuk' => '08:00:00', 'pulang' => '16:00:00', 'status' => 'Terlambat'],
            ['minus_days' => 17, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 16, 'masuk' => '07:25:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            // Kamis: izin (skip presensi → akan tercatat dari izin)
            ['minus_days' => 14, 'masuk' => '07:30:00', 'pulang' => '16:30:00', 'status' => 'Hadir'],
            // Minggu ke-2 lalu
            ['minus_days' => 11, 'masuk' => '07:47:00', 'pulang' => '16:00:00', 'status' => 'Terlambat'],
            ['minus_days' => 10, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 9,  'masuk' => '07:22:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 8,  'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 7,  'masuk' => '07:28:00', 'pulang' => '16:32:00', 'status' => 'Hadir'],
            // Minggu lalu (Senin–Jumat)
            ['minus_days' => 4, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 3, 'masuk' => '07:55:00', 'pulang' => '16:00:00', 'status' => 'Terlambat'],
            ['minus_days' => 2, 'masuk' => '07:30:00', 'pulang' => '16:00:00', 'status' => 'Hadir'],
            ['minus_days' => 1, 'masuk' => '07:40:00', 'pulang' => '16:02:00', 'status' => 'Terlambat'],
        ];

        foreach ($presensiData as $row) {
            $tanggal = Carbon::now()->subDays($row['minus_days'])->toDateString();
            // Skip jika weekend (just in case offset hits Saturday/Sunday)
            $dayOfWeek = Carbon::parse($tanggal)->dayOfWeek;
            if ($dayOfWeek === 0 || $dayOfWeek === 6) continue;

            Presensi::insertOrIgnore([[
                'peserta_id'        => $peserta->user_id,
                'tanggal'           => $tanggal,
                'jam_masuk'         => $row['masuk'],
                'jam_pulang'        => $row['pulang'],
                'latitude_masuk'    => -6.958742,
                'longitude_masuk'   => 110.285810,
                'latitude_pulang'   => -6.958742,
                'longitude_pulang'  => 110.285810,
                'status'            => $row['status'],
                'created_at'        => now(),
                'updated_at'        => now(),
            ]]);
        }

        // ── 6. IZIN ────────────────────────────────────────────────────────
        // Izin Sakit – Disetujui (3 minggu lalu)
        DB::table('izin')->insert([
            'peserta_id'      => $peserta->user_id,
            'jenis'           => 'Sakit',
            'tanggal_mulai'   => Carbon::now()->subDays(15)->toDateString(),
            'tanggal_selesai' => Carbon::now()->subDays(15)->toDateString(),
            'keterangan'      => 'Demam dan tidak bisa hadir ke tempat magang.',
            'file_bukti'      => null,
            'status'          => 'Disetujui',
            'pembimbing_id'   => $pembimbing->user_id,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // Izin Keperluan – Menunggu (minggu lalu)
        DB::table('izin')->insert([
            'peserta_id'      => $peserta->user_id,
            'jenis'           => 'Izin',
            'tanggal_mulai'   => Carbon::now()->subDays(5)->toDateString(),
            'tanggal_selesai' => Carbon::now()->subDays(5)->toDateString(),
            'keterangan'      => 'Ada keperluan keluarga yang tidak bisa ditinggal.',
            'file_bukti'      => null,
            'status'          => 'Menunggu',
            'pembimbing_id'   => null,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // Izin Ditolak
        DB::table('izin')->insert([
            'peserta_id'      => $peserta->user_id,
            'jenis'           => 'Izin',
            'tanggal_mulai'   => Carbon::now()->subDays(20)->toDateString(),
            'tanggal_selesai' => Carbon::now()->subDays(20)->toDateString(),
            'keterangan'      => 'Acara kampus.',
            'file_bukti'      => null,
            'status'          => 'Ditolak',
            'pembimbing_id'   => $pembimbing->user_id,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // ── 7. LOGBOOK ─────────────────────────────────────────────────────
        $logbookData = [
            [
                'minus_days'         => 32,
                'judul'              => 'Orientasi & Pengenalan Lingkungan Produksi',
                'deskripsi'          => "Hari pertama magang diisi dengan orientasi lingkungan kerja di divisi produksi furnitur.\nMengenal proses produksi dari bahan baku kayu hingga produk jadi.\nDiperkenalkan kepada tim pembimbing lapangan dan seluruh operator mesin.",
                'kendala'            => 'Belum familiar dengan alur kerja dan tata letak ruang produksi.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Bagus, semangat belajar terlihat. Perhatikan keselamatan kerja ya.',
            ],
            [
                'minus_days'         => 31,
                'judul'              => 'Pembelajaran Teknik Pemotongan Kayu CNC',
                'deskripsi'          => "Mengikuti pelatihan dasar pengoperasian mesin CNC Router untuk pemotongan kayu.\nMempelajari cara membaca G-code sederhana dan setting material di mesin.\nMencoba mensimulasikan pemotongan dasar dengan pengawasan operator senior.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Progres memuaskan. Lanjutkan dengan mempelajari lebih dalam parameter cutting.',
            ],
            [
                'minus_days'         => 30,
                'judul'              => 'Perancangan Desain Lemari Minimalis di AutoCAD',
                'deskripsi'          => "Mendapat tugas merancang desain lemari 2 pintu model minimalis menggunakan AutoCAD 2D.\nMembuat denah dan tampak depan, samping, atas sesuai spesifikasi yang diberikan pembimbing.\nRevisi desain sebanyak 2 kali setelah konsultasi.",
                'kendala'            => 'Kesulitan menentukan skala yang tepat untuk detail sambungan kayu.',
                'status'             => 'Approve',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 29,
                'judul'              => 'Proses Finishing dan Pengecatan Produk Kursi',
                'deskripsi'          => "Membantu proses finishing produk kursi makan seri K-204.\nMelakukan amplas manual pada permukaan kayu sebelum pengecatan.\nMenerapkan cat dasar (primer) dan top coat menggunakan spray gun.",
                'kendala'            => 'Hasil semprotan tidak merata pada area sudut karena tekanan angin yang kurang stabil.',
                'status'             => 'Revisi',
                'catatan_pembimbing' => 'Tolong perbaiki penjelasan teknik finishing yang digunakan. Sertakan jenis cat yang dipakai.',
            ],
            [
                'minus_days'         => 28,
                'judul'              => 'Studi Mesin Bubut Kayu & Pembuatan Kaki Meja',
                'deskripsi'          => "Mempelajari cara kerja mesin bubut kayu untuk membuat kaki meja bundar.\nMembuat 4 kaki meja dari kayu mahoni dengan diameter 5cm dan panjang 70cm.\nMenggunakan pahat set untuk membentuk profil dekoratif pada kaki meja.",
                'kendala'            => null,
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 25,
                'judul'              => 'Pengukuran & QC Produk Sebelum Packing',
                'deskripsi'          => "Membantu tim Quality Control melakukan pengukuran dimensi produk sebelum dikemas.\nMenggunakan jangka sorong dan meteran untuk verifikasi ukuran sesuai spesifikasi.\nMencatat hasil pengukuran pada form QC dan melaporkan 2 produk yang tidak sesuai toleransi.",
                'kendala'            => 'Beberapa produk memiliki selisih dimensi di luar toleransi ±1mm sehingga perlu dilaporkan.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Teliti dan sistematis. Pertahankan ketelitian ini.',
            ],
            [
                'minus_days'         => 24,
                'judul'              => 'Dokumentasi SOP Mesin Amplas Belt Sander',
                'deskripsi'          => "Mendapat tugas mendokumentasikan SOP penggunaan mesin belt sander.\nMewawancarai operator senior untuk mendapat informasi teknis yang akurat.\nMembuat draft dokumentasi dalam format Word disertai foto langkah kerja.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Dokumentasi sangat lengkap dan rapi. Terima kasih.',
            ],
            [
                'minus_days'         => 23,
                'judul'              => 'Perakitan Rak Buku Knock-Down Model RB-12',
                'deskripsi'          => "Melakukan perakitan rak buku model knock-down sesuai panduan assembly.\nMemasang dowel, cam lock, dan baut sesuai urutan yang benar.\nMenyelesaikan 3 unit rak buku dalam 1 hari kerja.",
                'kendala'            => 'Salah satu lubang dowel tidak presisi sehingga perlu dibor ulang.',
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 22,
                'judul'              => 'Analisis Kebutuhan Bahan Baku Produksi Mingguan',
                'deskripsi'          => "Membantu staf gudang melakukan perhitungan kebutuhan bahan baku untuk produksi minggu depan.\nMenggunakan BOM (Bill of Materials) untuk menghitung estimasi kayu, hardware, dan cat.\nMembuat laporan kebutuhan bahan dalam format spreadsheet Excel.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 21,
                'judul'              => 'Penerapan Teknik Dovetail Joint pada Laci',
                'deskripsi'          => "Belajar dan mempraktikkan teknik sambungan dovetail secara manual menggunakan gergaji dan pahat.\nMembuat laci kecil ukuran 30x20x15cm dengan sambungan dovetail di kedua sisi.\nHasil sambungan cukup rapat meski masih perlu latihan lebih lanjut.",
                'kendala'            => 'Presisi masih kurang – celah antar sambungan sekitar 0.5mm.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Teknik dovetail membutuhkan banyak latihan. Sudah bagus untuk pemula.',
            ],
            [
                'minus_days'         => 18,
                'judul'              => 'Observasi Proses Pengeringan Kayu (Kiln Drying)',
                'deskripsi'          => "Mengikuti tur ke ruang kiln drying untuk memahami proses pengeringan kayu.\nMencatat parameter suhu, kelembaban, dan durasi yang digunakan untuk berbagai jenis kayu.\nMembuat rangkuman proses dalam bentuk laporan singkat.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Rangkuman laporan sangat informatif.',
            ],
            [
                'minus_days'         => 17,
                'judul'              => 'Pembuatan Gambar Kerja Meja Kantor di SketchUp',
                'deskripsi'          => "Membuat model 3D meja kantor seri D-08 menggunakan SketchUp Pro.\nMenambahkan detail material, dimensi, dan anotasi sesuai arahan pembimbing.\nMengekspor gambar kerja dalam format PDF untuk keperluan produksi.",
                'kendala'            => 'Fitur LayOut pada SketchUp belum dikuasai sepenuhnya sehingga butuh waktu lebih lama.',
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 16,
                'judul'              => 'Inventarisasi Peralatan Hand Tool di Bengkel',
                'deskripsi'          => "Melakukan inventarisasi seluruh peralatan hand tool (palu, gergaji, pahat, dll) di bengkel produksi.\nMencatat kondisi tiap alat dan menandai yang memerlukan perbaikan atau penggantian.\nMenyusun laporan inventaris dalam format tabel.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 14,
                'judul'              => 'Presentasi Progres Magang Minggu ke-4',
                'deskripsi'          => "Mempresentasikan progres magang minggu ke-4 kepada pembimbing lapangan.\nMenyampaikan pencapaian, kendala yang dihadapi, dan rencana kerja minggu depan.\nMendapat masukan untuk meningkatkan ketelitian dalam dokumentasi teknis.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Presentasi baik. Terus tingkatkan dokumentasi teknis ya.',
            ],
            [
                'minus_days'         => 11,
                'judul'              => 'Pembuatan Prototype Kursi Ergonomis',
                'deskripsi'          => "Mulai mengerjakan prototype kursi ergonomis sebagai proyek akhir magang.\nMembuat rangka dasar dari kayu jati menggunakan mesin mortiser dan tenon.\nMelakukan fitting awal untuk memastikan dimensi sesuai desain.",
                'kendala'            => 'Kayu jati lebih keras dari perkiraan sehingga pemotongan membutuhkan waktu lebih lama.',
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Semangat untuk proyek akhir! Konsultasikan jika ada kesulitan.',
            ],
            [
                'minus_days'         => 10,
                'judul'              => 'Lanjutan Prototype – Pembuatan Sandaran & Dudukan',
                'deskripsi'          => "Melanjutkan pembuatan prototype kursi ergonomis – bagian sandaran dan dudukan.\nMembuat rangka sandaran dari kayu jati dengan sudut kemiringan 15 derajat.\nMempelajari cara pemasangan busa dan kain oscar sebagai pelapis dudukan.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 9,
                'judul'              => 'Finishing Prototype & Uji Beban Kursi Ergonomis',
                'deskripsi'          => "Menyelesaikan finishing prototype kursi ergonomis dengan teknik wood stain + clear gloss.\nMelakukan uji beban sederhana dengan beban 100kg selama 30 menit – tidak ada deformasi.\nMendokumentasikan hasil prototype dalam foto dan video.",
                'kendala'            => 'Warna stain sedikit tidak merata pada bagian bawah dudukan.',
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 8,
                'judul'              => 'Penyusunan Laporan Teknis Proyek Akhir Magang',
                'deskripsi'          => "Mulai menyusun laporan teknis proyek akhir magang.\nMenulis bab pendahuluan, landasan teori desain furnitur ergonomis, dan metodologi.\nMengumpulkan semua dokumentasi foto dan data pengukuran yang telah dibuat.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Laporan awal sudah terstruktur dengan baik.',
            ],
            [
                'minus_days'         => 7,
                'judul'              => 'Lanjutan Laporan – Bab Hasil & Pembahasan',
                'deskripsi'          => "Melanjutkan penulisan laporan – bab hasil dan pembahasan.\nMenyajikan data pengukuran, foto proses, dan analisis perbandingan desain awal vs hasil akhir.\nRevisi draft laporan setelah review dari pembimbing.",
                'kendala'            => null,
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 4,
                'judul'              => 'Revisi Laporan & Persiapan Presentasi Akhir',
                'deskripsi'          => "Melakukan revisi laporan sesuai catatan pembimbing.\nMenyiapkan materi presentasi akhir dalam format PowerPoint.\nLatihan presentasi dengan teman sesama peserta magang.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Revisi sudah sesuai. Siap untuk presentasi akhir.',
            ],
            [
                'minus_days'         => 3,
                'judul'              => 'Pengumpulan Seluruh Dokumentasi Magang',
                'deskripsi'          => "Mengumpulkan seluruh dokumentasi yang dibutuhkan untuk penyelesaian magang:\n- Logbook harian lengkap\n- Laporan teknis proyek akhir\n- Foto dan video dokumentasi kegiatan\n- Sertifikat kehadiran dari perusahaan",
                'kendala'            => null,
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
            [
                'minus_days'         => 2,
                'judul'              => 'Presentasi Akhir Magang di Hadapan Manajemen',
                'deskripsi'          => "Melaksanakan presentasi akhir magang di hadapan tim manajemen dan pembimbing lapangan.\nMempresentasikan seluruh hasil kerja dan prototype kursi ergonomis.\nMendapat penilaian sangat baik dan saran pengembangan dari manajemen.",
                'kendala'            => null,
                'status'             => 'Approve',
                'catatan_pembimbing' => 'Presentasi sangat memuaskan. Selamat menyelesaikan magang!',
            ],
            [
                'minus_days'         => 1,
                'judul'              => 'Hari Terakhir Magang – Perpisahan & Serah Terima',
                'deskripsi'          => "Hari terakhir pelaksanaan magang di Polifurneka Kendal.\nMelakukan serah terima hasil kerja dan prototype kepada perusahaan.\nBerpamitan dengan seluruh tim dan menerima sertifikat magang resmi.",
                'kendala'            => null,
                'status'             => 'Menunggu',
                'catatan_pembimbing' => null,
            ],
        ];

        foreach ($logbookData as $row) {
            $tanggal = Carbon::now()->subDays($row['minus_days'])->toDateString();
            // Skip weekends
            $dayOfWeek = Carbon::parse($tanggal)->dayOfWeek;
            if ($dayOfWeek === 0 || $dayOfWeek === 6) continue;

            Logbook::create([
                'peserta_id'         => $peserta->user_id,
                'tanggal'            => $tanggal,
                'judul_kegiatan'     => $row['judul'],
                'deskripsi'          => $row['deskripsi'],
                'kendala'            => $row['kendala'],
                'foto_bukti'         => null,
                'status'             => $row['status'],
                'catatan_pembimbing' => $row['catatan_pembimbing'],
            ]);
        }

        // ── 8. TUGAS & PENGUMPULAN ─────────────────────────────────────────

        // Tugas 1: Selesai (sudah ada riwayat pengumpulan + revisi)
        $tugas1 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Laporan Observasi Proses Produksi Furnitur',
            'deskripsi'     => 'Buat laporan observasi minimum 5 halaman A4 yang mencakup: alur proses produksi furnitur dari bahan baku hingga produk jadi, identifikasi mesin-mesin utama yang digunakan beserta fungsinya, dan foto dokumentasi tiap tahapan proses. Format PDF.',
            'deadline'      => Carbon::now()->subDays(20)->toDateString() . ' 16:00:00',
            'file_lampiran' => null,
            'status'        => 'Selesai',
        ]);
        DB::table('pengumpulan_tugas')->insert([
            'tugas_id'       => $tugas1->tugas_id,
            'file_hasil'     => 'https://drive.google.com/file/d/dummy-laporan-observasi',
            'versi_ke'       => 1,
            'catatan_revisi' => 'Bagian identifikasi mesin kurang lengkap. Tambahkan mesin mortiser dan belt sander.',
            'tanggal_submit' => Carbon::now()->subDays(22)->toDateString() . ' 14:30:00',
            'created_at'     => now(), 'updated_at' => now(),
        ]);
        DB::table('pengumpulan_tugas')->insert([
            'tugas_id'       => $tugas1->tugas_id,
            'file_hasil'     => 'https://drive.google.com/file/d/dummy-laporan-observasi-v2',
            'versi_ke'       => 2,
            'catatan_revisi' => null,
            'tanggal_submit' => Carbon::now()->subDays(21)->toDateString() . ' 09:15:00',
            'created_at'     => now(), 'updated_at' => now(),
        ]);

        // Tugas 2: Perlu Revisi
        $tugas2 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Gambar Teknik Rak Buku Model RB-12',
            'deskripsi'     => 'Buat gambar teknik lengkap (tampak depan, samping, atas, isometri) untuk rak buku model RB-12 menggunakan AutoCAD atau SketchUp. Sertakan dimensi detail dan BOM (Bill of Materials). Ekspor dalam format PDF ukuran A3.',
            'deadline'      => Carbon::now()->subDays(7)->toDateString() . ' 16:00:00',
            'file_lampiran' => null,
            'status'        => 'Perlu Revisi',
        ]);
        DB::table('pengumpulan_tugas')->insert([
            'tugas_id'       => $tugas2->tugas_id,
            'file_hasil'     => 'https://drive.google.com/file/d/dummy-gambar-teknik-rb12',
            'versi_ke'       => 1,
            'catatan_revisi' => 'BOM tidak lengkap – hardware (engsel, sekrup, cam lock) belum tercantum. Dimensi pada tampak atas juga ada yang salah. Harap diperbaiki.',
            'tanggal_submit' => Carbon::now()->subDays(8)->toDateString() . ' 15:45:00',
            'created_at'     => now(), 'updated_at' => now(),
        ]);

        // Tugas 3: Menunggu Review
        $tugas3 = Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Dokumentasi SOP Mesin CNC Router',
            'deskripsi'     => 'Buat dokumentasi SOP (Standard Operating Procedure) pengoperasian mesin CNC Router yang ada di bengkel produksi. Harus mencakup: langkah persiapan, prosedur operasi, langkah perawatan harian, dan prosedur keselamatan kerja. Format Word + PDF, minimum 8 halaman.',
            'deadline'      => Carbon::now()->addDays(3)->toDateString() . ' 16:00:00',
            'file_lampiran' => null,
            'status'        => 'Menunggu Review',
        ]);
        DB::table('pengumpulan_tugas')->insert([
            'tugas_id'       => $tugas3->tugas_id,
            'file_hasil'     => 'https://docs.google.com/document/d/dummy-sop-cnc',
            'versi_ke'       => 1,
            'catatan_revisi' => null,
            'tanggal_submit' => Carbon::now()->subDays(1)->toDateString() . ' 10:00:00',
            'created_at'     => now(), 'updated_at' => now(),
        ]);

        // Tugas 4: Belum Dikerjakan (deadline masih jauh)
        Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Laporan Teknis Proyek Akhir Magang',
            'deskripsi'     => 'Susun laporan teknis akhir magang yang mencakup seluruh kegiatan selama periode magang. Format mengikuti template dari kampus. Minimum 30 halaman isi (tidak termasuk lampiran). Kumpulkan dalam format PDF.',
            'deadline'      => Carbon::now()->addDays(14)->toDateString() . ' 16:00:00',
            'file_lampiran' => null,
            'status'        => 'Belum Dikerjakan',
        ]);

        // Tugas 5: Belum Dikerjakan
        Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id'    => $peserta->user_id,
            'judul'         => 'Video Dokumentasi Proses Pembuatan Prototype Kursi',
            'deskripsi'     => 'Buat video dokumentasi singkat (5–10 menit) yang merekam proses pembuatan prototype kursi ergonomis dari awal hingga selesai. Sertakan narasi atau teks penjelasan di setiap tahapan. Upload ke Google Drive dan kirimkan linknya.',
            'deadline'      => Carbon::now()->addDays(10)->toDateString() . ' 16:00:00',
            'file_lampiran' => null,
            'status'        => 'Belum Dikerjakan',
        ]);
    }
}
