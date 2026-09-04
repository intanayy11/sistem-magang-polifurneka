<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'SIMONIKA API - Sistem Magang Polifurneka',
        'status' => 'online',
        'version' => '1.0.0',
    ]);
});

Route::get('/login', function () {
    return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
})->name('login');
