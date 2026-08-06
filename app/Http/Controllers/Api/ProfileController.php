<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * GET /api/profile
     * Fetch current user profile data
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'data' => [
                'user_id' => $user->user_id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'nim_nis' => $user->nim_nis,
                'asal_instansi' => $user->asal_instansi,
                'jurusan' => $user->jurusan,
                'posisi_magang' => $user->posisi_magang,
                'jabatan' => $user->jabatan,
                'no_hp' => $user->no_hp,
                'foto_profil' => $user->foto_profil ? asset('storage/' . $user->foto_profil) : null,
                'foto_profil_raw' => $user->foto_profil,
                'status_aktif' => $user->status_aktif,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * POST /api/profile
     * Update no_hp and/or upload foto_profil
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'no_hp' => 'nullable|string|max:20',
            'foto_profil' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'foto_profil.image' => 'File harus berupa gambar.',
            'foto_profil.mimes' => 'Format foto profil harus JPG, JPEG, atau PNG.',
            'foto_profil.max' => 'Ukuran foto profil maksimal 2MB.',
        ]);

        if ($request->hasFile('foto_profil')) {
            // Delete old photo if exists
            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
            }

            // Store new photo in storage/app/public/profil
            $path = $request->file('foto_profil')->store('profil', 'public');
            $user->foto_profil = $path;
        }

        if ($request->has('no_hp')) {
            $user->no_hp = $request->input('no_hp');
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'user_id' => $user->user_id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'nim_nis' => $user->nim_nis,
                'asal_instansi' => $user->asal_instansi,
                'jurusan' => $user->jurusan,
                'posisi_magang' => $user->posisi_magang,
                'jabatan' => $user->jabatan,
                'no_hp' => $user->no_hp,
                'foto_profil' => $user->foto_profil ? asset('storage/' . $user->foto_profil) : null,
                'foto_profil_raw' => $user->foto_profil,
                'status_aktif' => $user->status_aktif,
            ]
        ]);
    }

    /**
     * PUT /api/profile/password
     * Change password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:6',
            'konfirmasi_password_baru' => 'required|string|same:password_baru',
        ], [
            'password_lama.required' => 'Password lama wajib diisi.',
            'password_baru.required' => 'Password baru wajib diisi.',
            'password_baru.min' => 'Password baru minimal 6 karakter.',
            'konfirmasi_password_baru.same' => 'Konfirmasi password baru tidak cocok dengan password baru.',
        ]);

        if (! Hash::check($request->password_lama, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password lama yang Anda masukkan salah.'
            ], 422);
        }

        $user->password = Hash::make($request->password_baru);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah. Silakan gunakan password baru pada login berikutnya.'
        ]);
    }
}
