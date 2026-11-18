<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanKerusakan extends Model
{
    use HasFactory;

    protected $table = 'laporan_kerusakan';

    protected $fillable = [
        'detail_pakaian_id',
        'petugas_id',
        'jenis_insiden',
        'jenis_pakaian',
        'keterangan',
        'nilai_kompensasi',
    ];

    protected function casts(): array
    {
        return [
            'nilai_kompensasi' => 'decimal:2',
        ];
    }

    public function detailPakaian(): BelongsTo
    {
        return $this->belongsTo(DetailPakaian::class, 'detail_pakaian_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Petugas::class, 'petugas_id');
    }
}
