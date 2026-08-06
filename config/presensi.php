<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Lokasi & Radius Geofencing Polifurneka Kendal
    |--------------------------------------------------------------------------
    |
    | Titik pusat lokasi Polifurneka Kendal dan radius maksimal (dalam meter)
    | yang diizinkan untuk presensi biasa (lokasi_tipe = 'instansi').
    |
    */

    'polifurneka_lat' => env('POLIFURNEKA_LAT', -6.929428),
    'polifurneka_lng' => env('POLIFURNEKA_LNG', 110.256226),
    'radius_meter'    => env('PRESENSI_RADIUS_METER', 500),
];
