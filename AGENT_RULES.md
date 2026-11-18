# Aturan Kerja & Protokol Eksekusi Agent — Proyek CleanWash

Dokumen ini berisi batasan teknis, protokol Git, dan alur perintah bertahap yang wajib dipatuhi oleh AI Agent selama mengerjakan proyek **CleanWash** di dalam workspace ini.

## 1. Aturan Baku Agent (Wajib Dipatuhi)

1. **Mode Diskusi vs Mode Eksekusi:**
   * Jika pesan pengguna diawali kata **`DISKUSI:`**, jawab secara konseptual dan analitis saja. **Dilarang** membuat, mengubah, menghapus file, maupun menjalankan perintah terminal apa pun.
   * Lakukan perubahan file atau eksekusi perintah terminal **hanya** jika pesan pengguna diawali kata **`EKSEKUSI:`** dan setelah mendapatkan persetujuan pengguna.
2. **Isolasi Docker & Keamanan Proyek Lain:**
   * Seluruh perintah Docker hanya boleh menargetkan proyek `cleanwash` di dalam direktori kerja saat ini.
   * **Dilarang keras** menjalankan perintah global yang mematikan, menghapus, atau mengubah kontainer, jaringan, maupun volume milik proyek lain (seperti `erles-bakery-erp`).
   * Kunci alokasi port host secara ketat:
     * Web / Laravel: `8080` (`8080:80`)
     * Vite React Dev: `5175` (`5175:5173`)
     * Database MySQL: `3306` (`3306:3306`)
3. **Konsistensi Arsitektur & Database:**
   * Selalu rujuk `@SKEMA_DATABASE_CLEANWASH.md` untuk struktur 11 tabel MySQL berbahasa Indonesia (`snake_case`).
   * Selalu rujuk `@SPESIFIKASI_FITUR_CLEANWASH.md` untuk pembagian fitur 3 role (`Kasir` merangkap Admin, `Produksi`, dan `Antar`), logika bisnis, serta cakupan MVP.
4. **Protokol Git & Kebersihan Repositori:**
   * Pastikan file `.gitignore` selalu mengecualikan `/vendor`, `/node_modules`, `.env`, `.phpunit.result.cache`, dan file log.
   * Jangan pernah menjalankan `git commit` atau `git push` secara otomatis tanpa perintah eksplisit dari pengguna.

## 2. Panduan Prompt Bertahap untuk Pengguna

Gunakan templat perintah di bawah ini secara berurutan di kolom chat Antigravity:

### A. Saat Ingin Bertanya / Berdiskusi Konsep
```text
DISKUSI: [Tulis pertanyaan atau diskusi Anda di sini]
```

### B. Tahap 1 — Inisialisasi Git & `.gitignore` Awal
```text
EKSEKUSI: Baca @AGENT_RULES.md. Jalankan git init di folder cleanwash ini, lalu buat file .gitignore awal yang mengabaikan vendor, node_modules, .env, .phpunit.result.cache, dan file log. Cek hasilnya dengan git status lalu berhenti dan laporkan.
```

### C. Tahap 2 — Setup Laravel, Breeze React, Tailwind & Docker
```text
EKSEKUSI: Baca @AGENT_RULES.md dan @SKEMA_DATABASE_CLEANWASH.md. Instal proyek Laravel baru dengan starter kit Breeze React (Inertia.js) dan Tailwind CSS di folder ini tanpa menghapus file .md dan .gitignore yang sudah ada. Siapkan Dockerfile, docker-compose.yml, dan .env dengan port host 8080 untuk Laravel, 5175 untuk Vite React, dan 3306 untuk MySQL. Jalankan docker compose up -d --build khusus proyek cleanwash, lalu tampilkan git status.
```

### D. Tahap 3 — Setup 11 Migration, Model Eloquent & Seeder Awal
```text
EKSEKUSI: Baca @SKEMA_DATABASE_CLEANWASH.md dan @SPESIFIKASI_FITUR_CLEANWASH.md. Buatkan seluruh 11 file migration, model Eloquent (lengkap dengan properti $table, $fillable, $casts, dan relasi antar-model), serta seeder untuk akun awal 3 role petugas (Kasir, Produksi, Antar) dan master jenis_layanan. Jalankan php artisan migrate:fresh --seed di dalam kontainer cleanwash dan laporkan hasilnya.
```

### E. Tahap 4 — Sistem Autentikasi & Middleware 3 Role
```text
EKSEKUSI: Baca @SPESIFIKASI_FITUR_CLEANWASH.md. Konfigurasikan autentikasi Laravel Breeze agar menggunakan tabel petugas dan model Petugas. Buat middleware pemisah hak akses untuk peran Kasir, Produksi, dan Antar sehingga masing-masing diarahkan ke dashboard kerjanya setelah login.
```

### F. Perintah Commit Bertahap (Setiap Satu Tahap Selesai)
```text
EKSEKUSI: Periksa git status untuk memastikan tidak ada file sensitif (.env) atau folder berat (vendor, node_modules) yang ikut ter-track, lalu jalankan git add . dan git commit dengan pesan "[isi pesan commit sesuai tahap]".
```