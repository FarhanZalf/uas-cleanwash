<?php

namespace App\Http\Requests\Produksi;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTahapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Produksi';
    }

    public function rules(): array
    {
        return [
            'tahap_tujuan' => ['required', 'string', 'in:Diterima,Dicuci,Dikeringkan,Disetrika,Selesai'],
        ];
    }

    public function messages(): array
    {
        return [
            'tahap_tujuan.required' => 'Tahap proses tujuan wajib ditentukan.',
            'tahap_tujuan.in' => 'Tahap proses tidak valid.',
        ];
    }
}
