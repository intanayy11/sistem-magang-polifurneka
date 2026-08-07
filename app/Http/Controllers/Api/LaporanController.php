<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\PlottingBimbingan;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    /**
     * GET /api/laporan/options
     * Mendapatkan opsi dropdown filter sesuai role yang login.
     */
    public function getFilterOptions(Request $request)
    {
        $user = $request->user();

        $data = [
            'peserta_list' => [],
            'jurusan_list' => [],
            'posisi_list' => [],
        ];

        if ($user->role === 'pembimbing') {
            $data['peserta_list'] = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                ->get()
                ->pluck('peserta')
                ->filter()
                ->values();
        } elseif ($user->role === 'admin') {
            $data['peserta_list'] = User::where('role', 'peserta')
                ->select('user_id', 'nama', 'nim_nis', 'asal_instansi', 'jurusan', 'posisi_magang')
                ->orderBy('nama', 'asc')
                ->get();

            $data['jurusan_list'] = User::where('role', 'peserta')
                ->whereNotNull('jurusan')
                ->where('jurusan', '!=', '')
                ->distinct()
                ->pluck('jurusan')
                ->values();

            $data['posisi_list'] = User::where('role', 'peserta')
                ->whereNotNull('posisi_magang')
                ->where('posisi_magang', '!=', '')
                ->distinct()
                ->pluck('posisi_magang')
                ->values();
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Helper privat untuk mengeksekusi query filter laporan.
     */
    private function getFilteredData(Request $request): array
    {
        $user = $request->user();

        $jenisData = $request->input('jenis_data', 'semua');
        $tanggalMulai = $request->input('tanggal_mulai');
        $tanggalSelesai = $request->input('tanggal_selesai');
        $pesertaId = $request->input('peserta_id');
        $jurusan = $request->input('jurusan');
        $posisiMagang = $request->input('posisi_magang');

        // Determine scope peserta_ids
        if ($user->role === 'peserta') {
            $pesertaIds = [$user->user_id];
        } elseif ($user->role === 'pembimbing') {
            $allowedIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->pluck('peserta_id')
                ->toArray();

            if ($pesertaId && $pesertaId !== 'semua' && in_array($pesertaId, $allowedIds)) {
                $pesertaIds = [(int)$pesertaId];
            } else {
                $pesertaIds = $allowedIds;
            }
        } else {
            // Admin
            if ($pesertaId && $pesertaId !== 'semua') {
                $pesertaIds = [(int)$pesertaId];
            } else {
                $queryUsers = User::where('role', 'peserta');
                if ($jurusan && $jurusan !== 'semua') {
                    $queryUsers->where('jurusan', $jurusan);
                }
                if ($posisiMagang && $posisiMagang !== 'semua') {
                    $queryUsers->where('posisi_magang', $posisiMagang);
                }
                $pesertaIds = $queryUsers->pluck('user_id')->toArray();
            }
        }

        $jenisData = $request->input('jenis_data', 'semua');
        if (is_array($jenisData)) {
            $types = $jenisData;
        } else {
            $types = explode(',', $jenisData);
        }

        // Determine which sections to include
        $includePresensi = in_array('semua', $types) || in_array('presensi', $types) || in_array('presensi_logbook', $types) || in_array('presensi_tugas', $types);
        $includeLogbook  = in_array('semua', $types) || in_array('logbook', $types) || in_array('presensi_logbook', $types) || in_array('logbook_tugas', $types);
        $includeTugas    = in_array('semua', $types) || in_array('tugas', $types) || in_array('presensi_tugas', $types) || in_array('logbook_tugas', $types);

        $presensi = collect();
        $logbook = collect();
        $tugas = collect();

        // 1. Presensi
        if ($includePresensi) {
            $q = Presensi::with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                ->whereIn('peserta_id', $pesertaIds);

            if ($tanggalMulai) {
                $q->whereDate('tanggal', '>=', $tanggalMulai);
            }
            if ($tanggalSelesai) {
                $q->whereDate('tanggal', '<=', $tanggalSelesai);
            }

            $presensi = $q->orderBy('tanggal', 'desc')->get();
        }

        // 2. Logbook
        if ($includeLogbook) {
            $q = Logbook::with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                ->whereIn('peserta_id', $pesertaIds);

            if ($tanggalMulai) {
                $q->whereDate('tanggal', '>=', $tanggalMulai);
            }
            if ($tanggalSelesai) {
                $q->whereDate('tanggal', '<=', $tanggalSelesai);
            }

            $logbook = $q->orderBy('tanggal', 'desc')->get();
        }

        // 3. Tugas
        if ($includeTugas) {
            $q = Tugas::with([
                'peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang',
                'pembimbing:user_id,nama',
                'pengumpulanTerakhir'
            ])->whereIn('peserta_id', $pesertaIds);

            if ($tanggalMulai) {
                $q->whereDate('deadline', '>=', $tanggalMulai);
            }
            if ($tanggalSelesai) {
                $q->whereDate('deadline', '<=', $tanggalSelesai);
            }

            $tugas = $q->orderBy('created_at', 'desc')->get();
        }

        // Prepare Summary Filter Info
        $pesertaInfo = null;
        if (count($pesertaIds) === 1) {
            $pesertaInfo = User::find($pesertaIds[0]);
        }

        $periodeTeks = 'Semua Tanggal';
        if ($tanggalMulai && $tanggalSelesai) {
            $periodeTeks = Carbon::parse($tanggalMulai)->translatedFormat('d F Y') . ' s/d ' . Carbon::parse($tanggalSelesai)->translatedFormat('d F Y');
        } elseif ($tanggalMulai) {
            $periodeTeks = 'Mulai ' . Carbon::parse($tanggalMulai)->translatedFormat('d F Y');
        } elseif ($tanggalSelesai) {
            $periodeTeks = 'Sampai ' . Carbon::parse($tanggalSelesai)->translatedFormat('d F Y');
        }

        return [
            'user_role' => $user->role,
            'jenis_data' => $jenisData,
            'include_presensi' => $includePresensi,
            'include_logbook' => $includeLogbook,
            'include_tugas' => $includeTugas,
            'periode_teks' => $periodeTeks,
            'peserta_info' => $pesertaInfo,
            'jurusan_filter' => ($jurusan && $jurusan !== 'semua') ? $jurusan : null,
            'posisi_filter' => ($posisiMagang && $posisiMagang !== 'semua') ? $posisiMagang : null,
            'presensi' => $presensi,
            'logbook' => $logbook,
            'tugas' => $tugas,
            'totals' => [
                'presensi' => count($presensi),
                'logbook' => count($logbook),
                'tugas' => count($tugas),
                'total' => count($presensi) + count($logbook) + count($tugas),
            ]
        ];
    }

    /**
     * GET /api/laporan/preview
     * Mengembalikan data pratinjau tabel laporan.
     */
    public function preview(Request $request)
    {
        $result = $this->getFilteredData($request);

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }

    /**
     * GET /api/laporan/export
     * Mengunduh PDF laporan resmi dengan Kop Surat Polifurneka.
     */
    public function exportPdf(Request $request)
    {
        Carbon::setLocale('id');
        $result = $this->getFilteredData($request);
        $user = $request->user();

        $pdf = Pdf::loadView('pdf.laporan', array_merge($result, [
            'user' => $user,
            'generatedAt' => now()->translatedFormat('d F Y H:i:s'),
        ]));

        $pdf->setPaper('A4', 'portrait');

        $filename = 'Laporan_Magang_' . str_replace(' ', '_', $user->nama) . '_' . date('Ymd') . '.pdf';
        return $pdf->download($filename);
    }
}
