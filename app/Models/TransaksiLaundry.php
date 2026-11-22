<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransaksiLaundry extends Model
{
    use HasFactory;

    protected $table = 'transaksi_laundry';

    protected $fillable = [
        'no_nota',
        'pelanggan_id',
        'petugas_id',
        'voucher_id',
        'tanggal_terima',
        'catatan_khusus',
        'total_harga',
        'total_kompensasi',
        'sisa_tagihan',
        'status_proses_terkini',
        'status_bayar',
        'status_transaksi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terima' => 'datetime',
            'total_harga' => 'decimal:2',
            'total_kompensasi' => 'decimal:2',
            'sisa_tagihan' => 'decimal:2',
        ];
    }

    // Skema tidak menyimpan kolom potongan; nilainya diturunkan dari voucher dan dibatasi total harga.
    public function potonganVoucher(): float
    {
        if (! $this->voucher) {
            return 0.0;
        }

        return min((float) $this->voucher->nilai_potongan, (float) $this->total_harga);
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Petugas::class, 'petugas_id');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
    }

    public function detailPakaian(): HasMany
    {
        return $this->hasMany(DetailPakaian::class, 'transaksi_laundry_id');
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'transaksi_laundry_id');
    }

    public function riwayatStatusProses(): HasMany
    {
        return $this->hasMany(RiwayatStatusProses::class, 'transaksi_laundry_id');
    }

    public function detailPengantaran(): HasMany
    {
        return $this->hasMany(DetailPengantaran::class, 'transaksi_laundry_id');
    }
}
