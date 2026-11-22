<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kasir\PengantaranRequest;
use App\Models\DetailPengantaran;
use App\Models\Pengantaran;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PengantaranController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $pengantaran = Pengantaran::query()
            ->with(['petugas:id,kode_petugas,nama_petugas,no_telepon'])
            ->withCount(['detailPengantaran as total_paket'])
            ->withCount(['detailPengantaran as total_diterima' => fn ($q) => $q->where('status_antar', 'Diterima')])
            ->withCount(['detailPengantaran as total_gagal' => fn ($q) => $q->where('status_antar', 'Gagal')])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kode_pengantaran', 'like', "%{$search}%")
                        ->orWhereHas('petugas', fn ($p) => $p->where('nama_petugas', 'like', "%{$search}%"));
                });
            })
            ->latest('tanggal_antar')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $kurirList = Petugas::where('peran', 'Antar')
            ->orderBy('nama_petugas')
            ->get(['id', 'kode_petugas', 'nama_petugas', 'no_telepon']);

        // Transaksi yang siap dijadwalkan (selesai dicuci, masih aktif, dan belum berada di kloter yang sedang berjalan)
        $transaksiSiapAntar = TransaksiLaundry::query()
            ->where('status_proses_terkini', 'Selesai')
            ->where('status_transaksi', 'Aktif')
            ->whereDoesntHave('detailPengantaran', function ($q) {
                $q->whereIn('status_antar', ['Menunggu', 'Diambil', 'DalamPerjalanan']);
            })
            ->with('pelanggan:id,kode_pelanggan,nama,no_telepon,alamat')
            ->latest('id')
            ->get();

        return Inertia::render('Kasir/Pengantaran/Index', [
            'pengantaran' => $pengantaran,
            'kurirList' => $kurirList,
            'transaksiSiapAntar' => $transaksiSiapAntar,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(PengantaranRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $pengantaran = DB::transaction(function () use ($data) {
            $kode = $this->kodePengantaranBerikutnya();

            $kloter = Pengantaran::create([
                'kode_pengantaran' => $kode,
                'petugas_id' => $data['petugas_id'],
                'tanggal_antar' => $data['tanggal_antar'],
            ]);

            foreach ($data['transaksi_ids'] as $transaksiId) {
                DetailPengantaran::create([
                    'pengantaran_id' => $kloter->id,
                    'transaksi_laundry_id' => $transaksiId,
                    'status_antar' => 'Menunggu',
                ]);
            }

            return $kloter;
        });

        return redirect()->route('kasir.pengantaran.show', $pengantaran)
            ->with('success', "Kloter pengantaran {$pengantaran->kode_pengantaran} berhasil dijadwalkan.");
    }

    public function show(Pengantaran $pengantaran): Response
    {
        $pengantaran->load([
            'petugas:id,kode_petugas,nama_petugas,no_telepon',
            'detailPengantaran.transaksiLaundry.pelanggan',
            'detailPengantaran.transaksiLaundry.detailPakaian.jenisLayanan',
        ]);

        return Inertia::render('Kasir/Pengantaran/Show', [
            'pengantaran' => $pengantaran,
        ]);
    }

    private function kodePengantaranBerikutnya(): string
    {
        $prefix = 'ANT-' . now()->format('Ymd') . '-';

        $terakhir = Pengantaran::where('kode_pengantaran', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('kode_pengantaran')
            ->value('kode_pengantaran');

        $urut = $terakhir ? ((int) substr($terakhir, -2)) + 1 : 1;

        return $prefix . str_pad((string) $urut, 2, '0', STR_PAD_LEFT);
    }
}
