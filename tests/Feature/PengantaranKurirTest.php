<?php

namespace Tests\Feature;

use App\Models\DetailPakaian;
use App\Models\DetailPengantaran;
use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Pengantaran;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PengantaranKurirTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $kasir;
    protected Petugas $kurir1;
    protected Petugas $kurir2;
    protected Pelanggan $pelanggan;
    protected JenisLayanan $layanan;
    protected TransaksiLaundry $transaksi1;
    protected TransaksiLaundry $transaksi2;

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

        $this->kurir1 = Petugas::create([
            'kode_petugas' => 'PTG-ANTAR-01',
            'nama_petugas' => 'Kurir Doni',
            'email' => 'antar@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Antar',
        ]);

        $this->kurir2 = Petugas::create([
            'kode_petugas' => 'PTG-ANTAR-02',
            'nama_petugas' => 'Kurir Eko',
            'email' => 'eko@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Antar',
        ]);

        $this->pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'PLG-001',
            'nama' => 'Budi Santoso',
            'no_telepon' => '081234567890',
            'alamat' => 'Jl. Mawar No. 12, Sleman, Yogyakarta',
            'hak_bayar_belakangan' => false,
        ]);

        $this->layanan = JenisLayanan::create([
            'kode_layanan' => 'LYN-CK',
            'nama_layanan' => 'Cuci Kering',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Berat_Kg',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 10000.00,
        ]);

        $this->transaksi1 = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-ANT1',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 20000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 0.00,
            'status_proses_terkini' => 'Selesai',
            'status_bayar' => 'Lunas',
            'status_transaksi' => 'Aktif',
        ]);

        DetailPakaian::create([
            'transaksi_laundry_id' => $this->transaksi1->id,
            'jenis_layanan_id' => $this->layanan->id,
            'daftar_pakaian' => '2 Kemeja, 1 Celana Jeans',
            'berat_atau_jumlah' => 2.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 20000.00,
        ]);

        $this->transaksi2 = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-ANT2',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 30000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 0.00,
            'status_proses_terkini' => 'Selesai',
            'status_bayar' => 'Lunas',
            'status_transaksi' => 'Aktif',
        ]);

        DetailPakaian::create([
            'transaksi_laundry_id' => $this->transaksi2->id,
            'jenis_layanan_id' => $this->layanan->id,
            'daftar_pakaian' => '3 Jaket Tebal',
            'berat_atau_jumlah' => 3.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 30000.00,
        ]);
    }

    public function test_kasir_dapat_membuat_kloter_pengantaran_baru(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.pengantaran.store'), [
            'petugas_id' => $this->kurir1->id,
            'tanggal_antar' => now()->toDateString(),
            'transaksi_ids' => [$this->transaksi1->id, $this->transaksi2->id],
        ]);

        $pengantaran = Pengantaran::first();
        $this->assertNotNull($pengantaran);
        $this->assertEquals($this->kurir1->id, $pengantaran->petugas_id);
        $this->assertEquals(now()->toDateString(), $pengantaran->tanggal_antar->toDateString());
        $response->assertRedirect(route('kasir.pengantaran.show', $pengantaran));

        $this->assertEquals(2, $pengantaran->detailPengantaran()->count());
        $this->assertDatabaseHas('detail_pengantaran', [
            'pengantaran_id' => $pengantaran->id,
            'transaksi_laundry_id' => $this->transaksi1->id,
            'status_antar' => 'Menunggu',
        ]);
    }

    public function test_kurir_dapat_melihat_daftar_tugas_pengantaran_miliknya(): void
    {
        $kloter = Pengantaran::create([
            'kode_pengantaran' => 'ANT-20261122-01',
            'petugas_id' => $this->kurir1->id,
            'tanggal_antar' => now()->toDateString(),
        ]);

        DetailPengantaran::create([
            'pengantaran_id' => $kloter->id,
            'transaksi_laundry_id' => $this->transaksi1->id,
            'status_antar' => 'Menunggu',
        ]);

        $response = $this->actingAs($this->kurir1)->get(route('antar.dashboard'));
        $response->assertStatus(200);
    }

    public function test_kurir_dapat_mengubah_status_antar_hingga_diterima(): void
    {
        $kloter = Pengantaran::create([
            'kode_pengantaran' => 'ANT-20261122-02',
            'petugas_id' => $this->kurir1->id,
            'tanggal_antar' => now()->toDateString(),
        ]);

        $detail = DetailPengantaran::create([
            'pengantaran_id' => $kloter->id,
            'transaksi_laundry_id' => $this->transaksi1->id,
            'status_antar' => 'Menunggu',
        ]);

        // 1. Ambil paket
        $this->actingAs($this->kurir1)->post(route('antar.update-status', $detail), [
            'status_antar' => 'Diambil',
        ])->assertRedirect();

        $detail->refresh();
        $this->assertEquals('Diambil', $detail->status_antar);

        // 2. Dalam perjalanan
        $this->actingAs($this->kurir1)->post(route('antar.update-status', $detail), [
            'status_antar' => 'DalamPerjalanan',
        ])->assertRedirect();

        $detail->refresh();
        $this->assertEquals('DalamPerjalanan', $detail->status_antar);

        // 3. Diterima oleh pelanggan
        $this->actingAs($this->kurir1)->post(route('antar.update-status', $detail), [
            'status_antar' => 'Diterima',
        ])->assertRedirect();

        $detail->refresh();
        $this->transaksi1->refresh();

        $this->assertEquals('Diterima', $detail->status_antar);
        $this->assertEquals('Selesai', $this->transaksi1->status_transaksi);
    }

    public function test_kurir_dapat_mencatat_pengantaran_gagal_dengan_alasan_dan_jadwal_ulang(): void
    {
        $kloter = Pengantaran::create([
            'kode_pengantaran' => 'ANT-20261122-03',
            'petugas_id' => $this->kurir1->id,
            'tanggal_antar' => now()->toDateString(),
        ]);

        $detail = DetailPengantaran::create([
            'pengantaran_id' => $kloter->id,
            'transaksi_laundry_id' => $this->transaksi1->id,
            'status_antar' => 'DalamPerjalanan',
        ]);

        $besok = now()->addDay()->toDateString();
        $response = $this->actingAs($this->kurir1)->post(route('antar.update-status', $detail), [
            'status_antar' => 'Gagal',
            'alasan_gagal' => 'Rumah kosong / pagar terkunci',
            'jadwal_ulang' => $besok,
        ]);

        $response->assertRedirect();

        $detail->refresh();
        $this->assertEquals('Gagal', $detail->status_antar);
        $this->assertEquals('Rumah kosong / pagar terkunci', $detail->alasan_gagal);
        $this->assertEquals($besok, $detail->jadwal_ulang->toDateString());
    }

    public function test_kurir_tidak_dapat_mengubah_tugas_kurir_lain(): void
    {
        $kloter = Pengantaran::create([
            'kode_pengantaran' => 'ANT-20261122-04',
            'petugas_id' => $this->kurir1->id,
            'tanggal_antar' => now()->toDateString(),
        ]);

        $detail = DetailPengantaran::create([
            'pengantaran_id' => $kloter->id,
            'transaksi_laundry_id' => $this->transaksi1->id,
            'status_antar' => 'Menunggu',
        ]);

        // Kurir 2 mencoba mengubah tugas kurir 1
        $response = $this->actingAs($this->kurir2)->post(route('antar.update-status', $detail), [
            'status_antar' => 'Diambil',
        ]);

        $response->assertStatus(403);
    }
}
