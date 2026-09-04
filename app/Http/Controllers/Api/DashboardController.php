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

        // 5. Recent Logbooks & Recent Tugas for dashboard widgets
        $recentLogbooks = Logbook::where('peserta_id', $user->user_id)
            ->orderBy('tanggal', 'desc')
            ->take(5)
            ->get(['logbook_id', 'tanggal', 'judul_kegiatan', 'status']);

        $recentTugas = Tugas::where('peserta_id', $user->user_id)
            ->orderBy('deadline', 'asc')
            ->take(5)
            ->get(['tugas_id', 'judul as judul_tugas', 'deadline', 'status']);

        // 6. Data Pembimbing Lapangan (jika sudah di-plot)
        $plotting = PlottingBimbingan::where('peserta_id', $user->user_id)
            ->with('pembimbing:user_id,nama,email,no_hp,jabatan')
            ->first();
        $pembimbing = $plotting ? $plotting->pembimbing : null;

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
                'recent_logbooks' => $recentLogbooks,
                'recent_tugas' => $recentTugas,
                'pembimbing' => $pembimbing,
                // Status masa magang
                'is_magang_selesai'      => $user->isMagangSelesai(),
                'tanggal_selesai_magang' => $user->tanggal_selesai_magang,
            ]
        ]);
    }

    public function pembimbingDashboard(Request $request)
    {
        $user = $request->user();

        $pesertaIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)->pluck('peserta_id');

        $pesertaBimbingan = User::whereIn('user_id', $pesertaIds)
            ->select('user_id', 'nama', 'email', 'nim_nis', 'no_hp', 'status_aktif', 'tanggal_mulai_magang', 'tanggal_selesai_magang')
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
            ->get()
            ->map(function ($p) {
                $p->is_magang_selesai = ! \App\Services\PeriodeMagangService::apakahAktif($p);
                return $p;
            });

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
        $today = Carbon::today()->toDateString();

        // 1. Ambil Aktivitas Terbaru (Presensi, Logbook, Izin, Tugas)
        $latestPresensi = Presensi::with('peserta:user_id,nama')
            ->latest('updated_at')
            ->take(4)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => 'presensi_' . $p->presensi_id,
                    'tipe' => 'presensi',
                    'judul' => ($p->peserta->nama ?? 'Peserta') . ' melakukan presensi',
                    'sub' => 'Status: ' . $p->status . ($p->jam_masuk ? ' (' . substr($p->jam_masuk, 0, 5) . ' WIB)' : ''),
                    'waktu' => $p->updated_at ? $p->updated_at->diffForHumans() : 'Baru saja',
                    'timestamp' => $p->updated_at,
                ];
            });

        $latestLogbook = Logbook::with('peserta:user_id,nama')
            ->latest('created_at')
            ->take(4)
            ->get()
            ->map(function ($l) {
                return [
                    'id' => 'logbook_' . $l->logbook_id,
                    'tipe' => 'logbook',
                    'judul' => ($l->peserta->nama ?? 'Peserta') . ' mengisi logbook',
                    'sub' => $l->judul_kegiatan,
                    'waktu' => $l->created_at ? $l->created_at->diffForHumans() : 'Baru saja',
                    'timestamp' => $l->created_at,
                ];
            });

        $latestIzin = Izin::with('peserta:user_id,nama')
            ->latest('created_at')
            ->take(4)
            ->get()
            ->map(function ($i) {
                return [
                    'id' => 'izin_' . $i->izin_id,
                    'tipe' => 'izin',
                    'judul' => ($i->peserta->nama ?? 'Peserta') . ' mengajukan izin',
                    'sub' => 'Alasan: ' . $i->alasan . ' (' . $i->status . ')',
                    'waktu' => $i->created_at ? $i->created_at->diffForHumans() : 'Baru saja',
                    'timestamp' => $i->created_at,
                ];
            });

        $latestTugas = Tugas::with('pembimbing:user_id,nama')
            ->latest('created_at')
            ->take(4)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => 'tugas_' . $t->tugas_id,
                    'tipe' => 'tugas',
                    'judul' => 'Tugas: ' . $t->judul,
                    'sub' => 'Oleh: ' . ($t->pembimbing->nama ?? 'Pembimbing'),
                    'waktu' => $t->created_at ? $t->created_at->diffForHumans() : 'Baru saja',
                    'timestamp' => $t->created_at,
                ];
            });

        $recentActivities = collect()
            ->concat($latestPresensi)
            ->concat($latestLogbook)
            ->concat($latestIzin)
            ->concat($latestTugas)
            ->sortByDesc('timestamp')
            ->values()
            ->take(4);

        // 2. Statistik Kehadiran & Kedisiplinan
        $totalPresensi = Presensi::count();
        $hadirTepatWaktu = Presensi::where('status', 'Hadir')->count();
        $terlambat = Presensi::where('status', 'Terlambat')->count();
        $izinSakit = Presensi::whereIn('status', ['Izin', 'Sakit'])->count();
        $alpha = Presensi::where('status', 'Alpha')->count();
        $persentaseKehadiran = $totalPresensi > 0 ? round((($hadirTepatWaktu + $terlambat) / $totalPresensi) * 100, 1) : 0;

        // 3. Statistik Progres Aktivitas Magang (Logbook & Tugas)
        $totalLogbook = Logbook::count();
        $logbookDisetujui = Logbook::where('status', 'Disetujui')->count();
        $logbookMenunggu = Logbook::where('status', 'Menunggu')->count();
        $logbookRevisi = Logbook::where('status', 'Revisi')->count();

        $totalTugas = Tugas::count();
        $tugasSelesai = Tugas::where('status', 'Selesai')->count();
        $tugasMenungguReview = Tugas::where('status', 'Menunggu Review')->count();
        $tugasPerluRevisi = Tugas::where('status', 'Perlu Revisi')->count();
        $tugasBelumDikerjakan = Tugas::where('status', 'Belum Dikerjakan')->count();

        // 4. Beban Bimbingan per Pembimbing (Mentor Workload)
        $totalPeserta = User::where('role', 'peserta')->count();
        $totalPembimbing = User::where('role', 'pembimbing')->count();
        $totalPlotting = PlottingBimbingan::count();
        $rataRataBimbingan = $totalPembimbing > 0 ? round($totalPlotting / $totalPembimbing, 1) : 0;
        
        $plottedPesertaIds = PlottingBimbingan::pluck('peserta_id');
        $pesertaBelumPlotting = User::where('role', 'peserta')->whereNotIn('user_id', $plottedPesertaIds)->count();

        $pembimbingWorkload = User::where('role', 'pembimbing')
            ->select('user_id', 'nama', 'jabatan', 'email')
            ->withCount('plottingAsPembimbing as total_bimbingan')
            ->orderBy('total_bimbingan', 'desc')
            ->take(6)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => User::count(),
                'total_peserta' => $totalPeserta,
                'total_pembimbing' => $totalPembimbing,
                'total_admin' => User::where('role', 'admin')->count(),
                'total_plotting' => $totalPlotting,
                'presensi_hari_ini' => Presensi::where('tanggal', $today)->count(),
                'logbook_hari_ini' => Logbook::where('tanggal', $today)->count(),
                'izin_pending' => Izin::where('status', 'Menunggu')->count(),
                'tugas_aktif' => Tugas::whereIn('status', ['Belum Dikerjakan', 'Menunggu Review', 'Perlu Revisi'])->count(),
                'recent_activities' => $recentActivities,
                
                // Statistik Tambahan 1: Kehadiran
                'presensi_stats' => [
                    'total' => $totalPresensi,
                    'hadir_tepat_waktu' => $hadirTepatWaktu,
                    'terlambat' => $terlambat,
                    'izin_sakit' => $izinSakit,
                    'alpha' => $alpha,
                    'persentase_kehadiran' => $persentaseKehadiran,
                ],

                // Statistik Tambahan 2: Logbook & Tugas
                'logbook_stats' => [
                    'total' => $totalLogbook,
                    'disetujui' => $logbookDisetujui,
                    'menunggu' => $logbookMenunggu,
                    'revisi' => $logbookRevisi,
                ],
                'tugas_stats' => [
                    'total' => $totalTugas,
                    'selesai' => $tugasSelesai,
                    'menunggu_review' => $tugasMenungguReview,
                    'perlu_revisi' => $tugasPerluRevisi,
                    'belum_dikerjakan' => $tugasBelumDikerjakan,
                ],

                // Statistik Tambahan 3: Beban Bimbingan Pembimbing
                'mentor_workload' => [
                    'rata_rata' => $rataRataBimbingan,
                    'peserta_belum_plotting' => $pesertaBelumPlotting,
                    'list' => $pembimbingWorkload,
                ],
            ]
        ]);
    }
}
