<?php

namespace Tests\Unit;

use App\Services\PresensiService;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class PresensiServiceTest extends TestCase
{
    public function test_jam_standar_senin_sampai_kamis()
    {
        // Monday (2026-07-20)
        $standarSenin = PresensiService::getJamStandar('2026-07-20');
        $this->assertEquals('07:30:00', $standarSenin['jam_masuk']);
        $this->assertEquals('16:00:00', $standarSenin['jam_pulang']);

        // Thursday (2026-07-23)
        $standarKamis = PresensiService::getJamStandar('2026-07-23');
        $this->assertEquals('07:30:00', $standarKamis['jam_masuk']);
        $this->assertEquals('16:00:00', $standarKamis['jam_pulang']);
    }

    public function test_jam_standar_jumat()
    {
        // Friday (2026-07-24)
        $standarJumat = PresensiService::getJamStandar('2026-07-24');
        $this->assertEquals('07:30:00', $standarJumat['jam_masuk']);
        $this->assertEquals('16:30:00', $standarJumat['jam_pulang']);
    }

    public function test_status_check_in_hadir()
    {
        // Senin check-in 07:25 -> Hadir
        $status = PresensiService::hitungStatusCheckIn('07:25:00', '2026-07-20');
        $this->assertEquals('Hadir', $status);

        // Senin check-in 07:30:00 -> Hadir (tepat waktu)
        $statusTepat = PresensiService::hitungStatusCheckIn('07:30:00', '2026-07-20');
        $this->assertEquals('Hadir', $statusTepat);
    }

    public function test_status_check_in_terlambat()
    {
        // Senin check-in 07:31:00 -> Terlambat
        $status = PresensiService::hitungStatusCheckIn('07:31:00', '2026-07-20');
        $this->assertEquals('Terlambat', $status);
    }

    public function test_status_check_out_senin_sampai_kamis()
    {
        // Senin check-out 15:55:00, status awal Hadir -> Pulang Cepat (karena jam standar 16:00)
        $statusCepat = PresensiService::hitungStatusCheckOut('15:55:00', 'Hadir', '2026-07-20');
        $this->assertEquals('Pulang Cepat', $statusCepat);

        // Senin check-out 16:00:00, status awal Hadir -> Hadir
        $statusNormal = PresensiService::hitungStatusCheckOut('16:00:00', 'Hadir', '2026-07-20');
        $this->assertEquals('Hadir', $statusNormal);

        // Senin check-out 15:55:00, status awal Terlambat -> Tetap Terlambat
        $statusTerlambat = PresensiService::hitungStatusCheckOut('15:55:00', 'Terlambat', '2026-07-20');
        $this->assertEquals('Terlambat', $statusTerlambat);
    }

    public function test_status_check_out_jumat()
    {
        // Jumat check-out 16:15:00, status awal Hadir -> Pulang Cepat (karena jam standar 16:30)
        $statusCepat = PresensiService::hitungStatusCheckOut('16:15:00', 'Hadir', '2026-07-24');
        $this->assertEquals('Pulang Cepat', $statusCepat);

        // Jumat check-out 16:30:00, status awal Hadir -> Hadir
        $statusNormal = PresensiService::hitungStatusCheckOut('16:30:00', 'Hadir', '2026-07-24');
        $this->assertEquals('Hadir', $statusNormal);
    }
}
