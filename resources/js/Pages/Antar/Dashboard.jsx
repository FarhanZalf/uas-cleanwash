import { IconCheck, IconClose, IconPhone, IconPin, IconTruck } from '@/Components/LineIcons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggal } from '@/utils/format';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

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

    const handleUpdateStatus = (detailId, statusBaru) => {
        router.post(
            route('antar.update-status', detailId),
            { status_antar: statusBaru },
            { preserveScroll: true }
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-[#134E4A]">
                            Tugas Pengantaran Kurir
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Antarmuka lapangan untuk kurir pengantaran cucian CleanWash.
                        </p>
                    </div>
                    <div>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-teal-100 text-[#134E4A] border border-teal-200">
                            Peran: Kurir Antar
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Kurir Antar" />

            <div className="mx-auto max-w-3xl space-y-5 px-3 sm:px-6">
                {/* Ringkasan Status Tab */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleTabChange('hari_ini')}
                        className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                            activeTab === 'hari_ini'
                                ? 'border-[#0D9488] bg-[#F6FBF9] ring-2 ring-[#0D9488]'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Hari Ini</div>
                        <div className="text-xl font-black text-[#134E4A] mt-0.5">{counts?.hari_ini || 0} Paket</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('aktif')}
                        className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                            activeTab === 'aktif'
                                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Sedang Jalan</div>
                        <div className="text-xl font-black text-amber-700 mt-0.5">{counts?.aktif || 0} Paket</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('selesai')}
                        className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                            activeTab === 'selesai'
                                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Diterima</div>
                        <div className="text-xl font-black text-emerald-700 mt-0.5">{counts?.diterima || 0} Paket</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange('gagal')}
                        className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                            activeTab === 'gagal'
                                ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Gagal Antar</div>
                        <div className="text-xl font-black text-red-600 mt-0.5">{counts?.gagal || 0} Paket</div>
                    </button>
                </div>

                {/* Filter Tab Bar */}
                <div className="flex border-b border-slate-200 pb-1 gap-2 text-xs font-bold overflow-x-auto">
                    {[
                        { key: 'semua', label: `Semua (${counts?.total || 0})` },
                        { key: 'hari_ini', label: `Hari Ini (${counts?.hari_ini || 0})` },
                        { key: 'aktif', label: `Perlu Diantar (${counts?.aktif || 0})` },
                        { key: 'selesai', label: `Selesai (${counts?.diterima || 0})` },
                        { key: 'gagal', label: `Gagal (${counts?.gagal || 0})` },
                    ].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => handleTabChange(t.key)}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                                activeTab === t.key
                                    ? 'bg-[#0D9488] text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
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
                            const waText = encodeURIComponent(`Halo kak ${plg?.nama || ''}, saya kurir CleanWash sedang mengantar cucian dengan nota ${nota?.no_nota || ''}.`);
                            const waLink = `https://wa.me/${phoneClean}?text=${waText}`;
                            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plg?.alamat || '')}`;

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3 hover:border-teal-300 transition"
                                >
                                    {/* Header Nota */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sm text-[#0D9488]">
                                                {nota?.no_nota}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Kloter: {item.pengantaran?.kode_pengantaran}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadgeClass[item.status_antar] || ''}`}>
                                            {item.status_antar}
                                        </span>
                                    </div>

                                    {/* Info Pelanggan & Alamat */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-bold text-slate-900">{plg?.nama}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                nota?.status_bayar === 'Lunas'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-900'
                                            }`}>
                                                {nota?.status_bayar === 'Lunas' ? 'Lunas' : `Tagihan: ${formatRupiah(nota?.sisa_tagihan)}`}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-start gap-2 text-xs text-slate-700 bg-[#F6FBF9] p-3 rounded-xl border border-teal-200/80 leading-relaxed">
                                            <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                                            <span>
                                                <span className="font-bold text-[#134E4A]">Alamat Antar:</span>{' '}
                                                {plg?.alamat || 'Alamat tidak tertera di data pelanggan'}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Rincian Pakaian Singkat */}
                                    <div className="text-xs text-slate-600">
                                        <span className="font-semibold text-slate-800">Paket:</span>{' '}
                                        {itemsPakaian.map((it) => `${it.jenis_layanan?.nama_layanan} (${it.berat_atau_jumlah})`).join(', ') || 'Cucian selesai'}
                                    </div>

                                    {/* Riwayat Gagal / Jadwal Ulang jika ada */}
                                    {item.status_antar === 'Gagal' && item.alasan_gagal && (
                                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-900 space-y-1">
                                            <div className="font-bold">Keterangan Gagal Antar:</div>
                                            <p>{item.alasan_gagal}</p>
                                            {item.jadwal_ulang && (
                                                <div className="text-[11px] text-rose-700 font-semibold">
                                                    Dijadwalkan Ulang: {formatTanggal(item.jadwal_ulang)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tombol Aksi Lapangan: WhatsApp & Google Maps */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0D9488] px-3 text-xs font-bold text-white hover:bg-[#134E4A] transition gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                        >
                                            <IconPhone className="h-3.5 w-3.5" />
                                            <span>WhatsApp Pelanggan</span>
                                        </a>

                                        {plg?.alamat ? (
                                            <a
                                                href={mapsLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#134E4A] hover:bg-[#CCFBF1] transition gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                            >
                                                <IconPin className="h-3.5 w-3.5 text-[#0D9488]" />
                                                <span>Buka Google Maps</span>
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed"
                                            >
                                                Alamat Tidak Ada
                                            </button>
                                        )}
                                    </div>

                                    {/* Tombol Alur Kerja Status Kurir */}
                                    <div className="border-t border-slate-100 pt-2.5">
                                        {item.status_antar === 'Menunggu' && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(item.id, 'Diambil')}
                                                className="w-full min-h-[44px] rounded-xl bg-[#134E4A] px-4 text-xs font-bold text-white hover:bg-[#0f3b38] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                            >
                                                Ambil Paket dari Laundry (Diambil)
                                            </button>
                                        )}

                                        {item.status_antar === 'Diambil' && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(item.id, 'DalamPerjalanan')}
                                                className="w-full min-h-[44px] rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                            >
                                                Mulai Pengantaran (Dalam Perjalanan)
                                            </button>
                                        )}

                                        {item.status_antar === 'DalamPerjalanan' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateStatus(item.id, 'Diterima')}
                                                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                                >
                                                    <IconCheck className="h-3.5 w-3.5" />
                                                    <span>Tandai Diterima</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedItemGagal(item);
                                                        formGagal.setData('alasan_gagal', 'Rumah kosong / tidak ada orang');
                                                    }}
                                                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <IconClose className="h-3.5 w-3.5" />
                                                    <span>Lapor Gagal Antar</span>
                                                </button>
                                            </div>
                                        )}

                                        {item.status_antar === 'Gagal' && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateStatus(item.id, 'DalamPerjalanan')}
                                                className="w-full min-h-[44px] rounded-xl border border-amber-300 bg-amber-50 px-4 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                                            >
                                                Antar Kembali Sekarang
                                            </button>
                                        )}

                                        {item.status_antar === 'Diterima' && (
                                            <div className="text-center py-2 text-xs font-bold text-[#134E4A] bg-[#CCFBF1]/70 border border-teal-200 rounded-xl">
                                                Paket telah berhasil diserahkan ke pelanggan
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-teal-200/80 bg-white p-10 text-center text-slate-600">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-teal-200 bg-[#CCFBF1] text-[#134E4A]">
                                <IconTruck className="h-5 w-5" />
                            </div>
                            <div className="font-bold text-[#134E4A] text-sm">Tidak ada tugas pengantaran</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Belum ada jadwal paket cucian yang perlu diantar pada kategori ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Lapor Gagal Antar */}
            {selectedItemGagal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-red-700">Lapor Pengantaran Gagal</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Nota: <strong className="text-slate-800">{selectedItemGagal.transaksi_laundry?.no_nota}</strong> ({selectedItemGagal.transaksi_laundry?.pelanggan?.nama})
                        </p>

                        <form onSubmit={handleKirimGagal} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Pilih Alasan Gagal</label>
                                <select
                                    value={formGagal.data.alasan_gagal}
                                    onChange={(e) => formGagal.setData('alasan_gagal', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                >
                                    <option value="Rumah kosong / tidak ada orang">Rumah kosong / tidak ada orang</option>
                                    <option value="Pelanggan tidak dapat dihubungi via telepon / WA">Pelanggan tidak dapat dihubungi via telepon / WA</option>
                                    <option value="Alamat salah / tidak ditemukan">Alamat salah / tidak ditemukan</option>
                                    <option value="Pelanggan meminta jadwal ditunda">Pelanggan meminta jadwal ditunda</option>
                                    <option value="Cuaca buruk / kendala operasional">Cuaca buruk / kendala operasional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700">Rencana Tanggal Antar Ulang</label>
                                <input
                                    type="date"
                                    value={formGagal.data.jadwal_ulang}
                                    onChange={(e) => formGagal.setData('jadwal_ulang', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItemGagal(null)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formGagal.processing}
                                    className="min-h-[40px] rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {formGagal.processing ? 'Menyimpan...' : 'Simpan Laporan Gagal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
