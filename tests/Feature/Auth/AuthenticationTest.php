<?php

namespace Tests\Feature\Auth;

use App\Models\Petugas;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_login_bisa_dibuka(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_kasir_bisa_login_dan_diarahkan_ke_dashboard_kasir(): void
    {
        $petugas = Petugas::create([
            'kode_petugas' => 'PTG-TEST-1',
            'nama_petugas' => 'Kasir Uji',
            'email' => 'kasir.uji@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Kasir',
        ]);

        $response = $this->post('/login', [
            'email' => $petugas->email,
            'password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('kasir.dashboard', absolute: false));
    }

    public function test_produksi_bisa_login_dan_diarahkan_ke_dashboard_produksi(): void
    {
        $petugas = Petugas::create([
            'kode_petugas' => 'PTG-TEST-2',
            'nama_petugas' => 'Produksi Uji',
            'email' => 'produksi.uji@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Produksi',
        ]);

        $response = $this->post('/login', [
            'email' => $petugas->email,
            'password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('produksi.dashboard', absolute: false));
    }

    public function test_antar_bisa_login_dan_diarahkan_ke_dashboard_antar(): void
    {
        $petugas = Petugas::create([
            'kode_petugas' => 'PTG-TEST-3',
            'nama_petugas' => 'Kurir Uji',
            'email' => 'antar.uji@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Antar',
        ]);

        $response = $this->post('/login', [
            'email' => $petugas->email,
            'password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('antar.dashboard', absolute: false));
    }

    public function test_middleware_peran_mencegah_akses_lintas_role(): void
    {
        $kurir = Petugas::create([
            'kode_petugas' => 'PTG-TEST-4',
            'nama_petugas' => 'Kurir Uji 2',
            'email' => 'kurir2@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Antar',
        ]);

        // Kurir mencoba akses modul Kasir -> harus 403 Forbidden
        $response = $this->actingAs($kurir)->get('/kasir/dashboard');
        $response->assertStatus(403);
    }

    public function test_login_gagal_jika_password_salah(): void
    {
        $petugas = Petugas::create([
            'kode_petugas' => 'PTG-TEST-5',
            'nama_petugas' => 'Uji Salah Password',
            'email' => 'salah@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Kasir',
        ]);

        $this->post('/login', [
            'email' => $petugas->email,
            'password' => 'password-yang-keliru',
        ]);

        $this->assertGuest();
    }

    public function test_petugas_bisa_logout(): void
    {
        $petugas = Petugas::create([
            'kode_petugas' => 'PTG-TEST-6',
            'nama_petugas' => 'Uji Logout',
            'email' => 'logout@cleanwash.local',
            'password' => Hash::make('password123'),
            'peran' => 'Kasir',
        ]);

        $response = $this->actingAs($petugas)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }
}
