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

    public function transaksiLaundry(): HasOne
    {
        return $this->hasOne(TransaksiLaundry::class, 'voucher_id');
    }
}
