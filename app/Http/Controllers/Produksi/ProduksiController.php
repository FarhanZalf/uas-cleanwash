<?php

namespace App\Http\Controllers\Produksi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Produksi\LaporKerusakanRequest;
use App\Http\Requests\Produksi\UpdateTahapRequest;
use App\Models\DetailPakaian;
use App\Models\LaporanKerusakan;
use App\Models\TransaksiLaundry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProduksiController extends Controller
{
    /**
     * Menampilkan papan kerja antrean produksi.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $tahapFilter = $request->input('tahap');
        $prioritasFilter = $request->input('prioritas'); // 'Express' | 'Reguler'

        $semuaTahap = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'];

        $countPerTahap = [];
        foreach ($semuaTahap as $t) {
            $countPerTahap[$t] = TransaksiLaundry::where('status_transaksi', 'Aktif')
                ->where('status_proses_terkini', $t)
                ->count();
        }

        $query = TransaksiLaundry::query()
            ->with([
                'pelanggan:id,kode_pelanggan,nama,no_telepon',
                'detailPakaian.jenisLayanan:id,kode_layanan,nama_layanan,kecepatan,satuan_hitung,tahapan_proses',
                'detailPakaian.laporanKerusakan.petugas:id,nama_petugas',
                'riwayatStatusProses.petugas:id,nama_petugas',
            ])
            ->where('status_transaksi', 'Aktif');

        // Filter berdasarkan pencarian
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('no_nota', 'like', "%{$search}%")
                    ->orWhereHas('pelanggan', function ($p) use ($search) {
                        $p->where('nama', 'like', "%{$search}%")
                            ->orWhere('no_telepon', 'like', "%{$search}%");
                    });
            });
        }

        // Filter tahap proses
        if (in_array($tahapFilter, $semuaTahap, true)) {
            $query->where('status_proses_terkini', $tahapFilter);
        }

        // Filter prioritas layanan
        if (in_array($prioritasFilter, ['Express', 'Reguler'], true)) {
            $query->whereHas('detailPakaian.jenisLayanan', function ($l) use ($prioritasFilter) {
                $l->where('kecepatan', $prioritasFilter);
            });
        }

        // Prioritaskan pesanan Express terlebih dahulu, lalu berdasarkan tanggal terima pakaian
        $antrean = $query->get()->sortBy([
            fn ($a, $b) => $b->detailPakaian->contains(fn ($d) => $d->jenisLayanan?->kecepatan === 'Express') <=>
                           $a->detailPakaian->contains(fn ($d) => $d->jenisLayanan?->kecepatan === 'Express'),
            fn ($a, $b) => $a->tanggal_terima <=> $b->tanggal_terima,
        ])->values();

        // Tambahkan metadata tahapan dinamis ke tiap transaksi
        $antreanFormatted = $antrean->map(function ($item) {
            $isExpress = $item->detailPakaian->contains(fn ($d) => $d->jenisLayanan?->kecepatan === 'Express');
            $tahapanBerlaku = $item->tahapanBerlaku();
            $tahapBerikutnya = $item->tahapBerikutnya();

            // Kumpulan laporan kerusakan pada transaksi ini
            $laporanList = $item->detailPakaian->flatMap->laporanKerusakan->values();

            return [
                'id' => $item->id,
                'no_nota' => $item->no_nota,
                'pelanggan' => $item->pelanggan,
                'tanggal_terima' => $item->tanggal_terima,
                'catatan_khusus' => $item->catatan_khusus,
                'status_proses_terkini' => $item->status_proses_terkini,
                'status_bayar' => $item->status_bayar,
                'total_kompensasi' => (float) $item->total_kompensasi,
                'sisa_tagihan' => (float) $item->sisa_tagihan,
                'is_express' => $isExpress,
                'tahapan_berlaku' => $tahapanBerlaku,
                'tahap_berikutnya' => $tahapBerikutnya,
                'detail_pakaian' => $item->detailPakaian->map(fn ($d) => [
                    'id' => $d->id,
                    'daftar_pakaian' => $d->daftar_pakaian,
                    'berat_atau_jumlah' => (float) $d->berat_atau_jumlah,
                    'jenis_layanan' => $d->jenisLayanan,
                    'laporan_kerusakan' => $d->laporanKerusakan,
                ]),
                'laporan_kerusakan' => $laporanList,
                'riwayat_status_proses' => $item->riwayatStatusProses,
            ];
        });

        return Inertia::render('Produksi/Dashboard', [
            'antreanCucian' => $antreanFormatted,
            'countPerTahap' => $countPerTahap,
            'filters' => [
                'search' => $search,
                'tahap' => $tahapFilter ?: '',
                'prioritas' => $prioritasFilter ?: '',
            ],
        ]);
    }

    /**
     * Memperbarui status proses cucian ke tahap berikutnya sesuai alur dinamis JSON.
     */
    public function updateTahap(UpdateTahapRequest $request, TransaksiLaundry $transaksi): RedirectResponse
    {
        if ($transaksi->status_transaksi !== 'Aktif') {
            throw ValidationException::withMessages([
                'tahap_tujuan' => 'Hanya transaksi berstatus Aktif yang dapat diproses.',
            ]);
        }

        $tahapTujuan = $request->validated()['tahap_tujuan'];
        $tahapSah = $transaksi->tahapBerikutnya();

        if ($tahapTujuan !== $tahapSah) {
            throw ValidationException::withMessages([
                'tahap_tujuan' => "Transisi tidak sah. Tahap berikutnya yang valid adalah {$tahapSah}.",
            ]);
        }

        DB::transaction(function () use ($transaksi, $tahapTujuan, $request) {
            $sekarang = now();

            $transaksi->update([
                'status_proses_terkini' => $tahapTujuan,
            ]);

            $transaksi->riwayatStatusProses()->create([
                'petugas_id' => $request->user()->id,
                'tahap' => $tahapTujuan,
                'waktu_update' => $sekarang,
            ]);
        });

        return redirect()->route('produksi.dashboard')
            ->with('success', "Status nota {$transaksi->no_nota} berhasil diperbarui ke tahap {$tahapTujuan}.");
    }

    /**
     * Mencatat laporan kerusakan atau kehilangan pakaian serta menyesuaikan tagihan.
     */
    public function laporKerusakan(LaporKerusakanRequest $request, TransaksiLaundry $transaksi): RedirectResponse
    {
        $data = $request->validated();

        $detailPakaian = DetailPakaian::where('id', $data['detail_pakaian_id'])
            ->where('transaksi_laundry_id', $transaksi->id)
            ->firstOrFail();

        DB::transaction(function () use ($data, $detailPakaian, $transaksi, $request) {
            LaporanKerusakan::create([
                'detail_pakaian_id' => $detailPakaian->id,
                'petugas_id' => $request->user()->id,
                'jenis_insiden' => $data['jenis_insiden'],
                'jenis_pakaian' => $data['jenis_pakaian'],
                'keterangan' => $data['keterangan'],
                'nilai_kompensasi' => $data['nilai_kompensasi'],
            ]);

            // Hitung total akumulasi kompensasi untuk seluruh transaksi ini
            $totalKompensasi = (float) LaporanKerusakan::whereHas('detailPakaian', function ($q) use ($transaksi) {
                $q->where('transaksi_laundry_id', $transaksi->id);
            })->sum('nilai_kompensasi');

            $transaksi->total_kompensasi = $totalKompensasi;
            $transaksi->hitungUlangTagihan();
        });

        return redirect()->route('produksi.dashboard')
            ->with('success', "Laporan {$data['jenis_insiden']} pakaian pada nota {$transaksi->no_nota} berhasil disimpan. Kompensasi otomatis memotong sisa tagihan.");
    }
}
