<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DetailPakaian extends Model
{
    use HasFactory;

    protected $table = 'detail_pakaian';

    protected $fillable = [
        'transaksi_laundry_id',
        'jenis_layanan_id',
        'daftar_pakaian',
        'berat_atau_jumlah',
        'harga_saat_transaksi',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'berat_atau_jumlah' => 'decimal:2',
            'harga_saat_transaksi' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function transaksiLaundry(): BelongsTo
    {
        return $this->belongsTo(TransaksiLaundry::class, 'transaksi_laundry_id');
    }

    public function jenisLayanan(): BelongsTo
    {
        return $this->belongsTo(JenisLayanan::class, 'jenis_layanan_id');
    }

    public function laporanKerusakan(): HasMany
    {
        return $this->hasMany(LaporanKerusakan::class, 'detail_pakaian_id');
    }
}
