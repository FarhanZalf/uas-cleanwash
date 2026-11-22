<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->peran === 'Kasir';
    }

    public function rules(): array
    {
        $voucherId = $this->route('voucher')?->id ?? $this->route('voucher');

        return [
            'nomor_voucher' => [
                'required',
                'string',
                'max:30',
                Rule::unique('voucher', 'nomor_voucher')->ignore($voucherId),
            ],
            'nilai_potongan' => ['required', 'numeric', 'min:500'],
            'masa_berlaku' => ['required', 'date'],
            'status_terpakai' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nomor_voucher.required' => 'Nomor kode voucher wajib diisi.',
            'nomor_voucher.unique' => 'Nomor kode voucher sudah ada.',
            'nilai_potongan.required' => 'Nilai potongan Rupiah wajib diisi.',
            'nilai_potongan.min' => 'Nilai potongan minimal Rp 500.',
            'masa_berlaku.required' => 'Batas masa berlaku voucher wajib diisi.',
            'masa_berlaku.date' => 'Format tanggal masa berlaku tidak valid.',
        ];
    }
}
