<?php

namespace Tests\Feature;

use App\Models\DetailPakaian;
use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PenyesuaianPelunasanTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $kasir;
    protected Petugas $produksi;
    protected Pelanggan $pelangganBiasa;
    protected Pelanggan $pelangganTempo;
    protected JenisLayanan $layanan;
    protected Voucher $voucher;

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

        $this->pelangganBiasa = Pelanggan::create([
            'kode_pelanggan' => 'PLG-001',
            'nama' => 'Budi Biasa',
            'no_telepon' => '081234567891',
            'hak_bayar_belakangan' => false,
        ]);

        $this->pelangganTempo = Pelanggan::create([
            'kode_pelanggan' => 'PLG-002',
            'nama' => 'Siti Tempo',
            'no_telepon' => '081234567892',
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

        $this->voucher = Voucher::create([
            'nomor_voucher' => 'DISKON5RB',
            'nilai_potongan' => 5000.00,
            'masa_berlaku' => now()->addDays(7),
            'status_terpakai' => false,
        ]);
    }

    public function test_kasir_dapat_timbang_ulang_dan_tagihan_dihitung_ulang(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-ADJ1',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 20000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 20000.00,
            'status_proses_terkini' => 'Diterima',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        $detail = DetailPakaian::create([
            'transaksi_laundry_id' => $transaksi->id,
            'jenis_layanan_id' => $this->layanan->id,
            'daftar_pakaian' => '3 Kemeja, 2 Celana',
            'berat_atau_jumlah' => 2.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 20000.00,
        ]);

        // Sesuaikan menjadi 3.5 kg
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.penyesuaian', $transaksi), [
            'items' => [
                [
                    'id' => $detail->id,
                    'berat_atau_jumlah' => 3.5,
                ],
            ],
            'catatan' => 'Timbang ulang di depan pelanggan',
        ]);

        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $transaksi->refresh();
        $detail->refresh();

        $this->assertEquals(3.5, (float) $detail->berat_atau_jumlah);
        $this->assertEquals(35000.00, (float) $detail->subtotal);
        $this->assertEquals(35000.00, (float) $transaksi->total_harga);
        $this->assertEquals(35000.00, (float) $transaksi->sisa_tagihan);
    }

    public function test_timbang_ulang_ditolak_jika_cucian_sudah_mulai_dicuci(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-ADJ2',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 20000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 20000.00,
            'status_proses_terkini' => 'Dicuci',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        $detail = DetailPakaian::create([
            'transaksi_laundry_id' => $transaksi->id,
            'jenis_layanan_id' => $this->layanan->id,
            'daftar_pakaian' => '3 Kemeja, 2 Celana',
            'berat_atau_jumlah' => 2.0,
            'harga_saat_transaksi' => 10000.00,
            'subtotal' => 20000.00,
        ]);

        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.penyesuaian', $transaksi), [
            'items' => [
                ['id' => $detail->id, 'berat_atau_jumlah' => 3.0],
            ],
        ]);

        $response->assertSessionHasErrors(['items']);
    }

    public function test_pembatalan_pada_tahap_diterima_dan_pelepasan_voucher(): void
    {
        $this->voucher->update(['status_terpakai' => true]);

        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-CAN1',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'voucher_id' => $this->voucher->id,
            'tanggal_terima' => now(),
            'total_harga' => 20000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 15000.00,
            'status_proses_terkini' => 'Diterima',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.batalkan', $transaksi), [
            'alasan_batal' => 'Pelanggan membatalkan pesanan secara langsung.',
        ]);

        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $transaksi->refresh();
        $this->voucher->refresh();

        $this->assertEquals('Batal', $transaksi->status_transaksi);
        $this->assertFalse((bool) $this->voucher->status_terpakai);
    }

    public function test_pembatalan_ditolak_jika_cucian_sudah_selesai(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-CAN2',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 20000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 0.00,
            'status_proses_terkini' => 'Selesai',
            'status_bayar' => 'Lunas',
            'status_transaksi' => 'Aktif',
        ]);

        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.batalkan', $transaksi), [
            'alasan_batal' => 'Ingin dibatalkan tapi sudah beres.',
        ]);

        $response->assertSessionHasErrors(['alasan_batal']);
    }

    public function test_kasir_dapat_mencatat_pelunasan_hingga_status_lunas(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-PAY1',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 30000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 30000.00,
            'status_proses_terkini' => 'Selesai',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.pelunasan', $transaksi), [
            'jenis_aksi' => 'pelunasan',
            'nominal' => 30000.00,
            'metode_pembayaran' => 'QRIS',
            'catatan' => 'Pelunasan di kasir',
            'serahkan_cucian' => true,
        ]);

        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $transaksi->refresh();
        $this->assertEquals(0.00, (float) $transaksi->sisa_tagihan);
        $this->assertEquals('Lunas', $transaksi->status_bayar);
        $this->assertEquals('Selesai', $transaksi->status_transaksi);
    }
}
