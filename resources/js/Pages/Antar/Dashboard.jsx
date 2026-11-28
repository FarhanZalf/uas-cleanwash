import { IconPhone, IconPin, IconSearch, IconTruck } from '@/Components/LineIcons';
import { buildGoogleMapsUrl } from '@/Components/LocationMapPicker';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggal } from '@/utils/format';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const STATUS_ANTAR_OPTIONS = [
    { value: 'Menunggu', label: 'Menunggu' },
    { value: 'Diambil', label: 'Diambil' },
    { value: 'DalamPerjalanan', label: 'Dalam Perjalanan' },
    { value: 'Diterima', label: 'Diterima' },
    { value: 'Gagal', label: 'Gagal Antar' },
];

export default function AntarDashboard({ daftarAntaran, counts, activeTab }) {
    const [selectedItemGagal, setSelectedItemGagal] = useState(null);
    const [cari, setCari] = useState('');

    const formGagal = useForm({
        status_antar: 'Gagal',
        alasan_gagal: 'Rumah kosong / tidak ada orang',
        jadwal_ulang: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });

    const handleTabChange = (tab) => {
        router.get(route('antar.dashboard'), { tab }, { preserveState: true });
    };

    const handleDropdownStatusChange = (item, statusBaru) => {
        if (!statusBaru || statusBaru === item.status_antar) return;

        if (statusBaru === 'Gagal') {
            setSelectedItemGagal(item);
            formGagal.setData('alasan_gagal', 'Rumah kosong / tidak ada orang');
            return;
        }

        router.post(
            route('antar.update-status', item.id),
            { status_antar: statusBaru },
            { preserveScroll: true },
        );
    };

    const handleKirimGagal = (e) => {
        e.preventDefault();
        if (!selectedItemGagal) return;

        formGagal.post(route('antar.update-status', selectedItemGagal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedItemGagal(null);
                formGagal.reset();
            },
        });
    };

    const statusBadgeClass = {
        Menunggu: 'bg-slate-100 text-slate-700 border-slate-200',
        Diambil: 'bg-[#CCFBF1] text-[#134E4A] border-teal-200',
        DalamPerjalanan: 'bg-amber-100 text-amber-800 border-amber-200',
        Diterima: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        Gagal: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    const daftarTerfilter = useMemo(() => {
        const list = daftarAntaran || [];
        const q = cari.trim().toLowerCase();
        if (!q) return list;
        return list.filter((item) => {
            const nota = item.transaksi_laundry?.no_nota?.toLowerCase() || '';
            const kloter = item.pengantaran?.kode_pengantaran?.toLowerCase() || '';
            const nama = item.transaksi_laundry?.pelanggan?.nama?.toLowerCase() || '';
            const alamat = item.transaksi_laundry?.pelanggan?.alamat?.toLowerCase() || '';
            return nota.includes(q) || kloter.includes(q) || nama.includes(q) || alamat.includes(q);
        });
    }, [daftarAntaran, cari]);

    const kartuRingkasan = [
        { key: 'semua', label: 'Semua Paket', nilai: counts?.total || 0 },
        { key: 'hari_ini', label: 'Jadwal Hari Ini', nilai: counts?.hari_ini || 0 },
        { key: 'aktif', label: 'Sedang Diantar', nilai: counts?.aktif || 0 },
        { key: 'selesai', label: 'Sudah Diterima', nilai: counts?.diterima || 0 },
        { key: 'gagal', label: 'Gagal Antar', nilai: counts?.gagal || 0 },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2.5">
                    <h1 className="text-lg font-bold text-[#134E4A]">Pengantaran Kurir</h1>
                </div>
            }
        >
            <Head title="Pengantaran Kurir" />

            <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                {/* 5 Kartu Ringkasan Tugas Kurir */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {kartuRingkasan.map((k) => {
                        const aktif = (activeTab || 'semua') === k.key;
                        return (
                            <button
                                key={k.key}
                                type="button"
                                onClick={() => handleTabChange(k.key)}
                                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                                    aktif
                                        ? 'border-[#0D9488] bg-[#CCFBF1]/60 ring-1 ring-[#0D9488]'
                                        : 'border-teal-100 bg-[#F6FBF9] hover:border-teal-300'
                                }`}
                            >
                                <div>
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        {k.label}
                                    </span>
                                    <div className="mt-0.5 text-2xl font-black tabular-nums text-[#134E4A]">
                                        {k.nilai}
                                    </div>
                                </div>
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        aktif ? 'bg-[#0D9488]' : 'bg-teal-200'
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Baris Pencarian Cepat */}
                <div className="flex flex-col gap-3 rounded-xl border border-teal-100 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari nomor nota, kode kloter, nama pelanggan, atau alamat..."
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                        />
                    </div>
                    <div className="text-xs font-bold text-[#134E4A] px-1">
                        Menampilkan <span className="tabular-nums text-[#0D9488]">{daftarTerfilter.length}</span> paket
                    </div>
                </div>

                {/* Grid 2 Kolom Kartu Antaran */}
                {daftarTerfilter.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {daftarTerfilter.map((item) => {
                            const nota = item.transaksi_laundry;
                            const plg = nota?.pelanggan;
                            const itemsPakaian = nota?.detail_pakaian || [];

                            const phoneClean = plg?.no_telepon ? plg.no_telepon.replace(/\D/g, '').replace(/^0/, '62') : '';
                            const waText = encodeURIComponent(`Halo ${plg?.nama || ''}, kurir CleanWash mengantar cucian nota ${nota?.no_nota || ''}.`);
                            const waLink = `https://wa.me/${phoneClean}?text=${waText}`;
                            const mapsLink = buildGoogleMapsUrl(plg?.alamat || '');

                            return (
                                <article
                                    key={item.id}
                                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-teal-200/80 bg-white"
                                >
                                    <div>
                                        {/* Header Kartu */}
                                        <div className="flex items-center justify-between gap-2 border-b border-teal-100 bg-[#F6FBF9] px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-black text-[#134E4A]">
                                                    {nota?.no_nota}
                                                </span>
                                                <span className="rounded border border-teal-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-teal-800">
                                                    {item.pengantaran?.kode_pengantaran}
                                                </span>
                                            </div>
                                            <span
                                                className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                                                    statusBadgeClass[item.status_antar] || ''
                                                }`}
                                            >
                                                {item.status_antar}
                                            </span>
                                        </div>

                                        {/* Informasi Pelanggan, Tagihan & Alamat */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="text-sm font-bold text-[#134E4A]">{plg?.nama}</h2>
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {plg?.no_telepon || '-'}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`rounded-md px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                                                        nota?.status_bayar === 'Lunas'
                                                            ? 'bg-[#CCFBF1] text-[#134E4A]'
                                                            : 'bg-amber-100 text-amber-900'
                                                    }`}
                                                >
                                                    {nota?.status_bayar === 'Lunas'
                                                        ? 'Lunas'
                                                        : `Tagihan: ${formatRupiah(nota?.sisa_tagihan)}`}
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-2.5 rounded-lg border border-teal-100 bg-[#F6FBF9] p-3 text-xs text-slate-700">
                                                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                                                <span className="font-medium leading-relaxed">
                                                    {plg?.alamat || 'Alamat belum tercatat'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                {itemsPakaian.length > 0 ? (
                                                    itemsPakaian.map((it) => (
                                                        <span
                                                            key={it.id}
                                                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700"
                                                        >
                                                            {it.jenis_layanan?.nama_layanan} ({it.berat_atau_jumlah})
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-500">Paket cucian siap antar</span>
                                                )}
                                            </div>

                                            {item.status_antar === 'Gagal' && item.alasan_gagal && (
                                                <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 space-y-1">
                                                    <div className="font-bold">Gagal: {item.alasan_gagal}</div>
                                                    {item.jadwal_ulang && (
                                                        <div className="text-[11px] font-semibold text-rose-700">
                                                            Jadwal Ulang: {formatTanggal(item.jadwal_ulang)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Kartu: Dropdown Status & Pintasan WhatsApp / Maps */}
                                    <div className="border-t border-teal-100 bg-[#F6FBF9]/60 p-4 space-y-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`status-antar-${item.id}`}
                                                    className="block text-[11px] font-bold text-[#134E4A] mb-1"
                                                >
                                                    Ubah Status Pengantaran
                                                </label>
                                                <select
                                                    id={`status-antar-${item.id}`}
                                                    value={item.status_antar}
                                                    onChange={(e) => handleDropdownStatusChange(item, e.target.value)}
                                                    className="block w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-xs font-bold text-[#134E4A] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] cursor-pointer"
                                                >
                                                    {STATUS_ANTAR_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={waLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg bg-[#0D9488] px-3.5 text-xs font-bold text-white transition hover:bg-[#134E4A]"
                                                >
                                                    <IconPhone className="h-3.5 w-3.5" />
                                                    <span>WhatsApp</span>
                                                </a>

                                                {plg?.alamat ? (
                                                    <a
                                                        href={mapsLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3.5 text-xs font-bold text-[#134E4A] transition hover:bg-[#CCFBF1]"
                                                    >
                                                        <IconPin className="h-3.5 w-3.5 text-[#0D9488]" />
                                                        <span>Maps</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed"
                                                    >
                                                        Maps
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-teal-200/80 bg-white p-10 text-center text-slate-600">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                            <IconTruck className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-[#134E4A] text-sm">Tidak ada tugas pengantaran</div>
                    </div>
                )}
            </div>

            {/* Modal Lapor Gagal Antar */}
            {selectedItemGagal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-rose-700">
                            Gagal Antar ({selectedItemGagal.transaksi_laundry?.no_nota})
                        </h3>

                        <form onSubmit={handleKirimGagal} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#134E4A]">Alasan Gagal</label>
                                <select
                                    value={formGagal.data.alasan_gagal}
                                    onChange={(e) => formGagal.setData('alasan_gagal', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                >
                                    <option value="Rumah kosong / tidak ada orang">Rumah kosong / tidak ada orang</option>
                                    <option value="Pelanggan tidak dapat dihubungi via telepon / WA">Pelanggan tidak dapat dihubungi via telepon / WA</option>
                                    <option value="Alamat salah / tidak ditemukan">Alamat salah / tidak ditemukan</option>
                                    <option value="Pelanggan meminta jadwal ditunda">Pelanggan meminta jadwal ditunda</option>
                                    <option value="Cuaca buruk / kendala operasional">Cuaca buruk / kendala operasional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#134E4A]">Jadwal Antar Ulang</label>
                                <input
                                    type="date"
                                    value={formGagal.data.jadwal_ulang}
                                    onChange={(e) => formGagal.setData('jadwal_ulang', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-teal-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItemGagal(null)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formGagal.processing}
                                    className="min-h-[40px] rounded-lg bg-rose-600 px-4 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                                >
                                    {formGagal.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
