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
        return $this->loginAsRole($peran);
    }

    public function demoLogin(string $peran): RedirectResponse
    {
        return $this->loginAsRole($peran);
    }

    private function loginAsRole(string $peran): RedirectResponse
    {
        $validRoles = ['Kasir', 'Produksi', 'Antar'];

        if (! in_array($peran, $validRoles, true)) {
            abort(400, 'Peran tidak valid.');
        }

        $targetPetugas = Petugas::where('peran', $peran)->orderBy('id')->first();

        if (! $targetPetugas) {
            return redirect()->route('login')->with('error', "Tidak ditemukan akun dengan peran {$peran}.");
        }

        Auth::login($targetPetugas);
        request()->session()->regenerate();

        return match ($peran) {
            'Kasir' => redirect()->route('kasir.dashboard')->with('success', "Berhasil masuk sebagai Kasir & Admin ({$targetPetugas->nama_petugas})."),
            'Produksi' => redirect()->route('produksi.dashboard')->with('success', "Berhasil masuk sebagai Staf Produksi ({$targetPetugas->nama_petugas})."),
            'Antar' => redirect()->route('antar.dashboard')->with('success', "Berhasil masuk sebagai Kurir Antar ({$targetPetugas->nama_petugas})."),
            default => redirect()->route('dashboard'),
        };
    }
}
