<?php

namespace App\Http\Requests\Antar;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusAntarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Antar';
    }

    public function rules(): array
    {
        return [
            'status_antar' => ['required', 'string', 'in:Menunggu,Diambil,DalamPerjalanan,Diterima,Gagal'],
            'alasan_gagal' => ['required_if:status_antar,Gagal', 'nullable', 'string', 'max:500'],
            'jadwal_ulang' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'status_antar.required' => 'Status pengantaran wajib ditentukan.',
            'status_antar.in' => 'Status pengantaran tidak sah.',
            'alasan_gagal.required_if' => 'Alasan kegagalan pengantaran wajib diisi jika status Gagal.',
            'jadwal_ulang.after_or_equal' => 'Tanggal jadwal ulang tidak boleh di masa lampau.',
        ];
    }
}
