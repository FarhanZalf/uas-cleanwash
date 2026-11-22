<?php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;

class PenyesuaianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Kasir';
    }

    public function rules(): array
    {
        return [
            'catatan' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:detail_pakaian,id'],
            'items.*.berat_atau_jumlah' => ['required', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Rincian item pakaian harus tersedia.',
            'items.*.berat_atau_jumlah.required' => 'Berat atau jumlah pakaian wajib diisi.',
            'items.*.berat_atau_jumlah.gt' => 'Berat atau jumlah pakaian harus lebih besar dari 0.',
        ];
    }
}
