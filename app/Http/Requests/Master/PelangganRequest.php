<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PelangganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->peran === 'Kasir';
    }

    public function rules(): array
    {
        $pelangganId = $this->route('pelanggan')?->id ?? $this->route('pelanggan');

        return [
            'kode_pelanggan' => [
                'required',
                'string',
                'max:20',
                Rule::unique('pelanggan', 'kode_pelanggan')->ignore($pelangganId),
            ],
            'nama' => ['required', 'string', 'max:100'],
            'no_telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'hak_bayar_belakangan' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_pelanggan.required' => 'Kode pelanggan wajib diisi.',
            'kode_pelanggan.unique' => 'Kode pelanggan sudah terdaftar di sistem.',
            'nama.required' => 'Nama lengkap pelanggan wajib diisi.',
            'no_telepon.required' => 'Nomor WhatsApp / telepon wajib diisi.',
        ];
    }
}
