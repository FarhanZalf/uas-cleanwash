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

    /**
     * Mengambil urutan tahapan yang berlaku untuk transaksi ini berdasarkan
     * gabungan JSON tahapan_proses seluruh item pakaian di dalamnya.
     */
    public function tahapanBerlaku(): array
    {
        $semuaTahapan = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'];

        $tahapanDibutuhkan = $this->detailPakaian
            ->flatMap(fn ($item) => $item->jenisLayanan?->tahapan_proses ?? [])
            ->unique()
            ->all();

        if (empty($tahapanDibutuhkan)) {
            return $semuaTahapan;
        }

        // Tetap menjaga urutan standar proses laundry
        return array_values(array_filter(
            $semuaTahapan,
            fn ($tahap) => in_array($tahap, $tahapanDibutuhkan, true)
        ));
    }

    /**
     * Menentukan tahap berikutnya yang sah sesuai alur tahapan dinamis.
     */
    public function tahapBerikutnya(): ?string
    {
        $tahapan = $this->tahapanBerlaku();
        $posisiSekarang = array_search($this->status_proses_terkini, $tahapan, true);

        if ($posisiSekarang === false || $posisiSekarang >= count($tahapan) - 1) {
            return null;
        }

        return $tahapan[$posisiSekarang + 1];
    }

    public function persentaseBiayaBatal(): ?int
    {
        return match ($this->status_proses_terkini) {
            'Diterima' => 0,
            'Dicuci' => 50,
            'Dikeringkan' => 75,
            default => null,
        };
    }

    /**
     * Menghitung ulang sisa tagihan berdasarkan rumus deterministik:
     * sisa_tagihan = total_harga - potongan_voucher - total_kompensasi - total_pembayaran
     */
    public function hitungUlangTagihan(): void
    {
        $totalBayar = (float) $this->pembayaran()->sum('nominal');
        $potonganVoucher = $this->potonganVoucher();
        $totalKompensasi = (float) $this->total_kompensasi;
        $totalHarga = (float) $this->total_harga;

        $sisa = round($totalHarga - $potonganVoucher - $totalKompensasi - $totalBayar, 2);
        $this->sisa_tagihan = max($sisa, 0);

        if ($this->sisa_tagihan <= 0 && in_array($this->status_bayar, ['Belum', 'DP'], true)) {
            $this->status_bayar = 'Lunas';
        }

        $this->save();
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
