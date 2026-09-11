# SIMONIKA — System Gap, Risk & Security Assessment
**Sistem Monitoring dan Informasi Magang (SIMONIKA)**  
**Politeknik Industri Furnitur dan Pengolahan Kayu Kendal (Polifurneka)**

---

## DAFTAR KLASIFIKASI STATUS DATA
Dalam dokumen ini, seluruh temuan dan pengamatan dikelompokkan secara ketat menggunakan kaidah:
1. **Confirmed from System**: Fakta teknis yang terbukti ada secara eksplisit pada *source code*, skema migrasi database, atau implementasi UI frontend/backend.
2. **Inferred**: Kesimpulan logis dari arsitektur kode saat ini, namun belum memiliki dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL/SRS) tertulis dari pihak Polifurneka.
3. **Requirement Gap**: Fitur atau informasi yang dibutuhkan oleh sistem/operasional tetapi belum ada atau belum diketahui aturannya.
4. **Stakeholder Confirmation Needed**: Keputusan bisnis, hukum, atau operasional yang hanya berhak diputuskan oleh pengelola instansi Polifurneka.
5. **Potential Overengineering**: Fitur atau kompleksitas teknis yang dibangun pengembang tetapi berpotensi membebani instansi dan pengguna akhir.

---

# BAGIAN 1 — SYSTEM OVERVIEW

### 1. Tujuan SIMONIKA
* **Mendigitalisasi dan memusatkan administrasi program magang** mahasiswa/siswa di Polifurneka Kendal dalam satu sistem web terpadu. `[Confirmed from System: routes/api.php, README.md]`
* **Mencegah kecurangan kehadiran** melalui pembatasan geofencing GPS pada radius kantor/kampus Polifurneka. `[Confirmed from System: PresensiController.php, presensi.php]`
* **Mempermudah pembimbing lapangan** dalam memantau keaktifan harian (*logbook*) dan memberikan tugas magang secara terstruktur. `[Confirmed from System: LogbookController.php, TugasController.php]`
* **Menyediakan rekapitulasi data dan pelaporan otomatis** bagi administrator dan pimpinan instansi. `[Confirmed from System: LaporanController.php, PresensiSheetExport.php]`

### 2. Masalah yang Ingin Diselesaikan
* Presensi manual berbasis kertas yang lambat direkap dan rawan manipulasi. `[Inferred: dari adanya fitur Presensi GPS & jam kerja]`
* Lembar kegiatan harian peserta yang tercecer atau terlambat diverifikasi pembimbing. `[Inferred: dari adanya modul logbook dan review status]`
* Tidak adanya arsip digital penugasan dan surat izin sakit yang tersentralisasi. `[Inferred: dari adanya modul tugas dan perizinan]`
* Kebutuhan formal instansi Polifurneka untuk menentukan kelulusan magang secara objektif. `[Requirement Gap: belum ada pembobotan nilai formal]`

### 3. Aktor (Peran Pengguna)
* **Admin Instansi**: Memiliki wewenang *superadmin* (kelola user, toggle status akun, reset password, plotting bimbingan, dashboard analitik). `[Confirmed from System: AdminController.php, RoleMiddleware.php]`
* **Pembimbing Lapangan**: Pegawai/staf industri yang membimbing peserta (monitoring presensi anak bimbingan, review logbook, verifikasi izin, penugasan tugas). `[Confirmed from System: LogbookController.php, TugasController.php]`
* **Peserta Magang**: Mahasiswa/siswa yang melaksanakan magang (check-in/check-out GPS, submit logbook, pengajuan izin, kumpul tugas, update profil kontak/sandi). `[Confirmed from System: PresensiController.php, IzinController.php]`
* **Pimpinan Instansi / Direktur / HRD**: `[Requirement Gap: tidak ada peran pimpinan khusus; jika pimpinan ingin melihat rekap, saat ini harus menggunakan akun Admin]`

### 4. Modul Utama
* **Modul Autentikasi & Akun**: Login Sanctum, Rate Limiting 5 req/min, manajemen profil, ganti kata sandi. `[Confirmed from System]`
* **Modul Presensi Geofencing**: Check-in & check-out radius 500 meter Polifurneka (-6.929428, 110.256226), validasi jam masuk/pulang, libur weekend, geocoding alamat. `[Confirmed from System]`
* **Modul Logbook Harian**: Input kegiatan harian, kendala, upload foto terkompresi, persetujuan/revisi pembimbing. `[Confirmed from System]`
* **Modul Pengajuan Izin / Sakit**: Input rentang tanggal, keterangan, upload berkas bukti ke private storage, verifikasi pembimbing. `[Confirmed from System]`
* **Modul Penugasan Magang**: Pembuatan tugas oleh pembimbing, pengumpulan file/link oleh peserta, versioning revisi pengumpulan, review pembimbing. `[Confirmed from System]`
* **Modul Administrasi & Plotting**: CRUD akun pengguna, pemetaan relasi 1 pembimbing ke N peserta magang. `[Confirmed from System]`
* **Modul Laporan & Ekspor**: Preview data gabungan, ekspor format Excel (*multi-sheet*) dan PDF. `[Confirmed from System]`

### 5. Alur Utama (Core Workflow)
* **Plotting Bimbingan**: Admin membuat akun $\rightarrow$ Admin mem-plot peserta ke pembimbing $\rightarrow$ Pembimbing dapat melihat peserta di dashboard. `[Confirmed from System]`
* **Siklus Harian Peserta**: Datang ke kampus $\rightarrow$ Buka browser $\rightarrow$ Check-in GPS (07:00–09:00 WIB) $\rightarrow$ Mengisi logbook kegiatan $\rightarrow$ Check-out GPS (mulai 16:00/16:30 WIB). `[Confirmed from System]`
* **Siklus Izin**: Peserta mengajukan izin $\rightarrow$ Notifikasi/tampil di pembimbing $\rightarrow$ Pembimbing menyetujui/menolak $\rightarrow$ Status kehadiran terakumulasi di laporan. `[Confirmed from System]`

### 6. Data Utama yang Dikelola
* Data Kredensial & Profil Pengguna (`users`: nama, email, password hash, role, nim_nis, no_hp, asal_instansi, jurusan, posisi_magang, tanggal_mulai, tanggal_selesai, foto_profil). `[Confirmed from System]`
* Data Presensi (`presensi`: tanggal, jam_masuk, jam_pulang, lat/long masuk & pulang, status, alamat geocoding). `[Confirmed from System]`
* Data Logbook (`logbook`: tanggal, judul, deskripsi, kendala, foto, status, catatan_pembimbing). `[Confirmed from System]`
* Data Izin (`izin`: jenis, tanggal_mulai, tanggal_selesai, keterangan, file_bukti, status). `[Confirmed from System]`
* Data Tugas (`tugas` & `pengumpulan_tugas`: judul, deskripsi, deadline, file lampiran, file hasil/link, versi, catatan revisi). `[Confirmed from System]`
* Data Plotting (`plotting_bimbingan`: pembimbing_id, peserta_id). `[Confirmed from System]`

### 7. Integrasi Eksternal
* **Nominatim OpenStreetMap API**: Digunakan untuk reverse-geocoding koordinat GPS menjadi nama alamat fisik jalan. `[Confirmed from System: PresensiService.php]`
* **Browser Geolocation API (HTML5)**: Digunakan pada perangkat peserta untuk mengambil koordinat latitude/longitude. `[Confirmed from System: PresensiPage.jsx]`
* **Leaflet / OpenStreetMap Tiles**: Digunakan di frontend pembimbing untuk menampilkan titik peta presensi peserta. `[Confirmed from System: MonitorPresensiPage.jsx]`

### 8. Teknologi yang Digunakan
* **Backend**: Laravel 11, PHP 8.2+, Laravel Sanctum, DomPDF, Maatwebsite/Excel. `[Confirmed from System]`
* **Frontend**: React 18, Vite 8, Tailwind CSS v4, Lucide React, Axios. `[Confirmed from System]`
* **Database**: MySQL (InnoDb, Foreign Key constraints, composite indexing). `[Confirmed from System]`

---

# BAGIAN 2 — REQUIREMENT ASSESSMENT

| ID | Modul | Requirement | Status | Evidence | Risiko / GAP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Autentikasi | Peserta dapat mendaftar akun secara mandiri (*self-registration*). | **Requirement Gap** | `Route::post('/register')` dikunci khusus `role:admin`. Peserta tidak bisa daftar sendiri. | Admin harus memasukkan data seluruh peserta magang secara manual satu per satu. Jika peserta banyak (misal 50 orang per periode), ini menjadi beban operasional berat. |
| **REQ-02** | Presensi | Validasi kehadiran wajib berada di dalam radius 500 meter dari titik pusat Polifurneka Kendal. | **Confirmed from System** | `PresensiController.php` baris 76–88 & `presensi.php`. | Koordinat mengandalkan GPS browser yang rentan dipalsukan (*fake GPS* / DevTools). Jika peserta ditugaskan dinas luar, peserta tidak bisa absen sama sekali karena opsi luar telah dikunci. |
| **REQ-03** | Presensi | Presensi masuk dibatasi maksimal pukul 09:00 WIB, lewat jam tersebut presensi ditolak (*error*). | **Confirmed from System** | `PresensiController.php` baris 92–98: `if ($now->greaterThan($maxJamMasuk)) return 400`. | Jika peserta datang pukul 09:01 karena ban bocor atau kendala perjalanan darurat, sistem menganggapnya "Tidak Hadir" permanen tanpa ada fitur dispensasi/koreksi manual dari pembimbing/admin. |
| **REQ-04** | Presensi | Presensi pulang dikunci sampai jam kerja berakhir (16:00 WIB Senin-Kamis, 16:30 WIB Jumat). | **Confirmed from System** | `PresensiController.php` baris 173–183 & `PresensiService.php`. | Peserta yang sakit di tengah hari dan dipulangkan lebih awal (misal jam 14:00) tidak bisa melakukan presensi pulang, sehingga data kepulangannya menjadi *null* (dianggap tidak lengkap). |
| **REQ-05** | Presensi | Hari Sabtu & Minggu diblokir dari seluruh aktivitas presensi. | **Confirmed from System** | `PresensiService.php`: `isWeekend() return 400`. | Bagaimana jika ada penugasan pameran furnitur/acara kampus di hari Sabtu/Minggu? Sistem menolak presensi lembur/weekend. |
| **REQ-06** | Presensi | Presensi memerlukan foto swafoto langsung dari kamera (*live selfie*). | **Missing Requirement** | `PresensiController.php` hanya menerima `latitude` & `longitude`. Tidak ada parameter foto presensi. | Celah integritas: Peserta A bisa meminjamkan akun login ke Peserta B yang sudah berada di kampus untuk menitip absen. |
| **REQ-07** | Logbook | Peserta hanya boleh mengisi 1 logbook per hari kerja. | **Inferred** | Database tidak memiliki *unique constraint* pada `(peserta_id, tanggal)`. Controller tidak memvalidasi apakah logbook hari ini sudah ada. | Peserta bisa submit logbook ganda (spam) pada tanggal yang sama, membuat bingung pembimbing dalam penilaian. |
| **REQ-08** | Logbook | Pembimbing wajib mengisi catatan saat memberikan status 'Revisi'. | **Requirement Gap** | `LogbookController.php` memvalidasi `'catatan_pembimbing' => 'nullable|string'`. | Pembimbing bisa menyetel status logbook menjadi 'Revisi' tanpa menulis alasan revisinya, sehingga peserta bingung apa yang perlu diperbaiki. |
| **REQ-09** | Izin | Pengajuan izin yang disetujui otomatis mencatat kehadiran sebagai 'Izin' atau 'Sakit' pada tabel presensi. | **Requirement Gap** | Tabel `izin` dan `presensi` berdiri sendiri secara terpisah. Approval izin hanya mengubah kolom `izin.status`. | Di rekap presensi bulanan, hari di mana peserta sakit/izin akan tampak kosong (*Alpha/Belum Hadir*) kecuali query laporan menggabungkan kedua tabel secara dinamis. |
| **REQ-10** | Tugas | Tugas memiliki batas waktu (*deadline*), dan peserta tidak boleh mengumpulkan jika terlambat. | **Confirmed from System** | `TugasController.php` tidak memblokir submit setelah tanggal `deadline`. Submit hanya mencatat `tanggal_submit`. | Batas *deadline* bersifat visual; peserta masih dapat mengumpulkan tugas yang terlambat 2 minggu tanpa sistem menolaknya secara otomatis. |
| **REQ-11** | Plotting | 1 Peserta hanya boleh memiliki 1 Pembimbing Lapangan. | **Confirmed from System** | `plotting_bimbingan.peserta_id` memiliki *unique constraint* di migrasi database. | Bagaimana jika di Polifurneka terdapat 1 peserta yang dibimbing oleh 2 divisi (misal: Pembimbing Akademik dan Pembimbing Industri Lapangan)? Sistem saat ini tidak mendukung pembimbing ganda (*dual mentor*). |
| **REQ-12** | Periode Magang | Peserta yang masa magangnya selesai otomatis terkunci dari pengisian presensi, logbook, dan izin baru. | **Confirmed from System** | `PeriodeMagangService.php` memblokir check-in, logbook, izin baru, dan memberi *grace period* 3 hari untuk revisi tugas. | Sudah terimplementasi dengan baik, namun tanggal selesai magang harus diinput manual oleh Admin di tabel users. |
| **REQ-13** | Evaluasi & Nilai | Pembimbing memberikan nilai angka/huruf akhir (A, B, C) untuk sertifikat magang. | **Missing Requirement** | Tidak ada tabel `penilaian`, kolom `nilai_akhir`, atau form evaluasi kuantitatif di database. | SIMONIKA saat ini hanya sistem absensi & aktivitas, bukan sistem penilaian akhir magang (*academic grading system*). |
| **REQ-14** | Geocoding | Konversi koordinat ke nama jalan mengandalkan server publik OpenStreetMap (Nominatim). | **Potential Overengineering** | `PresensiService.php` memanggil `curl https://nominatim.openstreetmap.org/reverse`. | Nominatim memiliki aturan *Usage Policy*: maksimal 1 request per detik dan melarang aplikasi komersial intensif tanpa server sendiri. Jika 30 peserta absen bersamaan pada jam 07:29 WIB, IP server kampus bisa di-*rate-limit* atau diblokir oleh OpenStreetMap, menyebabkan API presensi lambat (*lagging*). |

---

# BAGIAN 3 — STAKEHOLDER QUESTIONS (DAFTAR PERTANYAAN RESMI KE POLIFURNEKA)

### A. Proses Magang
#### Q-001
> **Pertanyaan:** Apakah peserta magang di Polifurneka harus didaftarkan satu per satu oleh Admin kampus, atau bolehkah peserta mendaftar sendiri (*self-registration*) lalu Admin cukup memvalidasi/menyetujui akunnya?  
> **Mengapa perlu ditanyakan:** Saat ini pendaftaran mandiri dikunci. Jika peserta magang mencapai puluhan orang setiap batch, Admin Polifurneka akan terbebani input manual.  
> **Terkait modul:** Modul Akun & Autentikasi (`AuthController.php`).  
> **Jika jawabannya A (Admin yang buat):** Sistem tetap seperti sekarang, tetapi perlu disediakan fitur impor file Excel peserta agar Admin tidak menginput satu per satu.  
> **Jika jawabannya B (Peserta daftar sendiri):** Perlu dibuka rute registrasi publik dengan status akun `Menunggu Verifikasi Admin`.  
> **Priority:** High.

#### Q-002
> **Pertanyaan:** Apakah di akhir masa magang pembimbing lapangan di Polifurneka wajib mengeluarkan nilai angka/huruf (evaluasi kompetensi) di dalam sistem, atau penilaian dilakukan di luar sistem melalui formulir fisik universitas masing-masing?  
> **Mengapa perlu ditanyakan:** Saat ini SIMONIKA belum memiliki tabel/modul penilaian magang (*grading*).  
> **Terkait modul:** Modul Evaluasi & Penilaian Akhir.  
> **Jika jawabannya A (Perlu di sistem):** Harus dibuat modul penilaian dengan kriteria khusus Polifurneka.  
> **Jika jawabannya B (Di luar sistem):** Cukup menambahkan fitur cetak Rekap Kehadiran dan Rekap Aktivitas Logbook untuk dilampirkan ke kampus asal.  
> **Priority:** High.

---

### B. Presensi
#### Q-003
> **Pertanyaan:** Jika seorang peserta magang datang pukul 09:05 WIB karena kendala transportasi mendesak, apakah peserta tersebut benar-benar dilarang presensi (dianggap alpa seharian), atau bolehkah tetap absen dengan status "Sangat Terlambat" disertai alasan tertulis?  
> **Mengapa perlu ditanyakan:** Sistem saat ini memblokir total check-in setelah pukul 09:00 WIB (`Error 400`).  
> **Terkait modul:** Modul Presensi (`PresensiController.php`).  
> **Jika jawabannya A (Tetap diblokir):** Pertahankan aturan saat ini.  
> **Jika jawabannya B (Boleh absen terlambat):** Longgarkan jam masuk menjadi sampai jam pulang dengan status "Terlambat Berat", atau tambahkan fitur persetujuan keterlambatan oleh pembimbing.  
> **Priority:** Critical.

#### Q-004
> **Pertanyaan:** Apakah presensi pulang wajib dilakukan di hari yang sama sebelum jam 22:00 WIB, dan apa konsekuensinya jika peserta lupa melakukan check-out saat meninggalkan kampus?  
> **Mengapa perlu ditanyakan:** Saat ini jika peserta lupa checkout, status presensi hari itu menggantung dan tidak ada fitur "Checkout Otomatis" atau "Koreksi Lupa Absen Pulang".  
> **Terkait modul:** Modul Presensi (`PresensiController.php`).  
> **Jika jawabannya A (Dianggap hangus/tidak lengkap):** Jam pulang dibiarkan kosong.  
> **Jika jawabannya B (Boleh dikoreksi):** Perlu fitur pengajuan koreksi presensi kepada pembimbing lapangan.  
> **Priority:** Medium.

---

### C. GPS / Lokasi
#### Q-005
> **Pertanyaan:** Apakah seluruh kegiatan magang di Polifurneka mutlak 100% berada di dalam area kampus, atau adakah kemungkinan peserta ditugaskan ke pabrik mitra, dinas luar, atau survei lapangan di luar kampus?  
> **Mengapa perlu ditanyakan:** Logika presensi luar kampus baru saja dibersihkan dari server karena tidak memiliki approval dan menjadi celah titip absen. Namun jika ada tugas luar nyata, peserta saat ini tidak bisa absen.  
> **Terkait modul:** Modul Presensi Geofencing.  
> **Jika jawabannya A (Mutlak di kampus saja):** Sistem saat ini sudah sangat tepat dan terkunci 100% aman dalam radius 500m.  
> **Jika jawabannya B (Ada tugas luar kampus):** Perlu dibuat fitur "Pengajuan Tugas Luar" yang harus disetujui pembimbing terlebih dahulu sebelum hari H, baru koordinat di luar radius diizinkan.  
> **Priority:** Critical.

#### Q-006
> **Pertanyaan:** Apakah radius toleransi 500 meter di titik koordinat Polifurneka sudah mencakup seluruh gedung perkuliahan, bengkel kayu (*workshop*), gedung administrasi, dan asrama di Kawasan Industri Kendal?  
> **Mengapa perlu ditanyakan:** Jika bengkel kayu berada di gedung belakang yang berjarak 550 meter atau sinyal GPS ponsel melenceng 30 meter di dalam ruangan baja, peserta akan gagal absen.  
> **Terkait modul:** Modul Geofencing (`config/presensi.php`).  
> **Jika jawabannya A (Sudah pas):** Pertahankan radius 500 meter.  
> **Jika jawabannya B (Kurang luas atau terlalu luas):** Sesuaikan nilai parameter `PRESENSI_RADIUS_METER` di file environment (.env).  
> **Priority:** High.

---

### D. Logbook
#### Q-007
> **Pertanyaan:** Apakah pengisian logbook kegiatan wajib dilakukan setiap hari kerja sebelum pulang, atau boleh dirangkum/diisi sekaligus di akhir minggu (*weekly*)?  
> **Mengapa perlu ditanyakan:** Berpengaruh pada aturan validasi tanggal logbook pada backend.  
> **Terkait modul:** Modul Logbook (`LogbookController.php`).  
> **Jika jawabannya A (Wajib harian):** Kunci input logbook hanya untuk tanggal hari ini (`today`).  
> **Jika jawabannya B (Boleh rapel):** Izinkan peserta memilih tanggal mundur dalam minggu yang sama.  
> **Priority:** Medium.

#### Q-008
> **Pertanyaan:** Apakah unggahan foto dokumentasi kegiatan pada logbook bersifat wajib (*mandatory*) atau opsional (*optional*)?  
> **Mengapa perlu ditanyakan:** Beberapa bagian magang (misal divisi administrasi berkas rahasia atau keuangan) mungkin dilarang mengambil foto dokumen kerja instansi karena alasan kerahasiaan.  
> **Terkait modul:** Modul Logbook (`LogbookController.php`).  
> **Jika jawabannya A (Wajib foto):** Backend harus mewajibkan `foto_kegiatan`.  
> **Jika jawabannya B (Opsional):** Pertahankan kode saat ini yang mengizinkan foto bernilai `nullable`.  
> **Priority:** Low.

---

### E. Verifikasi Pembimbing
#### Q-009
> **Pertanyaan:** Apa yang terjadi jika pembimbing lapangan cuti, bertugas luar kota, atau berhalangan hadir sehingga tidak sempat mereview logbook dan izin peserta hingga masa magang berakhir?  
> **Mengapa perlu ditanyakan:** Saat ini hanya pembimbing yang di-plot yang berhak memverifikasi. Tidak ada delegasi wewenang (*deputy mentor*) atau peran cadangan.  
> **Terkait modul:** Modul Verifikasi & Plotting.  
> **Jika jawabannya A (Hanya pembimbing bersangkutan):** Biarkan status logbook tetap 'Menunggu' sampai pembimbing aktif kembali.  
> **Jika jawabannya B (Admin boleh mengambil alih):** Berikan hak akses kepada Admin untuk memverifikasi logbook/izin secara darurat (*Admin Override*).  
> **Priority:** High.

---

### F. Laporan & Ekspor
#### Q-010
> **Pertanyaan:** Format laporan apa yang paling dibutuhkan oleh pihak manajemen Polifurneka untuk arsip instansi: rekap absensi per divisi, rekapitulasi nilai, atau logbook lengkap beserta lampiran foto?  
> **Mengapa perlu ditanyakan:** Saat ini ekspor Excel menghasilkan *multi-sheet* (Presensi, Izin, Logbook, Tugas), sementara PDF menghasilkan tabel teks tanpa foto bukti.  
> **Terkait modul:** Modul Laporan (`LaporanController.php`).  
> **Jika jawabannya A (Format Excel saat ini sudah cukup):** Tidak perlu perubahan.  
> **Jika jawabannya B (Butuh format lembar pengesahan resmi berlogo/tanda tangan):** Layout PDF DomPDF harus didesain ulang menyerupai format baku instansi Polifurneka lengkap dengan kolom tanda tangan pimpinan.  
> **Priority:** Medium.

---

### G. Administrasi Sistem
#### Q-011
> **Pertanyaan:** Siapa personil di Polifurneka yang akan bertindak sebagai Administrator utama SIMONIKA: Bagian IT, Bagian Kemahasiswaan/Biro Kerjasama, atau staf administrasi umum?  
> **Mengapa perlu ditanyakan:** Menentukan tingkat kemampuan teknis pengguna admin; apakah mereka terbiasa mengelola server atau membutuhkan antarmuka yang sangat awam.  
> **Terkait modul:** Modul Admin & Panduan Penggunaan.  
> **Jika jawabannya A (Staf Non-Teknis):** Hindari kebutuhan akses terminal server; buat seluruh tombol perbaikan data ada di web GUI.  
> **Jika jawabannya B (Unit IT):** Cukup berikan buku panduan konfigurasi environment dan database.  
> **Priority:** High.

---

### H. Data Peserta
#### Q-012
> **Pertanyaan:** Apakah peserta magang di Polifurneka hanya terdiri dari mahasiswa perguruan tinggi luar, ataukah mencakup siswa SMK dan mahasiswa internal Polifurneka sendiri?  
> **Mengapa perlu ditanyakan:** Berpengaruh pada panjang format NIM/NIS, nama jurusan, dan validasi data asal instansi.  
> **Terkait modul:** Modul Profil & User Management.  
> **Jika jawabannya A (Campuran Mahasiswa & Siswa SMK):** Field `nim_nis` harus fleksibel menampung nomor induk siswa maupun mahasiswa (sudah didukung tipe string).  
> **Jika jawabannya B (Hanya Mahasiswa):** Format label dapat disederhanakan.  
> **Priority:** Low.

---

### I. Data Pembimbing
#### Q-013
> **Pertanyaan:** Berapa rata-rata jumlah peserta magang yang dibimbing oleh satu orang pembimbing lapangan di Polifurneka?  
> **Mengapa perlu ditanyakan:** Jika 1 pembimbing membimbing 30 anak, halaman dashboard pembimbing akan mengalami *load* data presensi yang berat jika tidak ada paginasi per anak.  
> **Terkait modul:** Modul Pembimbing Dashboard (`DashboardController.php`).  
> **Jika jawabannya A (Sedikit, 1-5 orang):** Desain UI 2-tier saat ini sudah sangat ideal dan ringkas.  
> **Jika jawabannya B (Banyak, >15 orang):** Perlu penambahan filter pencarian nama peserta yang lebih cepat dan paginasi server.  
> **Priority:** Medium.

---

### J. Periode Magang
#### Q-014
> **Pertanyaan:** Jika sebuah perguruan tinggi memiliki kalender magang yang berbeda (misal: 1 bulan, 3 bulan, atau 6 bulan MBKM), apakah tanggal mulai dan selesai harus fleksibel per individu peserta?  
> **Mengapa perlu ditanyakan:** Sistem saat ini menyimpan `tanggal_mulai_magang` dan `tanggal_selesai_magang` langsung di setiap baris akun peserta (bukan global per instansi).  
> **Terkait modul:** `PeriodeMagangService.php`.  
> **Jika jawabannya A (Fleksibel per peserta):** Struktur database saat ini sudah sangat tepat dan siap mendukung perbedaan durasi magang.  
> **Jika jawabannya B (Serentak per gelombang/batch):** Lebih efisien jika ada fitur "Batch Magang" agar admin tidak perlu mengatur tanggal satu per satu untuk puluhan orang.  
> **Priority:** Medium.

---

### K. Hak Akses & Privasi Data
#### Q-015
> **Pertanyaan:** Apakah pembimbing lapangan diizinkan melihat riwayat data presensi dan nilai dari peserta magang di divisi lain, ataukah harus mutlak tertutup hanya untuk anak bimbingannya sendiri?  
> **Mengapa perlu ditanyakan:** Menilai apakah pembatasan otorisasi IDOR saat ini sudah sesuai dengan budaya kerja keterbukaan instansi Polifurneka.  
> **Terkait modul:** Otorisasi Backend (`TugasController`, `PresensiController`).  
> **Jika jawabannya A (Mutlak hanya bimbingan sendiri):** Sistem saat ini sudah mengunci data dengan status 403 Forbidden jika diakses pembimbing lain.  
> **Jika jawabannya B (Boleh melihat sesama pembimbing untuk koordinasi):** Perlu diberikan mode *Read-Only* antar pembimbing.  
> **Priority:** High.

---

### L. Retensi & Penghapusan Data
#### Q-016
> **Pertanyaan:** Berapa lama data riwayat presensi, foto logbook, dan berkas tugas magang harus disimpan di server Polifurneka sebelum boleh dihapus atau diarsipkan (misal: 1 tahun, 5 tahun, atau selamanya)?  
> **Mengapa perlu ditanyakan:** File foto logbook dan berkas tugas dapat menghabiskan kapasitas harddisk server (*disk quota*) hosting jika disimpan bertahun-tahun tanpa kebijakan retensi.  
> **Terkait modul:** Penyimpanan Berkas (`storage/`).  
> **Jika jawabannya A (Disimpan 1-2 tahun lalu dihapus):** Perlu dibuat script cronjob / artisan command untuk *auto-cleanup* arsip lama.  
> **Jika jawabannya B (Wajib permanen):** Vendor hosting instansi harus menyediakan kuota storage yang besar.  
> **Priority:** High.

---

### M. Prosedur Error & Darurat
#### Q-017
> **Pertanyaan:** Bagaimana prosedur resmi instansi jika terjadi pemadaman listrik di Kawasan Industri Kendal atau server hosting SIMONIKA mengalami gangguan teknis (*downtime*) pada jam presensi pagi?  
> **Mengapa perlu ditanyakan:** Menentukan apakah instansi membutuhkan "Formulir Kehadiran Manual Darurat" yang nantinya dapat diinput susulan oleh Admin ke dalam SIMONIKA.  
> **Terkait modul:** SOP Operasional.  
> **Jika jawabannya A (Ada formulir fisik darurat):** Admin harus memiliki hak akses untuk memasukkan presensi susulan bertanda *Manual Input*.  
> **Jika jawabannya B (Sistem dianggap mutlak):** Peserta akan dirugikan jika server mati.  
> **Priority:** Critical.

---

### N. Kebijakan Keamanan Akun
#### Q-018
> **Pertanyaan:** Apakah kata sandi awal akun peserta dan pembimbing yang dibuat oleh Admin wajib langsung diganti saat pengguna pertama kali login (*forced password change*)?  
> **Mengapa perlu ditanyakan:** Menggunakan password seragam seperti `password123` saat registrasi awal rentan disalahgunakan oleh rekan magang sebelum diganti sendiri oleh pemilik akun.  
> **Terkait modul:** Modul Profil & Autentikasi.  
> **Jika jawabannya A (Wajib ganti sandi):** Perlu ditambahkan *flag* `must_change_password` pada tabel user dan *middleware redirect*.  
> **Jika jawabannya B (Cukup dianjurkan):** Fitur ubah kata sandi di menu Profil saat ini sudah cukup memadai.  
> **Priority:** Medium.

---

### O. Infrastruktur Hosting
#### Q-019
> **Pertanyaan:** Di mana sistem SIMONIKA ini nantinya akan dideploy secara permanen: di server lokal kampus Polifurneka (*On-Premise Intranet*), cloud VPS (cPanel/Ubuntu), atau sub-domain resmi Kemperindag / poltek-furnitur.ac.id?  
> **Mengapa perlu ditanyakan:** Konfigurasi SSL/HTTPS, CORS domain, dan izin akses GPS browser sangat bergantung pada protokol HTTPS (Geolocation API tidak berfungsi di HTTP biasa di luar localhost).  
> **Terkait modul:** Konfigurasi Deployment & Web Server.  
> **Jika jawabannya A (Wajib HTTPS di domain resmi):** Harus disiapkan sertifikat SSL aktif agar GPS browser berfungsi.  
> **Jika jawabannya B (Server lokal tanpa internet):** Geolocation browser dan OpenStreetMap reverse geocoding tidak akan bisa berjalan.  
> **Priority:** Critical.

---

### P. Status Pasca Magang
#### Q-020
> **Pertanyaan:** Setelah periode magang seorang mahasiswa berakhir, apakah akun peserta langsung dinonaktifkan (tidak bisa login), atau tetap boleh login dalam mode *Read-Only* untuk mengunduh portofolio/sertifikat?  
> **Mengapa perlu ditanyakan:** Sistem saat ini mengizinkan login tetapi memblokir seluruh pengajuan baru via `PeriodeMagangService`.  
> **Terkait modul:** Siklus Hidup Akun (*Account Lifecycle*).  
> **Jika jawabannya A (Boleh login read-only):** Perilaku sistem saat ini sudah 100% konsisten dan tepat.  
> **Jika jawabannya B (Akun langsung dikunci total):** Admin cukup menekan tombol `Toggle Status` menjadi nonaktif.  
> **Priority:** Low.

---

# BAGIAN 4 — 20 PERTANYAAN PALING KRITIS (PRIORITAS TERTINGGI)

Berikut adalah **Top 20 Pertanyaan Kritis** yang wajib dijawab terlebih dahulu oleh pihak Polifurneka karena berdampak langsung pada perubahan arsitektur kode, basis data, dan hukum operasional:

1. **[Q-005 - Kritis]** Apakah ada kemungkinan peserta magang ditugaskan dinas luar kampus (pameran/pabrik rekanan)? Jika ya, bagaimana alur validasi kehadiran mereka tanpa melanggar pembatasan geofencing 500m?
2. **[Q-019 - Kritis]** Apakah server hosting yang disediakan vendor sudah memiliki sertifikat HTTPS aktif? (Penting: Fitur GPS browser *HTML5 Geolocation* mutlak menolak berjalan jika domain menggunakan HTTP biasa).
3. **[Q-003 - Kritis]** Apakah keterlambatan hadir setelah pukul 09:00 WIB mutlak membatalkan presensi harian (dianggap alpa), ataukah perlu ada mekanisme izin terlambat dengan persetujuan pembimbing?
4. **[Q-017 - Kritis]** Bagaimana prosedur rekap presensi jika terjadi gangguan server/koneksi internet kampus pada jam presensi pagi? Apakah Admin boleh menginput presensi kehadiran secara manual?
5. **[Q-001 - Tinggi]** Apakah pendaftaran peserta magang harus diinput manual oleh Admin, ataukah perlu disediakan fitur impor data massal dari file Excel (*Bulk Import*)?
6. **[Q-002 - Tinggi]** Apakah Polifurneka mewajibkan lembar evaluasi nilai kuantitatif (angka/huruf) di dalam sistem SIMONIKA untuk syarat kelulusan magang?
7. **[Q-006 - Tinggi]** Apakah radius geofencing 500 meter di koordinat kampus Polifurneka sudah menjangkau seluruh bengkel kerja kayu dan gedung operasional tanpa ada titik buta (*blind spot*) sinyal?
8. **[Q-009 - Tinggi]** Jika pembimbing lapangan berhalangan hadir atau dinas luar dalam waktu lama, apakah Admin instansi berhak mengambil alih persetujuan logbook dan izin (*Admin Override*)?
9. **[Q-011 - Tinggi]** Siapa personil internal Polifurneka yang akan bertanggung jawab penuh memegang akun Admin sistem ini setelah serah terima?
10. **[Q-015 - Tinggi]** Apakah pembimbing lapangan di satu divisi diizinkan melihat aktivitas bimbingan di divisi lain, ataukah akses antar divisi mutlak diisolasi?
11. **[Q-016 - Tinggi]** Berapa batas waktu (retensi) penyimpanan arsip foto kegiatan logbook dan tugas sebelum file fisik di server dibersihkan untuk menghemat penyimpanan?
12. **[Q-018 - Sedang]** Apakah kata sandi bawaan baru wajib diubah oleh pengguna pada saat login pertama kali demi keamanan akun pribadi?
13. **[Q-004 - Sedang]** Apa konsekuensi bagi peserta yang hadir di pagi hari namun lupa melakukan check-out presensi saat pulang? Apakah jam pulangnya dianggap nol?
14. **[Q-007 - Sedang]** Apakah pengisian logbook wajib diisi di hari yang sama, ataukah ada toleransi pengisian mundur hingga akhir pekan?
15. **[Q-010 - Sedang]** Apakah lembar ekspor PDF membutuhkan tanda tangan basah/elektronik dari Kepala Bagian atau Pimpinan Instansi Polifurneka?
16. **[Q-013 - Sedang]** Berapa rasio maksimal mahasiswa magang yang dibimbing oleh satu orang pembimbing lapangan di Polifurneka?
17. **[Q-014 - Sedang]** Apakah durasi magang di Polifurneka seragam per angkatan, ataukah bervariasi tergantung perjanjian kerja sama masing-masing universitas asal?
18. **[Q-008 - Rendah]** Apakah dokumentasi foto kegiatan logbook wajib diunggah, atau boleh ditiadakan jika kegiatan hari itu menyangkut data konfidensial industri?
19. **[Q-012 - Rendah]** Apakah sistem ini ke depan akan digunakan juga untuk siswa magang tingkat SMK selain mahasiswa perguruan tinggi?
20. **[Q-020 - Rendah]** Apakah akun mahasiswa yang sudah selesai magang tetap diizinkan login selamanya untuk melihat riwayat tugas dan logbook mereka?

---

# BAGIAN 5 — SECURITY QUESTIONNAIRE (KEAMANAN & PRIVASI DATA)

Kuesioner ini dirancang untuk diajukan kepada unit pengelola IT atau Pejabat Pengelola Informasi dan Dokumentasi (PPID) Polifurneka:

### 1. Perlindungan Data Pribadi (PDP)
* Data apa saja dari peserta magang yang dianggap bersifat publik di internal instansi, dan data apa yang bersifat rahasia? (Misal: Nomor HP, NIM, Surat Keterangan Sakit dari Dokter).
* Siapa saja pejabat instansi yang berhak mengunduh rekapitulasi data kontak peserta?
* Apakah surat dokter yang dilampirkan pada izin sakit boleh dilihat oleh staf administrasi umum, ataukah hanya oleh pembimbing lapangan yang bersangkutan?

### 2. Validasi Titik Lokasi & Integritas GPS
* Apakah pencatatan koordinat latitude & longitude presensi hanya digunakan sebagai verifikasi radius sesaat (*timestamp check*), ataukah riwayat koordinat tersebut akan dijadikan bukti hukum kepatuhan jam kerja?
* Jika ada peserta yang terbukti menggunakan aplikasi pemalsu lokasi (*Fake GPS*), apakah sistem perlu menandai akun tersebut secara otomatis dan melaporkannya ke Admin?

### 3. Kebijakan Kredensial & Sesi Pengguna
* Apakah instansi mewajibkan sistem untuk mengeluarkan sesi login (*auto-logout*) jika pengguna tidak aktif dalam waktu tertentu (misal 30 menit)?
* Apakah ada pembatasan bahwa satu akun peserta magang tidak boleh login secara bersamaan di dua perangkat berbeda (*concurrent session prevention*)?

### 4. Batasan Penyimpanan Berkas & Ukuran Server
* Berapa batas kuota penyimpanan server hosting yang disediakan oleh vendor Polifurneka untuk menampung file kompresi foto logbook dan file tugas mahasiswa?
* Apakah berkas tugas yang dikumpulkan mahasiswa boleh berupa file arsip `.zip` / `.rar` ataukah dibatasi hanya dokumen dokumen teks seperti `.pdf`?

---

# BAGIAN 6 — BUSINESS PROCESS GAP (ANALISIS PROSES BISNIS AS-IS VS TO-BE)

| Aktivitas | Proses Saat Ini (As-Is) | Proses dengan SIMONIKA (To-Be) | Perubahan Alur | Dampak Terhadap Instansi & Pengguna |
| :--- | :--- | :--- | :--- | :--- |
| **Pencatatan Kehadiran** | Mahasiswa mengisi daftar hadir fisik di pos satpam / meja administrasi manual. `[Requires stakeholder confirmation]` | Peserta melakukan scan lokasi via Geofencing GPS di smartphone/laptop masing-masing. | Manual fisik $\rightarrow$ Digital otomatis tersinkronisasi. | **Positif:** Menghemat waktu antrean, rekap otomatis per detik. **Risiko:** Bergantung pada kestabilan GPS dan kuota internet peserta. |
| **Pengawasan Jam Kerja** | Satpam/staf memeriksa jam dinding; toleransi waktu pencatatan bersifat subjektif. `[Requires stakeholder confirmation]` | Server secara otomatis menandai status "Hadir" atau "Terlambat" berdasarkan jam server presisi WIB. | Subjektif $\rightarrow$ Objektif matematis oleh sistem. | **Positif:** Disiplin tinggi. **Risiko:** Peserta komplain jika jam server berselisih beberapa detik dengan jam ponselnya. |
| **Penyusunan Logbook** | Menulis di buku jurnal kerja praktik atau file Word yang dicetak di akhir magang. `[Requires stakeholder confirmation]` | Mengisi form digital harian lengkap dengan foto bukti terkompresi langsung dari web. | Cetak kertas $\rightarrow$ *Paperless database*. | **Positif:** Arsip rapi, tidak bisa hilang atau rusak terkena air/debu bengkel. |
| **Review & Validasi Logbook** | Pembimbing menandatangani buku jurnal seminggu sekali atau saat hendak ujian magang. `[Requires stakeholder confirmation]` | Pembimbing memeriksa daftar logbook di dashboard dan menekan tombol 'Approve' atau 'Revisi' per kegiatan. | Pemeriksaan menumpuk di akhir $\rightarrow$ Evaluasi harian bertahap. | **Perhatian:** Pembimbing lapangan memiliki tugas harian kantor; jika malas membuka web, logbook peserta akan tertahan berstatus 'Menunggu'. |
| **Pengajuan Izin Sakit** | Menghubungi pembimbing via WhatsApp dan menitipkan surat dokter fisik beberapa hari kemudian. `[Requires stakeholder confirmation]` | Mengajukan izin via portal web dengan melampirkan foto/PDF surat dokter ke server privat. | Tidak terstruktur $\rightarrow$ Tersentralisasi di database. | **Positif:** Rekap perizinan terdata rapi untuk laporan pemotongan nilai/kehadiran. |
| **Pemberian Tugas** | Disampaikan secara lisan di bengkel/kantor atau via grup chat WhatsApp. `[Requires stakeholder confirmation]` | Tugas dibuat di menu penugasan dengan judul, deskripsi, lampiran berkas, dan tanggal *deadline*. | Pesan tenggelam di chat $\rightarrow$ Daftar tugas terarsip rapi. | **Positif:** Peserta tidak bisa berdalih lupa tugas karena daftar tugas tampil jelas di dashboard. |
| **Rekapitulasi Laporan Akhir** | Staf administrasi mengetik ulang rekapan absensi dari lembar kertas ke Excel di akhir bulan. `[Requires stakeholder confirmation]` | Admin/Pembimbing cukup menekan tombol "Ekspor Excel" atau "Ekspor PDF" sekali klik. | Memakan waktu berhari-hari $\rightarrow$ Selesai dalam 3 detik. | **Sangat Menguntungkan:** Memangkas beban kerja staf administrasi Polifurneka secara masif. |

---

# BAGIAN 7 — SECURITY RISK REGISTER (DAFTAR RISIKO KEAMANAN)

| ID | Kategori Risiko | Aset Terancam | Ancaman (*Threat*) | Kerentanan (*Vulnerability*) | Probabilitas | Dampak | Level Risiko | Mitigasi yang Diterapkan / Rekomendasi |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-01** | Lokasi GPS | Integritas Data Presensi | Peserta absen dari kos/luar kota menggunakan aplikasi pemalsu koordinat. | Koordinat diambil dari `navigator.geolocation` sisi klien (*client-side*). | Sedang | Tinggi | **HIGH** | Menerapkan validasi tambahan seperti swafoto kamera (*live photo capture*) atau pembatasan IP publik jaringan WiFi kampus. |
| **SEC-02** | Autentikasi | Akun Pengguna & Hak Akses | Penyerang menebak kata sandi pengguna secara masif (*brute force*). | Endpoint `/api/login` terbuka di internet tanpa batasan percobaan. | Tinggi | Tinggi | **HIGH** | **Telah Dimitigasi:** Diterapkan `throttle:login` (maksimal 5 percobaan gagal per menit per IP/email) dengan blokir HTTP 429. |
| **SEC-03** | Token Leak | Sesi Login Pengguna | Token login dicuri dari riwayat browser atau catatan log server. | Token Bearer dikirim melalui parameter URL query string (`?token=...`). | Sedang | Tinggi | **HIGH** | **Telah Dimitigasi:** Dihapus `QueryTokenAuthMiddleware`. Seluruh token mutlak wajib dikirim via HTTP Header `Authorization`. |
| **SEC-04** | Otorisasi (IDOR) | Kerahasiaan Tugas Magang | Peserta A mengintip berkas hasil kerja atau catatan revisi tugas milik Peserta B. | Endpoint `/api/tugas/{id}` tidak memvalidasi kepemilikan user ID. | Sedang | Sedang | **MEDIUM** | **Telah Dimitigasi:** Ditambahkan pengecekan `$tugas->peserta_id === $user->user_id` dan relasi plotting pembimbing (HTTP 403 jika melanggar). |
| **SEC-05** | Privasi Berkas | Berkas Surat Dokter / Bukti Izin | Publik mengunduh surat sakit peserta tanpa login melalui tautan link file. | Berkas diunggah ke folder publik `storage/app/public/izin/`. | Rendah | Tinggi | **MEDIUM** | **Telah Dimitigasi:** Berkas dipindahkan ke `storage/app/private/` dan diunduh via endpoint terautentikasi `/api/izin/{id}/bukti`. |
| **SEC-06** | File Upload | Keamanan Server Web | Penyerang mengunggah skrip web shell berbahaya (misal: `shell.php`). | Validasi ekstensi berkas yang longgar pada form unggahan. | Rendah | Kritis | **CRITICAL** | **Telah Dimitigasi:** Validasi ketat `mimes:jpg,jpeg,png,pdf|max:5120` dan berkas disimpan dengan penamaan acak (*random hash*). |
| **SEC-07** | Konfigurasi Server | Kredensial Database & Kunci Sistem | Informasi kredensial database bocor saat sistem mengalami error 500. | Pengaturan `APP_DEBUG=true` dibiarkan menyala di server produksi hosting. | Tinggi | Kritis | **CRITICAL** | **Telah Dimitigasi:** Disetel `APP_DEBUG=false` dan `APP_ENV=production` di file konfigurasi server. |
| **SEC-08** | Ekspor Berkas Sensitif | Dokumen Rahasia (.env, .git) | Peretas mengunduh file konfigurasi `.env` langsung dari browser. | Web server salah mengarahkan DocumentRoot ke root folder tanpa proteksi. | Sedang | Kritis | **CRITICAL** | **Telah Dimitigasi:** Dibuat file proteksi `.htaccess` di root proyek dan `public/.htaccess` yang memblokir akses ke file dotfile. |

---

# BAGIAN 8 — EDGE CASE ASSESSMENT (SKENARIO DI LUAR HAPPY-PATH)

| ID | Fitur | Skenario Edge Case | Expected Behavior Ideal | Current Behavior Sistem | GAP / Temuan Tindakan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EDG-01** | Presensi | Peserta menekan tombol Check-In berulang kali secara cepat karena jaringan lelet (*double click*). | Hanya 1 data yang masuk; request kedua diabaikan dengan aman tanpa membuat data dobel. | Database menangani dengan blok *try-catch QueryException* dan me-return error: "Anda sudah presensi". | **Aman:** Sudah terproteksi dari *race condition*. |
| **EDG-02** | Presensi | Peserta lupa mematikan izin lokasi (*location permission blocked*) di browser Chrome. | Sistem menampilkan instruksi jelas cara mengaktifkan kembali izin lokasi pada peramban. | Halaman menampilkan alert: "Izin lokasi tidak diberikan. Harap izinkan akses lokasi pada browser Anda". | **Aman:** Error tertangani dengan informatif di frontend. |
| **EDG-03** | Presensi | Jam di laptop/ponsel peserta dimundurkan secara manual (misal jam 09:30 dimundurkan ke 07:15). | Sistem tetap menggunakan jam server yang tidak terpengaruh jam perangkat peserta. | Sistem mengambil `Carbon::now()` di server VPS. Jam lokal peserta diabaikan. | **Aman:** Tidak dapat dicurangi lewat jam perangkat. |
| **EDG-04** | Logbook | Peserta tidak masuk (izin/sakit), namun tetap mencoba mengisi logbook harian. | Sistem menolak pengisian logbook pada hari di mana peserta berstatus Izin/Sakit. | Sistem saat ini mengizinkan pembuatan logbook kapan saja tanpa memeriksa status presensi hari tersebut. | **GAP:** Perlu konfirmasi apakah orang izin sakit boleh mengisi logbook tugas mandiri dari rumah. |
| **EDG-05** | Approval | Pembimbing menyetujui izin seorang peserta, namun 2 jam kemudian pembimbing ingin membatalkan (*revert*). | Tersedia opsi untuk mengubah status kembali menjadi "Menunggu" atau "Ditolak". | Sistem mengizinkan pembimbing memanggil endpoint verifikasi ulang untuk memperbarui status. | **Aman:** Dapat diperbarui fleksibel oleh pembimbing. |
| **EDG-06** | Akun | Admin menghapus akun pembimbing yang masih memiliki 5 orang anak bimbingan aktif. | Sistem menolak penghapusan pembimbing sebelum seluruh anak bimbingan dialihkan (*re-plot*). | Database menolak penghapusan karena terlindungi aturan *Foreign Key Constraint*. | **Aman:** Data tidak akan menjadi *orphan/corrupt*. |
| **EDG-07** | Periode Magang | Mahasiswa selesai magang pada tanggal 30 September, tetapi pembimbing baru sempat mereview tugas di tanggal 5 Oktober. | Pembimbing tetap dapat mereview dan menilai tugas meskipun masa magang mahasiswa telah habis. | `PeriodeMagangService` hanya membatasi aksi peserta (*submit*); aksi pembimbing (*review*) tetap diizinkan. | **Aman:** Pembimbing tidak terkunci saat melakukan evaluasi akhir. |
| **EDG-08** | Plotting | Mahasiswa baru membuat akun dan langsung login sebelum di-plot oleh Admin. | Tampilan dashboard tidak crash/blank putih dan menampilkan peringatan ramah: "Anda belum memiliki pembimbing". | Semua controller dan frontend sudah diberi *null-safe guard* (`$pembimbingId = $plotting ? ... : null`). | **Aman:** Terbukti bebas dari *Null Pointer Exception*. |

---

# BAGIAN 9 — OPERATIONAL RISK (POTENSI BEBAN OPERASIONAL INSTANSI)

| Aspek Operasional | Analisis Potensi Masalah di Polifurneka | Kategori Dampak |
| :--- | :--- | :--- |
| **Input Data Pengguna Massal** | Admin instansi harus mendaftarkan akun puluhan mahasiswa magang setiap periode baru secara manual karena pendaftaran mandiri dikunci. | **Additional Burden** |
| **Ketiadaan Fitur Reset Mandiri** | Jika peserta lupa kata sandi, peserta tidak bisa klik "Lupa Password via Email" karena belum ada integrasi SMTP Mail server; peserta harus menghadap Admin untuk reset manual. | **Additional Burden** |
| **Ketergantungan Jam Server (NTP)** | Jika jam server hosting VPS berselisih 5 menit dari waktu resmi BMKG/WIB, batas absensi masuk 07:30 akan salah mendeteksi keterlambatan puluhan mahasiswa. | **Critical Operational Risk** |
| **Pembersihan Kuota Harddisk** | Foto logbook kegiatan harian peserta yang terakumulasi selama 1 tahun dapat menghabiskan kuota hosting murah jika tidak dilakukan *backup* dan *purge* berkala. | **Neutral / Manageable** |
| **Kemudahan Pemulihan Data (*Backup*)**| Seluruh data tersimpan di basis data relasional MySQL tunggal dan berkas di folder `storage/`, sehingga proses pencadangan (*backup*) harian sangat mudah diotomasi via cPanel Backup Wizard. | **Benefit** |
| **Kecepatan Rekap Laporan Bulanan** | Bagian administrasi tidak perlu lagi mengetik atau menghitung absensi manual; laporan resmi berformat Excel dan PDF tersedia dalam hitungan detik. | **Substantial Benefit** |

---

# BAGIAN 10 — "WHAT COULD GO WRONG?" (20 SKENARIO KEGAGALAN SISTEM)

Berikut analisis terhadap 20 skenario kegagalan fatal serta rekomendasi mitigasinya:

#### 1. GPS Ponsel/Laptop Tidak Tersedia atau Rusak
* **What happens now:** Peserta menerima error "Tidak dapat mengambil lokasi" dan tombol check-in terkunci.
* **What should happen:** Harus ada jalur alternatif (misal lapor ke satpam/pembimbing untuk absen manual).
* **Is current behavior safe?** Aman dari manipulasi, tetapi merugikan peserta beritikad baik.
* **Confirmation needed:** Ya (butuh SOP kehadiran darurat).
* **Recommended solution:** Sediakan tombol "Lapor Masalah GPS" yang mengirim sinyal ke dashboard pembimbing.

#### 2. Koneksi Internet Kampus / Peserta Terputus saat Submit Presensi
* **What happens now:** Axios timeout 20 detik muncul dengan alert "Gagal terhubung ke server".
* **What should happen:** Data tidak boleh tersimpan separuh.
* **Is current behavior safe?** Aman; transaksi database otomatis di-*rollback*.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Cukup minta peserta menekan tombol kirim ulang saat koneksi kembali stabil.

#### 3. Server Web Hosting Mengalami Crash / Mati Total
* **What happens now:** Web menampilkan "502 Bad Gateway" atau *Connection Refused*.
* **What should happen:** Staf Polifurneka harus memiliki lembar absensi kertas cadangan.
* **Is current behavior safe?** Berisiko tinggi terhadap kelancaran operasional.
* **Confirmation needed:** Ya (SOP darurat).
* **Recommended solution:** Vendor hosting harus menyediakan garansi *uptime SLA 99.9%*.

#### 4. Basis Data MySQL Mengalami Kegagalan Koneksi
* **What happens now:** Karena `APP_DEBUG=false`, API mengembalikan JSON rapi status 500 `"Server Error"` tanpa membocorkan kredensial.
* **Is current behavior safe?** Sangat aman dari sudut pandang keamanan informasi.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pastikan layanan database memiliki konfigurasi *auto-restart* jika terjadi kehabisan memori RAM.

#### 5. Pengguna Melakukan Double-Click (Klik Cepat Dua Kali)
* **What happens now:** Request pertama masuk, request kedua dibatalkan atau ditolak oleh constraint database dengan pesan "Anda sudah presensi".
* **Is current behavior safe?** Sangat aman; tabel `presensi` memiliki kombinasi *unique key* pada tanggal dan peserta.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan kode saat ini.

#### 6. Pengguna Merefresh Halaman Tepat Setelah Menekan Tombol Submit
* **What happens now:** Status tombol di React langsung beralih ke state `loading/submitting`. Refresh halaman hanya akan me-reload data terbaru dari server.
* **Is current behavior safe?** Aman.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan arsitektur React SPA saat ini.

#### 7. Peserta Membuka Akun di Dua Perangkat Secara Bersamaan
* **What happens now:** Kedua perangkat dapat login secara aktif karena Laravel Sanctum mengizinkan *multi-token*.
* **Is current behavior safe?** Aman untuk kemudahan akses (laptop dan HP), tetapi membuka potensi berbagi akun (*account sharing*).
* **Confirmation needed:** Ya.
* **Recommended solution:** Jika Polifurneka ingin sangat ketat, panggil `$user->tokens()->delete()` sebelum membuat token baru saat login.

#### 8. Peserta Memanipulasi Koordinat Menggunakan Fake GPS
* **What happens now:** Server menerima koordinat palsu yang lolos radius 500m dan mengizinkan presensi.
* **Is current behavior safe?** Tidak aman dari kecurangan.
* **Confirmation needed:** Ya.
* **Recommended solution:** Jadwalkan pengembangan fitur verifikasi swafoto kamera (*live photo capture*) pada versi rilis berikutnya.

#### 9. Peserta Mencoba Mengakses Data dan Berkas Peserta Lain via API
* **What happens now:** Server menolak request dengan status HTTP **403 Forbidden** (*"Anda tidak berhak melihat detail tugas ini / berkas bukti ini"*).
* **Is current behavior safe?** Sangat aman; celah IDOR telah diperbaiki total.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan validasi otorisasi controller saat ini.

#### 10. Pembimbing Salah Menekan Tombol Persetujuan (Harusnya Tolak tapi Tertelan Setuju)
* **What happens now:** Pembimbing dapat membuka kembali data izin atau logbook tersebut dan memperbarui statusnya sewaktu-waktu.
* **Is current behavior safe?** Aman dan fleksibel.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan kode saat ini.

#### 11. Pembimbing Lapangan Mengundurkan Diri atau Dimutasi Divisi
* **What happens now:** Mahasiswa bimbingannya akan tertahan karena pembimbing lama tidak lagi membuka sistem.
* **Is current behavior safe?** Tidak aman secara operasional.
* **Confirmation needed:** Ya.
* **Recommended solution:** Admin dapat menggunakan menu "Plotting Bimbingan" untuk memindahkan mahasiswa ke pembimbing baru kapan saja.

#### 12. Peserta Telah Melewati Tanggal Akhir Magang
* **What happens now:** Sistem otomatis menampilkan badge "Selesai Magang", menolak check-in, dan memblokir pengajuan izin baru.
* **Is current behavior safe?** Sangat aman; ditangani oleh `PeriodeMagangService`.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan logika yang ada.

#### 13. Peserta Mengundurkan Diri Sebelum Periode Magang Selesai
* **What happens now:** Akun peserta tetap aktif sampai tanggal selesai tercapai.
* **Is current behavior safe?** Berpotensi disalahgunakan.
* **Confirmation needed:** Ya.
* **Recommended solution:** Admin cukup masuk ke menu Manajemen Pengguna dan menekan tombol **"Toggle Status"** untuk menonaktifkan akun seketika.

#### 14. Admin Salah Menghapus Data Pengguna
* **What happens now:** Jika user memiliki relasi data presensi/logbook, database akan menolak penghapusan (*integrity constraint violation*).
* **Is current behavior safe?** Aman dari korupsi data historis.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Gunakan penonaktifan status (*soft disable*) daripada penghapusan fisik (*hard delete*).

#### 15. Rekapitulasi Data Laporan Berbeda dengan Jumlah Logbook Nyata
* **What happens now:** Modul laporan mengambil data secara langsung (*live SQL query join*) dari tabel logbook dan presensi yang sama, sehingga 100% sinkron dan konsisten.
* **Is current behavior safe?** Sangat aman.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan query ORM Eloquent saat ini.

#### 16. Pengunggahan File Gagal di Tengah Jalan Karena File Terlalu Besar
* **What happens now:** Frontend mengompres foto secara otomatis sebelum dikirim, dan backend membatasi maksimal 5MB. Jika gagal, alert kesalahan tampil jelas.
* **Is current behavior safe?** Aman.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan utilitas `imageCompressor.js`.

#### 17. Kapasitas Harddisk Storage Server Penuh (100% Disk Usage)
* **What happens now:** Upload file baru akan memicu error 500, tetapi pembacaan data teks tetap berjalan.
* **Is current behavior safe?** Berbahaya untuk kelangsungan sistem.
* **Confirmation needed:** Ya.
* **Recommended solution:** Vendor hosting harus mengaktifkan notifikasi peringatan email jika kuota disk mencapai 80%.

#### 18. Akun Pengguna Dinonaktifkan oleh Admin
* **What happens now:** Saat mencoba login, server mengembalikan error 403: *"Akun Anda sedang dinonaktifkan. Silakan hubungi admin."* Sesi login aktif langsung ditolak.
* **Is current behavior safe?** Sangat aman.
* **Confirmation needed:** Tidak.
* **Recommended solution:** Pertahankan pengecekan `status_aktif` di `AuthController.php`.

#### 19. Periode Magang Telah Berakhir Namun Tugas Perlu Direvisi
* **What happens now:** Sistem memberikan kelonggaran waktu (*grace period*) selama 3 hari kalender khusus untuk tugas yang berstatus "Perlu Revisi".
* **Is current behavior safe?** Sangat adil dan realistis terhadap proses akademik.
* **Confirmation needed:** Ya (apakah 3 hari cukup).
* **Recommended solution:** Konfirmasi durasi toleransi revisi kepada pembimbing instansi.

#### 20. Data Presensi Perlu Diperbaiki Karena Kesalahan Sistem
* **What happens now:** Saat ini Admin belum memiliki antarmuka untuk mengedit jam presensi peserta secara manual lewat web.
* **Is current behavior safe?** Mengurangi fleksibilitas operasional jika ada kesalahan teknis darurat.
* **Confirmation needed:** Ya.
* **Recommended solution:** Buat menu khusus "Koreksi Presensi Darurat" bagi Admin instansi dengan catatan audit trail.

---

# BAGIAN 11 — PERTANYAAN KONSULTASI UNTUK DOSEN PEMBIMBING / PENGUJI KP

Daftar topik ilmiah dan arsitektural yang disarankan untuk didiskusikan dengan Dosen Pembimbing Kerja Praktik Informatika Unsoed:

1. **Keabsahan Bukti Geofencing**: Apakah penggunaan Geofencing GPS berbasis peramban (*browser web*) sudah memenuhi standar metodologi pengujian perangkat lunak untuk laporan KP, dan bagaimana cara menjelaskan mitigasi pemalsuan lokasi (*mock locations*) dalam tinjauan kelemahan sistem di Bab V?
2. **Arsitektur Decoupled API**: Bagaimana menyajikan diagram UML (*Sequence Diagram* dan *Component Diagram*) yang merepresentasikan arsitektur terpisah antara Laravel REST API dan React SPA dengan mekanisme token stateless Sanctum?
3. **Penyimpanan Berkas Medis (Privasi Data)**: Apakah implementasi pemindahan berkas surat izin dokter ke direktori privat (`storage/app/private`) dengan *authenticated streaming response* sudah memenuhi kaidah perlindungan data pribadi mahasiswa pada pembahasan keamanan sistem?
4. **Metodologi Pengujian**: Apakah kombinasi antara pengujian fungsional *Black Box Testing* (22 test case terotomasi via PHPUnit) dan *User Acceptance Testing* (UAT kuesioner Likert) sudah mencukupi sebagai tolok ukur kelayakan sistem di Bab IV?
5. **Skalabilitas Nominatim API**: Bagaimana mempertahankan keputusan penggunaan OpenStreetMap Nominatim di hadapan penguji jika ditanya mengenai potensi *rate-limit bottleneck* saat seluruh peserta absen bersamaan?

---

# BAGIAN 12 — FINAL ACTION PLAN

### A. MUST FIX BEFORE TESTING (Wajib Diselesaikan Sebelum Uji Coba Pengguna)
1. Menentukan titik pusat koordinat dan radius Geofencing Polifurneka Kendal bersama penanggung jawab instansi.
2. Memastikan seluruh data dummy pengujian telah dibersihkan dan membuat akun percontohan (*seeder*) resmi untuk pengujian lapangan.
3. Menguji fungsionalitas pengunduhan dokumen privat bukti izin pada berbagai peramban (Chrome, Edge, Safari di iOS/Android).

### B. MUST FIX BEFORE DEPLOYMENT (Wajib Selesai Sebelum Go-Live di Server Vendor)
1. Memastikan domain server hosting telah terpasang **sertifikat SSL aktif (HTTPS)** (Wajib agar GPS browser berfungsi).
2. Memastikan file `.env` di server hosting disetel ke `APP_ENV=production` dan `APP_DEBUG=false`.
3. Memastikan file root `.htaccess` aktif untuk memblokir akses langsung ke file `.env` dan folder `.git`.
4. Mengatur izin akses folder server: `chmod -R 775 storage bootstrap/cache`.

### C. SHOULD FIX (Perbaikan Penting Bertahap)
1. Menambahkan fitur impor data pengguna massal dari file Excel (*Bulk Excel Import*) agar Admin tidak perlu mengetik akun puluhan peserta satu per satu.
2. Menambahkan fitur "Koreksi Presensi Darurat" bagi Admin jika terjadi listrik padam atau kendala teknis kampus.
3. Menambahkan tombol unduh bukti pada ekspor laporan berkas PDF.

### D. NICE TO HAVE (Peningkatan Kualitas di Masa Depan)
1. Integrasi kamera swafoto langsung (*live selfie capture*) saat melakukan check-in presensi untuk meminimalisasi joki absen.
2. Notifikasi pengingat presensi dan review logbook via WhatsApp Gateway / Email otomatis.
3. Desain antarmuka sertifikat magang digital dengan QR Code verifikasi keaslian dokumen.

### E. NEEDS STAKEHOLDER DECISION (Keputusan Hak Prerogatif Polifurneka)
1. Penentuan durasi masa simpan berkas (kebijakan retensi data logbook dan arsip magang).
2. Keputusan mengenai legalitas presensi dinas di luar kampus (apakah diperlukan alur izin tugas luar).
3. Penetapan formulasi nilai akhir magang (apakah diintegrasikan ke web atau tetap manual di lembar kampus).

---

# TOP 10 HAL KRITIS YANG KEMUNGKINAN BESAR BELUM TERPIKIRKAN OLEH DEVELOPER

Berdasarkan audit mendalam terhadap kode sumber dan alur operasional SIMONIKA, berikut adalah 10 celah desain dan operasional yang paling sering terlewatkan:

1. **Ketergantungan Mutlak GPS Browser pada HTTPS**:  
   Fitur HTML5 Geolocation **secara otomatis diblokir oleh browser** modern jika aplikasi diakses melalui alamat IP publik atau domain tanpa sertifikat SSL (HTTP biasa). Jika vendor hosting memasang web di `http://magang.poltek-furnitur.ac.id` tanpa SSL, seluruh tombol presensi akan lumpuh total.
2. **Ketiadaan Mekanisme Presensi Dinas Luar Kampus**:  
   Setelah fitur presensi luar dibersihkan demi menutup celah manipulasi, sistem kini terkunci 100% di radius 500m kampus. Jika ada peserta magang yang ditugaskan dinas 3 hari ke pabrik furnitur di luar kota, peserta tersebut sama sekali tidak memiliki cara legal untuk presensi di sistem.
3. **Beban Input Akun Manual oleh Admin**:  
   Sistem tidak mengizinkan pendaftaran mandiri (*no self-register*) dan belum memiliki tombol impor data dari Excel. Jika dalam satu tahun Polifurneka menerima 100 anak magang, Admin harus mengklik form "Tambah Pengguna" sebanyak 100 kali.
4. **Resiko *Rate-Limit* Server OpenStreetMap (Nominatim)**:  
   Fungsi `reverseGeocode` memanggil API publik OpenStreetMap setiap kali ada yang presensi. Jika 50 peserta menekan check-in bersamaan pada pukul 07:29 WIB, OpenStreetMap dapat memblokir IP server kampus karena dianggap melakukan *scraping/spam*, menyebabkan sistem macet (*hang*).
5. **Ketiadaan Penanganan Kasus "Lupa Check-Out"**:  
   Jika peserta hadir di pagi hari namun terburu-buru pulang sehingga lupa absen keluar hingga melewati jam 22:00 WIB, jam pulang mereka menjadi kosong selamanya. Tidak ada alur bagi peserta untuk meminta verifikasi checkout susulan kepada pembimbing.
6. **Ketiadaan Fitur Reset Kata Sandi Mandiri (*Self Password Reset*)**:  
   Karena sistem belum memiliki integrasi pengiriman email SMTP, peserta yang lupa kata sandi tidak bisa menekan tombol "Lupa Kata Sandi". Beban reset password akan sepenuhnya dilempar ke Admin kampus.
7. **Ketiadaan Penilaian Kuantitatif Akademik**:  
   Sistem sangat kaya akan fitur monitoring harian, namun tidak memiliki formulir penilaian akhir berbobot angka/huruf (misal: Disiplin 30%, Tugas 40%, Laporan 30%). Padahal, nilai akhir adalah luaran paling krusial yang diminta universitas asal mahasiswa magang.
8. **Akun Menggantung Jika Pembimbing Lapangan Mutasi/Cuti**:  
   Hak review tugas dan logbook terkunci rapat hanya pada 1 pembimbing yang di-plot. Jika pembimbing tersebut cuti melahirkan atau dinas luar negeri selama sebulan, seluruh logbook mahasiswa akan membeku dalam status "Menunggu" tanpa bisa diapprove oleh staf pengganti.
9. **Ketiadaan Audit Trail (Catatan Perubahan Data)**:  
   Jika seorang Admin mengubah status akun peserta atau mengganti pembimbing, tidak ada tabel riwayat log audit (`audit_logs`) yang mencatat siapa admin yang melakukan aksi tersebut dan kapan dilakukan. Hal ini menyulitkan investigasi jika terjadi sengketa data.
10. **Logbook Dapat Diisi Meski Berstatus Sakit/Izin**:  
    Sistem belum mengaitkan validasi antara tabel `izin` dan tabel `logbook`. Mahasiswa yang mengajukan izin sakit opname di rumah sakit masih dapat mengisi logbook harian seolah-olah mereka bekerja penuh di hari yang sama.
