import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { formatRupiah, labelSatuan } from '@/utils/format';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';

let urutItem = 0;
const itemKosong = () => ({ key: ++urutItem, jenis_layanan_id: '', daftar_pakaian: '', berat_atau_jumlah: '' });

const METODE_BAYAR = [
    { value: 'Belum', label: 'Bayar saat ambil', hint: 'Belum ada uang masuk. Tagihan dilunasi saat cucian diambil.' },
    { value: 'UangMuka', label: 'Uang muka (DP)', hint: 'Sebagian dibayar sekarang, sisanya saat ambil.' },
    { value: 'Lunas', label: 'Lunas sekarang', hint: 'Seluruh tagihan dibayar saat nota dibuat.' },
    { value: 'Tempo', label: 'Tempo', hint: 'Khusus pelanggan yang diizinkan bayar belakangan.' },
];

const PELANGGAN_BARU_KOSONG = { nama: '', no_telepon: '', alamat: '', hak_bayar_belakangan: false };

const kelasInput =
    'mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-[#0D9488] focus:ring-[#0D9488]';
const kelasLabel = 'block text-xs font-bold text-[#134E4A]';
const kelasFokus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2';

export default function TransaksiCreate({ pelanggan, jenisLayanan }) {
    const [daftarPelanggan, setDaftarPelanggan] = useState(pelanggan);
    const [cariPelanggan, setCariPelanggan] = useState('');
    const [voucher, setVoucher] = useState({ status: 'idle', data: null, pesan: '' });

    const [modalBaru, setModalBaru] = useState(false);
    const [pelangganBaru, setPelangganBaru] = useState(PELANGGAN_BARU_KOSONG);
    const [errorBaru, setErrorBaru] = useState({});
    const [menyimpanBaru, setMenyimpanBaru] = useState(false);

    const form = useForm({
        pelanggan_id: '',
        catatan_khusus: '',
        items: [itemKosong()],
        nomor_voucher: '',
        metode_bayar: 'Belum',
        nominal_bayar: '',
    });

    const layananMap = useMemo(
        () => Object.fromEntries(jenisLayanan.map((l) => [String(l.id), l])),
        [jenisLayanan],
    );

    const pelangganTerpilih = daftarPelanggan.find((p) => String(p.id) === String(form.data.pelanggan_id));

    const hasilCari = useMemo(() => {
        const kata = cariPelanggan.trim().toLowerCase();
        const cocok = kata
            ? daftarPelanggan.filter(
                  (p) =>
                      p.nama.toLowerCase().includes(kata) ||
                      p.kode_pelanggan.toLowerCase().includes(kata) ||
                      p.no_telepon.includes(kata),
              )
            : daftarPelanggan;
        return cocok.slice(0, 6);
    }, [cariPelanggan, daftarPelanggan]);

    const rincian = form.data.items.map((item) => {
        const layanan = layananMap[String(item.jenis_layanan_id)];
        const jumlah = parseFloat(item.berat_atau_jumlah) || 0;
        const harga = layanan ? Number(layanan.harga_satuan) : 0;
        return { layanan, subtotal: Math.round(jumlah * harga * 100) / 100 };
    });

    const totalHarga = rincian.reduce((total, r) => total + r.subtotal, 0);
    const potongan = voucher.status === 'valid' ? Math.min(voucher.data.nilai_potongan, totalHarga) : 0;
    const tagihan = Math.max(totalHarga - potongan, 0);
    const dibayar =
        form.data.metode_bayar === 'Lunas'
            ? tagihan
            : form.data.metode_bayar === 'UangMuka'
              ? parseFloat(form.data.nominal_bayar) || 0
              : 0;
    const sisa = Math.max(tagihan - dibayar, 0);

    const pilihPelanggan = (p) => {
        form.setData((data) => ({
            ...data,
            pelanggan_id: p.id,
            metode_bayar: data.metode_bayar === 'Tempo' && !p.hak_bayar_belakangan ? 'Belum' : data.metode_bayar,
        }));
        form.clearErrors('pelanggan_id');
        setCariPelanggan('');
    };

    const ubahItem = (index, field, value) => {
        form.setData(
            'items',
            form.data.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        );
    };

    const tambahItem = () => form.setData('items', [...form.data.items, itemKosong()]);

    const hapusItem = (index) => {
        if (form.data.items.length === 1) return;
        form.setData(
            'items',
            form.data.items.filter((_, i) => i !== index),
        );
    };

    const ubahVoucher = (value) => {
        form.setData('nomor_voucher', value);
        form.clearErrors('nomor_voucher');
        setVoucher({ status: 'idle', data: null, pesan: '' });
    };

    const periksaVoucher = async () => {
        const kode = form.data.nomor_voucher.trim();
        if (!kode) {
            setVoucher({ status: 'invalid', data: null, pesan: 'Isi kode voucher terlebih dahulu.' });
            return;
        }
        setVoucher({ status: 'loading', data: null, pesan: '' });
        try {
            const { data } = await axios.post(route('kasir.transaksi.cek-voucher'), { nomor_voucher: kode });
            setVoucher({ status: data.valid ? 'valid' : 'invalid', data: data.voucher, pesan: data.pesan });
        } catch {
            setVoucher({ status: 'error', data: null, pesan: 'Gagal memeriksa voucher. Periksa koneksi lalu coba lagi.' });
        }
    };

    const hapusVoucher = () => ubahVoucher('');

    const bukaModalBaru = () => {
        setPelangganBaru({ ...PELANGGAN_BARU_KOSONG, nama: cariPelanggan.trim() });
        setErrorBaru({});
        setModalBaru(true);
    };

    const simpanPelangganBaru = async (event) => {
        event.preventDefault();
        setMenyimpanBaru(true);
        setErrorBaru({});
        try {
            const { data } = await axios.post(route('kasir.transaksi.pelanggan-cepat'), pelangganBaru);
            setDaftarPelanggan((list) => [...list, data.pelanggan].sort((a, b) => a.nama.localeCompare(b.nama)));
            pilihPelanggan(data.pelanggan);
            setModalBaru(false);
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors || {};
                setErrorBaru(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]])));
            } else {
                setErrorBaru({ umum: 'Gagal menyimpan pelanggan. Periksa koneksi lalu coba lagi.' });
            }
        } finally {
            setMenyimpanBaru(false);
        }
    };

    const simpanNota = (event) => {
        event.preventDefault();
        form.post(route('kasir.transaksi.store'), { preserveScroll: true });
    };

    const adaErrorItem = Object.keys(form.errors).some((k) => k.startsWith('items'));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#134E4A]">Nota baru</h1>
                        <p className="mt-0.5 text-sm text-slate-600">
                            Harga dikunci saat nota disimpan. Nota langsung masuk antrean produksi.
                        </p>
                    </div>
                    <Link
                        href={route('kasir.transaksi.index')}
                        className={`inline-flex min-h-[44px] items-center text-sm font-semibold text-[#0D9488] hover:text-[#134E4A] ${kelasFokus}`}
                    >
                        Kembali ke daftar nota
                    </Link>
                </div>
            }
        >
            <Head title="Nota Baru" />

            <form
                onSubmit={simpanNota}
                className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8"
                noValidate
            >
                <div className="space-y-6">
                    {/* Pelanggan */}
                    <section aria-labelledby="judul-pelanggan" className="rounded-xl border border-teal-100 bg-white p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 id="judul-pelanggan" className="text-base font-bold text-[#134E4A]">
                                1. Pelanggan
                            </h2>
                            <button
                                type="button"
                                onClick={bukaModalBaru}
                                className={`min-h-[44px] rounded-lg border border-[#0D9488] px-3 text-sm font-bold text-[#0D9488] transition hover:bg-teal-50 active:bg-teal-100 ${kelasFokus}`}
                            >
                                Pelanggan baru
                            </button>
                        </div>

                        {pelangganTerpilih ? (
                            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-teal-200 bg-[#F6FBF9] p-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-900">{pelangganTerpilih.nama}</div>
                                    <div className="text-sm text-slate-700">
                                        <span className="font-mono">{pelangganTerpilih.kode_pelanggan}</span> · {pelangganTerpilih.no_telepon}
                                    </div>
                                    {pelangganTerpilih.alamat && (
                                        <div className="mt-1 break-words text-sm text-slate-600">{pelangganTerpilih.alamat}</div>
                                    )}
                                    <div className="mt-2 text-xs font-semibold text-slate-700">
                                        {pelangganTerpilih.hak_bayar_belakangan
                                            ? 'Boleh bayar tempo'
                                            : 'Wajib lunas sebelum cucian diserahkan'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => form.setData('pelanggan_id', '')}
                                    className={`min-h-[44px] shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 ${kelasFokus}`}
                                >
                                    Ganti pelanggan
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <label htmlFor="cari-pelanggan" className={kelasLabel}>
                                    Cari nama, kode, atau telepon
                                </label>
                                <input
                                    id="cari-pelanggan"
                                    type="search"
                                    value={cariPelanggan}
                                    onChange={(e) => setCariPelanggan(e.target.value)}
                                    placeholder="Ketik nama pelanggan"
                                    autoComplete="off"
                                    className={kelasInput}
                                />
                                <InputError message={form.errors.pelanggan_id} className="mt-2" />

                                {daftarPelanggan.length === 0 ? (
                                    <p className="mt-3 text-sm text-slate-600">
                                        Belum ada pelanggan terdaftar. Tambahkan lewat tombol Pelanggan baru.
                                    </p>
                                ) : hasilCari.length === 0 ? (
                                    <p className="mt-3 text-sm text-slate-600">
                                        Tidak ada pelanggan bernama "{cariPelanggan}". Tambahkan sebagai pelanggan baru.
                                    </p>
                                ) : (
                                    <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200" aria-label="Hasil pencarian pelanggan">
                                        {hasilCari.map((p) => (
                                            <li key={p.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => pilihPelanggan(p)}
                                                    className="flex min-h-[44px] w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#F6FBF9] active:bg-teal-50 focus:outline-none focus-visible:bg-teal-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D9488]"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-semibold text-slate-800">{p.nama}</span>
                                                        <span className="block text-xs text-slate-600">{p.no_telepon}</span>
                                                    </span>
                                                    <span className="shrink-0 font-mono text-xs text-slate-600">{p.kode_pelanggan}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Item cucian */}
                    <section aria-labelledby="judul-item" className="rounded-xl border border-teal-100 bg-white p-4 sm:p-5">
                        <h2 id="judul-item" className="text-base font-bold text-[#134E4A]">
                            2. Rincian cucian
                        </h2>

                        {jenisLayanan.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-700">
                                Belum ada jenis layanan.{' '}
                                <Link href={route('kasir.layanan.index')} className="font-semibold text-[#0D9488] underline">
                                    Tambahkan layanan
                                </Link>{' '}
                                sebelum membuat nota.
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-4">
                                {form.data.items.map((item, index) => {
                                    const { layanan, subtotal } = rincian[index];
                                    const err = (field) => form.errors[`items.${index}.${field}`];
                                    const idDasar = `item-${item.key}`;

                                    return (
                                        <li key={item.key} className="rounded-lg border border-slate-200 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-800">Item {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => hapusItem(index)}
                                                    disabled={form.data.items.length === 1}
                                                    aria-label={`Hapus item ${index + 1}`}
                                                    className={`min-h-[36px] rounded-md px-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:text-slate-400 disabled:hover:bg-transparent ${kelasFokus}`}
                                                >
                                                    Hapus
                                                </button>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                                                <div>
                                                    <label htmlFor={`${idDasar}-layanan`} className={kelasLabel}>
                                                        Jenis layanan
                                                    </label>
                                                    <select
                                                        id={`${idDasar}-layanan`}
                                                        value={item.jenis_layanan_id}
                                                        onChange={(e) => ubahItem(index, 'jenis_layanan_id', e.target.value)}
                                                        className={kelasInput}
                                                    >
                                                        <option value="">Pilih layanan</option>
                                                        {jenisLayanan.map((l) => (
                                                            <option key={l.id} value={l.id}>
                                                                {l.nama_layanan} ({formatRupiah(l.harga_satuan)}/{labelSatuan(l.satuan_hitung)})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={err('jenis_layanan_id')} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label htmlFor={`${idDasar}-jumlah`} className={kelasLabel}>
                                                        {layanan ? (layanan.satuan_hitung === 'Jumlah_Pcs' ? 'Jumlah (pcs)' : 'Berat (kg)') : 'Berat / jumlah'}
                                                    </label>
                                                    <input
                                                        id={`${idDasar}-jumlah`}
                                                        type="number"
                                                        inputMode="decimal"
                                                        min={layanan?.satuan_hitung === 'Jumlah_Pcs' ? 1 : 0.1}
                                                        step={layanan?.satuan_hitung === 'Jumlah_Pcs' ? 1 : 0.1}
                                                        value={item.berat_atau_jumlah}
                                                        onChange={(e) => ubahItem(index, 'berat_atau_jumlah', e.target.value)}
                                                        className={`${kelasInput} tabular-nums`}
                                                    />
                                                    <InputError message={err('berat_atau_jumlah')} className="mt-1" />
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label htmlFor={`${idDasar}-pakaian`} className={kelasLabel}>
                                                    Rincian pakaian
                                                </label>
                                                <input
                                                    id={`${idDasar}-pakaian`}
                                                    type="text"
                                                    value={item.daftar_pakaian}
                                                    onChange={(e) => ubahItem(index, 'daftar_pakaian', e.target.value)}
                                                    placeholder="Contoh: 3 kemeja, 2 celana panjang"
                                                    className={kelasInput}
                                                />
                                                <InputError message={err('daftar_pakaian')} className="mt-1" />
                                            </div>

                                            <div className="mt-3 flex justify-between border-t border-dashed border-slate-200 pt-3 text-sm">
                                                <span className="text-slate-600">Subtotal</span>
                                                <span className="font-bold tabular-nums text-slate-900">{formatRupiah(subtotal)}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        {jenisLayanan.length > 0 && (
                            <button
                                type="button"
                                onClick={tambahItem}
                                disabled={form.data.items.length >= 20}
                                className={`mt-4 min-h-[44px] w-full rounded-lg border border-dashed border-[#0D9488] text-sm font-bold text-[#0D9488] transition hover:bg-teal-50 active:bg-teal-100 disabled:border-slate-300 disabled:text-slate-500 ${kelasFokus}`}
                            >
                                Tambah item
                            </button>
                        )}
                        <InputError message={form.errors.items} className="mt-2" />
                    </section>

                    {/* Catatan */}
                    <section aria-labelledby="judul-catatan" className="rounded-xl border border-teal-100 bg-white p-4 sm:p-5">
                        <h2 id="judul-catatan" className="text-base font-bold text-[#134E4A]">
                            3. Catatan untuk produksi
                        </h2>
                        <label htmlFor="catatan-khusus" className="sr-only">
                            Catatan khusus
                        </label>
                        <textarea
                            id="catatan-khusus"
                            rows={3}
                            value={form.data.catatan_khusus}
                            onChange={(e) => form.setData('catatan_khusus', e.target.value)}
                            placeholder="Noda, bahan sensitif, atau permintaan pelanggan (opsional)"
                            className={kelasInput}
                        />
                        <InputError message={form.errors.catatan_khusus} className="mt-1" />
                    </section>
                </div>

                {/* Ringkasan & pembayaran */}
                <aside aria-labelledby="judul-ringkasan" className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-xl border border-teal-200 bg-white">
                        <div className="border-b border-teal-100 p-4 sm:p-5">
                            <h2 id="judul-ringkasan" className="text-base font-bold text-[#134E4A]">
                                4. Tagihan & pembayaran
                            </h2>

                            <div className="mt-4">
                                <label htmlFor="nomor-voucher" className={kelasLabel}>
                                    Kode voucher (opsional)
                                </label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        id="nomor-voucher"
                                        type="text"
                                        value={form.data.nomor_voucher}
                                        onChange={(e) => ubahVoucher(e.target.value)}
                                        placeholder="CW-HEMAT10K"
                                        autoComplete="off"
                                        className="block w-full min-w-0 rounded-lg border-slate-300 font-mono text-sm uppercase focus:border-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                    {voucher.status === 'valid' ? (
                                        <button
                                            type="button"
                                            onClick={hapusVoucher}
                                            className={`min-h-[44px] shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${kelasFokus}`}
                                        >
                                            Lepas
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={periksaVoucher}
                                            disabled={voucher.status === 'loading'}
                                            className={`min-h-[44px] shrink-0 rounded-lg bg-[#134E4A] px-3 text-sm font-bold text-white hover:bg-[#0f3b38] disabled:opacity-60 ${kelasFokus}`}
                                        >
                                            {voucher.status === 'loading' ? 'Memeriksa...' : 'Periksa'}
                                        </button>
                                    )}
                                </div>
                                <div aria-live="polite">
                                    {voucher.status === 'valid' && (
                                        <p className="mt-1 text-sm font-semibold text-teal-800">
                                            Voucher berlaku: potongan {formatRupiah(voucher.data.nilai_potongan)}.
                                        </p>
                                    )}
                                    {(voucher.status === 'invalid' || voucher.status === 'error') && (
                                        <p className="mt-1 text-sm text-red-700">{voucher.pesan}</p>
                                    )}
                                    {voucher.status === 'idle' && form.data.nomor_voucher.trim() !== '' && !form.errors.nomor_voucher && (
                                        <p className="mt-1 text-xs text-slate-600">Tekan Periksa untuk melihat potongannya.</p>
                                    )}
                                </div>
                                <InputError message={form.errors.nomor_voucher} className="mt-1" />
                            </div>

                            <fieldset className="mt-5">
                                <legend className={kelasLabel}>Cara pembayaran</legend>
                                <div className="mt-2 space-y-2">
                                    {METODE_BAYAR.map((opsi) => {
                                        const tempoTerkunci = opsi.value === 'Tempo' && !pelangganTerpilih?.hak_bayar_belakangan;
                                        const aktif = form.data.metode_bayar === opsi.value;
                                        return (
                                            <label
                                                key={opsi.value}
                                                htmlFor={`metode-${opsi.value}`}
                                                className={`flex gap-3 rounded-lg border p-3 transition ${
                                                    tempoTerkunci
                                                        ? 'cursor-not-allowed border-slate-200 bg-slate-50'
                                                        : aktif
                                                          ? 'cursor-pointer border-[#0D9488] bg-[#F6FBF9]'
                                                          : 'cursor-pointer border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    id={`metode-${opsi.value}`}
                                                    type="radio"
                                                    name="metode_bayar"
                                                    value={opsi.value}
                                                    checked={aktif}
                                                    disabled={tempoTerkunci}
                                                    onChange={() => form.setData('metode_bayar', opsi.value)}
                                                    className="mt-0.5 border-slate-400 text-[#0D9488] focus:ring-[#0D9488]"
                                                />
                                                <span>
                                                    <span className={`block text-sm font-semibold ${tempoTerkunci ? 'text-slate-500' : 'text-slate-800'}`}>
                                                        {opsi.label}
                                                    </span>
                                                    <span className="block text-xs text-slate-600">
                                                        {tempoTerkunci && pelangganTerpilih
                                                            ? 'Pelanggan ini belum diizinkan bayar tempo.'
                                                            : opsi.hint}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.metode_bayar} className="mt-1" />
                            </fieldset>

                            {form.data.metode_bayar === 'UangMuka' && (
                                <div className="mt-4">
                                    <label htmlFor="nominal-bayar" className={kelasLabel}>
                                        Nominal uang muka (Rp)
                                    </label>
                                    <input
                                        id="nominal-bayar"
                                        type="number"
                                        inputMode="numeric"
                                        min={1000}
                                        step={500}
                                        value={form.data.nominal_bayar}
                                        onChange={(e) => form.setData('nominal_bayar', e.target.value)}
                                        className={`${kelasInput} tabular-nums`}
                                    />
                                    <InputError message={form.errors.nominal_bayar} className="mt-1" />
                                </div>
                            )}
                        </div>

                        <dl className="space-y-2 p-4 text-sm sm:p-5">
                            <div className="flex justify-between">
                                <dt className="text-slate-600">Total harga</dt>
                                <dd className="tabular-nums text-slate-900">{formatRupiah(totalHarga)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-600">Potongan voucher</dt>
                                <dd className="tabular-nums text-slate-900">{potongan > 0 ? `- ${formatRupiah(potongan)}` : formatRupiah(0)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-600">Dibayar sekarang</dt>
                                <dd className="tabular-nums text-slate-900">{dibayar > 0 ? `- ${formatRupiah(Math.min(dibayar, tagihan))}` : formatRupiah(0)}</dd>
                            </div>
                            <div className="flex items-end justify-between border-t border-teal-100 pt-3">
                                <dt className="font-bold text-[#134E4A]">Sisa tagihan</dt>
                                <dd className="text-2xl font-extrabold tabular-nums text-[#134E4A]" aria-live="polite">
                                    {formatRupiah(sisa)}
                                </dd>
                            </div>
                        </dl>

                        <div className="border-t border-teal-100 p-4 sm:p-5">
                            {(adaErrorItem || form.errors.pelanggan_id) && (
                                <p className="mb-3 text-sm text-red-700" role="alert">
                                    Nota belum tersimpan. Periksa isian yang ditandai merah.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={form.processing || jenisLayanan.length === 0}
                                className={`min-h-[48px] w-full rounded-lg bg-[#0D9488] text-base font-bold text-white transition hover:bg-[#134E4A] active:bg-[#0f3b38] disabled:opacity-60 ${kelasFokus}`}
                            >
                                {form.processing ? 'Menyimpan nota...' : 'Simpan nota'}
                            </button>
                        </div>
                    </div>
                </aside>
            </form>

            <Modal show={modalBaru} onClose={() => !menyimpanBaru && setModalBaru(false)} maxWidth="lg">
                <form onSubmit={simpanPelangganBaru} className="p-5 sm:p-6" noValidate>
                    <h2 className="text-lg font-bold text-[#134E4A]">Pelanggan baru</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Kode pelanggan dibuat otomatis. Data lengkap bisa diubah nanti di menu Pelanggan.
                    </p>

                    {errorBaru.umum && (
                        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800" role="alert">
                            {errorBaru.umum}
                        </p>
                    )}

                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="baru-nama" className={kelasLabel}>Nama lengkap</label>
                            <input
                                id="baru-nama"
                                type="text"
                                value={pelangganBaru.nama}
                                onChange={(e) => setPelangganBaru({ ...pelangganBaru, nama: e.target.value })}
                                className={kelasInput}
                                autoFocus
                            />
                            <InputError message={errorBaru.nama} className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="baru-telepon" className={kelasLabel}>Nomor WhatsApp / telepon</label>
                            <input
                                id="baru-telepon"
                                type="tel"
                                inputMode="tel"
                                value={pelangganBaru.no_telepon}
                                onChange={(e) => setPelangganBaru({ ...pelangganBaru, no_telepon: e.target.value })}
                                placeholder="08xxxxxxxxxx"
                                className={kelasInput}
                            />
                            <InputError message={errorBaru.no_telepon} className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="baru-alamat" className={kelasLabel}>Alamat (untuk pengantaran)</label>
                            <textarea
                                id="baru-alamat"
                                rows={2}
                                value={pelangganBaru.alamat}
                                onChange={(e) => setPelangganBaru({ ...pelangganBaru, alamat: e.target.value })}
                                className={kelasInput}
                            />
                            <InputError message={errorBaru.alamat} className="mt-1" />
                        </div>
                        <label htmlFor="baru-tempo" className="flex cursor-pointer items-start gap-3">
                            <input
                                id="baru-tempo"
                                type="checkbox"
                                checked={pelangganBaru.hak_bayar_belakangan}
                                onChange={(e) => setPelangganBaru({ ...pelangganBaru, hak_bayar_belakangan: e.target.checked })}
                                className="mt-0.5 rounded border-slate-400 text-[#0D9488] focus:ring-[#0D9488]"
                            />
                            <span className="text-sm text-slate-800">
                                Izinkan bayar tempo
                                <span className="block text-xs text-slate-600">Cucian boleh diserahkan sebelum lunas.</span>
                            </span>
                        </label>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setModalBaru(false)}
                            disabled={menyimpanBaru}
                            className={`min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${kelasFokus}`}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={menyimpanBaru}
                            className={`min-h-[44px] rounded-lg bg-[#0D9488] px-4 text-sm font-bold text-white hover:bg-[#134E4A] disabled:opacity-60 ${kelasFokus}`}
                        >
                            {menyimpanBaru ? 'Menyimpan...' : 'Simpan & pilih pelanggan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
