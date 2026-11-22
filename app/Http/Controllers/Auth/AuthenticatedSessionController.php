<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        return match ($user->peran) {
            'Kasir' => redirect()->intended(route('kasir.dashboard', absolute: false)),
            'Produksi' => redirect()->intended(route('produksi.dashboard', absolute: false)),
            'Antar' => redirect()->intended(route('antar.dashboard', absolute: false)),
            default => redirect()->intended(route('dashboard', absolute: false)),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        $response = redirect()->route('login');

        // Bersihkan seluruh cookie sesi CleanWash agar tidak ada sisa auth
        $response->withCookie(cookie()->forget('cleanwash_session'));
        $response->withCookie(cookie()->forget('cleanwash_kasir_session'));
        $response->withCookie(cookie()->forget('cleanwash_produksi_session'));
        $response->withCookie(cookie()->forget('cleanwash_antar_session'));

        return $response;
    }
}
