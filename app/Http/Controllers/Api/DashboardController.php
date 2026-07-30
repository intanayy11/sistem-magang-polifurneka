<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use App\Models\Izin;
use App\Models\PlottingBimbingan;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function pesertaDashboard(Request $request)
    {
        $user = $request->user();

        // 1. Kehadiran stats
        $totalPresensi = Presensi::where('peserta_id', $user->user_id)->count();
        $hadirCount = Presensi::where('peserta_id', $user->user_id)->whereIn('status', ['Hadir', 'Terlambat', 'Pulang Cepat'])->count();
        $persentaseKehadiran = $totalPresensi > 0 ? round(($hadirCount / $totalPresensi) * 100, 1) : 0;

        // 2. Pending logbook count
        $logbookPendingCount = Logbook::where('peserta_id', $user->user_id)
            ->where('status', 'Menunggu')
            ->count();

        // 3. Tugas count per status
        $tugasStats = [
            'belum_dikerjakan' => Tugas::where('peserta_id', $user->user_id)->where('status', 'Belum Dikerjakan')->count(),
            'menunggu_review' => Tugas::where('peserta_id', $user->user_id)->where('status', 'Menunggu Review')->count(),
            'perlu_revisi' => Tugas::where('peserta_id', $user->user_id)->where('status', 'Perlu Revisi')->count(),
            'selesai' => Tugas::where('peserta_id', $user->user_id)->where('status', 'Selesai')->count(),
        ];

        // 4. Status presensi hari ini
        // 4. Status presensi hari ini
        $today = Carbon::today()->toDateString();
        $todayPresensi = Presensi::where('peserta_id', $user->user_id)->where('tanggal', $today)->first();
        $sudahPresensiHariIni = $todayPresensi !== null;
        $jamSekarang = Carbon::now()->format('H:i');

        return response()->json([
            'status' => 'success',
            'data' => [
                'persentase_kehadiran' => $persentaseKehadiran,
                'total_presensi' => $totalPresensi,
                'hadir_count' => $hadirCount,
                'logbook_pending_count' => $logbookPendingCount,
                'tugas_stats' => $tugasStats,
                'today_presensi' => $todayPresensi,
                'sudah_presensi_hari_ini' => $sudahPresensiHariIni,
                'jam_sekarang' => $jamSekarang,
            ]
        ]);
    }

    public function pembimbingDashboard(Request $request)
    {
        $user = $request->user();

        $pesertaIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)->pluck('peserta_id');

        $pesertaBimbingan = User::whereIn('user_id', $pesertaIds)
            ->select('user_id', 'nama', 'email', 'nim_nis', 'no_hp', 'status_aktif')
            ->withCount([
                'logbook as logbook_pending_count' => function ($q) {
                    $q->where('status', 'Menunggu');
                },
                'izin as izin_pending_count' => function ($q) {
                    $q->where('status', 'Menunggu');
                },
                'tugasAsPeserta as tugas_review_count' => function ($q) {
                    $q->where('status', 'Menunggu Review');
                }
            ])
            ->get();

        $totalLogbookPending = Logbook::whereIn('peserta_id', $pesertaIds)->where('status', 'Menunggu')->count();
        $totalIzinPending = Izin::whereIn('peserta_id', $pesertaIds)->where('status', 'Menunggu')->count();
        $totalTugasReview = Tugas::where('pembimbing_id', $user->user_id)->where('status', 'Menunggu Review')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_peserta' => count($pesertaIds),
                'total_logbook_pending' => $totalLogbookPending,
                'total_izin_pending' => $totalIzinPending,
                'total_tugas_review' => $totalTugasReview,
                'peserta_bimbingan' => $pesertaBimbingan,
            ]
        ]);
    }

    public function adminDashboard(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => User::count(),
                'total_peserta' => User::where('role', 'peserta')->count(),
                'total_pembimbing' => User::where('role', 'pembimbing')->count(),
                'total_admin' => User::where('role', 'admin')->count(),
                'total_plotting' => PlottingBimbingan::count(),
            ]
        ]);
    }
}
