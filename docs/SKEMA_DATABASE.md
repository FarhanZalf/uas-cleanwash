# Skema Database & Konfigurasi Awal — Sistem Laundry CleanWash

Dokumen ini merupakan rancangan teknis terjemahan dari 11 Class Diagram Laporan UTS Sistem Informasi ke dalam struktur database MySQL berbahasa Indonesia (format `snake_case`) untuk diimplementasikan menggunakan **Laravel + React (Inertia.js)** di dalam lingkungan Docker.

---

## 1. Alokasi Port Docker (Isolasi dari Proyek Lain)
Agar dapat berjalan berdampingan dengan proyek `erles-bakery-erp` tanpa konflik port pada Docker Desktop:

| Service | Container Name | Port Host : Container | Keterangan |
| :--- | :--- | :--- | :--- |
| **Web / Backend (Laravel)** | `cleanwash-app` | `8080:80` | Akses utama aplikasi web & Inertia |
| **Frontend Dev (Vite React)** | `cleanwash-vite` | `5175:5173` | Hot Module Replacement (HMR) React |
| **Database (MySQL 8.0)** | `cleanwash-db` | `3306:3306` | Penyimpanan data transaksional |

---

## 2. Daftar & Ringkasan Relasi 11 Tabel

1. **`pelanggan`**: Data pelanggan (memiliki relasi 1 ke 0..* dengan `transaksi_laundry`).
2. **`petugas`**: Data pengguna internal/staf dengan peran Kasir, Produksi, dan Antar.
3. **`voucher`**: Data kode promo/potongan (relasi 0..1 ke 0..1 dengan `transaksi_laundry`).
4. **`jenis_layanan`**: Master layanan laundry (Cuci Kering, Cuci Setrika, Sepatu, Karpet, dll.).
5. **`transaksi_laundry`**: Header transaksi utama dan informasi tagihan.
6. **`detail_pakaian`**: Rincian item pakaian per transaksi (relasi komposisi 1 ke 1..*).
7. **`pembayaran`**: Riwayat pembayaran uang muka (DP) maupun pelunasan.
8. **`riwayat_status_proses`**: Log histori perpindahan status produksi cucian.
9. **`laporan_kerusakan`**: Pencatatan insiden pakaian rusak/hilang serta nilai kompensasi.
10. **`pengantaran`**: Jadwal/kloter pengantaran oleh kurir (Petugas Antar).
11. **`detail_pengantaran`**: Tabel penghubung (*many-to-many*) antara `transaksi_laundry` dan `pengantaran`.

---

## 3. Kamus Data Detail (11 Tabel)

### 3.1. Tabel `pelanggan`
Menyimpan profil pelanggan dan hak fasilitas pembayaran tempo.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `kode_pelanggan` | VARCHAR(20) | UNIQUE, NOT NULL | Kode unik pelanggan (misal: `PLG-001`) |
| `nama` | VARCHAR(100) | NOT NULL | Nama lengkap pelanggan |
| `no_telepon` | VARCHAR(20) | NOT NULL | Nomor WhatsApp/HP aktif |
| `alamat` | TEXT | NULLABLE | Alamat lengkap untuk layanan antar-jemput |
| `hak_bayar_belakangan` | BOOLEAN | DEFAULT FALSE | `true` jika diizinkan ambil pakaian sebelum lunas |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.2. Tabel `petugas`
Menyimpan akun petugas operasional gerai (dapat menggantikan atau terhubung dengan tabel `users` bawaan Laravel).

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `kode_petugas` | VARCHAR(20) | UNIQUE, NOT NULL | Kode identitas petugas (misal: `PTG-001`) |
| `nama_petugas` | VARCHAR(100) | NOT NULL | Nama lengkap petugas |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email untuk login sistem |
| `password` | VARCHAR(255) | NOT NULL | Kata sandi terenkripsi (bcrypt) |
| `peran` | ENUM('Kasir', 'Produksi', 'Antar') | NOT NULL | Hak akses modul operasional |
| `remember_token` | VARCHAR(100) | NULLABLE | Token sesi login Laravel |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.3. Tabel `voucher`
Menyimpan data voucher potongan harga yang hanya berlaku untuk satu kali transaksi.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `nomor_voucher` | VARCHAR(30) | UNIQUE, NOT NULL | Kode voucher yang diinput kasir |
| `nilai_potongan` | DECIMAL(12, 2) | NOT NULL | Nominal potongan dalam Rupiah |
| `masa_berlaku` | DATE | NOT NULL | Tanggal batas akhir penggunaan voucher |
| `status_terpakai` | BOOLEAN | DEFAULT FALSE | `false` = tersedia, `true` = sudah digunakan |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.4. Tabel `jenis_layanan`
Master data jenis layanan laundry beserta aturan satuan hitung dan tahapan proses yang berlaku.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `kode_layanan` | VARCHAR(20) | UNIQUE, NOT NULL | Kode layanan (misal: `LYN-001`) |
| `nama_layanan` | VARCHAR(100) | NOT NULL | Cuci Kering, Cuci Setrika, Sepatu, Karpet, dll. |
| `kecepatan` | ENUM('Reguler', 'Express') | DEFAULT 'Reguler' | Tingkat kecepatan pengerjaan |
| `satuan_hitung` | ENUM('Berat_Kg', 'Jumlah_Pcs') | NOT NULL | Dasar perhitungan harga |
| `tahapan_proses` | JSON | NOT NULL | Array tahapan berlaku, misal: `["Diterima","Dicuci","Dikeringkan","Selesai"]` |
| `harga_satuan` | DECIMAL(12, 2) | NOT NULL | Tarif per Kg atau per Pcs saat ini |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.5. Tabel `transaksi_laundry`
Tabel utama transaksi yang mencatat ringkasan tagihan, status terkini, serta referensi pelanggan, kasir, dan voucher.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `no_nota` | VARCHAR(30) | UNIQUE, NOT NULL | Nomor nota cetak (misal: `CW-20261117-001`) |
| `pelanggan_id` | BIGINT UNSIGNED | FOREIGN KEY -> `pelanggan(id)` | Relasi 1 Pelanggan ke 0..* Transaksi |
| `petugas_id` | BIGINT UNSIGNED | FOREIGN KEY -> `petugas(id)` | Petugas kasir yang mencatat transaksi |
| `voucher_id` | BIGINT UNSIGNED | NULLABLE, UNIQUE, FK -> `voucher(id)` | Relasi 0..1 ke 0..1 (mencegah voucher dipakai 2x) |
| `tanggal_terima` | DATETIME | NOT NULL | Waktu pakaian diterima di gerai |
| `catatan_khusus` | TEXT | NULLABLE | Catatan noda, bahan sensitif, dll. |
| `total_harga` | DECIMAL(12, 2) | DEFAULT 0 | Total kotor sebelum potongan voucher & kompensasi |
| `total_kompensasi` | DECIMAL(12, 2) | DEFAULT 0 | Akumulasi potongan dari laporan kerusakan/hilang |
| `sisa_tagihan` | DECIMAL(12, 2) | DEFAULT 0 | Sisa yang harus dibayar pelanggan |
| `status_proses_terkini` | ENUM('Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai') | DEFAULT 'Diterima' | Status produksi terbaru |
| `status_bayar` | ENUM('Belum', 'DP', 'Lunas', 'Tempo') | DEFAULT 'Belum' | Status keuangan transaksi |
| `status_transaksi` | ENUM('Aktif', 'Selesai', 'Batal') | DEFAULT 'Aktif' | Status siklus hidup transaksi |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.6. Tabel `detail_pakaian`
Menyimpan rincian per jenis layanan/item pakaian dalam satu transaksi (Relasi Komposisi `ON DELETE CASCADE`).

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `transaksi_laundry_id` | BIGINT UNSIGNED | FK -> `transaksi_laundry(id)` ON DELETE CASCADE | Induk transaksi |
| `jenis_layanan_id` | BIGINT UNSIGNED | FOREIGN KEY -> `jenis_layanan(id)` | Layanan yang dipilih untuk item ini |
| `daftar_pakaian` | TEXT | NOT NULL | Rincian fisik pakaian (misal: 3 Kemeja, 2 Celana) |
| `berat_atau_jumlah` | DECIMAL(8, 2) | NOT NULL | Angka berat (Kg) atau jumlah (Pcs) |
| `harga_saat_transaksi` | DECIMAL(12, 2) | NOT NULL | Snapshot harga saat nota dibuat (aman dari perubahan tarif) |
| `subtotal` | DECIMAL(12, 2) | NOT NULL | Hasil kalkulasi `berat_atau_jumlah` * `harga_saat_transaksi` |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.7. Tabel `pembayaran`
Mencatat setiap uang masuk (DP maupun pelunasan) untuk satu transaksi.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `transaksi_laundry_id` | BIGINT UNSIGNED | FOREIGN KEY -> `transaksi_laundry(id)` | Transaksi yang dibayar |
| `petugas_id` | BIGINT UNSIGNED | FOREIGN KEY -> `petugas(id)` | Petugas kasir penerima pembayaran |
| `jenis` | ENUM('UangMuka', 'Pelunasan') | NOT NULL | Tahap pembayaran |
| `nominal` | DECIMAL(12, 2) | NOT NULL | Jumlah uang yang dibayarkan |
| `tanggal_bayar` | DATETIME | NOT NULL | Waktu transaksi pembayaran dilakukan |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.8. Tabel `riwayat_status_proses`
Mencatat jejak audit perubahan status cucian beserta waktu dan petugas produksi yang memprosesnya.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `transaksi_laundry_id` | BIGINT UNSIGNED | FK -> `transaksi_laundry(id)` ON DELETE CASCADE | Transaksi yang diproses |
| `petugas_id` | BIGINT UNSIGNED | FOREIGN KEY -> `petugas(id)` | Petugas produksi yang mengubah status |
| `tahap` | ENUM('Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai') | NOT NULL | Status tahapan proses |
| `waktu_update` | DATETIME | NOT NULL | Waktu status diperbarui |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.9. Tabel `laporan_kerusakan`
Mencatat insiden pakaian rusak atau hilang selama proses laundry berlangsung.

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `detail_pakaian_id` | BIGINT UNSIGNED | FOREIGN KEY -> `detail_pakaian(id)` | Item pakaian yang mengalami insiden |
| `petugas_id` | BIGINT UNSIGNED | FOREIGN KEY -> `petugas(id)` | Petugas produksi pelapor |
| `jenis_insiden` | ENUM('Rusak', 'Hilang') | NOT NULL | Kategori masalah |
| `jenis_pakaian` | VARCHAR(100) | NOT NULL | Nama spesifik pakaian yang rusak/hilang |
| `keterangan` | TEXT | NOT NULL | Kronologi atau detail kerusakan |
| `nilai_kompensasi` | DECIMAL(12, 2) | NOT NULL | Nominal ganti rugi pemotong tagihan |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.10. Tabel `pengantaran`
Mencatat kloter/jadwal pengantaran yang ditugaskan kepada kurir (Petugas Antar).

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `kode_pengantaran` | VARCHAR(30) | UNIQUE, NOT NULL | Kode jadwal antaran (misal: `ANT-20261117-01`) |
| `petugas_id` | BIGINT UNSIGNED | FOREIGN KEY -> `petugas(id)` | Kurir (Petugas Antar) yang bertugas |
| `tanggal_antar` | DATE | NOT NULL | Tanggal pelaksanaan pengantaran |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

### 3.11. Tabel `detail_pengantaran`
Tabel pivot/detail penghubung relasi *many-to-many* antara `transaksi_laundry` dan `pengantaran` (mendukung satu kloter membawa banyak transaksi sekaligus penjadwalan ulang jika gagal).

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ID internal Laravel |
| `pengantaran_id` | BIGINT UNSIGNED | FK -> `pengantaran(id)` ON DELETE CASCADE | Induk jadwal pengantaran |
| `transaksi_laundry_id` | BIGINT UNSIGNED | FOREIGN KEY -> `transaksi_laundry(id)` | Transaksi pelanggan yang diantar |
| `status_antar` | ENUM('Menunggu', 'Diambil', 'DalamPerjalanan', 'Diterima', 'Gagal') | DEFAULT 'Menunggu' | Status pengiriman per nota |
| `alasan_gagal` | TEXT | NULLABLE | Diisi jika status Gagal (misal: rumah kosong) |
| `jadwal_ulang` | DATE | NULLABLE | Tanggal rencana pengantaran ulang |
| `created_at` | TIMESTAMP | NULLABLE | Waktu data dibuat |
| `updated_at` | TIMESTAMP | NULLABLE | Waktu data diperbarui |

---

## 4. Aturan Logika Bisnis Penting Saat Implementasi Laravel

1. **Perlindungan Harga Snapshot**: Saat kasir menyimpan transaksi baru atau melakukan penimbangan ulang, perhitungan `subtotal` pada tabel `detail_pakaian` wajib dikalikan dengan kolom `harga_saat_transaksi`, bukan mengambil ulang dari `jenis_layanan.harga_satuan`.
2. **Validasi Voucher Tunggal**: Constraint `UNIQUE` pada `transaksi_laundry.voucher_id` memastikan satu voucher tidak akan pernah bisa terpasang pada dua transaksi berbeda di level database, selain pengecekan `masa_berlaku >= CURDATE()` dan `status_terpakai == false` di Controller.
3. **Kalkulasi Sisa Tagihan Otomatis**:
   $$\text{sisa\_tagihan} = \text{total\_harga} - \text{potongan\_voucher} - \text{total\_kompensasi} - \text{total\_bayar}$$
   - Jika hasil perhitungan $\le 0$ dan masih terdapat kelebihan kompensasi, sistem menandai selisih lebihnya sebagai **refund tunai** saat pengambilan.
