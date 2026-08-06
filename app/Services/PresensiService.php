<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\HariLibur;

class PresensiService
{
    /**
     * Memeriksa apakah tanggal yang diberikan adalah weekend atau hari libur nasional.
     *
     * @param Carbon|string|null $date
     * @return array{is_libur: bool, kategori: string, keterangan: string}
     */
    public static function checkHariLibur($date = null): array
    {
        $carbonDate = $date ? Carbon::parse($date) : Carbon::now();
        $dateStr = $carbonDate->toDateString();
        $monthDayStr = $carbonDate->format('m-d');

        // 1. Check Weekend (Otomatis berlaku untuk semua tahun 2025, 2026, 2027, dst)
        if ($carbonDate->isWeekend()) {
            return [
                'is_libur' => true,
                'kategori' => 'weekend',
                'keterangan' => 'Akhir Pekan (Sabtu/Minggu)',
            ];
        }

        // 2. Check Database (Hari Libur Nasional spesifik dari DB / Seeder / Input Admin)
        $liburNasional = HariLibur::where('tanggal', $dateStr)->first();

        if ($liburNasional) {
            return [
                'is_libur' => true,
                'kategori' => 'nasional',
                'keterangan' => 'Hari Libur Nasional: ' . $liburNasional->keterangan,
            ];
        }

        // 3. Check Libur Nasional Tetap Tanggal-Bulan (Otomatis berlaku setiap tahun)
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

    /**
     * Menghitung jarak antara dua titik koordinat GPS (dalam meter) menggunakan rumus Haversine.
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float Jarak dalam meter
     */
    public static function hitungJarakMeter($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $dLat = deg2rad((float)$lat2 - (float)$lat1);
        $dLng = deg2rad((float)$lng2 - (float)$lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad((float)$lat1)) * cos(deg2rad((float)$lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Mengubah koordinat GPS (latitude, longitude) menjadi deskripsi alamat fisik melalui OpenStreetMap Nominatim.
     *
     * @param float|string|null $lat
     * @param float|string|null $lng
     * @return string|null
     */
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
