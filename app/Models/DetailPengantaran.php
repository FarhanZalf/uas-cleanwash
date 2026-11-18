<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPengantaran extends Model
{
    use HasFactory;

    protected $table = 'detail_pengantaran';

    protected $fillable = [
        'pengantaran_id',
        'transaksi_laundry_id',
        'status_antar',
        'alasan_gagal',
        'jadwal_ulang',
    ];

    protected function casts(): array
    {
        return [
            'jadwal_ulang' => 'date',
        ];
    }

    public function pengantaran(): BelongsTo
    {
        return $this->belongsTo(Pengantaran::class, 'pengantaran_id');
    }

    public function transaksiLaundry(): BelongsTo
    {
        return $this->belongsTo(TransaksiLaundry::class, 'transaksi_laundry_id');
    }
}
