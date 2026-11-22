<?php

namespace Tests\Feature;

use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Pembayaran;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LaporanTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $kasir;
    protected Petugas $produksi;
    protected Pelanggan $pelanggan;
    protected JenisLayanan $layanan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->kasir = Petugas::create([
            'kode_petugas' => 'PTG-KASIR-01',
            'nama_petugas' => 'Kasir Utama',
            'email' => 'kasir@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Kasir',
        ]);

        $this->produksi = Petugas::create([
            'kode_petugas' => 'PTG-PROD-01',
            'nama_petugas' => 'Staf Produksi',
            'email' => 'produksi@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Produksi',
        ]);

        $this->pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'PLG-001',
            'nama' => 'Budi Santoso',
            'no_telepon' => '081234567890',
            'hak_bayar_belakangan' => true,
        ]);

        $this->layanan = JenisLayanan::create([
            'kode_layanan' => 'LYN-CK',
            'nama_layanan' => 'Cuci Kering',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Berat_Kg',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 10000.00,
        ]);
    }

    public function test_kasir_dapat_mengakses_laporan_keuangan_dan_piutang(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-LAP1',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 50000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 20000.00,
            'status_proses_terkini' => 'Selesai',
            'status_bayar' => 'Tempo',
            'status_transaksi' => 'Aktif',
        ]);

        Pembayaran::create([
            'transaksi_laundry_id' => $transaksi->id,
            'petugas_id' => $this->kasir->id,
            'jenis' => 'UangMuka',
            'nominal' => 30000.00,
            'tanggal_bayar' => now(),
        ]);

        $response = $this->actingAs($this->kasir)->get(route('kasir.laporan.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Kasir/Laporan/Index')
            ->where('ringkasanKeuangan.total_pendapatan', fn ($v) => (float) $v === 30000.0)
            ->where('bukuPiutang.total_piutang', fn ($v) => (float) $v === 20000.0)
        );
    }

    public function test_role_non_kasir_dilarang_mengakses_laporan(): void
    {
        $response = $this->actingAs($this->produksi)->get(route('kasir.laporan.index'));
        $response->assertStatus(403);
    }
}
