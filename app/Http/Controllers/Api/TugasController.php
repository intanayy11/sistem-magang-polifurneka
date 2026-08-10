<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\PlottingBimbingan;
use App\Models\User;
use App\Services\PeriodeMagangService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'peserta') {
            $tugas = Tugas::where('peserta_id', $user->user_id)
                ->with(['pembimbing:user_id,nama', 'pengumpulan'])
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'pembimbing') {
            $tugas = Tugas::where('pembimbing_id', $user->user_id)
                ->with(['peserta:user_id,nama,nim_nis', 'pengumpulan'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $tugas = Tugas::with(['peserta:user_id,nama', 'pembimbing:user_id,nama', 'pengumpulan'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $tugas
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'peserta_id' => 'required|exists:users,user_id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline' => 'required|date',
            'file_lampiran' => 'nullable|file|mimes:jpg,jpeg,png,pdf,zip,rar,doc,docx|max:5120',
        ]);

        $peserta = User::findOrFail($request->peserta_id);
        $tglSelesaiFmt = $peserta->tanggal_selesai_magang
            ? Carbon::parse($peserta->tanggal_selesai_magang)->translatedFormat('d F Y')
            : null;

        // Guard: HANYA peserta yang aktif yang boleh diberi tugas baru
        if (! PeriodeMagangService::apakahAktif($peserta)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Peserta ' . $peserta->nama . ' sudah selesai masa magang. Tidak dapat membuat tugas baru.',
            ], 403);
        }

        // Validasi: deadline tidak boleh melebihi tanggal_selesai_magang milik peserta yang dipilih
        if ($peserta->tanggal_selesai_magang) {
            $deadlineDate = Carbon::parse($request->deadline)->startOfDay();
            $selesaiDate  = Carbon::parse($peserta->tanggal_selesai_magang)->startOfDay();
            if ($deadlineDate->gt($selesaiDate)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Deadline tidak boleh melebihi tanggal selesai magang peserta ({$tglSelesaiFmt}).",
                ], 422);
            }
        }

        $filePath = null;
        if ($request->hasFile('file_lampiran')) {
            $path = $request->file('file_lampiran')->store('tugas_lampiran', 'public');
            $filePath = 'storage/' . $path;
        }

        $tugas = Tugas::create([
            'pembimbing_id' => $user->user_id,
            'peserta_id' => $request->peserta_id,
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'deadline' => $request->deadline,
            'file_lampiran' => $filePath,
            'status' => 'Belum Dikerjakan',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tugas baru berhasil dibuat.',
            'data' => $tugas
        ], 201);
    }

    public function show($id)
    {
        $tugas = Tugas::with(['peserta:user_id,nama,nim_nis', 'pembimbing:user_id,nama', 'pengumpulan'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $tugas
        ]);
    }

    public function submit(Request $request, $id)
    {
        $user = $request->user();
        $tugas = Tugas::findOrFail($id);

        if ($tugas->peserta_id != $user->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mengumpulkan tugas ini.'
            ], 403);
        }

        // Guard Periode Magang & Grace Period Revisi Tugas
        if (! PeriodeMagangService::apakahAktif($user)) {
            $tglSelesai = $user->tanggal_selesai_magang
                ? Carbon::parse($user->tanggal_selesai_magang)->translatedFormat('d F Y')
                : null;
            $pesanDefault = $tglSelesai 
                ? "Periode magang Anda telah berakhir pada {$tglSelesai}."
                : "Periode magang Anda telah berakhir.";

            // Pengecualian: Grace period 3 hari kalender khusus tugas berstatus "Perlu Revisi"
            if ($tugas->status === 'Perlu Revisi') {
                if (! PeriodeMagangService::dalamGracePeriodRevisi($user)) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => "Batas waktu grace period (3 hari) untuk pengumpulan revisi tugas telah berakhir.",
                    ], 403);
                }
            } else {
                return response()->json([
                    'status'  => 'error',
                    'message' => $pesanDefault,
                ], 403);
            }
        }

        $request->validate([
            'file_hasil' => 'nullable|file|mimes:jpg,jpeg,png,pdf,zip,rar,doc,docx,xlsx|max:5120',
            'link_hasil' => 'nullable|url',
        ]);

        if (! $request->hasFile('file_hasil') && ! $request->link_hasil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Harap unggah berkas atau masukkan tautan link hasil kerja.'
            ], 422);
        }

        $fileHasilValue = '';
        if ($request->hasFile('file_hasil')) {
            $path = $request->file('file_hasil')->store('pengumpulan_tugas', 'public');
            $fileHasilValue = 'storage/' . $path;
        } else {
            $fileHasilValue = $request->link_hasil;
        }

        $lastSubmission = PengumpulanTugas::where('tugas_id', $id)->orderBy('versi_ke', 'desc')->first();
        $nextVersion = $lastSubmission ? ($lastSubmission->versi_ke + 1) : 1;

        $pengumpulan = PengumpulanTugas::create([
            'tugas_id' => $id,
            'file_hasil' => $fileHasilValue,
            'versi_ke' => $nextVersion,
            'catatan_revisi' => null,
            'tanggal_submit' => Carbon::now(),
        ]);

        $tugas->update([
            'status' => 'Menunggu Review'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Hasil kerja tugas berhasil dikumpulkan (Versi ' . $nextVersion . ').',
            'data' => $pengumpulan
        ]);
    }

    public function review(Request $request, $id)
    {
        $user = $request->user();

        $request->validate([
            'status' => 'required|in:Perlu Revisi,Selesai',
            'catatan_revisi' => 'nullable|string',
        ]);

        $tugas = Tugas::findOrFail($id);

        if ($user->role === 'pembimbing' && $tugas->pembimbing_id != $user->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mereview tugas ini.'
            ], 403);
        }

        $tugas->update([
            'status' => $request->status
        ]);

        $latestPengumpulan = PengumpulanTugas::where('tugas_id', $id)
            ->orderBy('versi_ke', 'desc')
            ->first();

        if ($latestPengumpulan && $request->catatan_revisi) {
            $latestPengumpulan->update([
                'catatan_revisi' => $request->catatan_revisi
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Review tugas berhasil diperbarui menjadi ' . $request->status,
            'data' => $tugas
        ]);
    }

    public function pembimbingPesertaList(Request $request)
    {
        $user = $request->user();

        // HANYA tampilkan peserta yang periode magangnya masih aktif (apakahAktif() === true)
        $pesertaList = PlottingBimbingan::where('pembimbing_id', $user->user_id)
            ->with('peserta:user_id,nama,nim_nis,email,tanggal_mulai_magang,tanggal_selesai_magang,status_aktif')
            ->get()
            ->pluck('peserta')
            ->filter(function ($peserta) {
                return $peserta && PeriodeMagangService::apakahAktif($peserta);
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => $pesertaList
        ]);
    }
}


