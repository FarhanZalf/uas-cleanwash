<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\VoucherRequest;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $vouchers = Voucher::query()
            ->when($search, function ($query, $search) {
                $query->where('nomor_voucher', 'like', "%{$search}%");
            })
            ->with('transaksiLaundry:id,no_nota,voucher_id')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'total' => Voucher::count(),
            'tersedia' => Voucher::where('status_terpakai', false)->where('masa_berlaku', '>=', now()->toDateString())->count(),
            'terpakai' => Voucher::where('status_terpakai', true)->count(),
            'kadaluarsa' => Voucher::where('status_terpakai', false)->where('masa_berlaku', '<', now()->toDateString())->count(),
        ];

        return Inertia::render('Master/Voucher/Index', [
            'vouchers' => $vouchers,
            'filters' => ['search' => $search],
            'stats' => $stats,
        ]);
    }

    public function store(VoucherRequest $request): RedirectResponse
    {
        Voucher::create($request->validated());

        return redirect()->route('kasir.voucher.index')
            ->with('success', 'Kode voucher promo baru berhasil ditambahkan.');
    }

    public function update(VoucherRequest $request, Voucher $voucher): RedirectResponse
    {
        $voucher->update($request->validated());

        return redirect()->route('kasir.voucher.index')
            ->with('success', 'Data voucher promo berhasil diperbarui.');
    }

    public function destroy(Voucher $voucher): RedirectResponse
    {
        if ($voucher->transaksiLaundry()->exists() || $voucher->status_terpakai) {
            return redirect()->route('kasir.voucher.index')
                ->with('error', 'Voucher tidak dapat dihapus karena sudah pernah digunakan dalam transaksi.');
        }

        $voucher->delete();

        return redirect()->route('kasir.voucher.index')
            ->with('success', 'Voucher berhasil dihapus.');
    }
}
