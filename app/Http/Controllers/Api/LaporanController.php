<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Presensi;
use App\Models\Logbook;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\Izin;
use App\Models\PlottingBimbingan;
use App\Services\PeriodeMagangService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'pembimbing_list' => [],
            'jurusan_list' => [],
            'posisi_list' => [],
            'jabatan_list' => [],
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

            $data['pembimbing_list'] = User::where('role', 'pembimbing')
                ->select('user_id', 'nama', 'email', 'jabatan')
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

            $data['jabatan_list'] = User::where('role', 'pembimbing')
                ->whereNotNull('jabatan')
                ->where('jabatan', '!=', '')
                ->distinct()
                ->pluck('jabatan')
                ->values();
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Helper privat untuk mengeksekusi query filter laporan berdasarkan kategori.
     */
    private function getFilteredData(Request $request): array
    {
        $user = $request->user();
        $kategoriLaporan = $request->input('kategori_laporan', 'aktivitas_magang');

        $tanggalMulai = $request->input('tanggal_mulai');
        $tanggalSelesai = $request->input('tanggal_selesai');
        $pesertaId = $request->input('peserta_id');
        $pembimbingId = $request->input('pembimbing_id');
        $jurusan = $request->input('jurusan');
        $posisiMagang = $request->input('posisi_magang');
        $jabatan = $request->input('jabatan');

        // Formatter Periode Teks
        $periodeTeks = 'Semua Periode';
        if ($tanggalMulai && $tanggalSelesai) {
            $periodeTeks = Carbon::parse($tanggalMulai)->translatedFormat('d F Y') . ' s/d ' . Carbon::parse($tanggalSelesai)->translatedFormat('d F Y');
        } elseif ($tanggalMulai) {
            $periodeTeks = 'Mulai ' . Carbon::parse($tanggalMulai)->translatedFormat('d F Y');
        } elseif ($tanggalSelesai) {
            $periodeTeks = 'Sampai ' . Carbon::parse($tanggalSelesai)->translatedFormat('d F Y');
        }

        // ═════════════════════════════════════════════════════════════════════
        // KATEGORI 1: AKTIVITAS MAGANG (Presensi, Logbook, Tugas, Izin)
        // ═════════════════════════════════════════════════════════════════════
        if ($kategoriLaporan === 'aktivitas_magang') {
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

            $includePresensi = in_array('semua', $types) || in_array('presensi', $types);
            $includeLogbook  = in_array('semua', $types) || in_array('logbook', $types);
            $includeTugas    = in_array('semua', $types) || in_array('tugas', $types);
            $includeIzin     = in_array('semua', $types) || in_array('izin', $types);

            $presensi = collect();
            $logbook = collect();
            $tugas = collect();
            $izin = collect();

            // Filter Spesifik
            $statusPresensi = $request->input('status_presensi', 'semua');
            $lokasiTipe     = $request->input('lokasi_tipe', 'semua');
            $statusLogbook  = $request->input('status_logbook', 'semua');
            $statusTugas    = $request->input('status_tugas', 'semua');
            $jenisIzin      = $request->input('jenis_izin', 'semua');
            $statusIzin     = $request->input('status_izin', 'semua');

            if ($includePresensi) {
                $q = Presensi::with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                    ->whereIn('peserta_id', $pesertaIds);

                if ($tanggalMulai) $q->whereDate('tanggal', '>=', $tanggalMulai);
                if ($tanggalSelesai) $q->whereDate('tanggal', '<=', $tanggalSelesai);
                if ($statusPresensi && $statusPresensi !== 'semua') $q->where('status', $statusPresensi);
                if ($lokasiTipe && $lokasiTipe !== 'semua') $q->where('lokasi_tipe', $lokasiTipe);

                $presensi = $q->orderBy('tanggal', 'desc')->get();
            }

            if ($includeLogbook) {
                $q = Logbook::with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                    ->whereIn('peserta_id', $pesertaIds);

                if ($tanggalMulai) $q->whereDate('tanggal', '>=', $tanggalMulai);
                if ($tanggalSelesai) $q->whereDate('tanggal', '<=', $tanggalSelesai);
                if ($statusLogbook && $statusLogbook !== 'semua') $q->where('status', $statusLogbook);

                $logbook = $q->orderBy('tanggal', 'desc')->get();
            }

            if ($includeTugas) {
                $q = Tugas::with([
                    'peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang',
                    'pembimbing:user_id,nama',
                    'pengumpulanTerakhir'
                ])->whereIn('peserta_id', $pesertaIds);

                if ($tanggalMulai) $q->whereDate('deadline', '>=', $tanggalMulai);
                if ($tanggalSelesai) $q->whereDate('deadline', '<=', $tanggalSelesai);
                if ($statusTugas && $statusTugas !== 'semua') $q->where('status', $statusTugas);

                $tugas = $q->orderBy('created_at', 'desc')->get();
            }

            if ($includeIzin) {
                $q = Izin::with('peserta:user_id,nama,nim_nis,asal_instansi,jurusan,posisi_magang')
                    ->whereIn('peserta_id', $pesertaIds);

                if ($tanggalMulai) $q->whereDate('tanggal_mulai', '>=', $tanggalMulai);
                if ($tanggalSelesai) $q->whereDate('tanggal_selesai', '<=', $tanggalSelesai);
                if ($jenisIzin && $jenisIzin !== 'semua') $q->where('jenis', $jenisIzin);
                if ($statusIzin && $statusIzin !== 'semua') $q->where('status', $statusIzin);

                $izin = $q->orderBy('created_at', 'desc')->get();
            }

            $pesertaInfo = count($pesertaIds) === 1 ? User::find($pesertaIds[0]) : null;

            return [
                'kategori_laporan' => 'aktivitas_magang',
                'user_role' => $user->role,
                'jenis_data' => $jenisData,
                'include_presensi' => $includePresensi,
                'include_logbook' => $includeLogbook,
                'include_tugas' => $includeTugas,
                'include_izin' => $includeIzin,
                'periode_teks' => $periodeTeks,
                'peserta_info' => $pesertaInfo,
                'jurusan_filter' => ($jurusan && $jurusan !== 'semua') ? $jurusan : null,
                'posisi_filter' => ($posisiMagang && $posisiMagang !== 'semua') ? $posisiMagang : null,
                'presensi' => $presensi,
                'logbook' => $logbook,
                'tugas' => $tugas,
                'izin' => $izin,
                'totals' => [
                    'presensi' => count($presensi),
                    'logbook' => count($logbook),
                    'tugas' => count($tugas),
                    'izin' => count($izin),
                    'total' => count($presensi) + count($logbook) + count($tugas) + count($izin),
                ]
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // KATEGORI 2: DATA PESERTA (Admin)
        // ═════════════════════════════════════════════════════════════════════
        if ($kategoriLaporan === 'data_peserta') {
            $statusPeriode = $request->input('status_periode', 'semua');
            $modeTampilan  = $request->input('mode_tampilan', 'daftar'); // daftar | rekap_kategori
            $rekapBy       = $request->input('rekap_by', 'jurusan'); // jurusan | posisi_magang | pembimbing

            $query = User::where('role', 'peserta')
                ->with(['plottingAsPeserta.pembimbing:user_id,nama']);

            if ($pesertaId && $pesertaId !== 'semua') $query->where('user_id', $pesertaId);
            if ($tanggalMulai) $query->whereDate('created_at', '>=', $tanggalMulai);
            if ($tanggalSelesai) $query->whereDate('created_at', '<=', $tanggalSelesai);
            if ($jurusan && $jurusan !== 'semua') $query->where('jurusan', $jurusan);
            if ($posisiMagang && $posisiMagang !== 'semua') $query->where('posisi_magang', $posisiMagang);
            if ($pembimbingId && $pembimbingId !== 'semua') {
                $query->whereHas('plottingAsPeserta', function ($q) use ($pembimbingId) {
                    $q->where('pembimbing_id', $pembimbingId);
                });
            }

            $rawPeserta = $query->orderBy('nama', 'asc')->get();

            // Filter status_periode via PeriodeMagangService
            $pesertaList = $rawPeserta->filter(function ($u) use ($statusPeriode) {
                $isAktif = PeriodeMagangService::apakahAktif($u);
                if ($statusPeriode === 'aktif') return $isAktif;
                if ($statusPeriode === 'selesai') return !$isAktif;
                return true;
            })->map(function ($u) {
                $u->is_magang_selesai = !PeriodeMagangService::apakahAktif($u);
                $u->pembimbing_nama = $u->plottingAsPeserta?->pembimbing?->nama ?? 'Belum Diplotting';
                return $u;
            })->values();

            // Handle Mode Rekap per Kategori
            $rekapGrouped = [];
            if ($modeTampilan === 'rekap_kategori') {
                $grouped = $pesertaList->groupBy(function ($item) use ($rekapBy) {
                    if ($rekapBy === 'pembimbing') return $item->pembimbing_nama;
                    if ($rekapBy === 'posisi_magang') return $item->posisi_magang ?: 'Tanpa Posisi';
                    return $item->jurusan ?: 'Tanpa Jurusan';
                });

                foreach ($grouped as $key => $items) {
                    $rekapGrouped[] = [
                        'kategori_label' => $key,
                        'total_peserta' => count($items),
                        'peserta_items' => $items,
                    ];
                }
            }

            return [
                'kategori_laporan' => 'data_peserta',
                'user_role' => $user->role,
                'periode_teks' => $periodeTeks,
                'mode_tampilan' => $modeTampilan,
                'rekap_by' => $rekapBy,
                'status_periode' => $statusPeriode,
                'peserta_list' => $pesertaList,
                'rekap_grouped' => $rekapGrouped,
                'totals' => [
                    'total_peserta' => count($pesertaList),
                ]
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // KATEGORI 3: DATA PEMBIMBING (Admin)
        // ═════════════════════════════════════════════════════════════════════
        if ($kategoriLaporan === 'data_pembimbing') {
            $query = User::where('role', 'pembimbing')
                ->withCount('plottingAsPembimbing as total_bimbingan');

            if ($pembimbingId && $pembimbingId !== 'semua') {
                $query->where('user_id', $pembimbingId);
            }
            if ($tanggalMulai) $query->whereDate('created_at', '>=', $tanggalMulai);
            if ($tanggalSelesai) $query->whereDate('created_at', '<=', $tanggalSelesai);
            if ($jabatan && $jabatan !== 'semua') {
                $query->where('jabatan', $jabatan);
            }

            $pembimbingList = $query->orderBy('nama', 'asc')->get();

            return [
                'kategori_laporan' => 'data_pembimbing',
                'user_role' => $user->role,
                'periode_teks' => $periodeTeks,
                'jabatan_filter' => ($jabatan && $jabatan !== 'semua') ? $jabatan : null,
                'pembimbing_list' => $pembimbingList,
                'totals' => [
                    'total_pembimbing' => count($pembimbingList),
                ]
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // KATEGORI 4: REKAPITULASI KEHADIRAN (Admin)
        // ═════════════════════════════════════════════════════════════════════
        if ($kategoriLaporan === 'rekapitulasi_kehadiran') {
            $sortOrder = $request->input('sort_order', 'asc'); // asc (terendah ke tertinggi) | desc

            $query = User::where('role', 'peserta');
            if ($jurusan && $jurusan !== 'semua') $query->where('jurusan', $jurusan);
            if ($pembimbingId && $pembimbingId !== 'semua') {
                $query->whereHas('plottingAsPeserta', function ($q) use ($pembimbingId) {
                    $q->where('pembimbing_id', $pembimbingId);
                });
            }

            $pesertaUsers = $query->get();

            $rekapKehadiran = $pesertaUsers->map(function ($p) use ($tanggalMulai, $tanggalSelesai) {
                $qPresensi = Presensi::where('peserta_id', $p->user_id);

                if ($tanggalMulai) $qPresensi->whereDate('tanggal', '>=', $tanggalMulai);
                if ($tanggalSelesai) $qPresensi->whereDate('tanggal', '<=', $tanggalSelesai);

                $presensiData = $qPresensi->get();
                $totalHari = count($presensiData);

                $jumlahHadir = $presensiData->where('status', 'Hadir')->count();
                $jumlahTerlambatCepat = $presensiData->whereIn('status', ['Terlambat', 'Pulang Cepat'])->count();
                $jumlahAlpha = $presensiData->where('status', 'Alpha')->count();

                $persentase = $totalHari > 0 ? round(($jumlahHadir / $totalHari) * 100, 1) : 0;

                return [
                    'user_id' => $p->user_id,
                    'nama' => $p->nama,
                    'nim_nis' => $p->nim_nis ?? '-',
                    'jurusan' => $p->jurusan ?? '-',
                    'total_hari' => $totalHari,
                    'jumlah_hadir' => $jumlahHadir,
                    'jumlah_terlambat_cepat' => $jumlahTerlambatCepat,
                    'jumlah_alpha' => $jumlahAlpha,
                    'persentase_kehadiran' => $persentase,
                ];
            });

            // Sorting default: TERENDAH ke tertinggi (asc)
            if ($sortOrder === 'desc') {
                $rekapKehadiran = $rekapKehadiran->sortByDesc('persentase_kehadiran')->values();
            } else {
                $rekapKehadiran = $rekapKehadiran->sortBy('persentase_kehadiran')->values();
            }

            return [
                'kategori_laporan' => 'rekapitulasi_kehadiran',
                'user_role' => $user->role,
                'periode_teks' => $periodeTeks,
                'sort_order' => $sortOrder,
                'rekap_kehadiran' => $rekapKehadiran,
                'totals' => [
                    'total_peserta' => count($rekapKehadiran),
                ]
            ];
        }

        // ═════════════════════════════════════════════════════════════════════
        // KATEGORI 5: LAPORAN PROGRAM MAGANG (Admin Ringkasan Lintas Domain)
        // ═════════════════════════════════════════════════════════════════════
        if ($kategoriLaporan === 'laporan_program_magang') {
            $allPeserta = User::where('role', 'peserta')->get();

            $totalPesertaAktif = $allPeserta->filter(fn($u) => PeriodeMagangService::apakahAktif($u))->count();
            $totalPesertaSelesai = $allPeserta->filter(fn($u) => !PeriodeMagangService::apakahAktif($u))->count();
            $totalPembimbingAktif = User::where('role', 'pembimbing')->where('status_aktif', true)->count();

            // Presensi stats dalam filter
            $qPresensi = Presensi::query();
            if ($tanggalMulai) $qPresensi->whereDate('tanggal', '>=', $tanggalMulai);
            if ($tanggalSelesai) $qPresensi->whereDate('tanggal', '<=', $tanggalSelesai);
            $totalPresensi = $qPresensi->count();
            $hadirCount = (clone $qPresensi)->where('status', 'Hadir')->count();
            $rataKehadiran = $totalPresensi > 0 ? round(($hadirCount / $totalPresensi) * 100, 1) : 0;

            // Tugas stats dalam filter
            $qTugas = Tugas::query();
            if ($tanggalMulai) $qTugas->whereDate('created_at', '>=', $tanggalMulai);
            if ($tanggalSelesai) $qTugas->whereDate('created_at', '<=', $tanggalSelesai);

            $tugasStats = [
                'selesai' => (clone $qTugas)->where('status', 'Selesai')->count(),
                'perlu_revisi' => (clone $qTugas)->where('status', 'Perlu Revisi')->count(),
                'belum_dikerjakan' => (clone $qTugas)->where('status', 'Belum Dikerjakan')->count(),
                'menunggu_review' => (clone $qTugas)->where('status', 'Menunggu Review')->count(),
                'total' => (clone $qTugas)->count(),
            ];

            // Logbook stats dalam filter
            $qLogbook = Logbook::query();
            if ($tanggalMulai) $qLogbook->whereDate('tanggal', '>=', $tanggalMulai);
            if ($tanggalSelesai) $qLogbook->whereDate('tanggal', '<=', $tanggalSelesai);

            $logbookStats = [
                'approve' => (clone $qLogbook)->where('status', 'Approve')->count(),
                'menunggu' => (clone $qLogbook)->where('status', 'Menunggu')->count(),
                'revisi' => (clone $qLogbook)->where('status', 'Revisi')->count(),
                'total' => (clone $qLogbook)->count(),
            ];

            return [
                'kategori_laporan' => 'laporan_program_magang',
                'user_role' => $user->role,
                'periode_teks' => $periodeTeks,
                'summary_cards' => [
                    'total_peserta_aktif' => $totalPesertaAktif,
                    'total_peserta_selesai' => $totalPesertaSelesai,
                    'total_pembimbing_aktif' => $totalPembimbingAktif,
                    'rata_kehadiran' => $rataKehadiran,
                    'tugas_stats' => $tugasStats,
                    'logbook_stats' => $logbookStats,
                ]
            ];
        }

        return ['kategori_laporan' => $kategoriLaporan];
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

        $kategoriSlug = Str::slug($result['kategori_laporan'] ?? 'laporan');
        $filename = 'Laporan_' . $kategoriSlug . '_' . date('Ymd_His') . '.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}

