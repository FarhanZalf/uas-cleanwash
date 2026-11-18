<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Petugas extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'petugas';

    protected $fillable = [
        'kode_petugas',
        'nama_petugas',
        'email',
        'password',
        'peran',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function isKasir(): bool
    {
        return $this->peran === 'Kasir';
    }

    public function isProduksi(): bool
    {
        return $this->peran === 'Produksi';
    }

    public function isAntar(): bool
    {
        return $this->peran === 'Antar';
    }

    public function transaksiLaundry(): HasMany
    {
        return $this->hasMany(TransaksiLaundry::class, 'petugas_id');
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'petugas_id');
    }

    public function riwayatStatusProses(): HasMany
    {
        return $this->hasMany(RiwayatStatusProses::class, 'petugas_id');
    }

    public function laporanKerusakan(): HasMany
    {
        return $this->hasMany(LaporanKerusakan::class, 'petugas_id');
    }

    public function pengantaran(): HasMany
    {
        return $this->hasMany(Pengantaran::class, 'petugas_id');
    }
}
