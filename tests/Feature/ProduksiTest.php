<?php

namespace Tests\Feature;

use App\Models\DetailPakaian;
use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProduksiTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $produksi;
    protected Petugas $kasir;
    protected Pelanggan $pelanggan;
    protected JenisLayanan $layananCuciKering; // tanpa Disetrika: Diterima -> Dicuci -> Dikeringkan -> Selesai
    protected JenisLayanan $layananCuciSetrika; // dengan Disetrika

    protected function setUp(): void
    {
        parent::setUp();

        $this->produksi = Petugas::create([
            'kode_petugas' => 'PTG-PROD-01',
            'nama_petugas' => 'Staf Produksi Cuci',
            'email' => 'produksi@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Produksi',
        ]);

        $this->kasir = Petugas::create([
            'kode_petugas' => 'PTG-KASIR-01',
            'nama_petugas' => 'Kasir Utama',
            'email' => 'kasir@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Kasir',
        ]);

        $this->pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'PLG-001',
            'nama' => 'Budi Santoso',
            'no_telepon' => '081234567890',
            'hak_bayar_belakangan' => false,
        ]);

        $this->layananCuciKering = JenisLayanan::create([
            'kode_layanan' => 'LYN-CKR',
            'nama_layanan' => 'Cuci Kering Reguler',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Berat_Kg',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 7000.00,
        ]);

        $this->layananCuciSetrika = JenisLayanan::create([
            'kode_layanan' => 'LYN-CKSR',
            'nama_layanan' => 'Cuci Setrika Reguler',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Berat_Kg',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'],
            'harga_satuan' => 10000.00,
        ]);
    }

    public function test_tim_produksi_dapat_mengakses_papan_antrean_produksi(): void
    {
        $response = $this->actingAs($this->produksi)->get(route('produksi.dashboard'));
        $response->assertStatus(200);
    }

    public function test_role_non_produksi_dilarang_mengakses_papan_produksi(): void
    {
        $response = $this->actingAs($this->kasir)->get(route('produksi.dashboard'));
        $response->assertStatus(403);
    }

    public function test_transisi_tahap_cuci_kering_otomatis_melewati_tahap_setrika(): void
    {
        // Buat transaksi dengan hanya layanan cuci kering (tidak ada setrika)
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-PROD1',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 21000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 21000.00,
            'status_proses_terkini' => 'Diterima',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        DetailPakaian::create([
            'transaksi_laundry_id' => $transaksi->id,
            'jenis_layanan_id' => $this->layananCuciKering->id,
            'daftar_pakaian' => '3 kemeja',
            'berat_atau_jumlah' => 3.0,
            'harga_saat_transaksi' => 7000.00,
            'subtotal' => 21000.00,
        ]);

        // 1. Diterima -> Dicuci
        $this->assertEquals('Dicuci', $transaksi->tahapBerikutnya());
        $response1 = $this->actingAs($this->produksi)->post(route('produksi.update-tahap', $transaksi), [
            'tahap_tujuan' => 'Dicuci',
        ]);
        $response1->assertRedirect(route('produksi.dashboard'));
        $transaksi->refresh();
        $this->assertEquals('Dicuci', $transaksi->status_proses_terkini);

        // Audit log tercatat
        $this->assertDatabaseHas('riwayat_status_proses', [
            'transaksi_laundry_id' => $transaksi->id,
            'petugas_id' => $this->produksi->id,
            'tahap' => 'Dicuci',
        ]);

        // 2. Dicuci -> Dikeringkan
        $this->assertEquals('Dikeringkan', $transaksi->tahapBerikutnya());
        $this->actingAs($this->produksi)->post(route('produksi.update-tahap', $transaksi), [
            'tahap_tujuan' => 'Dikeringkan',
        ]);
        $transaksi->refresh();
        $this->assertEquals('Dikeringkan', $transaksi->status_proses_terkini);

        // 3. Dikeringkan -> Langsung Selesai (otomatis melewati Disetrika sesuai JSON layanan!)
        $this->assertEquals('Selesai', $transaksi->tahapBerikutnya());
        $this->actingAs($this->produksi)->post(route('produksi.update-tahap', $transaksi), [
            'tahap_tujuan' => 'Selesai',
        ]);
        $transaksi->refresh();
        $this->assertEquals('Selesai', $transaksi->status_proses_terkini);
        $this->assertNull($transaksi->tahapBerikutnya());
    }

    public function test_transisi_tahap_tidak_sah_atau_melompat_akan_ditolak(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-PROD2',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 30000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 30000.00,
            'status_proses_terkini' => 'Diterima',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        DetailPakaian::create([
            'transaksi_laundry_id' => $transaksi->id,
            'jenis_layanan_id' => $this->layananCuciSetrika->id,
            'daftar_pakaian' => '3 kg baju campur',
            'berat_atau_jumlah' => 3.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 30000.00,
        ]);

        // Mencoba langsung melompat ke Disetrika padahal masih Diterima
        $response = $this->actingAs($this->produksi)->post(route('produksi.update-tahap', $transaksi), [
            'tahap_tujuan' => 'Disetrika',
        ]);

        $response->assertSessionHasErrors(['tahap_tujuan']);
        $transaksi->refresh();
        $this->assertEquals('Diterima', $transaksi->status_proses_terkini);
    }

    public function test_staf_produksi_dapat_mencatat_laporan_kerusakan_dan_memotong_tagihan(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-PROD3',
            'pelanggan_id' => $this->pelanggan->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 50000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 50000.00,
            'status_proses_terkini' => 'Dicuci',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        $itemPakaian = DetailPakaian::create([
            'transaksi_laundry_id' => $transaksi->id,
            'jenis_layanan_id' => $this->layananCuciSetrika->id,
            'daftar_pakaian' => 'Kemeja dan celana bahan',
            'berat_atau_jumlah' => 5.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 50000.00,
        ]);

        $response = $this->actingAs($this->produksi)->post(route('produksi.lapor-kerusakan', $transaksi), [
            'detail_pakaian_id' => $itemPakaian->id,
            'jenis_insiden' => 'Rusak',
            'jenis_pakaian' => 'Kemeja Katun Putih',
            'keterangan' => 'Kancing terlepas dan kain sedikit robek di lengan',
            'nilai_kompensasi' => 20000.00,
        ]);

        $response->assertRedirect(route('produksi.dashboard'));

        // Pastikan laporan tersimpan
        $this->assertDatabaseHas('laporan_kerusakan', [
            'detail_pakaian_id' => $itemPakaian->id,
            'petugas_id' => $this->produksi->id,
            'jenis_insiden' => 'Rusak',
            'jenis_pakaian' => 'Kemeja Katun Putih',
            'nilai_kompensasi' => 20000.00,
        ]);

        // Pastikan sisa tagihan terpotong secara deterministik: 50.000 - 20.000 = 30.000
        $transaksi->refresh();
        $this->assertEquals(20000.00, (float) $transaksi->total_kompensasi);
        $this->assertEquals(30000.00, (float) $transaksi->sisa_tagihan);
    }
}
