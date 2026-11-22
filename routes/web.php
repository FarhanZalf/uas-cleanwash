<?php

use App\Http\Controllers\Auth\RoleSwitcherController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Kasir\LaporanController;
use App\Http\Controllers\Kasir\PengantaranController;
use App\Http\Controllers\Kasir\TransaksiController;
use App\Http\Controllers\Produksi\ProduksiController;
use App\Http\Controllers\Antar\AntarController;
use App\Http\Controllers\Master\JenisLayananController;
use App\Http\Controllers\Master\PelangganController;
use App\Http\Controllers\Master\PetugasController;
use App\Http\Controllers\Master\VoucherController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Redirect halaman depan ke halaman login internal
Route::redirect('/', '/login');

// Dispatcher Dashboard: arahkan otomatis sesuai peran petugas
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

// Beralih Peran Cepat (Quick Role Switcher untuk testing & demo multi-role)
Route::post('/switch-role/{peran}', [RoleSwitcherController::class, 'switch'])
    ->middleware(['auth'])
    ->name('switch-role');

Route::match(['get', 'post'], '/demo-login/{peran}', [RoleSwitcherController::class, 'demoLogin'])
    ->name('demo-login');

// Modul Role Kasir & Admin
Route::middleware(['role:Kasir'])->prefix('kasir')->name('kasir.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'kasir'])->name('dashboard');

    // Transaksi Laundry Masuk & Cetak Nota
    Route::post('transaksi/cek-voucher', [TransaksiController::class, 'cekVoucher'])->name('transaksi.cek-voucher');
    Route::post('transaksi/pelanggan-cepat', [TransaksiController::class, 'pelangganCepat'])->name('transaksi.pelanggan-cepat');
    Route::get('transaksi/{transaksi}/cetak', [TransaksiController::class, 'cetak'])->name('transaksi.cetak');
    Route::post('transaksi/{transaksi}/penyesuaian', [TransaksiController::class, 'penyesuaian'])->name('transaksi.penyesuaian');
    Route::post('transaksi/{transaksi}/batalkan', [TransaksiController::class, 'batalkan'])->name('transaksi.batalkan');
    Route::post('transaksi/{transaksi}/pelunasan', [TransaksiController::class, 'pelunasan'])->name('transaksi.pelunasan');
    Route::resource('transaksi', TransaksiController::class)
        ->parameters(['transaksi' => 'transaksi'])
        ->only(['index', 'create', 'store', 'show']);

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

    // Penjadwalan Kloter Pengantaran Kurir
    Route::resource('pengantaran', PengantaranController::class)->only(['index', 'store', 'show']);

    // Rekapitulasi Laporan Keuangan, Piutang & Operasional
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
});

// Modul Role Produksi
Route::middleware(['role:Produksi'])->prefix('produksi')->name('produksi.')->group(function () {
    Route::get('/dashboard', [ProduksiController::class, 'index'])->name('dashboard');
    Route::post('/transaksi/{transaksi}/update-tahap', [ProduksiController::class, 'updateTahap'])->name('update-tahap');
    Route::post('/transaksi/{transaksi}/lapor-kerusakan', [ProduksiController::class, 'laporKerusakan'])->name('lapor-kerusakan');
});

// Modul Role Antar (Kurir)
Route::middleware(['role:Antar'])->prefix('antar')->name('antar.')->group(function () {
    Route::get('/dashboard', [AntarController::class, 'index'])->name('dashboard');
    Route::post('/detail-pengantaran/{detailPengantaran}/update-status', [AntarController::class, 'updateStatus'])->name('update-status');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
