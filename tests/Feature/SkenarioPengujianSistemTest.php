<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PlottingBimbingan;
use App\Models\Presensi;
use App\Models\Logbook;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SkenarioPengujianSistemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Atur waktu testing ke hari Rabu (hari kerja) jam 07:25 WIB
        Carbon::setTestNow(Carbon::create(2026, 9, 2, 7, 25, 0, 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function createPeserta(array $attributes = []): User
    {
        return User::create(array_merge([
            'nama' => 'Peserta Uji',
            'email' => 'peserta@polifurneka.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'peserta',
            'nim_nis' => '12345678',
            'asal_instansi' => 'Polifurneka',
            'status_aktif' => true,
            'tanggal_mulai_magang' => '2026-01-01',
            'tanggal_selesai_magang' => '2026-12-31',
        ], $attributes));
    }

    private function createPembimbing(array $attributes = []): User
    {
        return User::create(array_merge([
            'nama' => 'Pembimbing Uji',
            'email' => 'pembimbing@polifurneka.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'pembimbing',
            'status_aktif' => true,
        ], $attributes));
    }

    private function createAdmin(array $attributes = []): User
    {
        return User::create(array_merge([
            'nama' => 'Admin Sistem',
            'email' => 'admin@polifurneka.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status_aktif' => true,
        ], $attributes));
    }

    /* ══════════════════════════════════════════════════════════════
     * SKENARIO 1: UJI RADIUS & GEOFENCING PRESENSI POLIFURNEKA
     * ══════════════════════════════════════════════════════════════ */

    public function test_presensi_dalam_radius_kampus_berhasil()
    {
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        // Koordinat Polifurneka (-6.929428, 110.256226)
        $response = $this->postJson('/api/presensi/check-in', [
            'latitude' => -6.929428,
            'longitude' => 110.256226,
            'lokasi_tipe' => 'instansi',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertDatabaseHas('presensi', [
            'peserta_id' => $peserta->user_id,
            'tanggal' => '2026-09-02',
            'status' => 'Hadir',
        ]);
    }

    public function test_presensi_di_luar_radius_kampus_ditolak()
    {
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        // Koordinat jauh di luar kampus Polifurneka (> 10 km)
        $response = $this->postJson('/api/presensi/check-in', [
            'latitude' => -6.980000,
            'longitude' => 110.400000,
            'lokasi_tipe' => 'instansi',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
            ]);

        $this->assertDatabaseMissing('presensi', [
            'peserta_id' => $peserta->user_id,
            'tanggal' => '2026-09-02',
        ]);
    }

    /* ══════════════════════════════════════════════════════════════
     * SKENARIO 2: UJI PROTEKSI DOBEL PRESENSI (DOUBLE SUBMISSION)
     * ══════════════════════════════════════════════════════════════ */

    public function test_proteksi_dobel_presensi_masuk_di_hari_yang_sama()
    {
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        // Presensi Masuk Pertama
        $firstAttempt = $this->postJson('/api/presensi/check-in', [
            'latitude' => -6.929428,
            'longitude' => 110.256226,
            'lokasi_tipe' => 'instansi',
        ]);
        $firstAttempt->assertStatus(200);

        // Percobaan Presensi Masuk Kedua (Spam / Dobel klik)
        $secondAttempt = $this->postJson('/api/presensi/check-in', [
            'latitude' => -6.929428,
            'longitude' => 110.256226,
            'lokasi_tipe' => 'instansi',
        ]);

        $secondAttempt->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Anda sudah melakukan presensi masuk untuk hari ini.',
            ]);

        // Pastikan record di database tetap hanya 1
        $count = Presensi::where('peserta_id', $peserta->user_id)
            ->where('tanggal', '2026-09-02')
            ->count();
        $this->assertEquals(1, $count);
    }

    /* ══════════════════════════════════════════════════════════════
     * SKENARIO 3: UJI HAK AKSES / ROLE SECURITY
     * ══════════════════════════════════════════════════════════════ */

    public function test_peserta_dilarang_mengakses_endpoint_admin()
    {
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        // Mencoba mengambil data kelola user admin
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(403);

        // Mencoba membuat plotting bimbingan admin
        $responsePlotting = $this->postJson('/api/admin/plotting', [
            'pembimbing_id' => 1,
            'peserta_id' => $peserta->user_id,
        ]);
        $responsePlotting->assertStatus(403);
    }

    public function test_peserta_dilarang_mereview_logbook()
    {
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        $logbook = Logbook::create([
            'peserta_id' => $peserta->user_id,
            'tanggal' => '2026-09-02',
            'judul_kegiatan' => 'Merakit Prototype',
            'deskripsi' => 'Pengujian beban rak buku',
            'status' => 'Menunggu',
        ]);

        // Peserta mencoba menyetujui logbook sendiri
        $response = $this->putJson('/api/logbook/' . $logbook->logbook_id . '/review', [
            'status' => 'Disetujui',
        ]);

        $response->assertStatus(403);
    }

    public function test_pembimbing_hanya_bisa_review_peserta_bimbingannya()
    {
        $pembimbing1 = $this->createPembimbing(['email' => 'dosen1@polifurneka.ac.id']);
        $pembimbing2 = $this->createPembimbing(['email' => 'dosen2@polifurneka.ac.id']);
        $peserta = $this->createPeserta();

        // Plotting peserta ke pembimbing 1 saja
        PlottingBimbingan::create([
            'pembimbing_id' => $pembimbing1->user_id,
            'peserta_id' => $peserta->user_id,
        ]);

        $logbook = Logbook::create([
            'peserta_id' => $peserta->user_id,
            'tanggal' => '2026-09-02',
            'judul_kegiatan' => 'Pengecekan Komponen Mesin CNC',
            'deskripsi' => 'Melakukan kalibrasi sumbu XYZ',
            'status' => 'Menunggu',
        ]);

        // Pembimbing 2 (tidak di-plot) mencoba mereview
        Sanctum::actingAs($pembimbing2);
        $responsePembimbing2 = $this->putJson('/api/logbook/' . $logbook->logbook_id . '/review', [
            'status' => 'Disetujui',
            'catatan_pembimbing' => 'Bagus',
        ]);
        $responsePembimbing2->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Anda tidak berhak mereview logbook peserta ini.',
            ]);

        // Pembimbing 1 (yang sah) mereview
        Sanctum::actingAs($pembimbing1);
        $responsePembimbing1 = $this->putJson('/api/logbook/' . $logbook->logbook_id . '/review', [
            'status' => 'Disetujui',
            'catatan_pembimbing' => 'Kerja bagus, lanjutkan.',
        ]);
        $responsePembimbing1->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertDatabaseHas('logbook', [
            'logbook_id' => $logbook->logbook_id,
            'status' => 'Disetujui',
        ]);
    }

    /* ══════════════════════════════════════════════════════════════
     * SKENARIO 4: UJI VALIDASI UPLOAD FILE
     * ══════════════════════════════════════════════════════════════ */

    public function test_upload_logbook_format_file_terlarang_ditolak()
    {
        Storage::fake('public');
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        // Buat file terlarang (.php / .exe / .sh)
        $fakeScript = UploadedFile::fake()->create('malicious.php', 100, 'application/x-php');

        $response = $this->postJson('/api/logbook', [
            'tanggal' => '2026-09-02',
            'judul_kegiatan' => 'Aktivitas Harian',
            'deskripsi' => 'Penjelasan aktivitas',
            'foto_bukti' => $fakeScript,
        ]);

        // Harus gagal validasi 422
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['foto_bukti']);
    }

    public function test_upload_logbook_format_gambar_valid_berhasil()
    {
        Storage::fake('public');
        $peserta = $this->createPeserta();
        Sanctum::actingAs($peserta);

        $fakeImage = UploadedFile::fake()->image('dokumentasi_kegiatan.jpg');

        $response = $this->postJson('/api/logbook', [
            'tanggal' => '2026-09-02',
            'judul_kegiatan' => 'Aktivitas Magang Lapangan',
            'deskripsi' => 'Foto bukti kegiatan terlampir',
            'foto_bukti' => $fakeImage,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertDatabaseHas('logbook', [
            'peserta_id' => $peserta->user_id,
            'judul_kegiatan' => 'Aktivitas Magang Lapangan',
        ]);
    }
}
