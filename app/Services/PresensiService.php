<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\HariLibur;

class PresensiService
{
    public static function checkHariLibur($date = null): array
    {
        $carbonDate = $date ? Carbon::parse($date) : Carbon::now();
        $dateStr = $carbonDate->toDateString();
        $monthDayStr = $carbonDate->format('m-d');

        if ($carbonDate->isWeekend()) {
            return [
                'is_libur' => true,
                'kategori' => 'weekend',
                'keterangan' => 'Akhir Pekan (Sabtu/Minggu)',
            ];
        }

        $liburNasional = HariLibur::where('tanggal', $dateStr)->first();

        if ($liburNasional) {
            return [
                'is_libur' => true,
                'kategori' => 'nasional',
                'keterangan' => 'Hari Libur Nasional: ' . $liburNasional->keterangan,
            ];
        }

        $fixedHolidays = [
            '01-01' => 'Tahun Baru Masehi',
            '05-01' => 'Hari Buruh Internasional',
            '06-01' => 'Hari Lahir Pancasila',
            '08-17' => 'Proklamasi Kemerdekaan Republik Indonesia',
            '12-25' => 'Hari Raya Natal',
        ];

        if (array_key_exists($monthDayStr, $fixedHolidays)) {
            return [
                'is_libur' => true,
                'kategori' => 'nasional',
                'keterangan' => 'Hari Libur Nasional: ' . $fixedHolidays[$monthDayStr],
            ];
        }

        return [
            'is_libur' => false,
            'kategori' => 'kerja',
            'keterangan' => 'Hari Kerja',
        ];
    }

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

    public static function hitungStatusCheckIn(string $jamMasuk, $date = null): string
    {
        $standar = static::getJamStandar($date);

        $jamMasukCarbon = Carbon::parse($jamMasuk);
        $jamMasukStandarCarbon = Carbon::parse($standar['jam_masuk']);

        return $jamMasukCarbon->greaterThan($jamMasukStandarCarbon) ? 'Terlambat' : 'Hadir';
    }

    public static function hitungStatusCheckOut(string $jamPulang, string $currentStatus, $date = null): string
    {
        return $currentStatus;
    }

    public static function hitungJarakMeter($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371000;

        $dLat = deg2rad((float)$lat2 - (float)$lat1);
        $dLng = deg2rad((float)$lng2 - (float)$lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad((float)$lat1)) * cos(deg2rad((float)$lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    public static function reverseGeocode($lat, $lng): ?string
    {
        if (empty($lat) || empty($lng)) {
            return null;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'User-Agent' => 'SIMONIKA-Polifurneka/1.0 (sistem.magang@poltek-furnitur.ac.id)',
            ])->timeout(4)->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $lat,
                'lon' => $lng,
                'format' => 'json',
                'addressdetails' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['display_name'] ?? null;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Reverse geocoding error: ' . $e->getMessage());
        }

        return null;
    }
}

