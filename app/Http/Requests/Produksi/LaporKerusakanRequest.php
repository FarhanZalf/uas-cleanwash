<?php

namespace App\Http\Requests\Produksi;

use Illuminate\Foundation\Http\FormRequest;

class LaporKerusakanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->peran === 'Produksi';
    }

    public function rules(): array
    {
        return [
            'detail_pakaian_id' => ['required', 'integer', 'exists:detail_pakaian,id'],
            'jenis_insiden' => ['required', 'in:Rusak,Hilang'],
            'jenis_pakaian' => ['required', 'string', 'max:100'],
            'keterangan' => ['required', 'string', 'max:1000'],
            'nilai_kompensasi' => ['required', 'numeric', 'min:0', 'max:10000000'],
        ];
    }

    public function messages(): array
    {
        return [
            'detail_pakaian_id.required' => 'Pilih item pakaian yang mengalami kendala.',
            'jenis_insiden.required' => 'Tentukan jenis insiden (Rusak atau Hilang).',
            'jenis_pakaian.required' => 'Tuliskan jenis spesifik pakaian yang bermasalah.',
            'keterangan.required' => 'Tuliskan keterangan atau kronologi kejadian.',
            'nilai_kompensasi.required' => 'Isi nominal nilai kompensasi ganti rugi.',
            'nilai_kompensasi.min' => 'Nilai kompensasi minimal Rp 0.',
        ];
    }
}
