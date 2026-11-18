# Spesifikasi Fitur, Alur Bisnis & Cakupan MVP — Sistem Laundry CleanWash

Dokumen ini menjadi acuan fungsional bagi pengembangan aplikasi web **CleanWash** menggunakan **Laravel + React (Inertia.js) + Tailwind CSS + MySQL** di dalam lingkungan **Docker**, serta selaras dengan struktur 11 tabel pada `SKEMA_DATABASE_CLEANWASH.md`.

## 1. Arsitektur Peran & Antarmuka Pengguna

* **Sistem Autentikasi Tunggal (3 Role Internal):** Aplikasi hanya menyediakan login untuk petugas internal melalui tabel `petugas` yang dibedakan berdasarkan kolom `peran`:
  1. `Kasir` (merangkap hak akses **Admin**)
  2. `Produksi`
  3. `Antar`
* **Tanpa Login & Tanpa Halaman Publik Pelanggan:** Pelanggan tidak memiliki akun maupun halaman pelacakan daring. Seluruh pencatatan dilakukan petugas, sedangkan pelanggan menerima rincian tagihan melalui nota cetak/PDF.
* **Desain Web Responsif:**
  * **Desktop / Tablet:** Dioptimalkan untuk meja kerja **Kasir** (input banyak item transaksi & laporan) dan **Produksi** (antrean papan kerja).
  * **Mobile (HP):** Dioptimalkan untuk **Petugas Antar** saat memperbarui status pengiriman di lapangan.

## 2. Rincian Fitur Setiap Role

### 2.1. Role `Kasir` (Merangkap Admin)
Memiliki kendali penuh atas data master, manajemen staf, transaksi harian, keuangan, dan penjadwalan kurir.

1. **Manajemen Akun Petugas (Fungsi Admin):**
   * Tambah, ubah, dan kelola akun untuk peran `Kasir`, `Produksi`, dan `Antar` pada tabel `petugas`.
2. **Manajemen Data Master (Fungsi Admin):**
   * **Pelanggan (`pelanggan`):** Tambah dan ubah data pelanggan (`nama`, `no_telepon`, `alamat`) serta pengaturan izin `hak_bayar_belakangan`.
   * **Jenis Layanan (`jenis_layanan`):** Kelola tarif (`harga_satuan`), `satuan_hitung` (`Berat_Kg` atau `Jumlah_Pcs`), `kecepatan` (`Reguler` atau `Express`), dan urutan `tahapan_proses` (JSON).
   * **Voucher (`voucher`):** Buat dan kelola `nomor_voucher`, `nilai_potongan`, dan `masa_berlaku`.
3. **Pembuatan Transaksi Baru (`transaksi_laundry` & `detail_pakaian`):**
   * Pilih pelanggan dan tambahkan satu atau banyak baris item pakaian berdasarkan `jenis_layanan`.
   * Sistem otomatis mengunci harga pada kolom `detail_pakaian.harga_satuan_saat_transaksi` saat nota dibuat.
   * Input dan validasi kode `voucher` (belum terpakai dan masih berlaku).
   * Input pembayaran awal (`UangMuka` atau langsung `Pelunasan`) ke tabel `pembayaran`.
   * Cetak nota transaksi (tampilan siap cetak browser / PDF) dengan nomor unik `no_nota`.
4. **Penyesuaian & Pembatalan Transaksi:**
   * **Timbang Ulang / Ubah Layanan:** Memperbarui `berat_atau_jumlah` atau mengganti `jenis_layanan_id` selama proses produksi belum melewati batas tahap yang relevan, lalu menghitung ulang `total_harga` dan `sisa_tagihan`.
   * **Pembatalan Transaksi:** Mengubah `status_transaksi` menjadi `Batal` dengan menghitung biaya pembatalan proporsional sesuai tahapan terakhir yang sudah dikerjakan bagian produksi.
5. **Pelunasan & Penyerahan Cucian:**
   * Menampilkan `sisa_tagihan` akhir yang sudah dikurangi potongan voucher, uang muka, dan `total_kompensasi` kerusakan.
   * Mencatat `Pelunasan` ke tabel `pembayaran` hingga `status_bayar` menjadi `Lunas` dan `status_transaksi` menjadi `Selesai`.
   * Jika `pelanggan.hak_bayar_belakangan == true`, kasir dapat menyerahkan pakaian sebelum lunas dan mengubah `status_bayar` menjadi `Tempo`.
6. **Penjadwalan Pengantaran & Laporan:**
   * Membuat kloter pengiriman baru pada tabel `pengantaran` yang ditugaskan kepada petugas dengan peran `Antar`.
   * Memilih beberapa transaksi berstatus `Selesai` untuk dimasukkan ke `detail_pengantaran`.
   * Melihat rekap laporan transaksi, omzet masuk, dan daftar tagihan berstatus `Tempo` / belum lunas.

### 2.2. Role `Produksi`
Berfokus pada pengerjaan fisik cucian dan pencatatan kondisi pakaian.

1. **Daftar Antrean Cucian:**
   * Menampilkan daftar `transaksi_laundry` yang berstatus `Aktif` beserta rincian `daftar_pakaian` dan `catatan_khusus`.
2. **Pembaruan Tahap Proses Laundry:**
   * Mengubah `status_proses_terkini` secara berurutan (`Diterima` $\rightarrow$ `Dicuci` $\rightarrow$ `Dikeringkan` $\rightarrow$ `Disetrika` $\rightarrow$ `Selesai`).
   * Sistem membaca array `tahapan_proses` milik `jenis_layanan` terkait sehingga layanan tertentu (seperti cuci sepatu atau karpet) otomatis melewati tahap `Disetrika`.
   * Setiap perubahan tahap otomatis mencatat log ke tabel `riwayat_status_proses`.
3. **Pelaporan Kerusakan atau Kehilangan (`laporan_kerusakan`):**
   * Memilih baris `detail_pakaian` yang bermasalah, menentukan `jenis_insiden` (`Rusak` atau `Hilang`), `jenis_pakaian`, `keterangan`, dan `nilai_kompensasi`.
   * Sistem otomatis menambahkan nominal tersebut ke `transaksi_laundry.total_kompensasi` dan mengurangi `sisa_tagihan`.

### 2.3. Role `Antar`
Berfokus pada distribusi cucian selesai ke alamat pelanggan melalui tampilan responsif HP.

1. **Daftar Tugas Pengantaran:**
   * Menampilkan daftar `pengantaran` yang ditugaskan ke akun kurir yang sedang login beserta daftar nota pelanggan di dalam `detail_pengantaran` (lengkap dengan nama, nomor telepon, dan alamat pelanggan).
2. **Pembaruan Status Pengantaran:**
   * Memperbarui `status_antar` pada masing-masing nota secara bertahap: `Menunggu` $\rightarrow$ `Diambil` $\rightarrow$ `DalamPerjalanan` $\rightarrow$ `Diterima`.
3. **Pelaporan Gagal Antar & Jadwal Ulang:**
   * Jika pelanggan tidak berada di lokasi, kurir memilih status `Gagal`, mengisi `alasan_gagal`, dan menetapkan tanggal `jadwal_ulang` agar nota dapat dikirim kembali pada jadwal berikutnya.

## 3. Alur Keterhubungan Data Antar-Role

1. **Kasir $\rightarrow$ Produksi:** Transaksi baru dari Kasir otomatis muncul di antrean Produksi. Perubahan timbang ulang atau pembatalan dari Kasir langsung memperbarui rincian di layar Produksi.
2. **Produksi $\rightarrow$ Kasir:** Saat Produksi mengubah status menjadi `Selesai`, transaksi muncul di daftar siap ambil/siap antar milik Kasir. Input `laporan_kerusakan` dari Produksi langsung memotong `sisa_tagihan` di meja Kasir.
3. **Kasir $\rightarrow$ Antar:** Kasir mengelompokkan beberapa nota `Selesai` ke dalam satu jadwal `pengantaran` untuk kurir tertentu.
4. **Antar $\rightarrow$ Kasir:** Perubahan status menjadi `Diterima` atau `Gagal` beserta tanggal `jadwal_ulang` oleh kurir langsung terpantau di dashboard Kasir.

## 4. Aturan Logika Bisnis Inti

1. **Harga Snapshot:** Perubahan `harga_satuan` pada master `jenis_layanan` tidak boleh mengubah `harga_saat_transaksi` maupun `subtotal` pada transaksi yang sudah tercatat sebelumnya.
2. **Rumus Sisa Tagihan:**
   $$\text{sisa\_tagihan} = \text{total\_harga} - \text{potongan\_voucher} - \text{total\_kompensasi} - \sum \text{pembayaran.nominal}$$
3. **Tahapan Proses Dinamis:** Transisi status produksi wajib mengikuti urutan indeks pada array JSON `jenis_layanan.tahapan_proses`.

## 5. Batasan Cakupan MVP (Minimum Viable Product)

* **Termasuk dalam MVP:**
  * Autentikasi & *middleware* pemisah 3 role (`Kasir`, `Produksi`, `Antar`).
  * CRUD penuh untuk data `petugas`, `pelanggan`, `jenis_layanan`, dan `voucher`.
  * Alur lengkap transaksi nota multi-item, validasi voucher, pembayaran bertahap (`UangMuka`, `Pelunasan`, `Tempo`), penyesuaian/batal, kompensasi kerusakan, dan jadwal pengantaran kurir.
  * Tampilan nota siap cetak (Print CSS / PDF) dan tabel rekap laporan sederhana.
* **Di Luar Cakupan MVP:**
  * Portal login atau pelacakan publik untuk pelanggan.
  * Integrasi *payment gateway* otomatis maupun notifikasi WhatsApp otomatis.
  * Grafik analitik kompleks.