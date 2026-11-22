<?php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;

class PelunasanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Kasir';
    }

    public function rules(): array
    {
        return [
            'jenis_aksi' => ['required', 'string', 'in:pelunasan,tempo,serah_terima'],
            'nominal' => ['nullable', 'numeric', 'gte:0', 'required_if:jenis_aksi,pelunasan'],
            'metode_pembayaran' => ['nullable', 'string', 'in:Tunai,QRIS,Transfer', 'required_if:jenis_aksi,pelunasan'],
            'catatan' => ['nullable', 'string', 'max:500'],
            'serahkan_cucian' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis_aksi.required' => 'Jenis aksi wajib ditentukan.',
            'nominal.required_if' => 'Nominal pelunasan wajib diisi.',
            'nominal.gte' => 'Nominal pelunasan tidak boleh negatif.',
            'metode_pembayaran.required_if' => 'Metode pembayaran wajib dipilih.',
        ];
    }
}
