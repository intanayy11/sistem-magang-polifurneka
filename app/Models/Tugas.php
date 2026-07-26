<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    use HasFactory;

    protected $table = 'tugas';
    protected $primaryKey = 'tugas_id';

    protected $fillable = [
        'pembimbing_id',
        'peserta_id',
        'judul',
        'deskripsi',
        'deadline',
        'file_lampiran',
        'status',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function pembimbing()
    {
        return $this->belongsTo(User::class, 'pembimbing_id', 'user_id');
    }

    public function peserta()
    {
        return $this->belongsTo(User::class, 'peserta_id', 'user_id');
    }

    public function pengumpulan()
    {
        return $this->hasMany(PengumpulanTugas::class, 'tugas_id', 'tugas_id')->orderBy('versi_ke', 'desc');
    }

    public function pengumpulanTerakhir()
    {
        return $this->hasOne(PengumpulanTugas::class, 'tugas_id', 'tugas_id')->latestOfMany('versi_ke');
    }
}
