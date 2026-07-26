<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Izin extends Model
{
    use HasFactory;

    protected $table = 'izin';
    protected $primaryKey = 'izin_id';

    protected $fillable = [
        'peserta_id',
        'jenis',
        'tanggal_mulai',
        'tanggal_selesai',
        'keterangan',
        'file_bukti',
        'status',
        'pembimbing_id',
    ];

    public function peserta()
    {
        return $this->belongsTo(User::class, 'peserta_id', 'user_id');
    }

    public function pembimbing()
    {
        return $this->belongsTo(User::class, 'pembimbing_id', 'user_id');
    }
}
