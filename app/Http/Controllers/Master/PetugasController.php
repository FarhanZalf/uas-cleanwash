<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\PetugasRequest;
use App\Models\Petugas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PetugasController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $petugas = Petugas::query()
            ->when($search, function ($query, $search) {
                $query->where('nama_petugas', 'like', "%{$search}%")
                    ->orWhere('kode_petugas', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('peran', 'like', "%{$search}%");
            })
            ->withCount(['transaksiLaundry', 'riwayatStatusProses', 'pengantaran'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => Petugas::count(),
            'kasir' => Petugas::where('peran', 'Kasir')->count(),
            'produksi' => Petugas::where('peran', 'Produksi')->count(),
            'antar' => Petugas::where('peran', 'Antar')->count(),
        ];

        return Inertia::render('Master/Petugas/Index', [
            'petugas' => $petugas,
            'filters' => ['search' => $search],
            'stats' => $stats,
        ]);
    }

    public function store(PetugasRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        Petugas::create($data);

        return redirect()->route('kasir.petugas.index')
            ->with('success', 'Akun petugas baru berhasil dibuat.');
    }

    public function update(PetugasRequest $request, Petugas $petugas): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $petugas->update($data);

        return redirect()->route('kasir.petugas.index')
            ->with('success', 'Data akun petugas berhasil diperbarui.');
    }

    public function destroy(Request $request, Petugas $petugas): RedirectResponse
    {
        if ($petugas->id === $request->user()->id) {
            return redirect()->route('kasir.petugas.index')
                ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
        }

        if (
            $petugas->transaksiLaundry()->exists() ||
            $petugas->riwayatStatusProses()->exists() ||
            $petugas->pengantaran()->exists()
        ) {
            return redirect()->route('kasir.petugas.index')
                ->with('error', 'Petugas tidak dapat dihapus karena sudah memiliki riwayat operasional dalam sistem.');
        }

        $petugas->delete();

        return redirect()->route('kasir.petugas.index')
            ->with('success', 'Akun petugas berhasil dihapus.');
    }
}
