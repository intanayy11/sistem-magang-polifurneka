<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_rate_limiting_blocks_after_too_many_attempts(): void
    {
        $email = 'target@poltek-furnitur.ac.id';

        // Attempt 5 failed logins
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'wrong_password',
            ]);
            $this->assertEquals(401, $response->status());
        }

        // 6th attempt should be throttled (HTTP 429)
        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(429);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Terlalu banyak percobaan login. Silakan tunggu 1 menit sebelum mencoba kembali.',
        ]);
    }

    public function test_query_token_is_not_accepted_in_url(): void
    {
        $user = User::create([
            'nama' => 'Admin Test',
            'email' => 'admin_test@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status_aktif' => true,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        // Try accessing protected route via ?token=... in URL (should be rejected 401)
        $response = $this->getJson("/api/me?token={$token}");
        $response->assertStatus(401);

        // Accessing via standard Authorization header should succeed
        $responseWithHeader = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me');
        $responseWithHeader->assertStatus(200);
    }

    public function test_peserta_cannot_view_other_peserta_tugas_detail_idor(): void
    {
        $peserta1 = User::create([
            'nama' => 'Peserta Satu',
            'email' => 'peserta1@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'peserta',
            'status_aktif' => true,
        ]);

        $peserta2 = User::create([
            'nama' => 'Peserta Dua',
            'email' => 'peserta2@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'peserta',
            'status_aktif' => true,
        ]);

        $pembimbing = User::create([
            'nama' => 'Pembimbing Test',
            'email' => 'pembimbing@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'pembimbing',
            'status_aktif' => true,
        ]);

        $tugasPeserta2 = \App\Models\Tugas::create([
            'pembimbing_id' => $pembimbing->user_id,
            'peserta_id' => $peserta2->user_id,
            'judul' => 'Tugas Rahasia Peserta 2',
            'deskripsi' => 'Deskripsi tugas',
            'deadline' => now()->addDays(7),
            'status' => 'Belum Dikerjakan',
        ]);

        // Peserta 1 tries to view Peserta 2's task -> MUST return 403 Forbidden
        $response = $this->actingAs($peserta1)
            ->getJson("/api/tugas/{$tugasPeserta2->tugas_id}");

        $response->assertStatus(403);
        $response->assertJson([
            'status' => 'error',
            'message' => 'Anda tidak berhak melihat detail tugas ini.',
        ]);

        // Peserta 2 views their own task -> MUST return 200 OK
        $responseOwn = $this->actingAs($peserta2)
            ->getJson("/api/tugas/{$tugasPeserta2->tugas_id}");

        $responseOwn->assertStatus(200);
        $responseOwn->assertJson([
            'status' => 'success',
        ]);
    }

    public function test_izin_file_bukti_is_protected_and_requires_authorization(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $fakeFile = \Illuminate\Http\UploadedFile::fake()->create('surat_dokter.pdf', 100, 'application/pdf');
        $path = $fakeFile->store('izin', 'local');

        $peserta1 = User::create([
            'nama' => 'Peserta Izin 1',
            'email' => 'peserta_izin1@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'peserta',
            'status_aktif' => true,
        ]);

        $peserta2 = User::create([
            'nama' => 'Peserta Izin 2',
            'email' => 'peserta_izin2@poltek-furnitur.ac.id',
            'password' => bcrypt('password123'),
            'role' => 'peserta',
            'status_aktif' => true,
        ]);

        $izin = \App\Models\Izin::create([
            'peserta_id' => $peserta1->user_id,
            'jenis' => 'Sakit',
            'tanggal_mulai' => '2026-09-12',
            'tanggal_selesai' => '2026-09-13',
            'keterangan' => 'Sakit demam',
            'file_bukti' => $path,
            'status' => 'Menunggu',
        ]);

        // 1. Unauthenticated request -> 401
        $unauthResponse = $this->getJson("/api/izin/{$izin->izin_id}/bukti");
        $unauthResponse->assertStatus(401);

        // 2. Peserta 2 tries to access Peserta 1's medical certificate -> 403 Forbidden
        $forbiddenResponse = $this->actingAs($peserta2)
            ->getJson("/api/izin/{$izin->izin_id}/bukti");
        $forbiddenResponse->assertStatus(403);
        $forbiddenResponse->assertJson([
            'status' => 'error',
            'message' => 'Anda tidak berhak mengakses berkas bukti ini.',
        ]);

        // 3. Peserta 1 accesses their own medical certificate -> 200 OK
        $ownerResponse = $this->actingAs($peserta1)
            ->getJson("/api/izin/{$izin->izin_id}/bukti");
        $ownerResponse->assertStatus(200);
    }
}
