# SIMONIKA — Sistem Monitoring Kegiatan Magang
### Politeknik Industri Furnitur dan Pengolahan Kayu Kendal (Polifurneka)

![Laravel 11](https://img.shields.io/badge/Backend-Laravel%2011-FF2D20?style=for-the-badge&logo=laravel)
![React 18](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)
![Vite](https://img.shields.io/badge/Build-Vite%208-646CFF?style=for-the-badge&logo=vite)

---

## 1. Tentang Sistem

**SIMONIKA (Sistem Monitoring Kegiatan Magang)** adalah platform aplikasi berbasis web modern yang dirancang khusus untuk mengelola, memantau, dan mendigitalisasi seluruh rangkaian kegiatan magang mahasiswa di lingkungan **Politeknik Industri Furnitur dan Pengolahan Kayu Kendal (Polifurneka)**.

Sistem ini dibangun dengan arsitektur terpisah (*Decoupled REST API*) antara **Frontend Single Page Application (SPA)** berbasis React.js dan **Backend Engine API** berbasis Laravel 11 dengan autentikasi token **Laravel Sanctum**.

---

## 2. Fitur Utama & Hak Akses (Multi-Role)

Sistem ini mendukung 3 peran pengguna (*Role-Based Access Control / RBAC*):

### **A. Peran Peserta Magang**
- **Presensi Harian Berbasis Koordinat GPS**:
  - Mencatat titik lokasi *Latitude & Longitude* secara real-time via HTML5 Geolocation API.
  - Penilaian otomatis status kehadiran (*Hadir, Terlambat*).
  - Proteksi jam kerja resmi Polifurneka:
    - **Senin s.d. Kamis**: Jam Masuk **07.30 WIB** • Jam Pulang **16.00 WIB**.
    - **Jum'at**: Jam Masuk **07.30 WIB** • Jam Pulang **16.30 WIB**.
  - **Sistem Proteksi Jam Pulang**: Menolak presensi pulang sebelum jam kerja berakhir.
  - **Weekend Protection**: Blokir presensi pada hari Sabtu dan Minggu (hari libur).
- **Logbook Kegiatan Harian**:
  - Mengisi judul, deskripsi kegiatan harian, kendala yang dihadapi, dan mengunggah foto bukti kegiatan (maks 2MB).
  - Melihat status peninjauan pembimbing (*Menunggu, Approve, Revisi*).
- **Pengajuan Ketidakhadiran (Izin / Sakit)**:
  - Mengajukan surat izin/sakit dengan melampirkan berkas bukti pendukung.
- **Tugas Magang**:
  - Menerima tugas dari pembimbing, mengumpulkan berkas/link hasil tugas, dan mengunggah versi revisi.
- **Profil Saya**:
  - Mengubah foto profil, nomor kontak WhatsApp, dan kata sandi akun.

---

### **B. Peran Pembimbing Lapangan**
- **Monitor Presensi & Lokasi GPS Interaktif (2-Tier Layout)**:
  - **Tier 1 (Atas)**: Ringkasan status presensi real-time hari ini untuk seluruh anak bimbingan (*Total, Sudah Absen, Belum Absen*).
  - **Tier 2 (Bawah)**: Filter dan tabel riwayat presensi historis per peserta magang.
  - **Modal Peta GPS**: Menampilkan koordinat lokasi presensi masuk/pulang pada peta interaktif Leaflet / OpenStreetMap.
  - **Klik Baris Interaktif**: Cukup menekan baris tabel mana saja untuk melihat detail presensi dan lokasi GPS.
- **Review Logbook Kegiatan**:
  - Memberikan persetujuan (*Approve*) atau catatan revisi pada laporan logbook harian mahasiswa bimbingan.
- **Verifikasi Pengajuan Izin / Sakit**:
  - Memeriksa dokumen bukti dan memberikan keputusan *Disetujui* atau *Ditolak*.
- **Manajemen & Evaluasi Tugas**:
  - Membuat tugas baru, menentukan batas tenggat (*deadline*), memeriksa hasil pengumpulan mahasiswa, serta memberikan penilaian/catatan revisi.

---

### **C. Peran Admin Instansi**
- **Dashboard Ringkasan Multi-Metrik**: Menampilkan total pengguna, jumlah peserta aktif, pembimbing, dan statistik magang.
- **Kelola Master User**: Tambah, edit, reset password, dan nonaktifkan akun user (*Peserta, Pembimbing, Admin*).
- **Plotting Bimbingan**: Memetakan (*assign*) hubungan bimbingan antara peserta magang dengan pembimbing lapangan.

---

## 3. Spesifikasi Teknologi (Tech Stack)

### **Frontend**
- **Framework**: React 18.3 (Single Page Application)
- **Build Tool**: Vite 8.1
- **Styling**: Tailwind CSS v4 (Design System Clean Academic & Bento Grid)
- **Icons**: Lucide React Icons
- **HTTP Client**: Axios (dengan Interceptor Sanctum Bearer Token)
- **Routing**: React Router DOM v6 (Role-Based Protected Routes)

### **Backend**
- **Framework Engine**: Laravel 11.x (PHP 8.2+)
- **Authentication**: Laravel Sanctum Token API
- **Database**: MySQL RDBMS 8.0+
- **PDF Generator**: Dompdf Engine (Export Rekapitulasi Presensi/Logbook)
- **File Storage**: Laravel Local Public Disk (`storage/app/public`)

---

## 4. Struktur Direktori Project

```
sistem-magang-polifurneka/
├── app/                        # Backend Logic (Laravel)
│   ├── Http/Controllers/       # API Controllers (Auth, Presensi, Logbook, Izin, Tugas, Dashboard)
│   ├── Models/                 # Eloquent Models (User, Presensi, Logbook, Izin, Tugas)
│   └── Services/               # PresensiService (Logika Jam Kerja & Toleransi)
├── database/                   # Migrations & Seeders Data Default
├── routes/
│   └── api.php                 # Endpoint API Route Terenkripsi Token
├── storage/                    # Public Storage (Foto Profil, Bukti Logbook, Berkas Izin)
├── frontend/                   # Frontend Client (React + Vite)
│   ├── public/                 # Favicon & Asset Statis
│   └── src/
│       ├── api/                # Konfigurasi Axios Interceptor
│       ├── assets/             # Logo Polifurneka & Gambar Gedung Kampus
│       ├── components/         # StatusBadge, MapModal, DovetailDivider, Layout, ProtectedRoute
│       ├── context/            # AuthContext (State Login & Token User)
│       └── pages/              # Halaman Auth, Peserta, Pembimbing, Admin, Profil
├── README.md                   # Dokumentasi Utama Projek
└── .env                        # Konfigurasi Backend Laravel
```

---

## 5. Prasyarat Sistem (Prerequisites)

Pastikan komputer/server Anda telah terinstall perangkat lunak berikut:

1. **Node.js** `>= 18.x` dan **npm** `>= 9.x` ([Download Node.js](https://nodejs.org/))
2. **PHP** `>= 8.2` (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`)
3. **Composer** `>= 2.x` ([Download Composer](https://getcomposer.org/))
4. **MySQL Database Server** `>= 8.0` atau **MariaDB** `>= 10.4` (via XAMPP / Laragon / Standalone)

---

## 6. Panduan Instalasi & Menjalankan Projek

Ikuti langkah-langkah di bawah ini secara runtut untuk menginstall dan menjalankan sistem di komputer lokal Anda:

### **Langkah 1: Setup Backend (Laravel API)**

1. Buka terminal/command prompt di direktori utama projek:
   ```bash
   cd c:\Users\LENOVO\Documents\KP\MAGANG\SISTEM_MAGANG\sistem-magang-polifurneka
   ```

2. Install dependency PHP menggunakan Composer:
   ```bash
   composer install
   ```

3. Salin file environment `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

4. Generate Application Encryption Key:
   ```bash
   php artisan key:generate
   ```

5. Buat database baru bernama `sistem_magang_polifurneka` di MySQL / phpMyAdmin.

6. Konfigurasi koneksi database di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sistem_magang_polifurneka
   DB_USERNAME=root
   DB_PASSWORD=
   ```

7. Jalankan Migrasi Database dan Data Seeder Akun Default:
   ```bash
   php artisan migrate:fresh --seed
   ```

8. Buat Symlink Storage ke Folder Public:
   ```bash
   php artisan storage:link
   ```

9. Jalankan Backend Server Laravel (secara default berjalan di `http://127.0.0.1:8000`):
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

---

### **Langkah 2: Setup Frontend (React + Vite)**

1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependency JavaScript menggunakan npm:
   ```bash
   npm install
   ```

3. Jalankan Frontend Development Server:
   ```bash
   npm run dev -- --host
   ```
   *Frontend akan berjalan di `http://localhost:5173` atau alamat IP lokal Anda (misal: `http://192.168.1.18:5173`).*

---

## 7. Akun Uji Coba Default (Seeder Credentials)

Setelah menjalankan `php artisan migrate:fresh --seed`, Anda dapat menggunakan akun bawaan berikut untuk menguji seluruh fitur:

| Peran (Role) | Email Login | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin Instansi** | `admin@poltek-furnitur.ac.id` | `password123` | Kelola User, Plotting Bimbingan, Master Data |
| **Pembimbing Lapangan** | `pembimbing@poltek-furnitur.ac.id` | `password123` | Monitor Presensi GPS, Review Logbook & Tugas |
| **Peserta Magang** | `peserta@poltek-furnitur.ac.id` | `password123` | Presensi GPS, Isi Logbook, Upload Izin & Tugas |

---

## 8. Aturan Jam Kerja Resmi Polifurneka

Ketentuan jam kerja presensi diatur di `app/Services/PresensiService.php`:

| Hari Kerja | Batas Masuk Tepat Waktu | Jam Kerja Berakhir (Pulang) |
| :--- | :---: | :---: |
| **Senin s.d. Kamis** | `07:30:00 WIB` | `16:00:00 WIB` |
| **Jum'at** | `07:30:00 WIB` | `16:30:00 WIB` |
| **Sabtu & Minggu** | *Libur Resmi* (Presensi Diblokir) | *Libur Resmi* |

---

## 9. Hak Cipta & Lisensi

Hak Cipta © 2026 **Politeknik Industri Furnitur dan Pengolahan Kayu Kendal (Polifurneka)**.  
Dikembangkan untuk mendukung kelancaran dan efisiensi pelaksanaan program magang industri mahasiswa.
