<?php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PengantaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Kasir';
    }

    public function rules(): array
    {
        return [
            'petugas_id' => [
                'required',
                'integer',
                Rule::exists('petugas', 'id')->where(fn ($q) => $q->where('peran', 'Antar')),
            ],
            'tanggal_antar' => ['required', 'date', 'after_or_equal:today'],
            'transaksi_ids' => ['required', 'array', 'min:1'],
            'transaksi_ids.*' => [
                'required',
                'integer',
                Rule::exists('transaksi_laundry', 'id')->where(fn ($q) => $q->where('status_proses_terkini', 'Selesai')->where('status_transaksi', 'Aktif')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'petugas_id.required' => 'Pilih kurir (petugas antar) terlebih dahulu.',
            'petugas_id.exists' => 'Kurir yang dipilih tidak valid atau bukan bertugas sebagai Antar.',
            'tanggal_antar.required' => 'Tanggal pengantaran wajib diisi.',
            'tanggal_antar.after_or_equal' => 'Tanggal pengantaran tidak boleh di masa lampau.',
            'transaksi_ids.required' => 'Pilih minimal satu nota transaksi yang siap diantar.',
            'transaksi_ids.min' => 'Pilih minimal satu nota transaksi yang siap diantar.',
            'transaksi_ids.*.exists' => 'Nota yang dipilih harus berstatus Selesai di bagian produksi dan masih Aktif.',
        ];
    }
}
