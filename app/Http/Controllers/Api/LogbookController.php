<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Models\PlottingBimbingan;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'peserta') {
            $logbooks = Logbook::where('peserta_id', $user->user_id)
                ->orderBy('tanggal', 'desc')
                ->get();
        } elseif ($user->role === 'pembimbing') {
            $pesertaIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)->pluck('peserta_id');
            $logbooks = Logbook::whereIn('peserta_id', $pesertaIds)
                ->with('peserta:user_id,nama,nim_nis')
                ->orderBy('tanggal', 'desc')
                ->get();
        } else {
            $logbooks = Logbook::with('peserta:user_id,nama,nim_nis')
                ->orderBy('tanggal', 'desc')
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $logbooks
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'tanggal' => 'required|date',
            'judul_kegiatan' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'kendala' => 'nullable|string',
            'foto_bukti' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        // Server-side: reject weekend dates regardless of how the request was sent
        $tanggal = \Carbon\Carbon::parse($request->tanggal);
        if ($tanggal->isWeekend()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada aktivitas magang pada akhir pekan, silakan pilih tanggal hari kerja (Senin–Jumat).',
            ], 422);
        }

        $fotoPath = null;
        if ($request->hasFile('foto_bukti')) {
            $path = $request->file('foto_bukti')->store('logbook', 'public');
            $fotoPath = 'storage/' . $path;
        }

        $logbook = Logbook::create([
            'peserta_id' => $user->user_id,
            'tanggal' => $request->tanggal,
            'judul_kegiatan' => $request->judul_kegiatan,
            'deskripsi' => $request->deskripsi,
            'kendala' => $request->kendala,
            'foto_bukti' => $fotoPath,
            'status' => 'Menunggu',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Logbook harian berhasil ditambahkan.',
            'data' => $logbook
        ], 201);
    }

    public function review(Request $request, $id)
    {
        $user = $request->user();

        $request->validate([
            'status' => 'required|in:Approve,Revisi',
            'catatan_pembimbing' => 'nullable|string',
        ]);

        $logbook = Logbook::findOrFail($id);

        if ($user->role === 'pembimbing') {
            $isAssigned = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->where('peserta_id', $logbook->peserta_id)
                ->exists();

            if (! $isAssigned) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak berhak mereview logbook peserta ini.'
                ], 403);
            }
        }

        $logbook->update([
            'status' => $request->status,
            'catatan_pembimbing' => $request->catatan_pembimbing,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Logbook berhasil direview (' . $request->status . ').',
            'data' => $logbook
        ]);
    }
}
