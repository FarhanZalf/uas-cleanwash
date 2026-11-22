import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StatusBayar, StatusProses, StatusTransaksi } from '@/Components/StatusBadge';
import { formatRupiah, formatTanggalWaktu } from '@/utils/format';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const FILTER_STATUS = [
    { value: '', label: 'Semua status' },
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Batal', label: 'Batal' },
];

export default function TransaksiIndex({ transaksi, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [memuat, setMemuat] = useState(false);

    const sedangMemfilter = Boolean(filters?.search || filters?.status);
    const daftar = transaksi?.data || [];

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#134E4A]">Transaksi laundry</h1>
                        <p className="mt-0.5 text-sm text-slate-600">
                            Cari nota berdasarkan nomor, nama, atau telepon pelanggan.
                        </p>
                    </div>
                    <Link
                        href={route('kasir.transaksi.create')}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0D9488] px-4 text-sm font-bold text-white transition hover:bg-[#134E4A] active:bg-[#0f3b38] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                    >
                        Buat nota baru
                    </Link>
                </div>
            }
        >
            <Head title="Transaksi Laundry" />

            <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                <form
                    onSubmit={terapkanFilter}
                    className="flex flex-col gap-3 rounded-xl border border-teal-100 bg-white p-4 md:flex-row md:items-end"
                >
                    <div className="flex-1">
                        <label htmlFor="cari-transaksi" className="block text-xs font-bold text-[#134E4A]">
                            Cari nota
                        </label>
                        <input
                            id="cari-transaksi"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="CW-20261122-001 atau nama pelanggan"
                            className="mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-[#0D9488] focus:ring-[#0D9488]"
                        />
                    </div>
                    <div className="md:w-48">
                        <label htmlFor="filter-status" className="block text-xs font-bold text-[#134E4A]">
                            Status transaksi
                        </label>
                        <select
                            id="filter-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-slate-300 text-sm focus:border-[#0D9488] focus:ring-[#0D9488]"
                        >
                            {FILTER_STATUS.map((opsi) => (
                                <option key={opsi.value} value={opsi.value}>
                                    {opsi.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={memuat}
                            className="min-h-[44px] flex-1 rounded-lg bg-[#134E4A] px-4 text-sm font-bold text-white transition hover:bg-[#0f3b38] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 md:flex-none"
                        >
                            {memuat ? 'Memuat...' : 'Terapkan'}
                        </button>
                        {sedangMemfilter && (
                            <button
                                type="button"
                                onClick={resetFilter}
                                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl border border-teal-100 bg-white" aria-busy={memuat}>
                    <div className="overflow-x-auto">
                        <table className={`w-full min-w-[760px] text-left text-sm ${memuat ? 'opacity-60' : ''}`}>
                            <thead className="border-b border-teal-100 bg-[#F6FBF9] text-xs font-bold text-[#134E4A]">
                                <tr>
                                    <th scope="col" className="px-4 py-3">No. nota</th>
                                    <th scope="col" className="px-4 py-3">Pelanggan</th>
                                    <th scope="col" className="px-4 py-3">Diterima</th>
                                    <th scope="col" className="px-4 py-3">Proses</th>
                                    <th scope="col" className="px-4 py-3">Pembayaran</th>
                                    <th scope="col" className="px-4 py-3 text-right">Sisa tagihan</th>
                                    <th scope="col" className="px-4 py-3"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {daftar.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F6FBF9]">
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-sm font-bold text-[#134E4A]">{item.no_nota}</div>
                                            {item.status_transaksi !== 'Aktif' && (
                                                <div className="mt-1"><StatusTransaksi status={item.status_transaksi} /></div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-800">{item.pelanggan?.nama}</div>
                                            <div className="text-xs text-slate-600">{item.pelanggan?.no_telepon}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{formatTanggalWaktu(item.tanggal_terima)}</td>
                                        <td className="px-4 py-3"><StatusProses status={item.status_proses_terkini} /></td>
                                        <td className="px-4 py-3"><StatusBayar status={item.status_bayar} /></td>
                                        <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-800">
                                            {formatRupiah(item.sisa_tagihan)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={route('kasir.transaksi.show', item.id)}
                                                className="inline-flex min-h-[36px] items-center rounded-lg px-3 text-xs font-bold text-[#0D9488] transition hover:bg-teal-50 active:bg-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                            >
                                                Lihat nota
                                            </Link>
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
                                    <p className="font-semibold text-slate-800">Tidak ada nota yang cocok dengan filter ini.</p>
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="mt-3 min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                                    >
                                        Tampilkan semua nota
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-slate-800">Belum ada nota tercatat.</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Nota pertama akan muncul di sini dan langsung masuk antrean produksi.
                                    </p>
                                    <Link
                                        href={route('kasir.transaksi.create')}
                                        className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-[#0D9488] px-4 text-sm font-bold text-white hover:bg-[#134E4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
                                    >
                                        Buat nota pertama
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
                                            className={`min-h-[36px] min-w-[36px] rounded-md px-3 py-2 text-center text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                                                link.active
                                                    ? 'bg-[#134E4A] text-white'
                                                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            className="min-h-[36px] min-w-[36px] rounded-md border border-slate-100 px-3 py-2 text-center text-xs text-slate-500"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
