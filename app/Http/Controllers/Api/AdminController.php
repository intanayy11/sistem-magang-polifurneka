<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PlottingBimbingan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nim_nis', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:peserta,pembimbing,admin',
            'nim_nis' => 'nullable|string',
            'asal_instansi' => 'nullable|string',
            'jurusan' => 'nullable|string|max:255',
            'posisi_magang' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string',
            'tanggal_mulai_magang' => 'nullable|date',
            'tanggal_selesai_magang' => 'nullable|date|after_or_equal:tanggal_mulai_magang',
        ]);

        $user = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'nim_nis' => $request->nim_nis,
            'asal_instansi' => $request->asal_instansi,
            'jurusan' => $request->role === 'peserta' ? $request->jurusan : null,
            'posisi_magang' => $request->role === 'peserta' ? $request->posisi_magang : null,
            'jabatan' => $request->role === 'pembimbing' ? $request->jabatan : null,
            'no_hp' => $request->no_hp,
            'tanggal_mulai_magang' => $request->tanggal_mulai_magang,
            'tanggal_selesai_magang' => $request->tanggal_selesai_magang,
            'status_aktif' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil ditambahkan.',
            'data' => $user
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $id . ',user_id',
            'role' => 'required|in:peserta,pembimbing,admin',
            'nim_nis' => 'nullable|string',
            'asal_instansi' => 'nullable|string',
            'jurusan' => 'nullable|string|max:255',
            'posisi_magang' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string',
            'tanggal_mulai_magang' => 'nullable|date',
            'tanggal_selesai_magang' => 'nullable|date|after_or_equal:tanggal_mulai_magang',
        ]);

        $user->update([
            'nama' => $request->nama,
            'email' => $request->email,
            'role' => $request->role,
            'nim_nis' => $request->nim_nis,
            'asal_instansi' => $request->asal_instansi,
            'jurusan' => $request->role === 'peserta' ? $request->jurusan : null,
            'posisi_magang' => $request->role === 'peserta' ? $request->posisi_magang : null,
            'jabatan' => $request->role === 'pembimbing' ? $request->jabatan : null,
            'no_hp' => $request->no_hp,
            'tanggal_mulai_magang' => $request->tanggal_mulai_magang,
            'tanggal_selesai_magang' => $request->tanggal_selesai_magang,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data user berhasil diperbarui.',
            'data' => $user
        ]);
    }

    public function toggleUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update([
            'status_aktif' => ! $user->status_aktif
        ]);

        $statusStr = $user->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'status' => 'success',
            'message' => "User {$user->nama} berhasil {$statusStr}.",
            'data' => $user
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Password user {$user->nama} berhasil direset."
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus.'
        ]);
    }

    public function getOptionsList()
    {
        $pesertaList = User::where('role', 'peserta')
            ->where('status_aktif', true)
            ->whereDoesntHave('plottingAsPeserta')
            ->select('user_id', 'nama', 'nim_nis', 'email', 'tanggal_mulai_magang', 'tanggal_selesai_magang')
            ->get();
        $pembimbingList = User::where('role', 'pembimbing')->where('status_aktif', true)->select('user_id', 'nama', 'email', 'no_hp')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'peserta' => $pesertaList,
                'pembimbing' => $pembimbingList
            ]
        ]);
    }

    public function getPlotting()
    {
        $plotting = PlottingBimbingan::with(['peserta:user_id,nama,nim_nis,email,tanggal_mulai_magang,tanggal_selesai_magang', 'pembimbing:user_id,nama,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $plotting
        ]);
    }

    public function storePlotting(Request $request)
    {
        $request->validate([
            'peserta_id' => 'required|exists:users,user_id',
            'pembimbing_id' => 'required|exists:users,user_id',
        ]);

        // Check if existing active plotting for this peserta exists
        PlottingBimbingan::where('peserta_id', $request->peserta_id)->delete();

        $plotting = PlottingBimbingan::create([
            'peserta_id' => $request->peserta_id,
            'pembimbing_id' => $request->pembimbing_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Plotting bimbingan berhasil disimpan.',
            'data' => $plotting
        ], 201);
    }

    public function deletePlotting($id)
    {
        $plotting = PlottingBimbingan::findOrFail($id);
        $plotting->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Plotting bimbingan berhasil dihapus.'
        ]);
    }
}
