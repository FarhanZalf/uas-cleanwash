<?php

namespace App\Http\Controllers;

use App\Models\DetailPengantaran;
use App\Models\Pelanggan;
use App\Models\Pengantaran;
use App\Models\TransaksiLaundry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dispatcher utama: arahkan user sesuai peran masing-masing.
     */
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        return match ($user->peran) {
            'Kasir' => redirect()->route('kasir.dashboard'),
            'Produksi' => redirect()->route('produksi.dashboard'),
            'Antar' => redirect()->route('antar.dashboard'),
            default => abort(403, 'Peran petugas tidak dikenali.'),
        };
    }

    /**
     * Dashboard untuk Role Kasir (Merangkap Admin).
     */
    public function kasir(): Response
    {
        $totalPelanggan = Pelanggan::count();
        $transaksiAktif = TransaksiLaundry::where('status_transaksi', 'Aktif')->count();
        $transaksiSelesai = TransaksiLaundry::where('status_transaksi', 'Selesai')->count();
        $transaksiTempo = TransaksiLaundry::where('status_bayar', 'Tempo')->count();

        $transaksiTerbaru = TransaksiLaundry::with(['pelanggan', 'petugas'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Kasir/Dashboard', [
            'stats' => [
                'totalPelanggan' => $totalPelanggan,
                'transaksiAktif' => $transaksiAktif,
                'transaksiSelesai' => $transaksiSelesai,
                'transaksiTempo' => $transaksiTempo,
            ],
            'transaksiTerbaru' => $transaksiTerbaru,
        ]);
    }

    /**
     * Dashboard untuk Role Produksi.
     */
    public function produksi(): Response
    {
        $antreanCucian = TransaksiLaundry::with(['pelanggan', 'detailPakaian.jenisLayanan'])
            ->where('status_transaksi', 'Aktif')
            ->whereIn('status_proses_terkini', ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika'])
            ->orderBy('tanggal_terima', 'asc')
            ->get();

        $countPerTahap = [
            'Diterima' => TransaksiLaundry::where('status_transaksi', 'Aktif')->where('status_proses_terkini', 'Diterima')->count(),
            'Dicuci' => TransaksiLaundry::where('status_transaksi', 'Aktif')->where('status_proses_terkini', 'Dicuci')->count(),
            'Dikeringkan' => TransaksiLaundry::where('status_transaksi', 'Aktif')->where('status_proses_terkini', 'Dikeringkan')->count(),
            'Disetrika' => TransaksiLaundry::where('status_transaksi', 'Aktif')->where('status_proses_terkini', 'Disetrika')->count(),
            'Selesai' => TransaksiLaundry::where('status_transaksi', 'Aktif')->where('status_proses_terkini', 'Selesai')->count(),
        ];

        return Inertia::render('Produksi/Dashboard', [
            'antreanCucian' => $antreanCucian,
            'countPerTahap' => $countPerTahap,
        ]);
    }

    /**
     * Dashboard untuk Role Antar (Kurir Mobile-Optimized).
     */
    public function antar(Request $request): Response
    {
        $petugas = $request->user();

        // Ambil kloter pengantaran aktif kurir yang sedang login
        $jadwalAktif = Pengantaran::with(['detailPengantaran.transaksiLaundry.pelanggan'])
            ->where('petugas_id', $petugas->id)
            ->latest('tanggal_antar')
            ->get();

        $tugasHariIni = DetailPengantaran::whereHas('pengantaran', function ($q) use ($petugas) {
            $q->where('petugas_id', $petugas->id);
        })
        ->with(['transaksiLaundry.pelanggan', 'pengantaran'])
        ->whereIn('status_antar', ['Menunggu', 'Diambil', 'DalamPerjalanan'])
        ->get();

        return Inertia::render('Antar/Dashboard', [
            'jadwalAktif' => $jadwalAktif,
            'tugasHariIni' => $tugasHariIni,
        ]);
    }
}
