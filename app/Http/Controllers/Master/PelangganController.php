<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\PelangganRequest;
use App\Models\Pelanggan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PelangganController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $pelanggan = Pelanggan::query()
            ->when($search, function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode_pelanggan', 'like', "%{$search}%")
                    ->orWhere('no_telepon', 'like', "%{$search}%");
            })
            ->withCount('transaksiLaundry')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Rekomendasi kode pelanggan otomatis berikutnya
        $latestId = Pelanggan::max('id') ?? 0;
        $nextKode = 'PLG-' . str_pad($latestId + 1, 3, '0', STR_PAD_LEFT);

        return Inertia::render('Master/Pelanggan/Index', [
            'pelanggan' => $pelanggan,
            'filters' => [
                'search' => $search,
            ],
            'nextKode' => $nextKode,
        ]);
    }

    public function store(PelangganRequest $request): RedirectResponse
    {
        Pelanggan::create($request->validated());

        return redirect()->route('kasir.pelanggan.index')
            ->with('success', 'Data pelanggan baru berhasil ditambahkan.');
    }

    public function update(PelangganRequest $request, Pelanggan $pelanggan): RedirectResponse
    {
        $pelanggan->update($request->validated());

        return redirect()->route('kasir.pelanggan.index')
            ->with('success', 'Data pelanggan berhasil diperbarui.');
    }

    public function destroy(Pelanggan $pelanggan): RedirectResponse
    {
        if ($pelanggan->transaksiLaundry()->exists()) {
            return redirect()->route('kasir.pelanggan.index')
                ->with('error', 'Pelanggan tidak dapat dihapus karena sudah memiliki riwayat transaksi laundry.');
        }

        $pelanggan->delete();

        return redirect()->route('kasir.pelanggan.index')
            ->with('success', 'Data pelanggan berhasil dihapus.');
    }
}
