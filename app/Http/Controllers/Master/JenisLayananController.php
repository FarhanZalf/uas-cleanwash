<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\JenisLayananRequest;
use App\Models\JenisLayanan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JenisLayananController extends Controller
{
    public function index(Request $request): Response
    {
        $layanan = JenisLayanan::withCount('detailPakaian')
            ->orderBy('id', 'asc')
            ->get();

        $availableTahapan = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'];

        return Inertia::render('Master/JenisLayanan/Index', [
            'layanan' => $layanan,
            'availableTahapan' => $availableTahapan,
        ]);
    }

    public function store(JenisLayananRequest $request): RedirectResponse
    {
        JenisLayanan::create($request->validated());

        return redirect()->route('kasir.layanan.index')
            ->with('success', 'Master jenis layanan baru berhasil ditambahkan.');
    }

    public function update(JenisLayananRequest $request, JenisLayanan $jenisLayanan): RedirectResponse
    {
        $jenisLayanan->update($request->validated());

        return redirect()->route('kasir.layanan.index')
            ->with('success', 'Master jenis layanan berhasil diperbarui.');
    }

    public function destroy(JenisLayanan $jenisLayanan): RedirectResponse
    {
        if ($jenisLayanan->detailPakaian()->exists()) {
            return redirect()->route('kasir.layanan.index')
                ->with('error', 'Layanan tidak dapat dihapus karena sudah digunakan dalam transaksi laundry.');
        }

        $jenisLayanan->delete();

        return redirect()->route('kasir.layanan.index')
            ->with('success', 'Master jenis layanan berhasil dihapus.');
    }
}
