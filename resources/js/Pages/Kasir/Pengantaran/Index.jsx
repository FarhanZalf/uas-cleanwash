import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggal } from '@/utils/format';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PengantaranIndex({ pengantaran, kurirList, transaksiSiapAntar, filters }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const form = useForm({
        petugas_id: kurirList?.[0]?.id || '',
        tanggal_antar: new Date().toISOString().split('T')[0],
        transaksi_ids: [],
    });

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = route('kasir.pengantaran.index', { search });
    };

    const toggleNota = (id) => {
        const current = [...form.data.transaksi_ids];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        form.setData('transaksi_ids', current);
    };

    const selectAllNota = () => {
        if (form.data.transaksi_ids.length === transaksiSiapAntar.length) {
            form.setData('transaksi_ids', []);
        } else {
            form.setData('transaksi_ids', transaksiSiapAntar.map((t) => t.id));
        }
    };

    const handleSimpanKloter = (e) => {
        e.preventDefault();
        form.post(route('kasir.pengantaran.store'), {
            onSuccess: () => {
                setModalOpen(false);
                form.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-bold text-[#134E4A]">
                        Kloter Pengantaran
                    </h1>

                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        + Buat Kloter
                    </button>
                </div>
            }
        >
            <Head title="Kloter Pengantaran" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Baris Statistik & Pencarian */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode kloter atau nama kurir..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-teal-50 border border-teal-200 px-3.5 py-2 text-xs font-bold text-[#0D9488] hover:bg-teal-100 cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="text-xs text-slate-500 font-medium">
                        Tersedia <strong className="text-teal-900 font-bold">{transaksiSiapAntar?.length || 0}</strong> nota cucian siap diantar ke pelanggan.
                    </div>
                </div>

                {/* Tabel Daftar Kloter */}
                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-[#F6FBF9] font-bold text-[#134E4A]">
                                <tr>
                                    <th className="px-5 py-3.5 text-left">Kode Kloter</th>
                                    <th className="px-5 py-3.5 text-left">Kurir Bertugas</th>
                                    <th className="px-5 py-3.5 text-left">Tanggal Antar</th>
                                    <th className="px-5 py-3.5 text-center">Total Paket</th>
                                    <th className="px-5 py-3.5 text-center">Progres Antaran</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {pengantaran.data && pengantaran.data.length > 0 ? (
                                    pengantaran.data.map((kloter) => {
                                        const selesai = kloter.total_diterima || 0;
                                        const gagal = kloter.total_gagal || 0;
                                        const total = kloter.total_paket || 0;
                                        const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;

                                        return (
                                            <tr key={kloter.id} className="hover:bg-slate-50/60">
                                                <td className="px-5 py-3.5">
                                                    <span className="font-mono font-bold text-teal-800">
                                                        {kloter.kode_pengantaran}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-bold text-slate-900">
                                                        {kloter.petugas?.nama_petugas}
                                                    </div>
                                                    <span className="text-[11px] text-slate-500">
                                                        {kloter.petugas?.email || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 font-medium text-slate-700">
                                                    {formatTanggal(kloter.tanggal_antar)}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-bold">
                                                    {total} Paket
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-24 bg-slate-100 rounded-full h-2">
                                                            <div
                                                                className="bg-[#0D9488] h-2 rounded-full"
                                                                style={{ width: `${persen}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-600">
                                                            {selesai}/{total}
                                                        </span>
                                                        {gagal > 0 && (
                                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                                {gagal} Gagal
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <Link
                                                        href={route('kasir.pengantaran.show', kloter.id)}
                                                        className="inline-flex items-center rounded-lg border border-teal-600 bg-white px-3 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50 cursor-pointer"
                                                    >
                                                        Lihat Rincian
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400">
                                            Belum ada kloter pengantaran yang dibuat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pengantaran.links && pengantaran.links.length > 3 && (
                        <div className="border-t border-slate-100 bg-[#F6FBF9] px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Halaman {pengantaran.current_page} dari {pengantaran.last_page}
                            </span>
                            <div className="flex gap-1">
                                {pengantaran.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-[#0D9488] text-white'
                                                : link.url
                                                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Kloter Pengantaran */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-bold text-[#134E4A]">Jadwalkan Kloter Pengantaran Baru</h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Pilih kurir, tanggal pengantaran, dan centang nota cucian yang siap diantar ke pelanggan.
                        </p>

                        <form onSubmit={handleSimpanKloter} className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Pilih Kurir (Petugas Antar)</label>
                                    <select
                                        value={form.data.petugas_id}
                                        onChange={(e) => form.setData('petugas_id', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                        required
                                    >
                                        {kurirList.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.nama_petugas} ({k.kode_petugas})
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.petugas_id && (
                                        <p className="text-[11px] text-red-600 mt-1">{form.errors.petugas_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">Tanggal Pengantaran</label>
                                    <input
                                        type="date"
                                        value={form.data.tanggal_antar}
                                        onChange={(e) => form.setData('tanggal_antar', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                                        required
                                    />
                                    {form.errors.tanggal_antar && (
                                        <p className="text-[11px] text-red-600 mt-1">{form.errors.tanggal_antar}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Pilih Nota Siap Antar ({form.data.transaksi_ids.length} dipilih)
                                    </label>
                                    {transaksiSiapAntar.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={selectAllNota}
                                            className="text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                                        >
                                            {form.data.transaksi_ids.length === transaksiSiapAntar.length
                                                ? 'Batal Pilih Semua'
                                                : 'Pilih Semua Nota'}
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                                    {transaksiSiapAntar.length > 0 ? (
                                        transaksiSiapAntar.map((t) => {
                                            const checked = form.data.transaksi_ids.includes(t.id);
                                            return (
                                                <label
                                                    key={t.id}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${
                                                        checked
                                                            ? 'border-teal-500 bg-teal-50/60'
                                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleNota(t.id)}
                                                        className="mt-0.5 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                                                    />
                                                    <div className="flex-1 text-xs">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono font-bold text-teal-900">{t.no_nota}</span>
                                                            <span className={`font-semibold ${t.status_bayar === 'Lunas' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                                Status: {t.status_bayar}
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-800 mt-0.5">{t.pelanggan?.nama}</div>
                                                        <div className="text-slate-600 mt-0.5">
                                                            {t.pelanggan?.alamat || 'Alamat belum diatur'} · {t.pelanggan?.no_telepon}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-400">
                                            Tidak ada nota cucian yang berstatus Selesai di bagian produksi saat ini.
                                        </div>
                                    )}
                                </div>
                                {form.errors.transaksi_ids && (
                                    <p className="text-[11px] text-red-600 mt-1">{form.errors.transaksi_ids}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="min-h-[40px] rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing || form.data.transaksi_ids.length === 0}
                                    className="min-h-[40px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A] disabled:opacity-50 cursor-pointer"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Jadwalkan Kloter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
