<?php

namespace Database\Seeders;

use App\Models\DetailPakaian;
use App\Models\DetailPengantaran;
use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Pembayaran;
use App\Models\Pengantaran;
use App\Models\Petugas;
use App\Models\RiwayatStatusProses;
use App\Models\TransaksiLaundry;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with demo data for all roles.
     */
    public function run(): void
    {
        // 1. Akun Awal 3 Role Petugas
        $kasir = Petugas::updateOrCreate(
            ['email' => 'kasir@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-001',
                'nama_petugas' => 'Kasir / Admin',
                'password' => Hash::make('password'),
                'peran' => 'Kasir',
            ]
        );

        $produksi = Petugas::updateOrCreate(
            ['email' => 'produksi@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-002',
                'nama_petugas' => 'Petugas Laundry',
                'password' => Hash::make('password'),
                'peran' => 'Produksi',
            ]
        );

        $antar = Petugas::updateOrCreate(
            ['email' => 'antar@cleanwash.local'],
            [
                'kode_petugas' => 'PTG-003',
                'nama_petugas' => 'Kurir',
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

        $layananMap = [];
        foreach ($layananList as $item) {
            $layananMap[$item['kode_layanan']] = JenisLayanan::updateOrCreate(
                ['kode_layanan' => $item['kode_layanan']],
                $item
            );
        }

        // 3. Data Pelanggan Awal
        $pelanggan1 = Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-001'],
            [
                'nama' => 'Ahmad Fauzi',
                'no_telepon' => '081234567890',
                'alamat' => 'Jl. Kaliurang KM 5 No. 14, Sleman, Yogyakarta',
                'hak_bayar_belakangan' => true,
            ]
        );

        $pelanggan2 = Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-002'],
            [
                'nama' => 'Siti Nurhaliza',
                'no_telepon' => '085678901234',
                'alamat' => 'Jl. Gejayan No. 28, Condongcatur, Depok, Sleman',
                'hak_bayar_belakangan' => false,
            ]
        );

        $pelanggan3 = Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-003'],
            [
                'nama' => 'Hendra Pratama',
                'no_telepon' => '087812345678',
                'alamat' => 'Perum Candi Indah Blok C-5, Kalasan, Sleman',
                'hak_bayar_belakangan' => true,
            ]
        );

        $pelanggan4 = Pelanggan::updateOrCreate(
            ['kode_pelanggan' => 'PLG-004'],
            [
                'nama' => 'Rina Wulandari',
                'no_telepon' => '081398765432',
                'alamat' => 'Jl. Palagan Tentara Pelajar No. 88, Ngaglik, Sleman',
                'hak_bayar_belakangan' => false,
            ]
        );

        // 4. Voucher Promo
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

        // 5. Data Transaksi Demo Realistis untuk Masing-masing Role
        // Transaksi 1: Express di Produksi (Tahap Diterima)
        $t1 = TransaksiLaundry::updateOrCreate(
            ['no_nota' => 'CW-20261122-001'],
            [
                'pelanggan_id' => $pelanggan1->id,
                'petugas_id' => $kasir->id,
                'tanggal_terima' => now()->subHours(2),
                'catatan_khusus' => 'Prioritas Express! Wangi lavender, kemeja putih jangan dicampur.',
                'total_harga' => 54000.00,
                'total_kompensasi' => 0.00,
                'sisa_tagihan' => 34000.00,
                'status_proses_terkini' => 'Diterima',
                'status_bayar' => 'DP',
                'status_transaksi' => 'Aktif',
            ]
        );

        DetailPakaian::updateOrCreate(
            ['transaksi_laundry_id' => $t1->id],
            [
                'jenis_layanan_id' => $layananMap['LYN-CKSE']->id,
                'daftar_pakaian' => '3 Kemeja Kantor, 2 Celana Bahan',
                'berat_atau_jumlah' => 3.0,
                'harga_saat_transaksi' => 18000.00,
                'subtotal' => 54000.00,
            ]
        );

        Pembayaran::updateOrCreate(
            ['transaksi_laundry_id' => $t1->id, 'jenis' => 'UangMuka'],
            [
                'petugas_id' => $kasir->id,
                'nominal' => 20000.00,
                'tanggal_bayar' => now()->subHours(2),
            ]
        );

        RiwayatStatusProses::updateOrCreate(
            ['transaksi_laundry_id' => $t1->id, 'tahap' => 'Diterima'],
            [
                'petugas_id' => $kasir->id,
                'waktu_update' => now()->subHours(2),
            ]
        );

        // Transaksi 2: Sedang Dicuci di Produksi
        $t2 = TransaksiLaundry::updateOrCreate(
            ['no_nota' => 'CW-20261122-002'],
            [
                'pelanggan_id' => $pelanggan2->id,
                'petugas_id' => $kasir->id,
                'tanggal_terima' => now()->subHours(5),
                'catatan_khusus' => 'Cuci kering biasa.',
                'total_harga' => 35000.00,
                'total_kompensasi' => 0.00,
                'sisa_tagihan' => 0.00,
                'status_proses_terkini' => 'Dicuci',
                'status_bayar' => 'Lunas',
                'status_transaksi' => 'Aktif',
            ]
        );

        DetailPakaian::updateOrCreate(
            ['transaksi_laundry_id' => $t2->id],
            [
                'jenis_layanan_id' => $layananMap['LYN-CKR']->id,
                'daftar_pakaian' => '5 Kaos Harian, 3 Celana Pendek',
                'berat_atau_jumlah' => 5.0,
                'harga_saat_transaksi' => 7000.00,
                'subtotal' => 35000.00,
            ]
        );

        Pembayaran::updateOrCreate(
            ['transaksi_laundry_id' => $t2->id, 'jenis' => 'Pelunasan'],
            [
                'petugas_id' => $kasir->id,
                'nominal' => 35000.00,
                'tanggal_bayar' => now()->subHours(5),
            ]
        );

        RiwayatStatusProses::updateOrCreate(
            ['transaksi_laundry_id' => $t2->id, 'tahap' => 'Dicuci'],
            [
                'petugas_id' => $produksi->id,
                'waktu_update' => now()->subHours(1),
            ]
        );

        // Transaksi 3: Selesai di Produksi, Sudah Dijadwalkan ke Kurir (Dalam Perjalanan)
        $t3 = TransaksiLaundry::updateOrCreate(
            ['no_nota' => 'CW-20261122-003'],
            [
                'pelanggan_id' => $pelanggan4->id,
                'petugas_id' => $kasir->id,
                'tanggal_terima' => now()->subDay(),
                'catatan_khusus' => 'Antar setelah jam 1 siang.',
                'total_harga' => 50000.00,
                'total_kompensasi' => 0.00,
                'sisa_tagihan' => 0.00,
                'status_proses_terkini' => 'Selesai',
                'status_bayar' => 'Lunas',
                'status_transaksi' => 'Aktif',
            ]
        );

        DetailPakaian::updateOrCreate(
            ['transaksi_laundry_id' => $t3->id],
            [
                'jenis_layanan_id' => $layananMap['LYN-CKSR']->id,
                'daftar_pakaian' => '4 Baju Batik, 2 Gamis',
                'berat_atau_jumlah' => 5.0,
                'harga_saat_transaksi' => 10000.00,
                'subtotal' => 50000.00,
            ]
        );

        Pembayaran::updateOrCreate(
            ['transaksi_laundry_id' => $t3->id, 'jenis' => 'Pelunasan'],
            [
                'petugas_id' => $kasir->id,
                'nominal' => 50000.00,
                'tanggal_bayar' => now()->subDay(),
            ]
        );

        // Transaksi 4: Selesai di Produksi, Status Tempo (Siap Diantar Kurir)
        $t4 = TransaksiLaundry::updateOrCreate(
            ['no_nota' => 'CW-20261122-004'],
            [
                'pelanggan_id' => $pelanggan3->id,
                'petugas_id' => $kasir->id,
                'tanggal_terima' => now()->subDay(),
                'catatan_khusus' => 'Tagihan tempo langganan bulanan.',
                'total_harga' => 60000.00,
                'total_kompensasi' => 0.00,
                'sisa_tagihan' => 60000.00,
                'status_proses_terkini' => 'Selesai',
                'status_bayar' => 'Tempo',
                'status_transaksi' => 'Aktif',
            ]
        );

        DetailPakaian::updateOrCreate(
            ['transaksi_laundry_id' => $t4->id],
            [
                'jenis_layanan_id' => $layananMap['LYN-SPT']->id,
                'daftar_pakaian' => '2 Pasang Sepatu Sneakers',
                'berat_atau_jumlah' => 2.0,
                'harga_saat_transaksi' => 30000.00,
                'subtotal' => 60000.00,
            ]
        );

        // 6. Kloter Pengantaran untuk Kurir Doni
        $kloter = Pengantaran::updateOrCreate(
            ['kode_pengantaran' => 'ANT-' . now()->format('Ymd') . '-01'],
            [
                'petugas_id' => $antar->id,
                'tanggal_antar' => now()->toDateString(),
            ]
        );

        DetailPengantaran::updateOrCreate(
            ['pengantaran_id' => $kloter->id, 'transaksi_laundry_id' => $t3->id],
            [
                'status_antar' => 'DalamPerjalanan',
            ]
        );

        DetailPengantaran::updateOrCreate(
            ['pengantaran_id' => $kloter->id, 'transaksi_laundry_id' => $t4->id],
            [
                'status_antar' => 'Menunggu',
            ]
        );
    }
}
