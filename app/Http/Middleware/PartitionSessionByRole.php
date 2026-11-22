<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PartitionSessionByRole
{
    /**
     * Memisahkan cookie sesi Laravel berdasarkan subpath peran (Kasir, Produksi, Antar).
     * Memungkinkan pengujian simultan ketiga role dalam 1 jendela browser tanpa saling menimpa.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $cookieName = 'cleanwash_session';

        if ($request->is('kasir*')) {
            $cookieName = 'cleanwash_kasir_session';
        } elseif ($request->is('produksi*')) {
            $cookieName = 'cleanwash_produksi_session';
        } elseif ($request->is('antar*')) {
            $cookieName = 'cleanwash_antar_session';
        } elseif ($request->has('role')) {
            $role = strtolower((string) $request->input('role'));
            if (in_array($role, ['kasir', 'produksi', 'antar'], true)) {
                $cookieName = 'cleanwash_' . $role . '_session';
            }
        }

        config(['session.cookie' => $cookieName]);

        return $next($request);
    }
}
