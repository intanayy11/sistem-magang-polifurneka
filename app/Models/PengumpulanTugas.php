<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengumpulanTugas extends Model
{
    use HasFactory;

    protected $table = 'pengumpulan_tugas';
    protected $primaryKey = 'pengumpulan_id';

    protected $fillable = [
        'tugas_id',
        'file_hasil',
        'versi_ke',
        'catatan_revisi',
        'tanggal_submit',
    ];

    protected $casts = [
        'tanggal_submit' => 'datetime',
    ];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'tugas_id', 'tugas_id');
    }
}
