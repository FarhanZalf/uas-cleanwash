import { IconPhone, IconPin, IconTruck } from '@/Components/LineIcons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggal } from '@/utils/format';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_ANTAR_OPTIONS = [
    { value: 'Menunggu', label: 'Menunggu' },
    { value: 'Diambil', label: 'Diambil' },
    { value: 'DalamPerjalanan', label: 'Dalam Perjalanan' },
    { value: 'Diterima', label: 'Diterima' },
    { value: 'Gagal', label: 'Gagal Antar' },
];

export default function AntarDashboard({ daftarAntaran, counts, activeTab }) {
    const [selectedItemGagal, setSelectedItemGagal] = useState(null);

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

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-lg font-bold text-[#134E4A]">Pengantaran Kurir</h1>
            }
        >
            <Head title="Pengantaran Kurir" />

            <div className="mx-auto max-w-3xl space-y-5 px-3 sm:px-6">
                {/* Filter Tab Bar */}
                <div className="flex border-b border-teal-100 pb-2 gap-2 text-xs font-bold overflow-x-auto">
                    {[
                        { key: 'semua', label: `Semua (${counts?.total || 0})` },
                        { key: 'hari_ini', label: `Hari Ini (${counts?.hari_ini || 0})` },
                        { key: 'aktif', label: `Aktif (${counts?.aktif || 0})` },
                        { key: 'selesai', label: `Diterima (${counts?.diterima || 0})` },
                        { key: 'gagal', label: `Gagal (${counts?.gagal || 0})` },
                    ].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => handleTabChange(t.key)}
                            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                                activeTab === t.key
                                    ? 'bg-[#0D9488] text-white'
                                    : 'border border-teal-100 bg-white text-slate-700 hover:bg-[#F6FBF9]'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Daftar Kartu Antaran */}
                <div className="space-y-4">
                    {daftarAntaran && daftarAntaran.length > 0 ? (
                        daftarAntaran.map((item) => {
                            const nota = item.transaksi_laundry;
                            const plg = nota?.pelanggan;
                            const itemsPakaian = nota?.detail_pakaian || [];

                            const phoneClean = plg?.no_telepon ? plg.no_telepon.replace(/\D/g, '').replace(/^0/, '62') : '';
                            const waText = encodeURIComponent(`Halo ${plg?.nama || ''}, kurir CleanWash mengantar cucian nota ${nota?.no_nota || ''}.`);
                            const waLink = `https://wa.me/${phoneClean}?text=${waText}`;
                            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plg?.alamat || '')}`;

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-teal-200/80 bg-white p-4 sm:p-5 space-y-3"
                                >
                                    <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sm text-[#134E4A]">
                                                {nota?.no_nota}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {item.pengantaran?.kode_pengantaran}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${statusBadgeClass[item.status_antar] || ''}`}>
                                            {item.status_antar}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-bold text-[#134E4A]">{plg?.nama}</h2>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                nota?.status_bayar === 'Lunas'
                                                    ? 'bg-[#CCFBF1] text-[#134E4A]'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}>
                                                {nota?.status_bayar === 'Lunas' ? 'Lunas' : formatRupiah(nota?.sisa_tagihan)}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-start gap-2 text-xs text-slate-700 bg-[#F6FBF9] p-3 rounded-lg border border-teal-100">
                                            <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                                            <span>{plg?.alamat || 'Alamat belum tercatat'}</span>
                                        </p>
                                    </div>

                                    <div className="text-xs text-slate-600">
                                        {itemsPakaian.map((it) => `${it.jenis_layanan?.nama_layanan} (${it.berat_atau_jumlah})`).join(', ') || 'Cucian selesai'}
                                    </div>

                                    {item.status_antar === 'Gagal' && item.alasan_gagal && (
                                        <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900 space-y-1">
                                            <div className="font-bold">Gagal: {item.alasan_gagal}</div>
                                            {item.jadwal_ulang && (
                                                <div className="text-[11px] text-rose-700 font-semibold">
                                                    Jadwal Ulang: {formatTanggal(item.jadwal_ulang)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-[#0D9488] px-3 text-xs font-bold text-white hover:bg-[#134E4A] transition gap-1.5"
                                        >
                                            <IconPhone className="h-3.5 w-3.5" />
                                            <span>WhatsApp</span>
                                        </a>

                                        {plg?.alamat ? (
                                            <a
                                                href={mapsLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition gap-1.5"
                                            >
                                                <IconPin className="h-3.5 w-3.5 text-[#0D9488]" />
                                                <span>Google Maps</span>
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed"
                                            >
                                                Maps Tidak Ada
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Ubah Status Pengantaran */}
                                    <div className="border-t border-teal-100 pt-3">
                                        <label htmlFor={`status-antar-${item.id}`} className="block text-[11px] font-bold text-[#134E4A] mb-1">
                                            Ubah Status Pengantaran
                                        </label>
                                        <select
                                            id={`status-antar-${item.id}`}
                                            value={item.status_antar}
                                            onChange={(e) => handleDropdownStatusChange(item, e.target.value)}
                                            className="block w-full rounded-lg border border-teal-300 bg-white px-3 py-2.5 text-xs font-bold text-[#134E4A] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                        >
                                            {STATUS_ANTAR_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-xl border border-teal-200/80 bg-white p-10 text-center text-slate-600">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconTruck className="h-5 w-5" />
                            </div>
                            <div className="font-bold text-[#134E4A] text-sm">Tidak ada tugas pengantaran</div>
                        </div>
                    )}
                </div>
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
