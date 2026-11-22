<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JenisLayananRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->peran === 'Kasir';
    }

    public function rules(): array
    {
        $layananId = $this->route('jenis_layanan')?->id ?? $this->route('jenis_layanan');

        return [
            'kode_layanan' => [
                'required',
                'string',
                'max:20',
                Rule::unique('jenis_layanan', 'kode_layanan')->ignore($layananId),
            ],
            'nama_layanan' => ['required', 'string', 'max:100'],
            'kecepatan' => ['required', Rule::in(['Reguler', 'Express'])],
            'satuan_hitung' => ['required', Rule::in(['Berat_Kg', 'Jumlah_Pcs'])],
            'tahapan_proses' => ['required', 'array', 'min:2'],
            'tahapan_proses.*' => ['required', Rule::in(['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'])],
            'harga_satuan' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_layanan.required' => 'Kode layanan wajib diisi.',
            'kode_layanan.unique' => 'Kode layanan sudah digunakan.',
            'nama_layanan.required' => 'Nama layanan wajib diisi.',
            'kecepatan.required' => 'Pilih kecepatan pengerjaan.',
            'satuan_hitung.required' => 'Pilih satuan hitung (Kg atau Pcs).',
            'tahapan_proses.required' => 'Tahapan proses wajib ditentukan minimal 2 tahap.',
            'harga_satuan.required' => 'Harga satuan tarif wajib diisi.',
            'harga_satuan.numeric' => 'Harga satuan harus berupa angka nominal valid.',
        ];
    }
}
