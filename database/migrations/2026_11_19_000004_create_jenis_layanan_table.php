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
        Schema::create('jenis_layanan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_layanan', 20)->unique();
            $table->string('nama_layanan', 100);
            $table->enum('kecepatan', ['Reguler', 'Express'])->default('Reguler');
            $table->enum('satuan_hitung', ['Berat_Kg', 'Jumlah_Pcs']);
            $table->json('tahapan_proses');
            $table->decimal('harga_satuan', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_layanan');
    }
};
