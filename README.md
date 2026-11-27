# CleanWash - Sistem Informasi Manajemen Operasional Laundry

CleanWash adalah aplikasi web manajemen operasional laundry terpadu yang mencakup alur penerimaan cucian di kasir, pemrosesan bertahap di bagian produksi, penjadwalan kloter pengantaran kurir, hingga rekapitulasi keuangan dan buku piutang.

---

## 1. Teknologi yang Digunakan

- **Backend:** PHP 8.4, Laravel 12
- **Frontend:** React 18, Inertia.js 2.0, Tailwind CSS, Vite 6
- **Database:** MySQL 8.0 (Produksi/Docker) & SQLite In-Memory (Pengujian Otomatis)
- **Infrastruktur:** Docker & Docker Compose (`cleanwash-app`, `cleanwash-vite`, `cleanwash-db`)

---

## 2. Fitur Utama Berdasarkan Peran (Role)

Sistem membagi hak akses ke dalam 3 peran operasional dengan pemisahan sesi per peran dan sinkronisasi data realtime lintas tab:

### A. Kasir / Admin
- **Dashboard Operasional:** Ringkasan jumlah pelanggan, transaksi aktif, transaksi selesai, tagihan tempo, dan daftar transaksi terbaru.
- **Data Master:**
  - **Pelanggan:** Pengelolaan data pelanggan beserta pengaturan hak fasilitas bayar tempo (`hak_bayar_belakangan`).
  - **Jenis Layanan:** Pengelolaan layanan berbasis berat (`Berat_Kg`) atau satuan potong (`Jumlah_Pcs`), kecepatan (`Reguler` / `Express`), dan tahapan proses kustom.
  - **Voucher Promo:** Pengelolaan kode potongan harga beserta masa berlaku dan status pemakaian.
  - **Petugas:** Pengelolaan akun staf dengan pengubahan peran langsung melalui dropdown (`Kasir / Admin`, `Petugas Laundry`, `Kurir`).
- **Transaksi Laundry & Penyesuaian:**
  - Pembuatan nota baru multi-layanan, pendaftaran pelanggan cepat, validasi voucher otomatis, serta pilihan metode pembayaran (`Belum`, `Uang Muka / DP`, `Lunas`, dan `Tempo`).
  - **Timbang Ulang:** Penyesuaian berat/jumlah aktual pakaian selama cucian masih berada pada tahap `Diterima` dengan perhitungan ulang tagihan otomatis.
  - **Pembatalan Proporsional:** Pembatalan pesanan dengan perhitungan biaya otomatis (`0%` pada tahap `Diterima`, `50%` pada tahap `Dicuci`, `75%` pada tahap `Dikeringkan`, dan terkunci setelah `Disetrika`/`Selesai`) serta pelepasan kembali voucher yang digunakan.
  - **Pelunasan & Serah Terima:** Pencatatan pembayaran pelunasan (Tunai, QRIS, Transfer) dan penyerahan cucian kepada pelanggan.
  - **Cetak Nota:** Pratinjau cetak struk kasir **Thermal 80mm** dan **Invoice Formal A5**.
- **Kloter Pengantaran:** Penjadwalan kloter pengantaran kurir untuk cucian yang telah berstatus `Selesai` di produksi, termasuk penjadwalan ulang bagi paket yang sebelumnya gagal diantar.
- **Laporan Keuangan & Buku Piutang:** Rekapitulasi kas masuk berdasarkan periode tanggal, buku piutang tagihan tempo/belum lunas, laporan insiden kompensasi kerusakan, dan rincian volume cucian per layanan.

### B. Petugas Laundry (Produksi)
- **Papan Antrean Produksi:** Daftar cucian aktif yang diurutkan berdasarkan prioritas (`Express` didahulukan) dan waktu terima, dilengkapi filter pencarian, tahapan, dan prioritas.
- **Transisi Tahapan Berurutan (Dropdown):** Pembaruan status proses melalui dropdown (`Diterima` -> `Dicuci` -> `Dikeringkan` -> `Disetrika` -> `Selesai`). Layanan tanpa tahap setrika (seperti Cuci Kering atau Cuci Sepatu) otomatis melewati tahap `Disetrika`.
- **Laporan Kerusakan / Kehilangan:** Pencatatan insiden pakaian rusak atau hilang beserta nilai kompensasi yang otomatis memotong sisa tagihan pelanggan pada nota kasir.

### C. Kurir (Pengantaran)
- **Daftar Tugas Pengantaran:** Tampilan daftar paket antaran yang dioptimalkan untuk perangkat seluler dengan filter tab (`Semua`, `Hari Ini`, `Aktif`, `Diterima`, `Gagal`).
- **Navigasi Cepat Lapangan:** Pintasan langsung untuk menghubungi pelanggan melalui **WhatsApp** dan membuka titik alamat di **Google Maps**.
- **Pembaruan Status Pengantaran (Dropdown):** Pengubahan status antaran melalui dropdown (`Menunggu` -> `Diambil` -> `DalamPerjalanan` -> `Diterima` atau `Gagal`).
- **Penanganan Gagal Antar:** Jika kurir memilih status `Gagal`, sistem menampilkan form alasan gagal antar dan tanggal jadwal antar ulang yang langsung terhubung ke modul penjadwalan kloter di kasir.

---

## 3. Daftar Akun Login (Data Seeder)

Pada halaman Login (`/login`), klik kolom input **Peran / Email Akun** untuk memilih salah satu dari tiga akun peran berikut:

| Peran di Sistem | Email Akun | Kata Sandi | Hak Akses Modul |
| :--- | :--- | :--- | :--- |
| **Kasir / Admin** | `kasir@cleanwash.local` | `password` | Dashboard Kasir, Transaksi, Kloter Pengantaran, Master Data, Laporan & Piutang |
| **Petugas Laundry** | `produksi@cleanwash.local` | `password` | Papan Antrean Produksi, Update Tahap Cucian, Lapor Kerusakan & Kompensasi |
| **Kurir** | `antar@cleanwash.local` | `password` | Daftar Tugas Pengantaran Kurir, Update Status Antar & Jadwal Ulang |

---

## 4. Panduan Menjalankan Aplikasi (Docker)

Pastikan **Docker Desktop** sudah berjalan, kemudian jalankan perintah berikut pada terminal di direktori proyek:

1. **Menjalankan Container Aplikasi, Vite, dan Database:**
   ```bash
   docker compose up -d --build
   ```

2. **Menjalankan Migrasi dan Data Awal (Seeder):**
   ```bash
   docker compose exec cleanwash-app php artisan migrate:fresh --seed --force
   ```

3. **Mengompilasi Aset Frontend (Opsional jika ingin build produksi):**
   ```bash
   docker compose exec cleanwash-vite npm run build
   ```

4. **Mengakses Aplikasi:**
   - Aplikasi Web CleanWash: [http://localhost:8080](http://localhost:8080)
   - Server Vite HMR: `http://localhost:5175`
   - MySQL Database: `localhost:3306` (Database: `cleanwash`, User: `cleanwash`, Password: `secret`)

---

## 5. Pengujian Otomatis (Automated Tests)

Seluruh alur bisnis diuji menggunakan PHPUnit di atas database SQLite *in-memory* (sehingga tidak mengubah atau menghapus data MySQL):

```bash
docker compose exec cleanwash-app php artisan test
```

Cakupan 40 skenario pengujian (`157 assertions`):
- `AuthenticationTest`: Login per peran, pengalihan halaman otomatis, proteksi middleware lintas peran, dan logout.
- `MasterDataTest`: CRUD Pelanggan, Jenis Layanan, Voucher, dan Petugas beserta proteksi hapus akun sendiri.
- `TransaksiKasirTest`: Pembuatan transaksi lunas, DP, tempo, validasi hak tempo, pemotongan voucher, dan halaman cetak nota.
- `PenyesuaianPelunasanTest`: Timbang ulang pada tahap `Diterima`, penolakan timbang ulang saat sudah dicuci, pembatalan proporsional & pelepasan voucher, serta pelunasan tagihan.
- `ProduksiTest`: Papan antrean produksi, lompatan otomatis tahap setrika untuk layanan cuci kering, validasi urutan tahap, dan pemotongan tagihan dari kompensasi kerusakan.
- `PengantaranKurirTest`: Penjadwalan kloter pengantaran baru, pembaruan status pengantaran kurir hingga diterima, pencatatan gagal antar beserta jadwal ulang, dan isolasi tugas antar kurir.
- `LaporanTest`: Perhitungan pendapatan kas masuk dan akurasi buku piutang tagihan tempo.
