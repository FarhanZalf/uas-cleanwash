import InputError from '@/Components/InputError';
import { IconWasher } from '@/Components/LineIcons';
import Modal from '@/Components/Modal';
import { StatusProses } from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatJumlah, formatRupiah, formatTanggalWaktu } from '@/utils/format';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const TAHAP_LIST = ['Diterima', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Selesai'];

const kelasInput =
    'mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-[#0D9488] focus:ring-[#0D9488]';
const kelasLabel = 'block text-xs font-bold text-[#134E4A]';
const kelasFokus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2';

export default function ProduksiDashboard({ antreanCucian, countPerTahap, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [tahap, setTahap] = useState(filters?.tahap || '');
    const [prioritas, setPrioritas] = useState(filters?.prioritas || '');
    const [memuat, setMemuat] = useState(false);

    const [transaksiAktifLapor, setTransaksiAktifLapor] = useState(null);
    const formLapor = useForm({
        detail_pakaian_id: '',
        jenis_insiden: 'Rusak',
        jenis_pakaian: '',
        keterangan: '',
        nilai_kompensasi: '',
    });

    const terapkanFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('produksi.dashboard'),
            {
                search: search || undefined,
                tahap: tahap || undefined,
                prioritas: prioritas || undefined,
            },
            {
                preserveState: true,
                replace: true,
                onStart: () => setMemuat(true),
                onFinish: () => setMemuat(false),
            },
        );
    };

    const resetFilter = () => {
        setSearch('');
        setTahap('');
        setPrioritas('');
        router.get(route('produksi.dashboard'), {}, {
            onStart: () => setMemuat(true),
            onFinish: () => setMemuat(false),
        });
    };

    const handleUpdateTahap = (transaksiId, tahapTujuan, tahapSaatIni) => {
        if (!tahapTujuan || tahapTujuan === tahapSaatIni) {
            return;
        }

        router.post(
            route('produksi.update-tahap', transaksiId),
            { tahap_tujuan: tahapTujuan },
            { preserveScroll: true },
        );
    };

    const bukaModalLapor = (transaksi) => {
        setTransaksiAktifLapor(transaksi);
        formLapor.reset();
        formLapor.setData({
            detail_pakaian_id: transaksi.detail_pakaian?.[0]?.id || '',
            jenis_insiden: 'Rusak',
            jenis_pakaian: '',
            keterangan: '',
            nilai_kompensasi: '',
        });
        formLapor.clearErrors();
    };

    const tutupModalLapor = () => {
        if (!formLapor.processing) {
            setTransaksiAktifLapor(null);
            formLapor.reset();
        }
    };

    const simpanLaporanKerusakan = (e) => {
        e.preventDefault();
        if (!transaksiAktifLapor) return;

        formLapor.post(route('produksi.lapor-kerusakan', transaksiAktifLapor.id), {
            preserveScroll: true,
            onSuccess: () => tutupModalLapor(),
        });
    };

    const sedangMemfilter = Boolean(filters?.search || filters?.tahap || filters?.prioritas);

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-lg font-bold text-[#134E4A]">Antrean Produksi</h1>
            }
        >
            <Head title="Antrean Produksi" />

            <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                {/* 5 Kartu Tahap Ringkasan */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {TAHAP_LIST.map((t) => {
                        const aktif = tahap === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => {
                                    setTahap(aktif ? '' : t);
                                    router.get(
                                        route('produksi.dashboard'),
                                        {
                                            search: search || undefined,
                                            tahap: aktif ? undefined : t,
                                            prioritas: prioritas || undefined,
                                        },
                                        { preserveState: true, replace: true },
                                    );
                                }}
                                className={`rounded-xl border p-3.5 text-center transition ${kelasFokus} ${
                                    aktif
                                        ? 'border-[#0D9488] bg-[#CCFBF1]/45 ring-1 ring-[#0D9488]'
                                        : 'border-teal-200/80 bg-white hover:bg-[#F6FBF9]'
                                }`}
                            >
                                <span className="block text-xs font-bold text-slate-600">{t}</span>
                                <div className="mt-1 text-2xl font-black text-[#134E4A]">{countPerTahap?.[t] || 0}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Toolbar */}
                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-3 rounded-xl border border-teal-200/80 bg-white p-4 md:flex-row md:items-end"
                >
                    <div className="flex-1">
                        <label htmlFor="cari-produksi" className={kelasLabel}>
                            Cari Nota / Pelanggan
                        </label>
                        <input
                            id="cari-produksi"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="No. nota atau nama pelanggan"
                            className={kelasInput}
                        />
                    </div>

                    <div className="w-full md:w-44">
                        <label htmlFor="filter-tahap" className={kelasLabel}>
                            Tahap
                        </label>
                        <select
                            id="filter-tahap"
                            value={tahap}
                            onChange={(e) => setTahap(e.target.value)}
                            className={kelasInput}
                        >
                            <option value="">Semua tahapan</option>
                            {TAHAP_LIST.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-40">
                        <label htmlFor="filter-prioritas" className={kelasLabel}>
                            Prioritas
                        </label>
                        <select
                            id="filter-prioritas"
                            value={prioritas}
                            onChange={(e) => setPrioritas(e.target.value)}
                            className={kelasInput}
                        >
                            <option value="">Semua</option>
                            <option value="Express">Express</option>
                            <option value="Reguler">Reguler</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={memuat}
                            className={`min-h-[42px] flex-1 rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] disabled:opacity-60 md:flex-none ${kelasFokus}`}
                        >
                            {memuat ? 'Memuat...' : 'Filter'}
                        </button>
                        {sedangMemfilter && (
                            <button
                                type="button"
                                onClick={resetFilter}
                                className={`min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 ${kelasFokus}`}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Daftar Antrean Cucian */}
                {antreanCucian && antreanCucian.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {antreanCucian.map((item) => {
                            const nextTahap = item.tahap_berikutnya;
                            const adaInsiden = item.laporan_kerusakan && item.laporan_kerusakan.length > 0;
                            const tahapanList = item.tahapan_berlaku || TAHAP_LIST;

                            return (
                                <article
                                    key={item.id}
                                    aria-label={`Nota ${item.no_nota}`}
                                    className={`flex flex-col justify-between rounded-xl border bg-white p-5 ${
                                        item.is_express
                                            ? 'border-amber-300'
                                            : 'border-teal-200/80'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 border-b border-teal-100 pb-3">
                                            <div>
                                                <span className="font-mono text-sm font-black text-[#134E4A]">
                                                    {item.no_nota}
                                                </span>
                                                <div className="text-xs font-semibold text-slate-700">{item.pelanggan?.nama}</div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                {item.is_express && (
                                                    <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                                        EXPRESS
                                                    </span>
                                                )}
                                                <StatusProses status={item.status_proses_terkini} />
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2 text-xs">
                                            {item.detail_pakaian?.map((d) => (
                                                <div key={d.id} className="rounded-lg bg-[#F6FBF9] border border-teal-100 p-2.5 text-slate-700">
                                                    <div className="font-bold text-[#134E4A]">
                                                        {d.jenis_layanan?.nama_layanan}{' '}
                                                        <span className="font-normal text-slate-600">
                                                            ({formatJumlah(d.berat_atau_jumlah, d.jenis_layanan?.satuan_hitung)})
                                                        </span>
                                                    </div>
                                                    <div className="mt-0.5 text-slate-600">{d.daftar_pakaian}</div>
                                                </div>
                                            ))}

                                            {item.catatan_khusus && (
                                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2 text-amber-900">
                                                    <span className="font-bold">Catatan:</span> {item.catatan_khusus}
                                                </div>
                                            )}

                                            {adaInsiden && (
                                                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-rose-900">
                                                    <div className="font-bold">Insiden ({item.laporan_kerusakan.length}):</div>
                                                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                                                        {item.laporan_kerusakan.map((l) => (
                                                            <li key={l.id}>
                                                                {l.jenis_insiden}: {l.jenis_pakaian} ({formatRupiah(l.nilai_kompensasi)})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dropdown Ubah Status Proses & Tombol Lapor Kerusakan */}
                                    <div className="mt-4 space-y-2.5 border-t border-teal-100 pt-3">
                                        <div>
                                            <label htmlFor={`status-proses-${item.id}`} className="block text-[11px] font-bold text-[#134E4A] mb-1">
                                                Ubah Status Proses
                                            </label>
                                            <select
                                                id={`status-proses-${item.id}`}
                                                value={item.status_proses_terkini}
                                                disabled={!nextTahap}
                                                onChange={(e) => handleUpdateTahap(item.id, e.target.value, item.status_proses_terkini)}
                                                className="block w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-xs font-bold text-[#134E4A] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] disabled:bg-slate-50 disabled:text-slate-500"
                                            >
                                                {tahapanList.map((thp) => {
                                                    const isCurrent = thp === item.status_proses_terkini;
                                                    const isNext = thp === nextTahap;
                                                    return (
                                                        <option
                                                            key={thp}
                                                            value={thp}
                                                            disabled={!isCurrent && !isNext}
                                                        >
                                                            {isCurrent
                                                                ? `${thp} (Saat ini)`
                                                                : isNext
                                                                  ? `${thp}`
                                                                  : thp}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <span className="text-[11px] text-slate-500">
                                                {formatTanggalWaktu(item.tanggal_terima)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => bukaModalLapor(item)}
                                                className={`min-h-[36px] rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 ${kelasFokus}`}
                                            >
                                                Lapor Kerusakan
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-teal-200/80 bg-white p-10 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                            <IconWasher className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-[#134E4A]">
                            {sedangMemfilter
                                ? 'Tidak ada antrean yang cocok'
                                : 'Antrean produksi kosong'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Lapor Kerusakan / Kehilangan */}
            <Modal show={Boolean(transaksiAktifLapor)} onClose={tutupModalLapor} maxWidth="lg">
                {transaksiAktifLapor && (
                    <form onSubmit={simpanLaporanKerusakan} className="p-6" noValidate>
                        <div className="border-b border-teal-100 pb-3">
                            <h2 className="text-base font-bold text-[#134E4A]">
                                Lapor Kerusakan ({transaksiAktifLapor.no_nota})
                            </h2>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div>
                                <label htmlFor="lapor-item" className={kelasLabel}>
                                    Item Layanan
                                </label>
                                <select
                                    id="lapor-item"
                                    value={formLapor.data.detail_pakaian_id}
                                    onChange={(e) => formLapor.setData('detail_pakaian_id', e.target.value)}
                                    className={kelasInput}
                                >
                                    {transaksiAktifLapor.detail_pakaian?.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.jenis_layanan?.nama_layanan} · {d.daftar_pakaian}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={formLapor.errors.detail_pakaian_id} className="mt-1" />
                            </div>

                            <fieldset>
                                <legend className={kelasLabel}>Kategori</legend>
                                <div className="mt-2 flex gap-4">
                                    {['Rusak', 'Hilang'].map((kategori) => (
                                        <label key={kategori} className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="radio"
                                                name="jenis_insiden"
                                                value={kategori}
                                                checked={formLapor.data.jenis_insiden === kategori}
                                                onChange={(e) => formLapor.setData('jenis_insiden', e.target.value)}
                                                className="border-slate-400 text-[#0D9488] focus:ring-[#0D9488]"
                                            />
                                            <span className="font-semibold text-slate-800">{kategori}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={formLapor.errors.jenis_insiden} className="mt-1" />
                            </fieldset>

                            <div>
                                <label htmlFor="lapor-jenis" className={kelasLabel}>
                                    Jenis Pakaian
                                </label>
                                <input
                                    id="lapor-jenis"
                                    type="text"
                                    value={formLapor.data.jenis_pakaian}
                                    onChange={(e) => formLapor.setData('jenis_pakaian', e.target.value)}
                                    placeholder="Kemeja Putih"
                                    className={kelasInput}
                                />
                                <InputError message={formLapor.errors.jenis_pakaian} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="lapor-keterangan" className={kelasLabel}>
                                    Keterangan
                                </label>
                                <textarea
                                    id="lapor-keterangan"
                                    rows={2}
                                    value={formLapor.data.keterangan}
                                    onChange={(e) => formLapor.setData('keterangan', e.target.value)}
                                    className={kelasInput}
                                />
                                <InputError message={formLapor.errors.keterangan} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="lapor-kompensasi" className={kelasLabel}>
                                    Nilai Kompensasi (Rp)
                                </label>
                                <input
                                    id="lapor-kompensasi"
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    step={1000}
                                    value={formLapor.data.nilai_kompensasi}
                                    onChange={(e) => formLapor.setData('nilai_kompensasi', e.target.value)}
                                    placeholder="50000"
                                    className={`${kelasInput} tabular-nums`}
                                />
                                <InputError message={formLapor.errors.nilai_kompensasi} className="mt-1" />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={tutupModalLapor}
                                disabled={formLapor.processing}
                                className={`min-h-[42px] rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 ${kelasFokus}`}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={formLapor.processing}
                                className={`min-h-[42px] rounded-lg bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60 ${kelasFokus}`}
                            >
                                {formLapor.processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
