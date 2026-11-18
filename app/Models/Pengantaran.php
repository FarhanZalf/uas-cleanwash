<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengantaran extends Model
{
    use HasFactory;

    protected $table = 'pengantaran';

    protected $fillable = [
        'kode_pengantaran',
        'petugas_id',
        'tanggal_antar',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_antar' => 'date',
        ];
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Petugas::class, 'petugas_id');
    }

    public function detailPengantaran(): HasMany
    {
        return $this->hasMany(DetailPengantaran::class, 'pengantaran_id');
    }
}
