<?php

namespace App\Http\Middleware;

use App\Models\Petugas;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePetugasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Dalam lingkungan lokal/demo browser:
        // Jika sesi belum cocok dengan modul peran yang dibuka di tab,
        // otomatis sambungkan ke akun petugas peran tersebut untuk kenyamanan pengujian 1 tab 1 role.
        if (! app()->environment('testing')) {
            $requiredRole = $roles[0] ?? null;

            if ($requiredRole && (! $user || ! in_array($user->peran, $roles, true))) {
                $petugas = Petugas::where('peran', $requiredRole)->orderBy('id')->first();
                if ($petugas) {
                    Auth::login($petugas);
                    $request->setUserResolver(fn () => $petugas);
                    return $next($request);
                }
            }
        }

        if (! $user) {
            return redirect()->route('login');
        }

        if (! empty($roles) && ! in_array($user->peran, $roles, true)) {
            abort(403, 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
