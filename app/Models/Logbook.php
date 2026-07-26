<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logbook extends Model
{
    use HasFactory;

    protected $table = 'logbook';
    protected $primaryKey = 'logbook_id';

    protected $fillable = [
        'peserta_id',
        'tanggal',
        'judul_kegiatan',
        'deskripsi',
        'kendala',
        'foto_bukti',
        'status',
        'catatan_pembimbing',
    ];

    public function peserta()
    {
        return $this->belongsTo(User::class, 'peserta_id', 'user_id');
    }
}
