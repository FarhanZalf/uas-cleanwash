<?php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;

class PembatalanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Kasir';
    }

    public function rules(): array
    {
        return [
            'alasan_batal' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'alasan_batal.required' => 'Alasan pembatalan wajib diisi.',
            'alasan_batal.min' => 'Alasan pembatalan minimal 5 karakter.',
        ];
    }
}
