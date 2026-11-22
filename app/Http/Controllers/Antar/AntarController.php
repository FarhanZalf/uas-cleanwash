<?php

namespace App\Http\Controllers\Antar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Antar\UpdateStatusAntarRequest;
use App\Models\DetailPengantaran;
use App\Models\RiwayatStatusProses;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AntarController extends Controller
{
    public function index(Request $request): Response
    {
        $kurirId = auth()->id();
        $tab = $request->input('tab', 'semua'); // 'hari_ini', 'semua', 'selesai', 'gagal'
        $today = now()->toDateString();

        $query = DetailPengantaran::query()
            ->whereHas('pengantaran', function ($q) use ($kurirId) {
                $q->where('petugas_id', $kurirId);
            })
            ->with([
                'pengantaran:id,kode_pengantaran,tanggal_antar',
                'transaksiLaundry.pelanggan:id,kode_pelanggan,nama,no_telepon,alamat',
                'transaksiLaundry.detailPakaian.jenisLayanan:id,nama_layanan,satuan_hitung',
            ]);

        // Hitung total ringkasan
        $counts = [
            'total' => (clone $query)->count(),
            'hari_ini' => (clone $query)->whereHas('pengantaran', fn ($q) => $q->whereDate('tanggal_antar', $today))->count(),
            'aktif' => (clone $query)->whereIn('status_antar', ['Menunggu', 'Diambil', 'DalamPerjalanan'])->count(),
            'diterima' => (clone $query)->where('status_antar', 'Diterima')->count(),
            'gagal' => (clone $query)->where('status_antar', 'Gagal')->count(),
        ];

        // Filter tab
        if ($tab === 'hari_ini') {
            $query->whereHas('pengantaran', fn ($q) => $q->whereDate('tanggal_antar', $today));
        } elseif ($tab === 'selesai') {
            $query->where('status_antar', 'Diterima');
        } elseif ($tab === 'gagal') {
            $query->where('status_antar', 'Gagal');
        } elseif ($tab === 'aktif') {
            $query->whereIn('status_antar', ['Menunggu', 'Diambil', 'DalamPerjalanan']);
        }

        $daftarAntaran = $query->latest('id')->get();

        return Inertia::render('Antar/Dashboard', [
            'daftarAntaran' => $daftarAntaran,
            'counts' => $counts,
            'activeTab' => $tab,
        ]);
    }

    public function updateStatus(UpdateStatusAntarRequest $request, DetailPengantaran $detailPengantaran): RedirectResponse
    {
        // Pastikan kurir hanya mengubah tugas pengantaran miliknya
        if ($detailPengantaran->pengantaran->petugas_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki hak untuk memperbarui pengantaran ini.');
        }

        $data = $request->validated();
        $transaksi = $detailPengantaran->transaksiLaundry;
        $kurir = auth()->user();

        DB::transaction(function () use ($detailPengantaran, $transaksi, $kurir, $data) {
            $statusSebelumnya = $detailPengantaran->status_antar;

            $detailPengantaran->update([
                'status_antar' => $data['status_antar'],
                'alasan_gagal' => $data['status_antar'] === 'Gagal' ? $data['alasan_gagal'] : null,
                'jadwal_ulang' => $data['status_antar'] === 'Gagal' ? ($data['jadwal_ulang'] ?? null) : null,
            ]);

            if ($data['status_antar'] === 'Diterima') {
                if (in_array($transaksi->status_bayar, ['Lunas', 'Tempo'], true)) {
                    $transaksi->update(['status_transaksi' => 'Selesai']);
                }

                RiwayatStatusProses::create([
                    'transaksi_laundry_id' => $transaksi->id,
                    'petugas_id' => $kurir->id,
                    'tahap' => 'Selesai',
                    'waktu_update' => now(),
                    'catatan' => "Cucian berhasil diantar ke alamat pelanggan oleh kurir {$kurir->nama_petugas}.",
                ]);
            } elseif ($data['status_antar'] === 'Gagal') {
                RiwayatStatusProses::create([
                    'transaksi_laundry_id' => $transaksi->id,
                    'petugas_id' => $kurir->id,
                    'tahap' => $transaksi->status_proses_terkini,
                    'waktu_update' => now(),
                    'catatan' => sprintf(
                        'Pengantaran gagal oleh kurir %s. Alasan: %s.%s',
                        $kurir->nama_petugas,
                        $data['alasan_gagal'],
                        ! empty($data['jadwal_ulang']) ? " Jadwal ulang: {$data['jadwal_ulang']}." : ''
                    ),
                ]);
            } else {
                RiwayatStatusProses::create([
                    'transaksi_laundry_id' => $transaksi->id,
                    'petugas_id' => $kurir->id,
                    'tahap' => $transaksi->status_proses_terkini,
                    'waktu_update' => now(),
                    'catatan' => "Status paket kurir: {$statusSebelumnya} -> {$data['status_antar']}.",
                ]);
            }
        });

        return redirect()->back()
            ->with('success', "Status pengantaran nota {$transaksi->no_nota} berhasil diperbarui menjadi {$data['status_antar']}.");
    }
}
