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
    /**
     * Seed the application's database with comprehensive, rich dummy data
     * covering all 3 roles (admin, pembimbing, peserta) and all features:
     * presensi, izin, logbook, tugas, dan pengumpulan tugas.
     */
    public function run(): void
    {
        // Disable foreign key checks for clean truncation during dev testing
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

        // ═════════════════════════════════════════════════════════════════════
        // 1. HARI LIBUR NASIONAL (2025 - 2027)
        // ═════════════════════════════════════════════════════════════════════
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

        // ═════════════════════════════════════════════════════════════════════
        // 2. USERS: ADMINISTRATOR SISTEM UTAMA (Single Sovereign Account)
        // ═════════════════════════════════════════════════════════════════════
        $admin1 = User::create([
            'nama'          => 'Administrator Utama Sistem',
            'email'         => 'admin@poltek-furnitur.ac.id',
            'password'      => Hash::make('password123'),
            'role'          => 'admin',
            'nim_nis'       => 'ADM-001',
            'jabatan'       => 'Kepala Pengelola IT & Admin Sistem',
            'no_hp'         => '081234567890',
            'status_aktif'  => true,
        ]);

        // ═════════════════════════════════════════════════════════════════════
        // 3. USERS: PEMBIMBING LAPANGAN (4 Akun dari Berbagai Divisi)
        // ═════════════════════════════════════════════════════════════════════
        $pembimbing1 = User::create([
            'nama'         => 'Budi Pekerti S.Kom',
            'email'        => 'pembimbing@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.198503152010121001',
            'jabatan'      => 'Kepala Unit SIM & Sistem Informasi',
            'no_hp'        => '082198765432',
            'status_aktif' => true,
        ]);

        $pembimbing2 = User::create([
            'nama'         => 'Ir. Haryanto M.T.',
            'email'        => 'pembimbing2@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.197808202005011003',
            'jabatan'      => 'Manager R&D Desain Furnitur & Kayu',
            'no_hp'        => '081398765411',
            'status_aktif' => true,
        ]);

        $pembimbing3 = User::create([
            'nama'         => 'Dewi Lestari S.T.',
            'email'        => 'pembimbing3@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.199004122015042002',
            'jabatan'      => 'Kepala Bagian Quality Control & Laboratorium',
            'no_hp'        => '085698765422',
            'status_aktif' => true,
        ]);

        $pembimbing4 = User::create([
            'nama'         => 'Andi Wijaya S.E., M.M.',
            'email'        => 'pembimbing4@poltek-furnitur.ac.id',
            'password'     => Hash::make('password123'),
            'role'         => 'pembimbing',
            'nim_nis'      => 'NIP.198211052008121004',
            'jabatan'      => 'Supervisor Human Capital & General Affairs',
            'no_hp'        => '087898765433',
            'status_aktif' => true,
        ]);

        $allPembimbing = [$pembimbing1, $pembimbing2, $pembimbing3, $pembimbing4];

        // ═════════════════════════════════════════════════════════════════════
        // 4. USERS: PESERTA MAGANG (12 Akun Beragam Kampus, Jurusan & Posisi)
        // ═════════════════════════════════════════════════════════════════════
        $startDate = Carbon::now()->subMonths(2)->startOfMonth()->toDateString();
        $endDate   = Carbon::now()->addMonth()->endOfMonth()->toDateString();

        $pesertaData = [
            [
                'nama'          => 'Intan Ayu',
                'email'         => 'peserta@poltek-furnitur.ac.id',
                'nim_nis'       => 'H1D024027',
                'asal_instansi' => 'Universitas Jenderal Soedirman',
                'jurusan'       => 'Teknik Informatika',
                'posisi_magang' => 'Divisi Software & IT Support',
                'no_hp'         => '085712345678',
                'pembimbing_id' => $pembimbing1->user_id,
            ],
            [
                'nama'          => 'Fajar Pratama',
                'email'         => 'peserta2@poltek-furnitur.ac.id',
                'nim_nis'       => 'H1D024028',
                'asal_instansi' => 'Universitas Jenderal Soedirman',
                'jurusan'       => 'Teknik Informatika',
                'posisi_magang' => 'Divisi Software & IT Support',
                'no_hp'         => '085798765432',
                'pembimbing_id' => $pembimbing1->user_id,
            ],
            [
                'nama'          => 'Rian Hidayat',
                'email'         => 'rian.hidayat@poltek-furnitur.ac.id',
                'nim_nis'       => '220101402',
                'asal_instansi' => 'Politeknik Industri Furnitur Kendal',
                'jurusan'       => 'Teknik Industri Furnitur',
                'posisi_magang' => 'Production Planning & Inventory Control',
                'no_hp'         => '081223344556',
                'pembimbing_id' => $pembimbing1->user_id,
            ],
            [
                'nama'          => 'Siti Nurhaliza',
                'email'         => 'siti.nurhaliza@poltek-furnitur.ac.id',
                'nim_nis'       => '220101509',
                'asal_instansi' => 'Politeknik Industri Furnitur Kendal',
                'jurusan'       => 'Desain Mebel dan Interior',
                'posisi_magang' => 'Divisi R&D Desain Furnitur 3D',
                'no_hp'         => '081334455667',
                'pembimbing_id' => $pembimbing2->user_id,
            ],
            [
                'nama'          => 'Rizky Ramadhan',
                'email'         => 'rizky.ramadhan@poltek-furnitur.ac.id',
                'nim_nis'       => '210501191',
                'asal_instansi' => 'Universitas Diponegoro',
                'jurusan'       => 'Teknik Mesin',
                'posisi_magang' => 'Maintenance & CNC Operator',
                'no_hp'         => '081445566778',
                'pembimbing_id' => $pembimbing2->user_id,
            ],
            [
                'nama'          => 'Maya Anggraini',
                'email'         => 'maya.anggraini@poltek-furnitur.ac.id',
                'nim_nis'       => '220202104',
                'asal_instansi' => 'Politeknik Industri Furnitur Kendal',
                'jurusan'       => 'Manajemen Industri Kayu',
                'posisi_magang' => 'Divisi Supply Chain & Purchasing',
                'no_hp'         => '081556677889',
                'pembimbing_id' => $pembimbing2->user_id,
            ],
            [
                'nama'          => 'Dika Perkasa',
                'email'         => 'dika.perkasa@poltek-furnitur.ac.id',
                'nim_nis'       => '4.33.21.0.11',
                'asal_instansi' => 'Politeknik Negeri Semarang',
                'jurusan'       => 'Teknik Komunikasi & IoT',
                'posisi_magang' => 'Automation & Sensor Support',
                'no_hp'         => '081667788990',
                'pembimbing_id' => $pembimbing3->user_id,
            ],
            [
                'nama'          => 'Anisa Rahma',
                'email'         => 'anisa.rahma@poltek-furnitur.ac.id',
                'nim_nis'       => '7101421088',
                'asal_instansi' => 'Universitas Negeri Semarang',
                'jurusan'       => 'Akuntansi Sektor Publik',
                'posisi_magang' => 'Administrasi Keuangan & Asset',
                'no_hp'         => '081778899001',
                'pembimbing_id' => $pembimbing3->user_id,
            ],
            [
                'nama'          => 'Kevin Sanjaya',
                'email'         => 'kevin.sanjaya@poltek-furnitur.ac.id',
                'nim_nis'       => '220101612',
                'asal_instansi' => 'Politeknik Industri Furnitur Kendal',
                'jurusan'       => 'Desain Mebel dan Interior',
                'posisi_magang' => 'Divisi Finishing & Material Specialist',
                'no_hp'         => '081889900112',
                'pembimbing_id' => $pembimbing3->user_id,
            ],
            [
                'nama'          => 'Nabila Putri',
                'email'         => 'nabila.putri@poltek-furnitur.ac.id',
                'nim_nis'       => '2102012015',
                'asal_instansi' => 'Universitas Semarang',
                'jurusan'       => 'Manajemen SDM',
                'posisi_magang' => 'Human Capital & General Affairs',
                'no_hp'         => '081990011223',
                'pembimbing_id' => $pembimbing4->user_id,
            ],
            [
                'nama'          => 'Muhammad Syahrul',
                'email'         => 'm.syahrul@poltek-furnitur.ac.id',
                'nim_nis'       => '12210842',
                'asal_instansi' => 'SMK Negeri 1 Kendal',
                'jurusan'       => 'Teknik Komputer & Jaringan',
                'posisi_magang' => 'IT Network & Hardware Support',
                'no_hp'         => '082001122334',
                'pembimbing_id' => $pembimbing4->user_id,
            ],
            [
                'nama'          => 'Clarissa Wijaya',
                'email'         => 'clarissa.wijaya@poltek-furnitur.ac.id',
                'nim_nis'       => '220101705',
                'asal_instansi' => 'Politeknik Industri Furnitur Kendal',
                'jurusan'       => 'Teknik Industri Furnitur',
                'posisi_magang' => 'Quality Control & Safety Officer',
                'no_hp'         => '082112233445',
                'pembimbing_id' => $pembimbing4->user_id,
            ],
        ];

        $createdPesertaList = [];

        foreach ($pesertaData as $pData) {
            $pUser = User::create([
                'nama'                   => $pData['nama'],
                'email'                  => $pData['email'],
                'password'               => Hash::make('password123'),
                'role'                   => 'peserta',
                'nim_nis'                => $pData['nim_nis'],
                'asal_instansi'          => $pData['asal_instansi'],
                'jurusan'                => $pData['jurusan'],
                'posisi_magang'          => $pData['posisi_magang'],
                'no_hp'                  => $pData['no_hp'],
                'tanggal_mulai_magang'   => $startDate,
                'tanggal_selesai_magang' => $endDate,
                'status_aktif'           => true,
            ]);

            // Plotting Bimbingan
            PlottingBimbingan::create([
                'peserta_id'    => $pUser->user_id,
                'pembimbing_id' => $pData['pembimbing_id'],
            ]);

            $createdPesertaList[] = [
                'user'          => $pUser,
                'pembimbing_id' => $pData['pembimbing_id'],
                'posisi'        => $pData['posisi_magang'],
                'jurusan'       => $pData['jurusan'],
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // 5. GENERATE DATA AKTIVITAS UNTUK SEMUA PESERTA (40 HARI KERJA KE BELAKANG)
        // ═════════════════════════════════════════════════════════════════════
        
        // Buat daftar tanggal kerja (Senin - Jumat) dari 45 hari yang lalu hingga kemarin
        $workDates = [];
        for ($i = 42; $i >= 1; $i--) {
            $dateObj = Carbon::now()->subDays($i);
            if ($dateObj->isWeekday()) {
                // Pastikan bukan tanggal libur nasional
                $dateStr = $dateObj->toDateString();
                if (!in_array($dateStr, array_column($hariLiburData, 'tanggal'))) {
                    $workDates[] = $dateStr;
                }
            }
        }

        // Template Logbook Spesifik berdasarkan rumpun bidang
        $logbookTemplates = [
            'Software & IT' => [
                ['judul' => 'Pengenalan Infrastruktur Jaringan & Server Instansi', 'deskripsi' => "Melakukan pemetaan topologi jaringan internal Polifurneka.\nMengecek switch core, mikrotik router, dan akses poin di gedung utama.\nMendata IP address server local dan konfigurasi gateway.", 'kendala' => 'Belum mendapat credential super admin server.'],
                ['judul' => 'Pengembangan Modul Presensi & Geolocation System', 'deskripsi' => "Mengembangkan fitur validasi koordinat GPS radius instansi.\nMembuat algoritma Haversine formula di backend controller Laravel.\nMenguji akurasi lokasi presensi dengan sampel koordinat smartphone.", 'kendala' => null],
                ['judul' => 'Slicing UI Dashboard Admin dengan React & TailwindCSS', 'deskripsi' => "Membangun tampilan dashboard admin responsive menggunakan React.js.\nMenambahkan komponen statistik kartu bento dan grafik persentase kehadiran.\nMelakukan optimasi bundle size dengan lazy loading.", 'kendala' => 'Terjadi konflik styling font pada komponen sidebar.'],
                ['judul' => 'Testing API Endpoint Laporan PDF & Excel Generator', 'deskripsi' => "Menguji kinerja endpoint DomPDF di backend Laravel untuk rekapitulasi data.\nMengecek performa query SQL dan eager loading relationship `peserta` & `pembimbing`.\nHasil rendering PDF selesai dalam waktu 1.2 detik.", 'kendala' => null],
                ['judul' => 'Maintenance Database & Query Optimization', 'deskripsi' => "Menambahkan index database pada kolom `tanggal` dan `status` di tabel presensi.\nMengurangi durasi load pratinjau laporan sebesar 45%.\nMelakukan backup database berkala ke cloud storage.", 'kendala' => null],
            ],
            'Furnitur & Desain' => [
                ['judul' => 'Pengukuran & Sketching 3D Kursi Ergonomis', 'deskripsi' => "Melakukan pengukuran antropometri untuk kenyamanan pengguna kursi kerja.\nMembuat draft desain 3D di SolidWorks dan SketchUp Pro.\nMenentukan sudut kemiringan sandaran 105 derajat sesuai standar ergonomi.", 'kendala' => 'Kesulitan membuat lekukan ergonomis pada komponen kayu mahoni.'],
                ['judul' => 'Pemrograman Mesin CNC Router 3-Axis', 'deskripsi' => "Menerjemahkan file CAD .DXF ke G-Code menggunakan software ArtCAM.\nMelakukan setting zero point pada permukaan kayu murni sebelum proses milling.\nMengawasi pemotongan 12 komponen kaki meja bundar.", 'kendala' => null],
                ['judul' => 'Pengujian Ketahanan Lapisan Finishing PU Clear Gloss', 'deskripsi' => "Menguji daya rekat cat finishing jenis Polyurethane (PU) pada permukaan kayu jati.\nMelakukan cross-cut tape test dan pengujian ketahanan gores.\nHasil pengujian memenuhi standar kelas A (tidak ada cat terkelupas).", 'kendala' => 'Ruang pengeringan lembab akibat cuaca hujan.'],
                ['judul' => 'Assembly & Uji Konstruksi Sambungan Mortise & Tenon', 'deskripsi' => "Merakit rangka meja makan dari bahan kayu mahoni olahan.\nMenerapkan lem kayu PVAc tahan air pada sambungan purus dan lubang.\nMemasang klem kencang selama 4 jam hingga lem kering sempurna.", 'kendala' => null],
                ['judul' => 'QC Akhir & Quality Audit Produk Ekspor', 'deskripsi' => "Melakukan inspeksi visual akhir terhadap 25 unit rak buku knock-down.\nMengecek kadar air kayu (Moisture Content) menggunakan Moisture Meter digital (<12%).\nMenandai 1 unit yang memiliki kecacatan warna pada bagian urat kayu.", 'kendala' => null],
            ],
            'Umum & Manajemen' => [
                ['judul' => 'Analisis Alur Supply Chain & Stok Bahan Baku Kayu', 'deskripsi' => "Melakukan verifikasi fisik persediaan log kayu jati dan mahoni di gudang bahan baku.\nMengonfirmasi volume kubikasi log dengan dokumen jalan dari vendor supplier.\nMenginput data penerimaan barang ke dalam sistem ERP instansi.", 'kendala' => 'Terjadi selisih kubikasi 0.3 m3 pada log nomor seri B-104.'],
                ['judul' => 'Penyusunan Dokumentasi SOP Keselamatan Kerja (K3)', 'deskripsi' => "Mendokumentasikan instruksi kerja aman untuk operasional mesin ketam dan pemotong.\nMemasang stiker rambu K3 kewajiban penggunaan kacamata dan penutup telinga.\nMengadakan pembekalan K3 singkat kepada 15 operator muda.", 'kendala' => null],
                ['judul' => 'Audit Administrasi & File Arsip Peserta Magang', 'deskripsi' => "Melakukan verifikasi berkas permohonan magang, surat balasan, dan berkas MoU kampus.\nMengurutkan arsip digital peserta magang berdasarkan periode dan instansi asal.\nMenyusun ringkasan statistik rekapitulasi jumlah peserta aktif bulanan.", 'kendala' => null],
                ['judul' => 'Evaluasi Biaya Material & Calculation Cost of Goods Sold', 'deskripsi' => "Menghitung HPP (Harga Pokok Produksi) untuk 1 set meja makan tipe minimalis.\nMengkalkulasi biaya kayu, bahan kimia finishing, hardware, serta biaya tenaga kerja langsung.\nMenyusun lembar estimasi biaya untuk tim pemasaran.", 'kendala' => null],
                ['judul' => 'Penyelenggaraan Briefing & Evaluasi Kinerja Bulanan', 'deskripsi' => "Membantu koordinasi ruang rapat dan penyiapan materi slide evaluasi bulanan.\nMencatat notulensi rapat koordinasi antar divisi produksi dan IT.\nMendistribusikan notulensi rapat ke seluruh supervisor divisi.", 'kendala' => null],
            ]
        ];

        foreach ($createdPesertaList as $pIdx => $pItem) {
            $peserta = $pItem['user'];
            $pembimbingId = $pItem['pembimbing_id'];
            $posisi = $pItem['posisi'];

            // Tentukan rumpun bidang
            $rumpun = 'Umum & Manajemen';
            if (str_contains($posisi, 'IT') || str_contains($posisi, 'Software') || str_contains($posisi, 'Automation')) {
                $rumpun = 'Software & IT';
            } elseif (str_contains($posisi, 'Furnitur') || str_contains($posisi, 'R&D') || str_contains($posisi, 'Finishing') || str_contains($posisi, 'CNC') || str_contains($posisi, 'Quality')) {
                $rumpun = 'Furnitur & Desain';
            }

            $templates = $logbookTemplates[$rumpun];

            // ── A. SEED PRESENSI & LOGBOOK PER HARI KERJA ──
            foreach ($workDates as $dIdx => $tanggal) {
                // Tentukan status presensi acak terstruktur
                // 85% Hadir, 10% Terlambat, 5% Pulang Cepat
                $randP = rand(1, 100);
                $statusPresensi = 'Hadir';
                $jamMasuk  = sprintf('07:%02d:00', rand(15, 29));
                $jamPulang = sprintf('16:%02d:00', rand(1, 20));
                $lokasiTipe = 'instansi';
                $ketLuar = null;

                if ($randP > 85 && $randP <= 95) {
                    $statusPresensi = 'Terlambat';
                    $jamMasuk = sprintf('07:%02d:00', rand(31, 55));
                } elseif ($randP > 95) {
                    $statusPresensi = 'Pulang Cepat';
                    $jamPulang = sprintf('15:%02d:00', rand(15, 50));
                }

                // Tiap 7 hari sekali ada kegiatan luar
                if ($dIdx % 7 === 0) {
                    $lokasiTipe = 'luar';
                    $ketLuar = 'Kunjungan Lapangan & Workshop Industri Industri Mitra';
                }

                // Insert Presensi
                Presensi::create([
                    'peserta_id'       => $peserta->user_id,
                    'tanggal'          => $tanggal,
                    'jam_masuk'        => $jamMasuk,
                    'jam_pulang'       => $jamPulang,
                    'latitude_masuk'   => -6.958742,
                    'longitude_masuk'  => 110.285810,
                    'latitude_pulang'  => -6.958742,
                    'longitude_pulang' => 110.285810,
                    'status'           => $statusPresensi,
                    'lokasi_tipe'      => $lokasiTipe,
                    'keterangan_luar'  => $ketLuar,
                    'alamat_masuk'     => 'Kawasan Industri Wijayakusuma / Polifurneka Kendal',
                    'alamat_pulang'    => 'Kawasan Industri Wijayakusuma / Polifurneka Kendal',
                ]);

                // Insert Logbook (beberapa hari sekali)
                $tpl = $templates[$dIdx % count($templates)];
                $statusLog = 'Approve';
                $catatanPem = 'Pekerjaan dilaksanakan dengan sangat baik dan sesuai spesifikasi.';

                if ($dIdx % 5 === 0) {
                    $statusLog = 'Menunggu';
                    $catatanPem = null;
                } elseif ($dIdx % 9 === 0) {
                    $statusLog = 'Revisi';
                    $catatanPem = 'Tolong tambahkan foto dokumentasi hasil pengujian serta perhitungan fisik.';
                }

                Logbook::create([
                    'peserta_id'         => $peserta->user_id,
                    'tanggal'            => $tanggal,
                    'judul_kegiatan'     => $tpl['judul'] . ' (Hari ke-' . ($dIdx + 1) . ')',
                    'deskripsi'          => $tpl['deskripsi'],
                    'kendala'            => $tpl['kendala'],
                    'status'             => $statusLog,
                    'catatan_pembimbing' => $catatanPem,
                ]);
            }

            // ── B. SEED PENGAJUAN IZIN ──
            // Sakit - Disetujui
            DB::table('izin')->insert([
                'peserta_id'      => $peserta->user_id,
                'pembimbing_id'   => $pembimbingId,
                'jenis'           => 'Sakit',
                'tanggal_mulai'   => Carbon::now()->subDays(rand(20, 30))->toDateString(),
                'tanggal_selesai' => Carbon::now()->subDays(rand(19, 29))->toDateString(),
                'keterangan'      => 'Kondisi badan kurang sehat (Flu dan Demam Tinggi), membawa surat keterangan dokter.',
                'status'          => 'Disetujui',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // Izin Keperluan Kampus - Menunggu atau Ditolak
            DB::table('izin')->insert([
                'peserta_id'      => $peserta->user_id,
                'pembimbing_id'   => $pembimbingId,
                'jenis'           => 'Izin',
                'tanggal_mulai'   => Carbon::now()->subDays(rand(3, 10))->toDateString(),
                'tanggal_selesai' => Carbon::now()->subDays(rand(3, 10))->toDateString(),
                'keterangan'      => 'Mengikuti ujian susulan dan bimbingan akademik di kampus asal.',
                'status'          => ($pIdx % 2 === 0) ? 'Menunggu' : 'Ditolak',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            // ── C. SEED TUGAS & PENGUMPULAN ──
            
            // Tugas 1: Selesai (sudah ada revisi & disetujui)
            $t1 = Tugas::create([
                'pembimbing_id' => $pembimbingId,
                'peserta_id'    => $peserta->user_id,
                'judul'         => 'Laporan Analisis & Modul Kerja ' . $posisi,
                'deskripsi'     => 'Susun laporan analisis komprehensif mengenai alur kerja dan evaluasi efisiensi pada ' . $posisi . '. Format laporan PDF minimum 8 halaman dilengkapi diagram alir.',
                'deadline'      => Carbon::now()->subDays(12)->toDateString() . ' 16:00:00',
                'status'        => 'Selesai',
            ]);
            DB::table('pengumpulan_tugas')->insert([
                'tugas_id'       => $t1->tugas_id,
                'file_hasil'     => 'https://drive.google.com/file/d/dummy-laporan-modul-v1',
                'versi_ke'       => 1,
                'catatan_revisi' => 'Lengkapi diagram alir proses dan lengkapi referensi acuan standar ISO.',
                'tanggal_submit' => Carbon::now()->subDays(15)->toDateString() . ' 14:00:00',
                'created_at'     => now(), 'updated_at' => now(),
            ]);
            DB::table('pengumpulan_tugas')->insert([
                'tugas_id'       => $t1->tugas_id,
                'file_hasil'     => 'https://drive.google.com/file/d/dummy-laporan-modul-v2-final',
                'versi_ke'       => 2,
                'catatan_revisi' => null,
                'tanggal_submit' => Carbon::now()->subDays(13)->toDateString() . ' 09:30:00',
                'created_at'     => now(), 'updated_at' => now(),
            ]);

            // Tugas 2: Menunggu Review
            $t2 = Tugas::create([
                'pembimbing_id' => $pembimbingId,
                'peserta_id'    => $peserta->user_id,
                'judul'         => 'Dokumentasi & Ringkasan Presentasi Progres ' . $peserta->nama,
                'deskripsi'     => 'Buat file slide presentasi (PPTX/PDF) yang menjelaskan pencapaian magang hingga pertengahan periode.',
                'deadline'      => Carbon::now()->addDays(2)->toDateString() . ' 16:00:00',
                'status'        => 'Menunggu Review',
            ]);
            DB::table('pengumpulan_tugas')->insert([
                'tugas_id'       => $t2->tugas_id,
                'file_hasil'     => 'https://docs.google.com/presentation/d/dummy-slide-progres',
                'versi_ke'       => 1,
                'catatan_revisi' => null,
                'tanggal_submit' => Carbon::now()->subDays(1)->toDateString() . ' 11:20:00',
                'created_at'     => now(), 'updated_at' => now(),
            ]);

            // Tugas 3: Perlu Revisi
            $t3 = Tugas::create([
                'pembimbing_id' => $pembimbingId,
                'peserta_id'    => $peserta->user_id,
                'judul'         => 'Penyusunan Standard Operating Procedure (SOP) Divisi',
                'deskripsi'     => 'Menyusun draft SOP pengoperasian instrumen dan alat kerja divisi.',
                'deadline'      => Carbon::now()->subDays(2)->toDateString() . ' 16:00:00',
                'status'        => 'Perlu Revisi',
            ]);
            DB::table('pengumpulan_tugas')->insert([
                'tugas_id'       => $t3->tugas_id,
                'file_hasil'     => 'https://drive.google.com/file/d/dummy-sop-v1',
                'versi_ke'       => 1,
                'catatan_revisi' => 'Harap tambahkan diagram flow-chart pada halaman 3 serta daftar simbol bahaya K3.',
                'tanggal_submit' => Carbon::now()->subDays(3)->toDateString() . ' 15:45:00',
                'created_at'     => now(), 'updated_at' => now(),
            ]);

            // Tugas 4: Belum Dikerjakan (Deadline Mendatang)
            Tugas::create([
                'pembimbing_id' => $pembimbingId,
                'peserta_id'    => $peserta->user_id,
                'judul'         => 'Draft Akhir Laporan KKN/Magang Kampus',
                'deskripsi'     => 'Menyusun draft lengkap laporan magang untuk diserahkan ke program studi kampus asal.',
                'deadline'      => Carbon::now()->addDays(14)->toDateString() . ' 16:00:00',
                'status'        => 'Belum Dikerjakan',
            ]);
        }
    }
}
