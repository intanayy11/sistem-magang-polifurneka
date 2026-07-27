<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'nim_nis',
        'asal_instansi',
        'no_hp',
        'foto_profil',
        'tanggal_mulai_magang',
        'tanggal_selesai_magang',
        'status_aktif',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'status_aktif' => 'boolean',
        ];
    }

    public function plottingAsPeserta()
    {
        return $table = $this->hasOne(PlottingBimbingan::class, 'peserta_id', 'user_id');
    }

    public function plottingAsPembimbing()
    {
        return $this->hasMany(PlottingBimbingan::class, 'pembimbing_id', 'user_id');
    }

    public function presensi()
    {
        return $this->hasMany(Presensi::class, 'peserta_id', 'user_id');
    }

    public function izin()
    {
        return $this->hasMany(Izin::class, 'peserta_id', 'user_id');
    }

    public function logbook()
    {
        return $this->hasMany(Logbook::class, 'peserta_id', 'user_id');
    }

    public function tugasAsPeserta()
    {
        return $this->hasMany(Tugas::class, 'peserta_id', 'user_id');
    }

    public function tugasAsPembimbing()
    {
        return $this->hasMany(Tugas::class, 'pembimbing_id', 'user_id');
    }
}
