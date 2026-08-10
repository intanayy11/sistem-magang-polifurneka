<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\PlottingBimbingan;
use App\Services\PresensiService;
use App\Services\PeriodeMagangService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PresensiController extends Controller
{
    public function checkIn(Request $request)
    {
        $user = $request->user();

        // Guard: periode magang peserta sudah berakhir / nonaktif
        if (! PeriodeMagangService::apakahAktif($user)) {
            $tglSelesai = $user->tanggal_selesai_magang
                ? Carbon::parse($user->tanggal_selesai_magang)->translatedFormat('d F Y')
                : null;
            $pesan = $tglSelesai 
                ? "Periode magang Anda telah berakhir pada {$tglSelesai}."
                : "Periode magang Anda telah berakhir.";
            return response()->json([
                'status'  => 'error',
                'message' => $pesan,
            ], 403);
        }

        $todayCarbon = Carbon::today();
        $today = $todayCarbon->toDateString();

        $liburCheck = PresensiService::checkHariLibur($todayCarbon);
        if ($liburCheck['is_libur']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hari ini adalah ' . $liburCheck['keterangan'] . '. Tidak ada jadwal presensi.'
            ], 400);
        }

        $existing = Presensi::where('peserta_id', $user->user_id)
            ->where('tanggal', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah melakukan presensi masuk untuk hari ini.'
            ], 400);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'lokasi_tipe' => 'nullable|in:instansi,luar',
            'keterangan_luar' => 'nullable|string',
        ]);

        $lokasiTipe = $request->lokasi_tipe ?? 'instansi';
        $keteranganLuar = trim($request->keterangan_luar ?? '');

        if ($lokasiTipe === 'luar' && empty($keteranganLuar)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Keterangan kegiatan luar wajib diisi.'
            ], 400);
        }

        $lat = (float) $request->latitude;
        $lng = (float) $request->longitude;

        if ($lokasiTipe === 'instansi') {
            $polifurnekaLat = config('presensi.polifurneka_lat', -6.929428);
            $polifurnekaLng = config('presensi.polifurneka_lng', 110.256226);
            $allowedRadius = config('presensi.radius_meter', 500);

            $distance = PresensiService::hitungJarakMeter($lat, $lng, $polifurnekaLat, $polifurnekaLng);

            if ($distance > $allowedRadius) {
                $distFmt = $distance >= 1000 ? round($distance / 1000, 2) . ' km' : round($distance) . ' meter';
                return response()->json([
                    'status' => 'error',
                    'message' => "Anda berada di luar lokasi Polifurneka (Jarak Anda: {$distFmt}, Maksimal: {$allowedRadius} meter). Gunakan Presensi Kegiatan Luar jika sedang bertugas di luar instansi."
                ], 400);
            }
        }

        $now = Carbon::now();
        $maxJamMasuk = Carbon::parse($today . ' 11:00:00');

        if ($now->greaterThan($maxJamMasuk)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Batas waktu presensi masuk hari ini telah berakhir (maksimal pukul 11:00 WIB).'
            ], 400);
        }

        $jamMasuk = $now->toTimeString();
        $status = PresensiService::hitungStatusCheckIn($jamMasuk, $now);

        $alamatMasuk = PresensiService::reverseGeocode($lat, $lng);

        $presensi = Presensi::create([
            'peserta_id' => $user->user_id,
            'tanggal' => $today,
            'jam_masuk' => $jamMasuk,
            'latitude_masuk' => $lat,
            'longitude_masuk' => $lng,
            'alamat_masuk' => $alamatMasuk,
            'status' => $status,
            'lokasi_tipe' => $lokasiTipe,
            'keterangan_luar' => $lokasiTipe === 'luar' ? $keteranganLuar : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi masuk berhasil (' . $status . ').',
            'data' => $presensi
        ]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();

        // Guard: periode magang peserta sudah berakhir / nonaktif
        if (! PeriodeMagangService::apakahAktif($user)) {
            $tglSelesai = $user->tanggal_selesai_magang
                ? Carbon::parse($user->tanggal_selesai_magang)->translatedFormat('d F Y')
                : null;
            $pesan = $tglSelesai 
                ? "Periode magang Anda telah berakhir pada {$tglSelesai}."
                : "Periode magang Anda telah berakhir.";
            return response()->json([
                'status'  => 'error',
                'message' => $pesan,
            ], 403);
        }

        $todayCarbon = Carbon::today();
        $today = $todayCarbon->toDateString();

        $liburCheck = PresensiService::checkHariLibur($todayCarbon);
        if ($liburCheck['is_libur']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hari ini adalah ' . $liburCheck['keterangan'] . '. Tidak ada jadwal presensi.',
            ], 400);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'lokasi_tipe' => 'nullable|in:instansi,luar',
            'keterangan_luar' => 'nullable|string',
        ]);

        $presensi = Presensi::where('peserta_id', $user->user_id)
            ->where('tanggal', $today)
            ->first();

        if (! $presensi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda belum melakukan presensi masuk hari ini.'
            ], 400);
        }

        if ($presensi->jam_pulang) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah melakukan presensi pulang hari ini.'
            ], 400);
        }

        $now = Carbon::now();
        $standar = PresensiService::getJamStandar($todayCarbon);
        $jamPulangStandar = Carbon::parse($today . ' ' . $standar['jam_pulang']);
        $maxJamPulang = Carbon::parse($today . ' 22:00:00');

        if ($now->lessThan($jamPulangStandar)) {
            $jamFmt = Carbon::parse($standar['jam_pulang'])->format('H:i');
            return response()->json([
                'status' => 'error',
                'message' => "Belum waktunya presensi pulang. Presensi pulang dapat dilakukan mulai pukul {$jamFmt} WIB."
            ], 400);
        }

        if ($now->greaterThan($maxJamPulang)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Batas waktu presensi pulang hari ini telah berakhir (maksimal pukul 22:00 WIB).'
            ], 400);
        }

        $lokasiTipe = $request->lokasi_tipe ?? $presensi->lokasi_tipe ?? 'instansi';
        $keteranganLuar = trim($request->keterangan_luar ?? '');

        if ($lokasiTipe === 'luar' && empty($keteranganLuar) && empty($presensi->keterangan_luar)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Keterangan kegiatan luar wajib diisi.'
            ], 400);
        }

        $lat = (float) $request->latitude;
        $lng = (float) $request->longitude;

        if ($lokasiTipe === 'instansi') {
            $polifurnekaLat = config('presensi.polifurneka_lat', -6.929428);
            $polifurnekaLng = config('presensi.polifurneka_lng', 110.256226);
            $allowedRadius = config('presensi.radius_meter', 500);

            $distance = PresensiService::hitungJarakMeter($lat, $lng, $polifurnekaLat, $polifurnekaLng);

            if ($distance > $allowedRadius) {
                $distFmt = $distance >= 1000 ? round($distance / 1000, 2) . ' km' : round($distance) . ' meter';
                return response()->json([
                    'status' => 'error',
                    'message' => "Anda berada di luar lokasi Polifurneka (Jarak Anda: {$distFmt}, Maksimal: {$allowedRadius} meter). Gunakan Presensi Kegiatan Luar jika sedang bertugas di luar instansi."
                ], 400);
            }
        }

        $jamPulang = $now->toTimeString();
        $status = PresensiService::hitungStatusCheckOut($jamPulang, $presensi->status, $now);

        $alamatPulang = PresensiService::reverseGeocode($lat, $lng);

        $updateData = [
            'jam_pulang' => $jamPulang,
            'latitude_pulang' => $lat,
            'longitude_pulang' => $lng,
            'alamat_pulang' => $alamatPulang,
            'status' => $status,
            'lokasi_tipe' => $lokasiTipe,
        ];

        if ($lokasiTipe === 'luar' && !empty($keteranganLuar)) {
            $updateData['keterangan_luar'] = $keteranganLuar;
        }

        $presensi->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi pulang berhasil.',
            'data' => $presensi
        ]);
    }

    public function riwayat(Request $request)
    {
        $user = $request->user();

        $riwayat = Presensi::where('peserta_id', $user->user_id)
            ->orderBy('tanggal', 'desc')
            ->get();

        $today = Carbon::today()->toDateString();
        $todayPresensi = Presensi::where('peserta_id', $user->user_id)
            ->where('tanggal', $today)
            ->first();

        $liburInfo = PresensiService::checkHariLibur(Carbon::today());

        return response()->json([
            'status' => 'success',
            'data' => [
                'today' => $todayPresensi,
                'riwayat' => $riwayat,
                'libur_info' => $liburInfo,
            ]
        ]);
    }

    public function presensiPeserta(Request $request, $peserta_id)
    {
        $user = $request->user();

        if ($user->role === 'pembimbing') {
            $isAssigned = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->where('peserta_id', $peserta_id)
                ->exists();

            if (! $isAssigned) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta ini tidak berada dalam bimbingan Anda.'
                ], 403);
            }
        }

        $riwayat = Presensi::where('peserta_id', $peserta_id)
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $riwayat
        ]);
    }
}
