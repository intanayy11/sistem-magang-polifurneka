<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    use HasFactory;

    protected $table = 'presensi';
    protected $primaryKey = 'presensi_id';

    protected $fillable = [
        'peserta_id',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'status',
    ];

    public function peserta()
    {
        return $this->belongsTo(User::class, 'peserta_id', 'user_id');
    }
}
