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

// Helper untuk menjalankan storage:link langsung dari browser di server hosting
Route::get('/artisan-storage-link', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        return response()->json([
            'status' => 'success',
            'message' => 'storage:link berhasil dijalankan di hosting!',
            'output' => trim(\Illuminate\Support\Facades\Artisan::output()),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// Fallback jika symlink public/storage belum dibuat di cPanel hosting
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    $realBase = realpath(storage_path('app/public'));
    $realPath = realpath($fullPath);

    if (!$realPath || !$realBase || !str_starts_with($realPath, $realBase) || !file_exists($realPath)) {
        abort(404);
    }

    return response()->file($realPath);
})->where('path', '.*');

