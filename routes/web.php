<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\JenisLayananController;
use App\Http\Controllers\Master\PelangganController;
use App\Http\Controllers\Master\PetugasController;
use App\Http\Controllers\Master\VoucherController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Redirect halaman depan ke halaman login internal
Route::get('/', function () {
    return redirect()->route('login');
});

// Dispatcher Dashboard: arahkan otomatis sesuai peran petugas
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

// Modul Role Kasir & Admin
Route::middleware(['auth', 'role:Kasir'])->prefix('kasir')->name('kasir.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'kasir'])->name('dashboard');

    // Master Pelanggan
    Route::resource('pelanggan', PelangganController::class)->except(['create', 'show', 'edit']);

    // Master Jenis Layanan
    Route::resource('layanan', JenisLayananController::class)
        ->parameters(['layanan' => 'jenis_layanan'])
        ->except(['create', 'show', 'edit']);

    // Master Voucher Promo
    Route::resource('voucher', VoucherController::class)->except(['create', 'show', 'edit']);

    // Master Akun Petugas
    Route::resource('petugas', PetugasController::class)
        ->parameters(['petugas' => 'petugas'])
        ->except(['create', 'show', 'edit']);
});

// Modul Role Produksi
Route::middleware(['auth', 'role:Produksi'])->prefix('produksi')->name('produksi.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'produksi'])->name('dashboard');
});

// Modul Role Antar (Kurir)
Route::middleware(['auth', 'role:Antar'])->prefix('antar')->name('antar.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'antar'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
