<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\PeriodeMagangService;
use PHPUnit\Framework\TestCase;

class PeriodeMagangServiceTest extends TestCase
{
    public function test_apakah_aktif_peserta_dalam_periode()
    {
        $peserta = new User([
            'role' => 'peserta',
            'status_aktif' => true,
            'tanggal_mulai_magang' => '2026-06-01',
            'tanggal_selesai_magang' => '2026-08-31',
        ]);

        $this->assertTrue(PeriodeMagangService::apakahAktif($peserta, '2026-07-15'));
        $this->assertTrue(PeriodeMagangService::apakahAktif($peserta, '2026-06-01'));
        $this->assertTrue(PeriodeMagangService::apakahAktif($peserta, '2026-08-31'));
    }

    public function test_apakah_aktif_peserta_di_luar_periode()
    {
        $peserta = new User([
            'role' => 'peserta',
            'status_aktif' => true,
            'tanggal_mulai_magang' => '2026-06-01',
            'tanggal_selesai_magang' => '2026-08-31',
        ]);

        $this->assertFalse(PeriodeMagangService::apakahAktif($peserta, '2026-05-31'));
        $this->assertFalse(PeriodeMagangService::apakahAktif($peserta, '2026-09-01'));
    }

    public function test_apakah_aktif_peserta_nonaktif()
    {
        $peserta = new User([
            'role' => 'peserta',
            'status_aktif' => false,
            'tanggal_mulai_magang' => '2026-06-01',
            'tanggal_selesai_magang' => '2026-08-31',
        ]);

        $this->assertFalse(PeriodeMagangService::apakahAktif($peserta, '2026-07-15'));
    }

    public function test_dalam_grace_period_revisi()
    {
        $peserta = new User([
            'role' => 'peserta',
            'status_aktif' => true,
            'tanggal_mulai_magang' => '2026-06-01',
            'tanggal_selesai_magang' => '2026-08-31',
        ]);

        // Hari ke-1 setelah tanggal selesai magang (1 Sept 2026) -> Boleh
        $this->assertTrue(PeriodeMagangService::dalamGracePeriodRevisi($peserta, '2026-09-01'));
        // Hari ke-3 setelah tanggal selesai magang (3 Sept 2026) -> Boleh
        $this->assertTrue(PeriodeMagangService::dalamGracePeriodRevisi($peserta, '2026-09-03'));
        // Hari ke-4 setelah tanggal selesai magang (4 Sept 2026) -> Ditolak
        $this->assertFalse(PeriodeMagangService::dalamGracePeriodRevisi($peserta, '2026-09-04'));
    }
}
