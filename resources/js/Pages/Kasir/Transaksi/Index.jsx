import { IconSearch } from '@/Components/LineIcons';
import NotaDetailModal from '@/Components/NotaDetailModal';
import { StatusBayar, StatusProses, StatusTransaksi } from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah, formatTanggalWaktu } from '@/utils/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const FILTER_STATUS = [
    { value: '', label: 'Semua Status' },
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Batal', label: 'Batal' },
];

export default function TransaksiIndex({ transaksi, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [memuat, setMemuat] = useState(false);
    const [selectedNotaId, setSelectedNotaId] = useState(null);

    const sedangMemfilter = Boolean(filters?.search || filters?.status);
    const daftar = transaksi?.data || [];
    const selectedNota = daftar.find((item) => item.id === selectedNotaId) || null;

    const terapkanFilter = (event) => {
        event.preventDefault();
        router.get(
            route('kasir.transaksi.index'),
            { search: search || undefined, status: status || undefined },
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
        setStatus('');
        router.get(route('kasir.transaksi.index'), {}, {
            onStart: () => setMemuat(true),
            onFinish: () => setMemuat(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-bold text-[#134E4A]">Transaksi Laundry</h1>
                    <Link
                        href={route('kasir.transaksi.create')}
                        className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                    >
                        + Buat Nota Baru
                    </Link>
                </div>
            }
        >
            <Head title="Transaksi Laundry" />

            <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                {/* Bar Pencarian Seragam Full-Width */}
                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-3 rounded-xl border border-teal-200/80 bg-white p-4 sm:flex-row sm:items-center"
                >
                    <div className="relative flex-1">
                        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            id="cari-transaksi"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor nota (CW-...) atau nama pelanggan..."
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3.5 text-xs font-medium text-slate-800 focus:border-[#0D9488] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            id="filter-status"
                            aria-label="Filter status transaksi"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="min-w-[140px] rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-[#134E4A] focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                        >
                            {FILTER_STATUS.map((opsi) => (
                                <option key={opsi.value} value={opsi.value}>
                                    {opsi.label}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={memuat}
                            className="min-h-[38px] rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:bg-[#134E4A] disabled:opacity-60 cursor-pointer"
                        >
                            {memuat ? 'Memuat...' : 'Cari'}
                        </button>
                        {sedangMemfilter && (
                            <button
                                type="button"
                                onClick={resetFilter}
                                className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl border border-teal-200/80 bg-white" aria-busy={memuat}>
                    <div className="overflow-x-auto">
                        <table className={`w-full min-w-[760px] text-left text-xs ${memuat ? 'opacity-60' : ''}`}>
                            <thead className="border-b border-teal-100 bg-[#F6FBF9] font-bold text-[#134E4A]">
                                <tr>
                                    <th scope="col" className="px-5 py-3.5">No. Nota</th>
                                    <th scope="col" className="px-5 py-3.5">Pelanggan</th>
                                    <th scope="col" className="px-5 py-3.5">Waktu Terima</th>
                                    <th scope="col" className="px-5 py-3.5">Tahap Proses</th>
                                    <th scope="col" className="px-5 py-3.5">Pembayaran</th>
                                    <th scope="col" className="px-5 py-3.5 text-right">Sisa Tagihan</th>
                                    <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-100/70">
                                {daftar.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F6FBF9] transition">
                                        <td className="px-5 py-3.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedNotaId(item.id)}
                                                className="font-mono font-bold text-[#134E4A] hover:text-[#0D9488] hover:underline cursor-pointer"
                                            >
                                                {item.no_nota}
                                            </button>
                                            {item.status_transaksi !== 'Aktif' && (
                                                <div className="mt-1"><StatusTransaksi status={item.status_transaksi} /></div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-slate-800">{item.pelanggan?.nama}</div>
                                            <div className="text-[11px] text-slate-500">{item.pelanggan?.no_telepon}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700">{formatTanggalWaktu(item.tanggal_terima)}</td>
                                        <td className="px-5 py-3.5"><StatusProses status={item.status_proses_terkini} /></td>
                                        <td className="px-5 py-3.5"><StatusBayar status={item.status_bayar} /></td>
                                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-[#134E4A]">
                                            {formatRupiah(item.sisa_tagihan)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedNotaId(item.id)}
                                                className="inline-flex min-h-[34px] items-center rounded-lg border border-teal-200 bg-[#F6FBF9] px-3 text-xs font-bold text-[#0D9488] transition hover:bg-[#CCFBF1] hover:text-[#134E4A] cursor-pointer"
                                            >
                                                Lihat Nota
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {daftar.length === 0 && (
                        <div className="px-4 py-10 text-center">
                            {sedangMemfilter ? (
                                <>
                                    <p className="font-bold text-xs text-slate-800">Tidak ada nota yang cocok dengan pencarian.</p>
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="mt-3 min-h-[38px] rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Tampilkan Semua Nota
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-xs text-slate-800">Belum ada nota tercatat.</p>
                                    <Link
                                        href={route('kasir.transaksi.create')}
                                        className="mt-3 inline-flex min-h-[38px] items-center rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white hover:bg-[#134E4A]"
                                    >
                                        + Buat Nota Pertama
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {transaksi?.links && transaksi.last_page > 1 && (
                        <nav
                            aria-label="Halaman daftar nota"
                            className="flex flex-col gap-3 border-t border-teal-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span className="text-xs text-slate-600">
                                Menampilkan {transaksi.from}-{transaksi.to} dari {transaksi.total} nota
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {transaksi.links.map((link, idx) =>
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveState
                                            aria-current={link.active ? 'page' : undefined}
                                            className={`min-h-[34px] min-w-[34px] rounded-md px-3 py-1.5 text-center text-xs font-bold transition ${
                                                link.active
                                                    ? 'bg-[#0D9488] text-white'
                                                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            className="min-h-[34px] min-w-[34px] rounded-md border border-slate-100 px-3 py-1.5 text-center text-xs text-slate-400"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </div>

            <NotaDetailModal
                show={Boolean(selectedNota)}
                transaksi={selectedNota}
                onClose={() => setSelectedNotaId(null)}
            />
        </AuthenticatedLayout>
    );
}
