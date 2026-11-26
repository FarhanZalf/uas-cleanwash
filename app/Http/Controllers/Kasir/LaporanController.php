<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Models\DetailPakaian;
use App\Models\LaporanKerusakan;
use App\Models\Pembayaran;
use App\Models\TransaksiLaundry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. Rekapitulasi Kas Masuk dari Tabel Pembayaran
        $pembayaranQuery = Pembayaran::whereBetween('tanggal_bayar', [$start, $end]);
        $totalPendapatan = (float) (clone $pembayaranQuery)->sum('nominal');

        $pendapatanPerJenis = (clone $pembayaranQuery)
            ->selectRaw('jenis, sum(nominal) as total')
            ->groupBy('jenis')
            ->pluck('total', 'jenis')
            ->all();

        $totalUangMuka = (float) ($pendapatanPerJenis['UangMuka'] ?? 0);
        $totalPelunasan = (float) ($pendapatanPerJenis['Pelunasan'] ?? 0);

        // 2. Buku Piutang Tagihan Tempo & Belum Lunas (termasuk cucian yang sudah diserahkan/diantar namun masih tempo)
        $daftarPiutang = TransaksiLaundry::query()
            ->where('status_transaksi', '!=', 'Batal')
            ->where('sisa_tagihan', '>', 0)
            ->with(['pelanggan:id,kode_pelanggan,nama,no_telepon', 'petugas:id,nama_petugas'])
            ->orderByDesc('sisa_tagihan')
            ->get();

        $totalPiutang = (float) $daftarPiutang->sum('sisa_tagihan');

        // 3. Rekapitulasi Operasional Cucian
        $transaksiPeriode = TransaksiLaundry::whereBetween('tanggal_terima', [$start, $end]);
        $totalNota = (clone $transaksiPeriode)->count();
        $totalNotaSelesai = (clone $transaksiPeriode)->where('status_transaksi', 'Selesai')->count();
        $totalNotaBatal = (clone $transaksiPeriode)->where('status_transaksi', 'Batal')->count();
        $totalNotaAktif = (clone $transaksiPeriode)->where('status_transaksi', 'Aktif')->count();

        // Total Kompensasi Kerusakan dalam periode
        $totalKompensasi = (float) (clone $transaksiPeriode)->sum('total_kompensasi');
        $jumlahInsiden = LaporanKerusakan::whereBetween('created_at', [$start, $end])->count();

        // Volume Cucian per Layanan
        $volumeLayanan = DetailPakaian::whereHas('transaksiLaundry', function ($q) use ($start, $end) {
            $q->whereBetween('tanggal_terima', [$start, $end]);
        })
            ->with('jenisLayanan:id,nama_layanan,satuan_hitung')
            ->get()
            ->groupBy('jenis_layanan_id')
            ->map(function ($items) {
                $layanan = $items->first()->jenisLayanan;
                return [
                    'nama_layanan' => $layanan?->nama_layanan ?? 'Layanan',
                    'satuan' => $layanan?->satuan_hitung === 'Jumlah_Pcs' ? 'Pcs' : 'Kg',
                    'total_volume' => (float) $items->sum('berat_atau_jumlah'),
                    'total_omzet' => (float) $items->sum('subtotal'),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Kasir/Laporan/Index', [
            'ringkasanKeuangan' => [
                'total_pendapatan' => $totalPendapatan,
                'total_uang_muka' => $totalUangMuka,
                'total_pelunasan' => $totalPelunasan,
            ],
            'bukuPiutang' => [
                'daftar' => $daftarPiutang,
                'total_piutang' => $totalPiutang,
            ],
            'operasional' => [
                'total_nota' => $totalNota,
                'aktif' => $totalNotaAktif,
                'selesai' => $totalNotaSelesai,
                'batal' => $totalNotaBatal,
                'total_kompensasi' => $totalKompensasi,
                'jumlah_insiden' => $jumlahInsiden,
                'volume_layanan' => $volumeLayanan,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
