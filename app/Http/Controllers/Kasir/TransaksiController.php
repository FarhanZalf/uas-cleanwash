<?php

namespace App\Http\Controllers\Kasir;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kasir\PelunasanRequest;
use App\Http\Requests\Kasir\PembatalanRequest;
use App\Http\Requests\Kasir\PenyesuaianRequest;
use App\Http\Requests\Kasir\TransaksiRequest;
use App\Models\DetailPakaian;
use App\Models\JenisLayanan;
use App\Models\Pelanggan;
use App\Models\Pembayaran;
use App\Models\RiwayatStatusProses;
use App\Models\TransaksiLaundry;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    private const STATUS_TRANSAKSI = ['Aktif', 'Selesai', 'Batal'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');

        $transaksi = TransaksiLaundry::query()
            ->with('pelanggan:id,kode_pelanggan,nama,no_telepon')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('no_nota', 'like', "%{$search}%")
                        ->orWhereHas('pelanggan', function ($p) use ($search) {
                            $p->where('nama', 'like', "%{$search}%")
                                ->orWhere('no_telepon', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, self::STATUS_TRANSAKSI, true), fn ($query) => $query->where('status_transaksi', $status))
            ->latest('tanggal_terima')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Kasir/Transaksi/Index', [
            'transaksi' => $transaksi,
            'filters' => [
                'search' => $search,
                'status' => in_array($status, self::STATUS_TRANSAKSI, true) ? $status : '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Kasir/Transaksi/Create', [
            'pelanggan' => Pelanggan::orderBy('nama')
                ->get(['id', 'kode_pelanggan', 'nama', 'no_telepon', 'alamat', 'hak_bayar_belakangan']),
            'jenisLayanan' => JenisLayanan::orderBy('nama_layanan')
                ->get(['id', 'kode_layanan', 'nama_layanan', 'kecepatan', 'satuan_hitung', 'harga_satuan']),
        ]);
    }

    public function store(TransaksiRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $pelanggan = Pelanggan::findOrFail($data['pelanggan_id']);

        if ($data['metode_bayar'] === 'Tempo' && ! $pelanggan->hak_bayar_belakangan) {
            throw ValidationException::withMessages([
                'metode_bayar' => 'Pelanggan ini belum diizinkan bayar tempo. Aktifkan izinnya di menu Pelanggan.',
            ]);
        }

        $layananMap = JenisLayanan::whereIn('id', collect($data['items'])->pluck('jenis_layanan_id'))
            ->get()
            ->keyBy('id');

        $rincian = [];
        $totalHarga = 0.0;

        foreach ($data['items'] as $index => $item) {
            $layanan = $layananMap[$item['jenis_layanan_id']];
            $jumlah = round((float) $item['berat_atau_jumlah'], 2);

            if ($layanan->satuan_hitung === 'Jumlah_Pcs' && floor($jumlah) != $jumlah) {
                throw ValidationException::withMessages([
                    "items.{$index}.berat_atau_jumlah" => 'Layanan per pcs harus diisi bilangan bulat.',
                ]);
            }

            // Harga dikunci dari master saat nota dibuat; perubahan tarif berikutnya tidak memengaruhi nota ini.
            $harga = (float) $layanan->harga_satuan;
            $subtotal = round($jumlah * $harga, 2);
            $totalHarga += $subtotal;

            $rincian[] = [
                'jenis_layanan_id' => $layanan->id,
                'daftar_pakaian' => $item['daftar_pakaian'],
                'berat_atau_jumlah' => $jumlah,
                'harga_saat_transaksi' => $harga,
                'subtotal' => $subtotal,
            ];
        }

        $totalHarga = round($totalHarga, 2);
        $petugasId = $request->user()->id;

        $transaksi = DB::transaction(function () use ($data, $pelanggan, $rincian, $totalHarga, $petugasId) {
            $voucher = null;
            $potongan = 0.0;

            if ($data['nomor_voucher']) {
                $voucher = Voucher::where('nomor_voucher', $data['nomor_voucher'])->lockForUpdate()->first();
                $alasan = Voucher::alasanTidakBerlaku($voucher);

                if ($alasan) {
                    throw ValidationException::withMessages(['nomor_voucher' => $alasan]);
                }

                $potongan = min((float) $voucher->nilai_potongan, $totalHarga);
            }

            $tagihanAwal = round($totalHarga - $potongan, 2);

            [$jenisBayar, $nominal] = match ($data['metode_bayar']) {
                'Lunas' => ['Pelunasan', $tagihanAwal],
                'UangMuka' => ['UangMuka', round((float) $data['nominal_bayar'], 2)],
                default => [null, 0.0],
            };

            if ($data['metode_bayar'] === 'UangMuka' && $nominal >= $tagihanAwal) {
                throw ValidationException::withMessages([
                    'nominal_bayar' => 'Uang muka harus lebih kecil dari tagihan. Pilih "Lunas sekarang" bila dibayar penuh.',
                ]);
            }

            $sisa = round($tagihanAwal - $nominal, 2);
            $statusBayar = $sisa <= 0 ? 'Lunas' : match ($data['metode_bayar']) {
                'UangMuka' => 'DP',
                'Tempo' => 'Tempo',
                default => 'Belum',
            };

            $sekarang = now();

            $transaksi = TransaksiLaundry::create([
                'no_nota' => $this->nomorNotaBerikutnya(),
                'pelanggan_id' => $pelanggan->id,
                'petugas_id' => $petugasId,
                'voucher_id' => $voucher?->id,
                'tanggal_terima' => $sekarang,
                'catatan_khusus' => $data['catatan_khusus'] ?? null,
                'total_harga' => $totalHarga,
                'total_kompensasi' => 0,
                'sisa_tagihan' => max($sisa, 0),
                'status_proses_terkini' => 'Diterima',
                'status_bayar' => $statusBayar,
                'status_transaksi' => 'Aktif',
            ]);

            $transaksi->detailPakaian()->createMany($rincian);

            $transaksi->riwayatStatusProses()->create([
                'petugas_id' => $petugasId,
                'tahap' => 'Diterima',
                'waktu_update' => $sekarang,
            ]);

            if ($jenisBayar && $nominal > 0) {
                $transaksi->pembayaran()->create([
                    'petugas_id' => $petugasId,
                    'jenis' => $jenisBayar,
                    'nominal' => $nominal,
                    'tanggal_bayar' => $sekarang,
                ]);
            }

            $voucher?->update(['status_terpakai' => true]);

            return $transaksi;
        });

        return redirect()->route('kasir.transaksi.show', $transaksi)
            ->with('success', "Nota {$transaksi->no_nota} tersimpan dan masuk antrean produksi.");
    }

    public function show(TransaksiLaundry $transaksi): Response
    {
        return Inertia::render('Kasir/Transaksi/Show', $this->dataNota($transaksi));
    }

    public function cetak(Request $request, TransaksiLaundry $transaksi): Response
    {
        $format = $request->input('format') === 'a5' ? 'a5' : 'thermal';

        return Inertia::render('Kasir/Transaksi/Cetak', [
            ...$this->dataNota($transaksi),
            'format' => $format,
        ]);
    }

    public function cekVoucher(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nomor_voucher' => ['required', 'string', 'max:30'],
        ], [
            'nomor_voucher.required' => 'Isi kode voucher terlebih dahulu.',
        ]);

        $voucher = Voucher::where('nomor_voucher', trim($data['nomor_voucher']))->first();
        $alasan = Voucher::alasanTidakBerlaku($voucher);

        return response()->json([
            'valid' => $alasan === null,
            'pesan' => $alasan ?? 'Voucher berlaku.',
            'voucher' => $alasan ? null : [
                'nomor_voucher' => $voucher->nomor_voucher,
                'nilai_potongan' => (float) $voucher->nilai_potongan,
                'masa_berlaku' => $voucher->masa_berlaku->toDateString(),
            ],
        ]);
    }

    public function pelangganCepat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'no_telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'hak_bayar_belakangan' => ['boolean'],
        ], [
            'nama.required' => 'Nama pelanggan wajib diisi.',
            'no_telepon.required' => 'Nomor WhatsApp / telepon wajib diisi.',
        ]);

        $pelanggan = Pelanggan::create([
            'kode_pelanggan' => $this->kodePelangganBerikutnya(),
            'nama' => $data['nama'],
            'no_telepon' => $data['no_telepon'],
            'alamat' => $data['alamat'] ?? null,
            'hak_bayar_belakangan' => $data['hak_bayar_belakangan'] ?? false,
        ]);

        return response()->json([
            'pelanggan' => $pelanggan->only(['id', 'kode_pelanggan', 'nama', 'no_telepon', 'alamat', 'hak_bayar_belakangan']),
        ], 201);
    }

    public function penyesuaian(PenyesuaianRequest $request, TransaksiLaundry $transaksi): RedirectResponse
    {
        if ($transaksi->status_transaksi !== 'Aktif') {
            throw ValidationException::withMessages([
                'items' => 'Penyesuaian hanya dapat dilakukan pada transaksi berstatus Aktif.',
            ]);
        }

        if ($transaksi->status_proses_terkini !== 'Diterima') {
            throw ValidationException::withMessages([
                'items' => 'Timbang ulang hanya dapat dilakukan saat cucian masih berada di tahap Diterima.',
            ]);
        }

        $data = $request->validated();

        DB::transaction(function () use ($transaksi, $data) {
            foreach ($data['items'] as $itemData) {
                $detail = DetailPakaian::where('id', $itemData['id'])
                    ->where('transaksi_laundry_id', $transaksi->id)
                    ->firstOrFail();

                $jumlah = (float) $itemData['berat_atau_jumlah'];
                $subtotal = round($jumlah * (float) $detail->harga_saat_transaksi, 2);

                $detail->update([
                    'berat_atau_jumlah' => $jumlah,
                    'subtotal' => $subtotal,
                ]);
            }

            $totalHargaBaru = (float) $transaksi->detailPakaian()->sum('subtotal');
            $transaksi->update(['total_harga' => $totalHargaBaru]);
            $transaksi->hitungUlangTagihan();

            RiwayatStatusProses::create([
                'transaksi_laundry_id' => $transaksi->id,
                'petugas_id' => auth()->id(),
                'tahap' => $transaksi->status_proses_terkini,
                'waktu_update' => now(),
                'catatan' => 'Penyesuaian timbang ulang oleh kasir: ' . ($data['catatan'] ?? 'Pembaruan kuantitas/berat cucian.'),
            ]);
        });

        return redirect()->route('kasir.transaksi.show', $transaksi)
            ->with('success', 'Penyesuaian timbang ulang pakaian berhasil disimpan.');
    }

    public function batalkan(PembatalanRequest $request, TransaksiLaundry $transaksi): RedirectResponse
    {
        if ($transaksi->status_transaksi !== 'Aktif') {
            throw ValidationException::withMessages([
                'alasan_batal' => 'Hanya transaksi berstatus Aktif yang dapat dibatalkan.',
            ]);
        }

        $persenBiaya = $transaksi->persentaseBiayaBatal();

        if ($persenBiaya === null) {
            throw ValidationException::withMessages([
                'alasan_batal' => 'Pesanan telah diproses ke tahap lanjut (' . $transaksi->status_proses_terkini . ') dan tidak dapat dibatalkan.',
            ]);
        }

        $data = $request->validated();

        DB::transaction(function () use ($transaksi, $data, $persenBiaya) {
            $biayaBatal = round(((float) $transaksi->total_harga * $persenBiaya) / 100, 2);

            $transaksi->update([
                'status_transaksi' => 'Batal',
            ]);

            if ($transaksi->voucher_id && $transaksi->voucher) {
                $transaksi->voucher->update(['status_terpakai' => false]);
            }

            RiwayatStatusProses::create([
                'transaksi_laundry_id' => $transaksi->id,
                'petugas_id' => auth()->id(),
                'tahap' => $transaksi->status_proses_terkini,
                'waktu_update' => now(),
                'catatan' => sprintf(
                    'Pesanan dibatalkan. Alasan: %s. Biaya pembatalan proporsional (%d%%): Rp %s.',
                    $data['alasan_batal'],
                    $persenBiaya,
                    number_format($biayaBatal, 0, ',', '.')
                ),
            ]);
        });

        return redirect()->route('kasir.transaksi.show', $transaksi)
            ->with('success', 'Transaksi berhasil dibatalkan.');
    }

    public function pelunasan(PelunasanRequest $request, TransaksiLaundry $transaksi): RedirectResponse
    {
        if ($transaksi->status_transaksi === 'Batal') {
            throw ValidationException::withMessages([
                'jenis_aksi' => 'Pelunasan tidak dapat dilakukan pada transaksi yang sudah dibatalkan.',
            ]);
        }

        $data = $request->validated();
        $pelanggan = $transaksi->pelanggan;

        DB::transaction(function () use ($transaksi, $pelanggan, $data) {
            if ($data['jenis_aksi'] === 'pelunasan') {
                $nominal = (float) ($data['nominal'] ?? 0);
                if ($nominal > 0) {
                    Pembayaran::create([
                        'transaksi_laundry_id' => $transaksi->id,
                        'petugas_id' => auth()->id(),
                        'jenis' => 'Pelunasan',
                        'nominal' => $nominal,
                        'metode' => $data['metode_pembayaran'],
                        'tanggal_bayar' => now(),
                        'catatan' => $data['catatan'] ?? null,
                    ]);

                    $transaksi->hitungUlangTagihan();
                }

                if ($transaksi->sisa_tagihan <= 0) {
                    $transaksi->update(['status_bayar' => 'Lunas']);
                }
            } elseif ($data['jenis_aksi'] === 'tempo') {
                if (! $pelanggan->hak_bayar_belakangan) {
                    throw ValidationException::withMessages([
                        'jenis_aksi' => 'Pelanggan tidak memiliki izin bayar tempo (hak bayar belakangan).',
                    ]);
                }
                $transaksi->update(['status_bayar' => 'Tempo']);
            }

            if (! empty($data['serahkan_cucian']) && $transaksi->status_transaksi === 'Aktif') {
                if ($transaksi->status_proses_terkini !== 'Selesai') {
                    throw ValidationException::withMessages([
                        'serahkan_cucian' => 'Cucian belum selesai diproses di bagian produksi.',
                    ]);
                }

                if (! in_array($transaksi->status_bayar, ['Lunas', 'Tempo'], true)) {
                    throw ValidationException::withMessages([
                        'serahkan_cucian' => 'Cucian hanya dapat diserahkan jika sudah Lunas atau menggunakan fasilitas Tempo.',
                    ]);
                }

                $transaksi->update(['status_transaksi' => 'Selesai']);

                RiwayatStatusProses::create([
                    'transaksi_laundry_id' => $transaksi->id,
                    'petugas_id' => auth()->id(),
                    'tahap' => 'Selesai',
                    'waktu_update' => now(),
                    'catatan' => "Cucian diserahkan kepada pelanggan (Status: {$transaksi->status_bayar}).",
                ]);
            }
        });

        return redirect()->route('kasir.transaksi.show', $transaksi)
            ->with('success', 'Status pembayaran dan penyerahan cucian berhasil diperbarui.');
    }

    private function dataNota(TransaksiLaundry $transaksi): array
    {
        $transaksi->load([
            'pelanggan',
            'petugas:id,kode_petugas,nama_petugas',
            'voucher',
            'detailPakaian.jenisLayanan:id,kode_layanan,nama_layanan,satuan_hitung,kecepatan',
            'detailPakaian.laporanKerusakan.petugas:id,nama_petugas',
            'detailPengantaran.pengantaran.petugas:id,nama_petugas',
            'pembayaran.petugas:id,nama_petugas',
            'riwayatStatusProses.petugas:id,nama_petugas',
        ]);

        return [
            'transaksi' => $transaksi,
            'ringkasan' => [
                'potongan_voucher' => $transaksi->potonganVoucher(),
                'total_dibayar' => (float) $transaksi->pembayaran->sum('nominal'),
            ],
        ];
    }

    private function nomorNotaBerikutnya(): string
    {
        $prefix = 'CW-' . now()->format('Ymd') . '-';

        $terakhir = TransaksiLaundry::where('no_nota', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('no_nota')
            ->value('no_nota');

        $urut = $terakhir ? ((int) substr($terakhir, -3)) + 1 : 1;

        return $prefix . str_pad((string) $urut, 3, '0', STR_PAD_LEFT);
    }

    private function kodePelangganBerikutnya(): string
    {
        $urut = (Pelanggan::max('id') ?? 0) + 1;

        do {
            $kode = 'PLG-' . str_pad((string) $urut, 3, '0', STR_PAD_LEFT);
            $urut++;
        } while (Pelanggan::where('kode_pelanggan', $kode)->exists());

        return $kode;
    }
}
