<?php

namespace Database\Seeders;

use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Petugas;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Awal 3 Role Petugas
        Petugas::updateOrCreate(
            ['email' => 'kasir@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-001',
                'nama_petugas' => 'Farhan (Kasir & Admin)',
                'password' => Hash::make('password'),
                'peran' => 'Kasir',
            ]
        );

        Petugas::updateOrCreate(
            ['email' => 'produksi@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-002',
                'nama_petugas' => 'Budi (Staf Produksi)',
                'password' => Hash::make('password'),
                'peran' => 'Produksi',
            ]
        );

        Petugas::updateOrCreate(
            ['email' => 'antar@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-003',
                'nama_petugas' => 'Doni (Petugas Antar/Kurir)',
                'password' => Hash::make('password'),
                'peran' => 'Antar',
            ]
        );

        // 2. Master Data Jenis Layanan Laundry
        $layananList = [
            [
                'kode_layanan' => 'LYN-CKR',
                'nama_layanan' => 'Cuci Kering Reguler',
                'kecepatan' => 'Reguler',
                'satuan_hitung' => 'Berat_Kg',
                'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
                'harga_satuan' => 7000.00,
            ],
            [
                'kode_layanan' => 'LYN-CKSR',
                'nama_layanan' => 'Cuci Setrika Reguler',
                'kecepatan' => 'Reguler',
                'satuan_hitung' => 'Berat_Kg',
                'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'],
                'harga_satuan' => 10000.00,
            ],
            [
                'kode_layanan' => 'LYN-CKSE',
                'nama_layanan' => 'Cuci Setrika Express',
                'kecepatan' => 'Express',
                'satuan_hitung' => 'Berat_Kg',
                'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'],
                'harga_satuan' => 18000.00,
            ],
            [
                'kode_layanan' => 'LYN-SPT',
                'nama_layanan' => 'Cuci Sepatu Premium',
                'kecepatan' => 'Reguler',
                'satuan_hitung' => 'Jumlah_Pcs',
                'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
                'harga_satuan' => 30000.00,
            ],
            [
                'kode_layanan' => 'LYN-BC',
                'nama_layanan' => 'Cuci Bed Cover / Selimut',
                'kecepatan' => 'Reguler',
                'satuan_hitung' => 'Jumlah_Pcs',
                'tahapan_proses' => ['Diterima', 'Dicuci', 'Dikeringkan', 'Selesai'],
                'harga_satuan' => 25000.00,
            ],
        ];

        foreach ($layananList as $item) {
            JenisLayanan::updateOrCreate(
                ['kode_layanan' => $item['kode_layanan']],
                $item
            );
        }

        // 3. Data Pelanggan Awal untuk Pengujian
        Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-001'],
            [
                'nama' => 'Ahmad Fauzi',
                'no_telepon' => '081234567890',
                'alamat' => 'Jl. Mawar No. 12, Kebayoran Baru',
                'hak_bayar_belakangan' => true,
            ]
        );

        Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-002'],
            [
                'nama' => 'Siti Nurhaliza',
                'no_telepon' => '085678901234',
                'alamat' => 'Jl. Melati No. 45, Tebet',
                'hak_bayar_belakangan' => false,
            ]
        );

        // 4. Data Voucher Awal untuk Pengujian
        Voucher::updateOrCreate(
            ['nomor_voucher' => 'CW-HEMAT10K'],
            [
                'nilai_potongan' => 10000.00,
                'masa_berlaku' => '2027-12-31',
                'status_terpakai' => false,
            ]
        );

        Voucher::updateOrCreate(
            ['nomor_voucher' => 'CW-DISKON5K'],
            [
                'nilai_potongan' => 5000.00,
                'masa_berlaku' => '2027-12-31',
                'status_terpakai' => false,
            ]
        );
    }
}
