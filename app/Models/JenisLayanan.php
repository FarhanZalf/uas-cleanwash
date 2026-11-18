<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisLayanan extends Model
{
    use HasFactory;

    protected $table = 'jenis_layanan';

    protected $fillable = [
        'kode_layanan',
        'nama_layanan',
        'kecepatan',
        'satuan_hitung',
        'tahapan_proses',
        'harga_satuan',
    ];

    protected function casts(): array
    {
        return [
            'tahapan_proses' => 'array',
            'harga_satuan' => 'decimal:2',
        ];
    }

    public function detailPakaian(): HasMany
    {
        return $this->hasMany(DetailPakaian::class, 'jenis_layanan_id');
    }
}
