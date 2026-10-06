<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class PeriodeMagangService
{
    public static function apakahAktif($peserta, $tanggal = null): bool
    {
        if (!($peserta instanceof User)) {
            $peserta = User::find($peserta);
        }

        if (!$peserta || ($peserta->role !== null && $peserta->role !== 'peserta')) {
            return false;
        }

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

        if (!$peserta->tanggal_selesai_magang) {
            return true;
        }

        $targetDate = $tanggal ? Carbon::parse($tanggal)->startOfDay() : Carbon::today();
        $gracePeriodEnd = Carbon::parse($peserta->tanggal_selesai_magang)->addDays(3)->endOfDay();

        return $targetDate->lte($gracePeriodEnd);
    }
}

