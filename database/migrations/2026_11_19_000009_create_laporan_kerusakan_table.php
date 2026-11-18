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
        Schema::create('laporan_kerusakan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detail_pakaian_id')->constrained('detail_pakaian');
            $table->foreignId('petugas_id')->constrained('petugas');
            $table->enum('jenis_insiden', ['Rusak', 'Hilang']);
            $table->string('jenis_pakaian', 100);
            $table->text('keterangan');
            $table->decimal('nilai_kompensasi', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_kerusakan');
    }
};
