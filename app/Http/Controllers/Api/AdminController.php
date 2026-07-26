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
            'no_hp' => 'nullable|string',
        ]);

        $user = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'nim_nis' => $request->nim_nis,
            'no_hp' => $request->no_hp,
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
            'no_hp' => 'nullable|string',
        ]);

        $user->update([
            'nama' => $request->nama,
            'email' => $request->email,
            'role' => $request->role,
            'nim_nis' => $request->nim_nis,
            'no_hp' => $request->no_hp,
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
        $pesertaList = User::where('role', 'peserta')->where('status_aktif', true)->select('user_id', 'nama', 'nim_nis', 'email')->get();
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
        $plotting = PlottingBimbingan::with(['peserta:user_id,nama,nim_nis,email', 'pembimbing:user_id,nama,email'])
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
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        // Check if existing active plotting for this peserta exists
        PlottingBimbingan::where('peserta_id', $request->peserta_id)->delete();

        $plotting = PlottingBimbingan::create([
            'peserta_id' => $request->peserta_id,
            'pembimbing_id' => $request->pembimbing_id,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
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
