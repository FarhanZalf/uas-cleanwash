<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pelanggan extends Model
{
    use HasFactory;

    protected $table = 'pelanggan';

    protected $fillable = [
        'kode_pelanggan',
        'nama',
        'no_telepon',
        'alamat',
        'hak_bayar_belakangan',
    ];

    protected function casts(): array
    {
        return [
            'hak_bayar_belakangan' => 'boolean',
        ];
    }

    public function transaksiLaundry(): HasMany
    {
        return $this->hasMany(TransaksiLaundry::class, 'pelanggan_id');
    }
}
