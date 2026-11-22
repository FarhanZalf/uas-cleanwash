<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class PetugasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->peran === 'Kasir';
    }

    public function rules(): array
    {
        $petugasId = $this->route('petugas')?->id ?? $this->route('petugas');
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'kode_petugas' => [
                'required',
                'string',
                'max:20',
                Rule::unique('petugas', 'kode_petugas')->ignore($petugasId),
            ],
            'nama_petugas' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:100',
                Rule::unique('petugas', 'email')->ignore($petugasId),
            ],
            'password' => [
                $isUpdate ? 'nullable' : 'required',
                'string',
                Password::default()->min(6),
            ],
            'peran' => ['required', Rule::in(['Kasir', 'Produksi', 'Antar'])],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_petugas.required' => 'Kode petugas unik wajib diisi.',
            'kode_petugas.unique' => 'Kode petugas sudah terpakai.',
            'nama_petugas.required' => 'Nama lengkap petugas wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar untuk petugas lain.',
            'password.required' => 'Kata sandi wajib diisi untuk akun baru.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'peran.required' => 'Pilih peran tugas (Kasir, Produksi, atau Antar).',
        ];
    }
}
