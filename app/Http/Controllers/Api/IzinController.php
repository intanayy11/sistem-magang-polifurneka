<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Izin;
use App\Models\PlottingBimbingan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class IzinController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'peserta') {
            $izinList = Izin::where('peserta_id', $user->user_id)
                ->with('pembimbing:user_id,nama')
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->role === 'pembimbing') {
            $pesertaIds = PlottingBimbingan::where('pembimbing_id', $user->user_id)->pluck('peserta_id');
            $izinList = Izin::whereIn('peserta_id', $pesertaIds)
                ->with('peserta:user_id,nama,nim_nis')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $izinList = Izin::with(['peserta:user_id,nama,nim_nis', 'pembimbing:user_id,nama'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $izinList
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'jenis' => 'required|in:Izin,Sakit',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'keterangan' => 'nullable|string',
            'file_bukti' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $filePath = null;
        if ($request->hasFile('file_bukti')) {
            $path = $request->file('file_bukti')->store('izin', 'public');
            $filePath = 'storage/' . $path;
        }

        $plotting = PlottingBimbingan::where('peserta_id', $user->user_id)->first();
        $pembimbingId = $plotting ? $plotting->pembimbing_id : null;

        $izin = Izin::create([
            'peserta_id' => $user->user_id,
            'jenis' => $request->jenis,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'keterangan' => $request->keterangan,
            'file_bukti' => $filePath,
            'status' => 'Menunggu',
            'pembimbing_id' => $pembimbingId,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan izin berhasil dibuat.',
            'data' => $izin
        ], 201);
    }

    public function verifikasi(Request $request, $id)
    {
        $user = $request->user();

        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
        ]);

        $izin = Izin::findOrFail($id);

        if ($user->role === 'pembimbing') {
            $isAssigned = PlottingBimbingan::where('pembimbing_id', $user->user_id)
                ->where('peserta_id', $izin->peserta_id)
                ->exists();

            if (! $isAssigned) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak berhak memverifikasi izin peserta ini.'
                ], 403);
            }
        }

        $izin->update([
            'status' => $request->status,
            'pembimbing_id' => $user->user_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Verifikasi izin berhasil diperbarui menjadi ' . $request->status,
            'data' => $izin
        ]);
    }
}
