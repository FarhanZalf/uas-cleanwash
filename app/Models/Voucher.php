<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'voucher';

    protected $fillable = [
        'nomor_voucher',
        'nilai_potongan',
        'masa_berlaku',
        'status_terpakai',
    ];

    protected function casts(): array
    {
        return [
            'nilai_potongan' => 'decimal:2',
            'masa_berlaku' => 'date',
            'status_terpakai' => 'boolean',
        ];
    }

    public static function alasanTidakBerlaku(?self $voucher): ?string
    {
        if (! $voucher) {
            return 'Kode voucher tidak ditemukan.';
        }

        if ($voucher->status_terpakai) {
            return 'Voucher ini sudah dipakai di nota lain.';
        }

        if ($voucher->masa_berlaku->lt(today())) {
            return 'Voucher kedaluwarsa sejak ' . $voucher->masa_berlaku->format('d/m/Y') . '.';
        }

        return null;
    }

    public function transaksiLaundry(): HasOne
    {
        return $this->hasOne(TransaksiLaundry::class, 'voucher_id');
    }
}
