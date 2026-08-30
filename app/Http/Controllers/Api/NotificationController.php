<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use App\Models\Izin;
use App\Models\PlottingBimbingan;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Mengambil daftar notifikasi pengingat & event nyata berbasis role (Peserta & Pembimbing).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = [];

        // Role Admin -> Kosongkan (tidak ada notifikasi lonceng untuk Admin)
        if ($user->role === 'admin') {
            return response()->json([
                'status' => 'success',
                'data' => [],
                'unread_count' => 0
            ]);
        }

        Carbon::setLocale('id');

        // ═════════════════════════════════════════════════════════════════════
        // ROLE: PESERTA MAGANG
        // ═════════════════════════════════════════════════════════════════════
        if ($user->role === 'peserta') {
            $today = Carbon::today()->toDateString();

            // 1. Pengingat Presensi Masuk (Jika hari kerja & belum absen masuk)
            $presensiHariIni = Presensi::where('peserta_id', $user->user_id)
                ->where('tanggal', $today)
                ->first();

            if (!$presensiHariIni && !Carbon::today()->isWeekend()) {
                $notifications[] = [
                    'id' => 'presensi_masuk_' . $today,
                    'title' => 'Pengingat Presensi Masuk',
                    'message' => 'Anda belum melakukan presensi masuk hari ini. Silakan catat presensi sebelum jam kerja berakhir.',
                    'time' => 'Hari ini',
                    'unread' => true,
                    'type' => 'warning',
                    'link' => '/peserta/presensi'
                ];
            } elseif ($presensiHariIni && !$presensiHariIni->jam_keluar && Carbon::now()->hour >= 16) {
                // 2. Pengingat Presensi Pulang
                $notifications[] = [
                    'id' => 'presensi_pulang_' . $today,
                    'title' => 'Pengingat Presensi Pulang',
                    'message' => 'Sudah memasuki jam pulang kerja. Jangan lupa catat presensi pulang Anda.',
                    'time' => 'Hari ini',
                    'unread' => true,
                    'type' => 'info',
                    'link' => '/peserta/presensi'
                ];
            }

            // 3. Tugas Magang yang Memerlukan Revisi
            $tugasRevisi = Tugas::with('pembimbing:user_id,nama')
                ->where('peserta_id', $user->user_id)
                ->where('status', 'Perlu Revisi')
                ->get();

            foreach ($tugasRevisi as $t) {
                $notifications[] = [
                    'id' => 'tugas_revisi_' . $t->tugas_id,
                    'title' => 'Tugas Perlu Revisi',
                    'message' => "Tugas '" . $t->judul . "' memerlukan perbaikan. Cek catatan revisi dari Pembimbing.",
                    'time' => $t->updated_at ? Carbon::parse($t->updated_at)->diffForHumans() : 'Baru saja',
                    'unread' => true,
                    'type' => 'danger',
                    'link' => '/peserta/tugas'
                ];
            }

            // 4. Tugas Magang Baru (Belum Dikerjakan)
            $tugasBaru = Tugas::with('pembimbing:user_id,nama')
                ->where('peserta_id', $user->user_id)
                ->where('status', 'Belum Dikerjakan')
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($tugasBaru as $t) {
                $deadlineText = $t->deadline ? Carbon::parse($t->deadline)->format('d M Y H:i') : '-';
                $notifications[] = [
                    'id' => 'tugas_baru_' . $t->tugas_id,
                    'title' => 'Tugas Magang Baru',
                    'message' => "Pembimbing memberikan tugas '" . $t->judul . "'. Deadline: " . $deadlineText,
                    'time' => $t->created_at ? Carbon::parse($t->created_at)->diffForHumans() : 'Baru saja',
                    'unread' => true,
                    'type' => 'info',
                    'link' => '/peserta/tugas'
                ];
            }

            // 5. Logbook yang Di-Revisi
            $logbookRevisi = Logbook::where('peserta_id', $user->user_id)
                ->where('status', 'Revisi')
                ->orderBy('tanggal', 'desc')
                ->take(3)
                ->get();

            foreach ($logbookRevisi as $l) {
                $tglStr = Carbon::parse($l->tanggal)->format('d M Y');
                $notifications[] = [
                    'id' => 'logbook_revisi_' . $l->logbook_id,
                    'title' => 'Logbook Perlu Perbaikan',
                    'message' => "Catatan kegiatan harian tanggal " . $tglStr . " memerlukan revisi dari Pembimbing.",
                    'time' => $l->updated_at ? Carbon::parse($l->updated_at)->diffForHumans() : 'Baru saja',
                    'unread' => true,
                    'type' => 'danger',
                    'link' => '/peserta/logbook'
                ];
            }
        }

        // ═════════════════════════════════════════════════════════════════════
        // ROLE: PEMBIMBING LAPANGAN
        // ═════════════════════════════════════════════════════════════════════
        if ($user->role === 'pembimbing') {
            // Ambil ID peserta bimbingan
            $pesertaIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->pluck('peserta_id')
                ->toArray();

            // 1. Logbook Baru Menunggu Approval
            $logbookPendingCount = Logbook::whereIn('peserta_id', $pesertaIds)
                ->where('status', 'Menunggu')
                ->count();

            if ($logbookPendingCount > 0) {
                $notifications[] = [
                    'id' => 'pembimbing_logbook_pending',
                    'title' => 'Logbook Menunggu Verifikasi',
                    'message' => $logbookPendingCount . ' logbook harian dari peserta bimbingan Anda memerlukan peninjauan.',
                    'time' => 'Hari ini',
                    'unread' => true,
                    'type' => 'info',
                    'link' => '/pembimbing/logbook'
                ];
            }

            // 2. Tugas Magang Menunggu Review (Peserta telah mengumpulkan)
            $tugasPending = Tugas::with('peserta:user_id,nama')
                ->whereIn('peserta_id', $pesertaIds)
                ->where('status', 'Menunggu Review')
                ->get();

            foreach ($tugasPending as $t) {
                $notifications[] = [
                    'id' => 'pembimbing_tugas_review_' . $t->tugas_id,
                    'title' => 'Pengumpulan Tugas Baru',
                    'message' => ($t->peserta?->nama ?? 'Peserta') . " mengumpulkan tugas '" . $t->judul . "' untuk ditinjau.",
                    'time' => $t->updated_at ? Carbon::parse($t->updated_at)->diffForHumans() : 'Baru saja',
                    'unread' => true,
                    'type' => 'success',
                    'link' => '/pembimbing/tugas'
                ];
            }

            // 3. Pengajuan Izin Baru Menunggu Verifikasi
            $izinPendingCount = Izin::whereIn('peserta_id', $pesertaIds)
                ->where('status', 'Menunggu')
                ->count();

            if ($izinPendingCount > 0) {
                $notifications[] = [
                    'id' => 'pembimbing_izin_pending',
                    'title' => 'Pengajuan Izin Baru',
                    'message' => $izinPendingCount . ' pengajuan izin/sakit dari peserta bimbingan Anda menunggu persetujuan.',
                    'time' => 'Hari ini',
                    'unread' => true,
                    'type' => 'warning',
                    'link' => '/pembimbing/izin'
                ];
            }
        }

        $unreadCount = count(array_filter($notifications, fn($n) => $n['unread']));

        return response()->json([
            'status' => 'success',
            'data' => array_values($notifications),
            'unread_count' => $unreadCount
        ]);
    }
}
