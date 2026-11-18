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
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaksi_laundry_id')->constrained('transaksi_laundry');
            $table->foreignId('petugas_id')->constrained('petugas');
            $table->enum('jenis', ['UangMuka', 'Pelunasan']);
            $table->decimal('nominal', 12, 2);
            $table->dateTime('tanggal_bayar');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
