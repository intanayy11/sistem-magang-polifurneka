<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\PlottingBimbingan;
use App\Services\PresensiService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PresensiController extends Controller
{
    public function checkIn(Request $request)
    {
        $user = $request->user();
        $todayCarbon = Carbon::today();
        $today = $todayCarbon->toDateString();

        if ($todayCarbon->isWeekend()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hari ini adalah hari libur (Sabtu/Minggu). Tidak ada jadwal presensi.'
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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $now = Carbon::now();
        $jamMasuk = $now->toTimeString();
        $status = PresensiService::hitungStatusCheckIn($jamMasuk, $now);

        // Fallback default coordinates to Polifurneka Kendal (KIK) if browser GPS is blocked/null
        $lat = $request->latitude ?? -6.958742;
        $lng = $request->longitude ?? 110.285810;

        $presensi = Presensi::create([
            'peserta_id' => $user->user_id,
            'tanggal' => $today,
            'jam_masuk' => $jamMasuk,
            'latitude_masuk' => $lat,
            'longitude_masuk' => $lng,
            'status' => $status,
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
        $todayCarbon = Carbon::today();
        $today = $todayCarbon->toDateString();

        if ($todayCarbon->isWeekend()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hari ini adalah hari libur (Sabtu/Minggu). Tidak ada jadwal presensi.',
            ], 400);
        }

        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
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

        if ($now->lessThan($jamPulangStandar)) {
            $jamFmt = Carbon::parse($standar['jam_pulang'])->format('H:i');
            return response()->json([
                'status' => 'error',
                'message' => "Belum waktunya presensi pulang. Presensi pulang dapat dilakukan mulai pukul {$jamFmt} WIB."
            ], 400);
        }

        $jamPulang = $now->toTimeString();
        $status = PresensiService::hitungStatusCheckOut($jamPulang, $presensi->status, $now);

        // Fallback default coordinates to Polifurneka Kendal (KIK) if browser GPS is blocked/null
        $lat = $request->latitude ?? -6.958742;
        $lng = $request->longitude ?? 110.285810;

        $presensi->update([
            'jam_pulang' => $jamPulang,
            'latitude_pulang' => $lat,
            'longitude_pulang' => $lng,
            'status' => $status,
        ]);

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

        return response()->json([
            'status' => 'success',
            'data' => [
                'today' => $todayPresensi,
                'riwayat' => $riwayat
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
