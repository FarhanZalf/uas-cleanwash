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

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected Petugas $kasir;
    protected Petugas $produksi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->kasir = Petugas::create([
            'kode_petugas' => 'PTG-KASIR',
            'nama_petugas' => 'Kasir Utama',
            'email' => 'kasir@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Kasir',
        ]);

        $this->produksi = Petugas::create([
            'kode_petugas' => 'PTG-PROD',
            'nama_petugas' => 'Staf Produksi',
            'email' => 'prod@cleanwash.local',
            'password' => Hash::make('password'),
            'peran' => 'Produksi',
        ]);
    }

    public function test_kasir_dapat_mengakses_dan_membuat_pelanggan_baru(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.pelanggan.store'), [
            'kode_pelanggan' => 'PLG-999',
            'nama' => 'Budi Santoso',
            'no_telepon' => '081299988877',
            'alamat' => 'Jl. Kenanga No. 8',
            'hak_bayar_belakangan' => true,
        ]);

        $response->assertRedirect(route('kasir.pelanggan.index'));
        $this->assertDatabaseHas('pelanggan', [
            'kode_pelanggan' => 'PLG-999',
            'nama' => 'Budi Santoso',
            'hak_bayar_belakangan' => true,
        ]);
    }

    public function test_kasir_dapat_mengubah_data_pelanggan(): void
    {
        $pelanggan = Pelanggan::create([
            'kode_pelanggan' => 'PLG-010',
            'nama' => 'Nama Lama',
            'no_telepon' => '0811111111',
            'alamat' => 'Alamat Lama',
            'hak_bayar_belakangan' => false,
        ]);

        $response = $this->actingAs($this->kasir)->put(route('kasir.pelanggan.update', $pelanggan), [
            'kode_pelanggan' => 'PLG-010',
            'nama' => 'Nama Baru Diperbarui',
            'no_telepon' => '0822222222',
            'alamat' => 'Alamat Baru',
            'hak_bayar_belakangan' => true,
        ]);

        $response->assertRedirect(route('kasir.pelanggan.index'));
        $this->assertDatabaseHas('pelanggan', [
            'id' => $pelanggan->id,
            'nama' => 'Nama Baru Diperbarui',
            'hak_bayar_belakangan' => true,
        ]);
    }

    public function test_kasir_dapat_membuat_master_jenis_layanan(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.layanan.store'), [
            'kode_layanan' => 'LYN-HELM',
            'nama_layanan' => 'Cuci Helm Deep Clean',
            'kecepatan' => 'Reguler',
            'satuan_hitung' => 'Jumlah_Pcs',
            'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
            'harga_satuan' => 25000.00,
        ]);

        $response->assertRedirect(route('kasir.layanan.index'));
        $this->assertDatabaseHas('jenis_layanan', [
            'kode_layanan' => 'LYN-HELM',
            'nama_layanan' => 'Cuci Helm Deep Clean',
        ]);
    }

    public function test_kasir_dapat_membuat_voucher_promo(): void
    {
        $response = $this->actingAs($this->kasir)->post(route('kasir.voucher.store'), [
            'nomor_voucher' => 'DISKON15K',
            'nilai_potongan' => 15000.00,
            'masa_berlaku' => '2027-01-01',
            'status_terpakai' => false,
        ]);

        $response->assertRedirect(route('kasir.voucher.index'));
        $this->assertDatabaseHas('voucher', [
            'nomor_voucher' => 'DISKON15K',
            'nilai_potongan' => 15000.00,
        ]);
    }

    public function test_kasir_dapat_membuat_dan_mengubah_akun_petugas(): void
    {
        // 1. Tambah petugas baru
        $response = $this->actingAs($this->kasir)->post(route('kasir.petugas.store'), [
            'kode_petugas' => 'PTG-KURIR-BARU',
            'nama_petugas' => 'Kurir Cepat',
            'email' => 'kurir.baru@cleanwash.local',
            'password' => 'secret123',
            'peran' => 'Antar',
        ]);

        $response->assertRedirect(route('kasir.petugas.index'));
        $this->assertDatabaseHas('petugas', [
            'kode_petugas' => 'PTG-KURIR-BARU',
            'peran' => 'Antar',
        ]);

        $petugasBaru = Petugas::where('kode_petugas', 'PTG-KURIR-BARU')->first();
        $this->assertTrue(Hash::check('secret123', $petugasBaru->password));

        // 2. Ubah tanpa ubah password
        $responseUpdate = $this->actingAs($this->kasir)->put(route('kasir.petugas.update', $petugasBaru), [
            'kode_petugas' => 'PTG-KURIR-BARU',
            'nama_petugas' => 'Kurir Cepat Senior',
            'email' => 'kurir.baru@cleanwash.local',
            'password' => '', // kosong = jangan ubah password
            'peran' => 'Antar',
        ]);

        $responseUpdate->assertRedirect(route('kasir.petugas.index'));
        $petugasBaru->refresh();
        $this->assertEquals('Kurir Cepat Senior', $petugasBaru->nama_petugas);
        $this->assertTrue(Hash::check('secret123', $petugasBaru->password));
    }

    public function test_petugas_tidak_dapat_menghapus_akun_dirinya_sendiri(): void
    {
        $response = $this->actingAs($this->kasir)->delete(route('kasir.petugas.destroy', $this->kasir));

        $response->assertRedirect(route('kasir.petugas.index'));
        $this->assertDatabaseHas('petugas', [
            'id' => $this->kasir->id,
        ]);
    }

    public function test_role_selain_kasir_dilarang_mengakses_modul_master(): void
    {
        $response = $this->actingAs($this->produksi)->get(route('kasir.pelanggan.index'));
        $response->assertStatus(403);

        $response2 = $this->actingAs($this->produksi)->get(route('kasir.layanan.index'));
        $response2->assertStatus(403);
    }
}
