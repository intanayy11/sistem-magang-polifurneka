<?php

namespace App\Services;

use Carbon\Carbon;

class PresensiService
{
    /**
     * Mendapatkan jam standar masuk & pulang berdasarkan hari presensi.
     *
     * Senin–Kamis: jam masuk standar 07:30, jam pulang standar 16:00
     * Jumat      : jam masuk standar 07:30, jam pulang standar 16:30
     *
     * @param Carbon|string|null $date
     * @return array{jam_masuk: string, jam_pulang: string}
     */
    public static function getJamStandar($date = null): array
    {
        $carbonDate = $date ? Carbon::parse($date) : Carbon::now();

        if ($carbonDate->isFriday()) {
            return [
                'jam_masuk' => env('PRESENSI_JAM_MASUK_JUMAT', '07:30:00'),
                'jam_pulang' => env('PRESENSI_JAM_PULANG_JUMAT', '16:30:00'),
            ];
        }

        return [
            'jam_masuk' => env('PRESENSI_JAM_MASUK', '07:30:00'),
            'jam_pulang' => env('PRESENSI_JAM_PULANG', '16:00:00'),
        ];
    }

    /**
     * Menentukan status presensi saat check-in (Hadir / Terlambat).
     *
     * @param string $jamMasuk Format HH:MM atau HH:MM:SS
     * @param Carbon|string|null $date Tanggal presensi (default: sekarang)
     * @return string 'Hadir' | 'Terlambat'
     */
    public static function hitungStatusCheckIn(string $jamMasuk, $date = null): string
    {
        $standar = static::getJamStandar($date);

        $jamMasukCarbon = Carbon::parse($jamMasuk);
        $jamMasukStandarCarbon = Carbon::parse($standar['jam_masuk']);

        return $jamMasukCarbon->greaterThan($jamMasukStandarCarbon) ? 'Terlambat' : 'Hadir';
    }

    /**
     * Menentukan status presensi saat check-out.
     * Status presensi tetap (Hadir atau Terlambat) karena check-out sebelum jam kerja resmi telah diblokir.
     *
     * @param string $jamPulang Format HH:MM atau HH:MM:SS
     * @param string $currentStatus Status presensi sebelum check-out
     * @param Carbon|string|null $date Tanggal presensi (default: sekarang)
     * @return string
     */
    public static function hitungStatusCheckOut(string $jamPulang, string $currentStatus, $date = null): string
    {
        return $currentStatus;
    }
}
