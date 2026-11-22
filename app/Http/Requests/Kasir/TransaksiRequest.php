<?php

namespace App\Http\Requests\Kasir;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransaksiRequest extends FormRequest
{
    public const METODE_BAYAR = ['Belum', 'UangMuka', 'Lunas', 'Tempo'];

    public function authorize(): bool
    {
        return $this->user()?->peran === 'Kasir';
    }

    protected function prepareForValidation(): void
    {
        $kode = trim((string) $this->input('nomor_voucher', ''));

        $this->merge([
            'nomor_voucher' => $kode === '' ? null : $kode,
        ]);
    }

    public function rules(): array
    {
        return [
            'pelanggan_id' => ['required', 'integer', 'exists:pelanggan,id'],
            'catatan_khusus' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1', 'max:20'],
            'items.*.jenis_layanan_id' => ['required', 'integer', 'exists:jenis_layanan,id'],
            'items.*.daftar_pakaian' => ['required', 'string', 'max:500'],
            'items.*.berat_atau_jumlah' => ['required', 'numeric', 'min:0.1', 'max:999'],
            'nomor_voucher' => ['nullable', 'string', 'max:30'],
            'metode_bayar' => ['required', Rule::in(self::METODE_BAYAR)],
            'nominal_bayar' => ['nullable', 'required_if:metode_bayar,UangMuka', 'numeric', 'min:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'pelanggan_id.required' => 'Pilih pelanggan terlebih dahulu.',
            'items.required' => 'Tambahkan minimal satu item cucian.',
            'items.min' => 'Tambahkan minimal satu item cucian.',
            'items.*.jenis_layanan_id.required' => 'Pilih jenis layanan.',
            'items.*.daftar_pakaian.required' => 'Tulis rincian pakaian, misalnya 3 kemeja, 2 celana.',
            'items.*.berat_atau_jumlah.required' => 'Isi berat atau jumlah.',
            'items.*.berat_atau_jumlah.min' => 'Minimal 0,1.',
            'metode_bayar.required' => 'Pilih cara pembayaran.',
            'nominal_bayar.required_if' => 'Isi nominal uang muka.',
            'nominal_bayar.min' => 'Uang muka minimal Rp 1.000.',
        ];
    }
}
