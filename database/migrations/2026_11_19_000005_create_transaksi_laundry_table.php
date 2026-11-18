<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksi_laundry', function (Blueprint $table) {
            $table->id();
            $table->string('no_nota', 30)->unique();
            $table->foreignId('pelanggan_id')->constrained('pelanggan');
            $table->foreignId('petugas_id')->constrained('petugas');
            $table->foreignId('voucher_id')->nullable()->unique()->constrained('voucher');
            $table->dateTime('tanggal_terima');
            $table->text('catatan_khusus')->nullable();
            $table->decimal('total_harga', 12, 2)->default(0);
            $table->decimal('total_kompensasi', 12, 2)->default(0);
            $table->decimal('sisa_tagihan', 12, 2)->default(0);
            $table->enum('status_proses_terkini', ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'])->default('Diterima');
            $table->enum('status_bayar', ['Belum', 'DP', 'Lunas', 'Tempo'])->default('Belum');
            $table->enum('status_transaksi', ['Aktif', 'Selesai', 'Batal'])->default('Aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_laundry');
    }
};
