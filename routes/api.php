<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PresensiController;
use App\Http\Controllers\Api\IzinController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProfileController;

// Public Auth route
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile Management (All roles)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Shared view routes
    Route::get('/izin', [IzinController::class, 'index']);
    Route::get('/logbook', [LogbookController::class, 'index']);
    Route::get('/tugas', [TugasController::class, 'index']);
    Route::get('/tugas/{id}', [TugasController::class, 'show']);

    // Role: Peserta
    Route::middleware('role:peserta')->group(function () {
        Route::post('/presensi/check-in', [PresensiController::class, 'checkIn']);
        Route::post('/presensi/check-out', [PresensiController::class, 'checkOut']);
        Route::get('/presensi/riwayat', [PresensiController::class, 'riwayat']);
        Route::post('/izin', [IzinController::class, 'store']);
        Route::post('/logbook', [LogbookController::class, 'store']);
        Route::post('/tugas/{id}/kumpul', [TugasController::class, 'submit']);
        Route::get('/dashboard/peserta', [DashboardController::class, 'pesertaDashboard']);
        Route::get('/export/rekap-pdf', [ExportController::class, 'exportRekapPdf']);
    });

    // Role: Pembimbing
    Route::middleware('role:pembimbing')->group(function () {
        Route::put('/izin/{id}/verifikasi', [IzinController::class, 'verifikasi']);
        Route::put('/logbook/{id}/review', [LogbookController::class, 'review']);
        Route::post('/tugas', [TugasController::class, 'store']);
        Route::put('/tugas/{id}/review', [TugasController::class, 'review']);
        Route::get('/pembimbing/peserta', [TugasController::class, 'pembimbingPesertaList']);
        Route::get('/dashboard/pembimbing', [DashboardController::class, 'pembimbingDashboard']);
    });

    // Role: Pembimbing or Admin
    Route::middleware('role:pembimbing,admin')->group(function () {
        Route::get('/presensi/peserta/{peserta_id}', [PresensiController::class, 'presensiPeserta']);
    });

    // Role: Admin
    Route::middleware('role:admin')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::get('/dashboard/admin', [DashboardController::class, 'adminDashboard']);
        
        // Admin User CRUD
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
        Route::patch('/admin/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::patch('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);

        // Admin Plotting CRUD
        Route::get('/admin/options', [AdminController::class, 'getOptionsList']);
        Route::get('/admin/plotting', [AdminController::class, 'getPlotting']);
        Route::post('/admin/plotting', [AdminController::class, 'storePlotting']);
        Route::delete('/admin/plotting/{id}', [AdminController::class, 'deletePlotting']);
    });
});
