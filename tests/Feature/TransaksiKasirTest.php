<?php

namespace Tests\Feature;

use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Petugas;
use App\Models\TransaksiLaundry;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TransaksiKasirTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $kasir;
    protected Petugas $produksi;
    protected Pelanggan $pelangganBiasa;
    protected Pelanggan $pelangganTempo;
    protected JenisLayanan $layananKg;
    protected JenisLayanan $layananPcs;
    protected Voucher $voucherAktif;

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
            'nama_petugas' => 'Staf Cuci',
            'email' => 'prod@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Produksi',
        ]);

        $this->pelangganBiasa = Pelanggan::create([
            'kode_pelanggan' => 'PLG-001',
            'nama' => 'Budi Santoso',
            'no_telepon' => '081234567890',
            'alamat' => 'Jl. Anggrek No. 10',
            'hak_bayar_belakangan' => false,
        ]);

        $this->pelangganTempo = Pelanggan::create([
            'kode_pelanggan' => 'PLG-002',
            'nama' => 'Ibu Ratna',
            'no_telepon' => '081299988877',
            'alamat' => 'Jl. Melati No. 20',
            'hak_bayar_belakangan' => true,
        ]);

        $this->layananKg = JenisLayanan::create([
            'kode_layanan' => 'LYN-CKR',
            'nama_layanan' => 'Cuci Kering Reguler',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Berat_Kg',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 7000.00,
        ]);

        $this->layananPcs = JenisLayanan::create([
            'kode_layanan' => 'LYN-SPT',
            'nama_layanan' => 'Cuci Sepatu Premium',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Jumlah_Pcs',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 30000.00,
        ]);

        $this->voucherAktif = Voucher::create([
            'nomor_voucher' => 'CW-PROMO10K',
            'nilai_potongan' => 10000.00,
            'masa_berlaku' => now()->addMonth()->toDateString(),
            'status_terpakai' => false,
        ]);
    }

    public function test_kasir_dapat_melihat_daftar_transaksi(): void
    {
        $response = $this->actingAs($this->kasir)->get(route('kasir.transaksi.index'));
        $response->assertStatus(200);
    }

    public function test_role_non_kasir_dilarang_mengakses_modul_transaksi(): void
    {
        $response = $this->actingAs($this->produksi)->get(route('kasir.transaksi.index'));
        $response->assertStatus(403);

        $responseCreate = $this->actingAs($this->produksi)->get(route('kasir.transaksi.create'));
        $responseCreate->assertStatus(403);
    }

    public function test_kasir_dapat_mendaftarkan_pelanggan_cepat_via_api(): void
    {
        $response = $this->actingAs($this->kasir)->postJson(route('kasir.transaksi.pelanggan-cepat'), [
            'nama' => 'Pelanggan Walk-In Baru',
            'no_telepon' => '087711223344',
            'alamat' => 'Jl. Baru No. 1',
            'hak_bayar_belakangan' => false,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('pelanggan.nama', 'Pelanggan Walk-In Baru');

        $this->assertDatabaseHas('pelanggan', [
            'nama' => 'Pelanggan Walk-In Baru',
            'no_telepon' => '087711223344',
        ]);
    }

    public function test_kasir_dapat_membuat_transaksi_baru_dengan_pembayaran_lunas(): void
    {
        // 3 kg @ 7000 = 21.000
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.store'), [
            'pelanggan_id' => $this->pelangganBiasa->id,
            'catatan_khusus' => 'Baju putih dipisah',
            'items' => [
                [
                    'jenis_layanan_id' => $this->layananKg->id,
                    'daftar_pakaian' => '3 kemeja kerja',
                    'berat_atau_jumlah' => 3.0,
                ],
            ],
            'nomor_voucher' => null,
            'metode_bayar' => 'Lunas',
        ]);

        $transaksi = TransaksiLaundry::latest('id')->first();
        $this->assertNotNull($transaksi);
        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $this->assertEquals(21000.00, (float) $transaksi->total_harga);
        $this->assertEquals(0.00, (float) $transaksi->sisa_tagihan);
        $this->assertEquals('Lunas', $transaksi->status_bayar);
        $this->assertEquals('Diterima', $transaksi->status_proses_terkini);
        $this->assertEquals('Aktif', $transaksi->status_transaksi);

        // Snapshot harga terkunci
        $this->assertDatabaseHas('detail_pakaian', [
            'transaksi_laundry_id' => $transaksi->id,
            'harga_saat_transaksi' => 7000.00,
            'subtotal' => 21000.00,
        ]);

        // Pembayaran tercatat
        $this->assertDatabaseHas('pembayaran', [
            'transaksi_laundry_id' => $transaksi->id,
            'jenis' => 'Pelunasan',
            'nominal' => 21000.00,
        ]);

        // Audit log riwayat status proses terbuat
        $this->assertDatabaseHas('riwayat_status_proses', [
            'transaksi_laundry_id' => $transaksi->id,
            'tahap' => 'Diterima',
            'petugas_id' => $this->kasir->id,
        ]);
    }

    public function test_transaksi_dengan_uang_muka_dp_menghitung_sisa_tagihan_dengan_tepat(): void
    {
        // 2 pasang sepatu @ 30.000 = 60.000, DP = 20.000 -> sisa = 40.000
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.store'), [
            'pelanggan_id' => $this->pelangganBiasa->id,
            'items' => [
                [
                    'jenis_layanan_id' => $this->layananPcs->id,
                    'daftar_pakaian' => '2 pasang sneakers',
                    'berat_atau_jumlah' => 2,
                ],
            ],
            'metode_bayar' => 'UangMuka',
            'nominal_bayar' => 20000,
        ]);

        $transaksi = TransaksiLaundry::latest('id')->first();
        $this->assertNotNull($transaksi);
        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $this->assertEquals(60000.00, (float) $transaksi->total_harga);
        $this->assertEquals(40000.00, (float) $transaksi->sisa_tagihan);
        $this->assertEquals('DP', $transaksi->status_bayar);

        $this->assertDatabaseHas('pembayaran', [
            'transaksi_laundry_id' => $transaksi->id,
            'jenis' => 'UangMuka',
            'nominal' => 20000.00,
        ]);
    }

    public function test_transaksi_dengan_voucher_memotong_tagihan_dan_mengubah_status_voucher(): void
    {
        // 2 pcs sepatu @ 30.000 = 60.000. Potongan voucher 10.000 = 50.000. Lunas bayar 50.000
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.store'), [
            'pelanggan_id' => $this->pelangganBiasa->id,
            'items' => [
                [
                    'jenis_layanan_id' => $this->layananPcs->id,
                    'daftar_pakaian' => '2 pasang boots kulit',
                    'berat_atau_jumlah' => 2,
                ],
            ],
            'nomor_voucher' => 'CW-PROMO10K',
            'metode_bayar' => 'Lunas',
        ]);

        $transaksi = TransaksiLaundry::latest('id')->first();
        $this->assertNotNull($transaksi);
        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $this->assertEquals($this->voucherAktif->id, $transaksi->voucher_id);
        $this->assertEquals(60000.00, (float) $transaksi->total_harga);
        $this->assertEquals(0.00, (float) $transaksi->sisa_tagihan);
        $this->assertEquals('Lunas', $transaksi->status_bayar);

        // Voucher terpakai tidak boleh bisa dipakai lagi
        $this->voucherAktif->refresh();
        $this->assertTrue($this->voucherAktif->status_terpakai);

        // Pembayaran lunas hanya sebesar tagihan setelah potongan voucher (50.000)
        $this->assertDatabaseHas('pembayaran', [
            'transaksi_laundry_id' => $transaksi->id,
            'nominal' => 50000.00,
        ]);
    }

    public function test_transaksi_tempo_ditolak_jika_pelanggan_tidak_memiliki_hak_bayar_belakangan(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.store'), [
            'pelanggan_id' => $this->pelangganBiasa->id, // hak_bayar_belakangan = false
            'items' => [
                [
                    'jenis_layanan_id' => $this->layananKg->id,
                    'daftar_pakaian' => '4 kemeja',
                    'berat_atau_jumlah' => 4,
                ],
            ],
            'metode_bayar' => 'Tempo',
        ]);

        $response->assertSessionHasErrors(['metode_bayar']);
    }

    public function test_transaksi_tempo_diterima_jika_pelanggan_memiliki_hak_bayar_belakangan(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.transaksi.store'), [
            'pelanggan_id' => $this->pelangganTempo->id, // hak_bayar_belakangan = true
            'items' => [
                [
                    'jenis_layanan_id' => $this->layananKg->id,
                    'daftar_pakaian' => '5 kg sprei',
                    'berat_atau_jumlah' => 5,
                ],
            ],
            'metode_bayar' => 'Tempo',
        ]);

        $transaksi = TransaksiLaundry::latest('id')->first();
        $this->assertNotNull($transaksi);
        $response->assertRedirect(route('kasir.transaksi.show', $transaksi));

        $this->assertEquals(35000.00, (float) $transaksi->total_harga);
        $this->assertEquals(35000.00, (float) $transaksi->sisa_tagihan);
        $this->assertEquals('Tempo', $transaksi->status_bayar);
    }

    public function test_halaman_cetak_nota_dapat_diakses_dalam_format_thermal_dan_a5(): void
    {
        $transaksi = TransaksiLaundry::create([
            'no_nota' => 'CW-20261122-TEST',
            'pelanggan_id' => $this->pelangganBiasa->id,
            'petugas_id' => $this->kasir->id,
            'tanggal_terima' => now(),
            'total_harga' => 21000.00,
            'total_kompensasi' => 0.00,
            'sisa_tagihan' => 21000.00,
            'status_proses_terkini' => 'Diterima',
            'status_bayar' => 'Belum',
            'status_transaksi' => 'Aktif',
        ]);

        // 1. Format thermal 80mm
        $resThermal = $this->actingAs($this->kasir)->get(route('kasir.transaksi.cetak', [
            'transaksi' => $transaksi->id,
            'format' => 'thermal',
        ]));
        $resThermal->assertStatus(200);

        // 2. Format formal A5
        $resA5 = $this->actingAs($this->kasir)->get(route('kasir.transaksi.cetak', [
            'transaksi' => $transaksi->id,
            'format' => 'a5',
        ]));
        $resA5->assertStatus(200);
    }
}
