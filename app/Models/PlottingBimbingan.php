<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlottingBimbingan extends Model
{
    use HasFactory;

    protected $table = 'plotting_bimbingan';
    protected $primaryKey = 'plotting_id';

    protected $fillable = [
        'peserta_id',
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
