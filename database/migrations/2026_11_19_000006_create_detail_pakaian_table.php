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
        Schema::create('detail_pakaian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaksi_laundry_id')->constrained('transaksi_laundry')->cascadeOnDelete();
            $table->foreignId('jenis_layanan_id')->constrained('jenis_layanan');
            $table->text('daftar_pakaian');
            $table->decimal('berat_atau_jumlah', 8, 2);
            $table->decimal('harga_saat_transaksi', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_pakaian');
    }
};
