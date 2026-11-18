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
        Schema::create('detail_pengantaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengantaran_id')->constrained('pengantaran')->cascadeOnDelete();
            $table->foreignId('transaksi_laundry_id')->constrained('transaksi_laundry');
            $table->enum('status_antar', ['Menunggu', 'Diambil', 'DalamPerjalanan', 'Diterima', 'Gagal'])->default('Menunggu');
            $table->text('alasan_gagal')->nullable();
            $table->date('jadwal_ulang')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_pengantaran');
    }
};
