<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Petugas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class RoleSwitcherController extends Controller
{
    public function switch(string $peran): RedirectResponse
    {
        $validRoles = ['Kasir', 'Produksi', 'Antar'];

        if (! in_array($peran, $validRoles, true)) {
            abort(400, 'Peran tidak valid.');
        }

        $targetPetugas = Petugas::where('peran', $peran)->orderBy('id')->first();

        if (! $targetPetugas) {
            return redirect()->back()->with('error', "Tidak ditemukan akun dengan peran {$peran}.");
        }

        Auth::login($targetPetugas);
        request()->session()->regenerate();

        return redirect()->route('dashboard')
            ->with('success', "Berhasil beralih ke peran {$peran} ({$targetPetugas->nama_petugas}).");
    }
}
