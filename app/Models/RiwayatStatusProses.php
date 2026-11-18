<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatStatusProses extends Model
{
    use HasFactory;

    protected $table = 'riwayat_status_proses';

    protected $fillable = [
        'transaksi_laundry_id',
        'petugas_id',
        'tahap',
        'waktu_update',
    ];

    protected function casts(): array
    {
        return [
            'waktu_update' => 'datetime',
        ];
    }

    public function transaksiLaundry(): BelongsTo
    {
        return $this->belongsTo(TransaksiLaundry::class, 'transaksi_laundry_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Petugas::class, 'petugas_id');
    }
}
