<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class PeriodeMagangService
{
    /**
     * Memeriksa apakah peserta berada dalam periode magang yang aktif pada tanggal tertentu.
     * 
     * Periode magang aktif: tanggal_mulai_magang <= tanggal <= tanggal_selesai_magang
     * 
     * @param User|int $peserta
     * @param string|Carbon|null $tanggal
     * @return bool
     */
    public static function apakahAktif($peserta, $tanggal = null): bool
    {
        if (!($peserta instanceof User)) {
            $peserta = User::find($peserta);
        }

        if (!$peserta || $peserta->role !== 'peserta') {
            return false;
        }

        // Jika akun dinonaktifkan secara manual oleh admin
        if ($peserta->status_aktif === false) {
            return false;
        }

        $targetDate = $tanggal ? Carbon::parse($tanggal)->startOfDay() : Carbon::today();

        if ($peserta->tanggal_mulai_magang) {
            $mulai = Carbon::parse($peserta->tanggal_mulai_magang)->startOfDay();
            if ($targetDate->lt($mulai)) {
                return false;
            }
        }

        if ($peserta->tanggal_selesai_magang) {
            $selesai = Carbon::parse($peserta->tanggal_selesai_magang)->endOfDay();
            if ($targetDate->gt($selesai)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Memeriksa apakah peserta masih berada dalam masa grace period (3 hari kalender setelah tanggal_selesai_magang)
     * khusus untuk mengunggah revisi tugas yang berstatus "Perlu Revisi".
     * 
     * @param User|int $peserta
     * @param string|Carbon|null $tanggal
     * @return bool
     */
    public static function dalamGracePeriodRevisi($peserta, $tanggal = null): bool
    {
        if (!($peserta instanceof User)) {
            $peserta = User::find($peserta);
        }

        if (!$peserta || $peserta->role !== 'peserta') {
            return false;
        }

        if ($peserta->status_aktif === false) {
            return false;
        }

        // Jika tidak ada tanggal selesai magang, anggap tidak terbatas
        if (!$peserta->tanggal_selesai_magang) {
            return true;
        }

        $targetDate = $tanggal ? Carbon::parse($tanggal)->startOfDay() : Carbon::today();
        $gracePeriodEnd = Carbon::parse($peserta->tanggal_selesai_magang)->addDays(3)->endOfDay();

        return $targetDate->lte($gracePeriodEnd);
    }
}
